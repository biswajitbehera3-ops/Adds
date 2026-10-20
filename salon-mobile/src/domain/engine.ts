/**
 * The salon's business logic, running on the device. Every operation takes the
 * current data and returns the next data plus its result, so the store can
 * commit atomically and tests can run without storage.
 *
 * Visit lifecycle: a visit OPENs when the customer walks in (so staff see at once
 * whether they are new or returning), services can be added while it is open, and
 * it is PAID after the service. A paid visit can be undone by staff for a short
 * window, or VOIDed by the owner later; both refund any wallet money used.
 */
import config from "../config/salon";
import { UserError } from "./errors";
import {
  daysBetween,
  dueDate,
  istDate,
  isLate,
  normalizePhone,
  priceItems,
  renderReminder,
  renderTemplate,
  startOfIstDay,
  topUpBonus,
} from "./rules";
import type { Appointment, Attendance, Customer, Data, PaymentMethod, PrivacyEvent, ReminderLog, Secret, Staff, Visit, WalletTx } from "./types";

const DAY_MS = 24 * 60 * 60 * 1000;
// No 0/O/1/I so codes read cleanly over the phone.
const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

let idCounter = 0;
export function newId(): string {
  idCounter = (idCounter + 1) % 1e6;
  return Date.now().toString(36) + idCounter.toString(36) + Math.random().toString(36).slice(2, 7);
}

function makeReferralCode(name: string, taken: Set<string>): string {
  const prefix = (name.replace(/[^a-z]/gi, "").toUpperCase() + "XXX").slice(0, 3);
  for (;;) {
    let suffix = "";
    for (let i = 0; i < 4; i++) suffix += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)];
    if (!taken.has(prefix + suffix)) return prefix + suffix;
  }
}

export function referralLink(code: string): string {
  return `${config.publicUrl.replace(/\/$/, "")}/${code}`;
}

type Op<T> = { data: Data; result: T };

const paid = (v: Visit) => v.status === "PAID";
const at = (v: Visit) => v.paidAt ?? v.createdAt;

// ── Migration ────────────────────────────────────────────────────────────────

/** Upgrades stored data from older versions of the app. */
export function migrate(raw: unknown): Data {
  const d = raw as Record<string, unknown> & { version?: number };
  if (d.version === 4) return d as unknown as Data;
  if (d.version === 3) return { ...(d as unknown as Omit<Data, "version" | "appointments">), version: 4, appointments: [] };
  const v2 = d.version === 2 ? (d as unknown as Omit<Data, "version" | "privacyLog" | "appointments"> & { customers: Array<Record<string, unknown>> }) : migrateV1(d);
  // v2 → v3: one consent covered both records and reminders, so it carries over to both.
  return {
    ...v2,
    version: 4,
    customers: v2.customers.map((c) => ({
      ...(c as unknown as Customer),
      marketingConsentAt: (c.marketingConsentAt as string | null | undefined) ?? (c.consentAt as string | null) ?? null,
      consentNotice: (c.consentNotice as string | undefined) ?? "before-2026-10-15",
      consentTakenBy: (c.consentTakenBy as string | null | undefined) ?? null,
      guardianConsent: Boolean(c.guardianConsent),
      deletedAt: (c.deletedAt as string | null | undefined) ?? null,
    })),
    appointments: [],
    privacyLog: [],
  };
}

function migrateV1(d: Record<string, unknown>) {
  // v1: one service per visit, every visit paid, staff lived in config.
  const v1Visits = (d.visits as Array<Record<string, unknown>>) ?? [];
  return {
    customers: (d.customers as Array<Record<string, unknown>>) ?? [],
    visits: v1Visits.map((v) => ({
      id: v.id as string,
      customerId: v.customerId as string,
      serviceIds: [v.serviceId as string],
      staffId: v.staffId as string,
      addOnIds: (v.addOnIds as string[]) ?? [],
      total: v.total as number,
      walletPaid: v.walletPaid as number,
      directPaid: v.directPaid as number,
      paymentMethod: v.paymentMethod as PaymentMethod,
      status: "PAID" as const,
      createdAt: v.createdAt as string,
      paidAt: v.createdAt as string,
      voidedAt: null,
      voidReason: null,
    })),
    walletTxs: (d.walletTxs as WalletTx[]) ?? [],
    reminders: (d.reminders as ReminderLog[]) ?? [],
    staff: [],
    attendance: [],
    owner: null,
    demo: Boolean(d.demo),
  };
}

function logPrivacy(data: Data, customerId: string, type: PrivacyEvent["type"], by: string | null, now: Date): PrivacyEvent[] {
  return [...data.privacyLog, { id: newId(), customerId, type, by, at: now.toISOString() }];
}

const live = (c: Customer) => !c.deletedAt;

// ── Customers ────────────────────────────────────────────────────────────────

export function findByPhone(data: Data, rawPhone: string) {
  const phone = normalizePhone(rawPhone);
  if (!phone) throw new UserError("Enter a valid 10-digit mobile number");
  const customer = data.customers.find((c) => live(c) && c.phone === phone) ?? null;
  if (!customer) return { phone, customer: null };
  const visits = paidVisitsOf(data, customer.id);
  const openVisit = data.visits.find((v) => v.customerId === customer.id && v.status === "OPEN") ?? null;
  return { phone, customer: { ...customer, visitCount: visits.length, lastVisit: visits[0] ?? null, openVisit } };
}

/** Finds the referrer from what the new customer says: a referral code or the friend's phone number. */
export function findReferrer(data: Data, codeOrPhone: string): Customer | null {
  const raw = codeOrPhone.trim();
  if (!raw) return null;
  const phone = normalizePhone(raw);
  if (phone) return data.customers.find((c) => live(c) && c.phone === phone) ?? null;
  return data.customers.find((c) => live(c) && c.referralCode === raw.toUpperCase()) ?? null;
}

/**
 * Saves a new customer. DPDP: `consent` (keep my details for visits and the wallet)
 * is required; `marketing` (WhatsApp reminders and offers) is a separate, optional
 * choice. A customer under 18 is saved only with a parent's or guardian's consent,
 * under that adult's number.
 */
export function createCustomer(
  data: Data,
  input: {
    phone: string;
    name: string;
    consent: boolean;
    marketing?: boolean;
    minor?: boolean;
    guardianConsent?: boolean;
    referredBy?: string;
    takenBy?: string | null;
  },
  now = new Date(),
): Op<Customer> {
  const phone = normalizePhone(input.phone);
  if (!phone) throw new UserError("Enter a valid 10-digit mobile number");
  const name = input.name.trim().replace(/\s+/g, " ");
  if (!name) throw new UserError("Name is required");
  if (name.length > 80) throw new UserError("Name is too long");
  if (!input.consent) throw new UserError("The customer's consent is needed to save their details");
  if (input.minor && !input.guardianConsent) {
    throw new UserError("For a customer under 18, a parent or guardian must agree and give their own number");
  }
  if (data.customers.some((c) => live(c) && c.phone === phone)) throw new UserError("A customer with this number already exists");

  let referredById: string | null = null;
  if (input.referredBy?.trim()) {
    const referrer = findReferrer(data, input.referredBy);
    if (!referrer) throw new UserError("No customer found with that referral code or number");
    if (referrer.phone === phone) throw new UserError("A customer can't refer themselves");
    referredById = referrer.id;
  }

  const when = now.toISOString();
  const customer: Customer = {
    id: newId(),
    phone,
    name,
    referralCode: makeReferralCode(name, new Set(data.customers.map((c) => c.referralCode))),
    walletBalance: 0,
    consentAt: when,
    marketingConsentAt: input.marketing ? when : null,
    consentNotice: config.legal.noticeVersion,
    consentTakenBy: input.takenBy ?? null,
    guardianConsent: Boolean(input.minor),
    deletedAt: null,
    referredById,
    referralRewardedAt: null,
    createdAt: when,
  };
  let next: Data = { ...data, customers: [...data.customers, customer] };
  next = { ...next, privacyLog: logPrivacy(next, customer.id, "CONSENT_GIVEN", customer.consentTakenBy, now) };
  if (input.marketing) next = { ...next, privacyLog: logPrivacy(next, customer.id, "MARKETING_ON", customer.consentTakenBy, now) };
  return { data: next, result: customer };
}

export function searchCustomers(data: Data, q: string, take = 60) {
  const term = q.trim().toLowerCase();
  const digits = term.replace(/\D/g, "");
  const people = data.customers.filter(live);
  const list = term
    ? people.filter(
        (c) =>
          c.name.toLowerCase().includes(term) ||
          (digits.length > 0 && c.phone.includes(digits)) ||
          c.referralCode === term.toUpperCase(),
      )
    : people;
  return [...list].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, take);
}

export type CustomerFilter = "all" | "mine" | "top" | "regular" | "lapsed" | "wallet" | "new";
export type CustomerSort = "spend" | "recent" | "name";
/** Regulars have this many paid visits; "not seen" and "new" use this many days. */
const REGULAR_VISITS = 5;
const LAPSED_DAYS = 30;
const NEW_DAYS = 30;
const TOP_SPENDERS = 20;

/**
 * The Customers tab: every customer with what they have spent, their wallet, last visit and
 * who served them, for any staff member (BUILD-SPEC 4.17). `staffId` powers "My customers"
 * (customers this stylist has served). Search matches name, number or referral code.
 */
export function customerDirectory(
  data: Data,
  input: { q?: string; filter?: CustomerFilter; sort?: CustomerSort; staffId?: string | null } = {},
  now = new Date(),
) {
  const stats = new Map<string, { visits: number; spent: number; lastAt: string | null; lastStaffId: string | null; served: Set<string> }>();
  for (const v of data.visits) {
    if (!paid(v)) continue;
    const s = stats.get(v.customerId) ?? { visits: 0, spent: 0, lastAt: null, lastStaffId: null, served: new Set<string>() };
    s.visits += 1;
    s.spent += v.total;
    s.served.add(v.staffId);
    if (!s.lastAt || at(v) > s.lastAt) {
      s.lastAt = at(v);
      s.lastStaffId = v.staffId;
    }
    stats.set(v.customerId, s);
  }
  const days = (iso: string) => Math.floor((now.getTime() - Date.parse(iso)) / DAY_MS);
  const all = data.customers.filter(live).map((c) => {
    const s = stats.get(c.id);
    const sinceLast = s?.lastAt ? days(s.lastAt) : null;
    const tag: "new" | "lapsed" | "regular" | null =
      days(c.createdAt) <= NEW_DAYS ? "new" : sinceLast !== null && sinceLast > LAPSED_DAYS ? "lapsed" : (s?.visits ?? 0) >= REGULAR_VISITS ? "regular" : null;
    return {
      id: c.id,
      name: c.name,
      phone: c.phone,
      referralCode: c.referralCode,
      walletBalance: c.walletBalance,
      visits: s?.visits ?? 0,
      spent: s?.spent ?? 0,
      lastVisitAt: s?.lastAt ? new Date(s.lastAt) : null,
      daysSinceLast: sinceLast,
      lastStylist: s?.lastStaffId ? (data.staff.find((x) => x.id === s.lastStaffId)?.name ?? null) : null,
      servedByMe: !!input.staffId && !!s?.served.has(input.staffId),
      tag,
      createdAt: c.createdAt,
    };
  });
  const counts = {
    all: all.length,
    newThisMonth: all.filter((r) => days(r.createdAt) <= NEW_DAYS).length,
    lapsed: all.filter((r) => r.daysSinceLast !== null && r.daysSinceLast > LAPSED_DAYS).length,
    mine: all.filter((r) => r.servedByMe).length,
  };
  const term = (input.q ?? "").trim().toLowerCase();
  const digits = term.replace(/\D/g, "");
  let rows = term
    ? all.filter((r) => r.name.toLowerCase().includes(term) || (digits.length > 0 && r.phone.includes(digits)) || r.referralCode === term.toUpperCase())
    : all;
  const filter = input.filter ?? "all";
  const bySpend = (a: (typeof all)[number], b: (typeof all)[number]) => b.spent - a.spent || a.name.localeCompare(b.name);
  if (filter === "mine") rows = rows.filter((r) => r.servedByMe);
  if (filter === "regular") rows = rows.filter((r) => r.visits >= REGULAR_VISITS);
  if (filter === "lapsed") rows = rows.filter((r) => r.daysSinceLast !== null && r.daysSinceLast > LAPSED_DAYS);
  if (filter === "wallet") rows = rows.filter((r) => r.walletBalance > 0);
  if (filter === "new") rows = rows.filter((r) => days(r.createdAt) <= NEW_DAYS);
  if (filter === "top") rows = [...rows].sort(bySpend).slice(0, TOP_SPENDERS);
  const sort = filter === "top" ? "spend" : (input.sort ?? "spend");
  rows = [...rows].sort(
    sort === "spend"
      ? bySpend
      : sort === "recent"
        ? (a, b) => (b.lastVisitAt?.getTime() ?? 0) - (a.lastVisitAt?.getTime() ?? 0) || a.name.localeCompare(b.name)
        : (a, b) => a.name.localeCompare(b.name),
  );
  return { rows, counts };
}

function paidVisitsOf(data: Data, customerId: string) {
  return data.visits.filter((v) => v.customerId === customerId && paid(v)).sort((a, b) => at(b).localeCompare(at(a)));
}

/** Per-service due dates for one customer, soonest first. */
export function serviceDueDates(data: Data, customerId: string) {
  const last = new Map<string, string>();
  for (const v of data.visits) {
    if (v.customerId !== customerId || !paid(v)) continue;
    for (const s of v.serviceIds) {
      const prev = last.get(s);
      if (!prev || at(v) > prev) last.set(s, at(v));
    }
  }
  return [...last.entries()]
    .flatMap(([serviceId, when]) => {
      const service = config.services.find((s) => s.id === serviceId);
      const lastVisit = new Date(when);
      const dueAt = dueDate(serviceId, lastVisit);
      return service && dueAt ? [{ serviceId, serviceName: service.name, lastVisit, dueAt }] : [];
    })
    .sort((a, b) => a.dueAt.getTime() - b.dueAt.getTime());
}

export function getProfile(data: Data, id: string) {
  const customer = data.customers.find((c) => c.id === id);
  if (!customer) throw new UserError("Customer not found");
  const visits = data.visits
    .filter((v) => v.customerId === id && v.status !== "OPEN")
    .sort((a, b) => at(b).localeCompare(at(a)));
  const walletTxs = data.walletTxs.filter((t) => t.customerId === id).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const dues = serviceDueDates(data, id);
  const referredBy = customer.referredById ? (data.customers.find((c) => c.id === customer.referredById) ?? null) : null;
  const referrals = data.customers.filter((c) => c.referredById === id);
  return {
    ...customer,
    visits,
    walletTxs,
    referredBy,
    referrals,
    lifetimeSpend: visits.filter(paid).reduce((s, v) => s + v.total, 0),
    referralLink: referralLink(customer.referralCode),
    serviceDues: dues,
    nextDue: dues[0] ?? null,
  };
}

// ── Wallet ───────────────────────────────────────────────────────────────────

/** Deposit money into a customer's wallet and credit the tiered bonus on top. */
export function topUp(
  data: Data,
  input: { customerId: string; amount: number; method: PaymentMethod },
  now = new Date(),
): Op<{ deposit: number; bonus: number; balance: number }> {
  const amount = input.amount;
  if (!Number.isInteger(amount) || amount <= 0) throw new UserError("Top-up must be a whole rupee amount above 0");
  if (amount > 100000) throw new UserError("Top-up is above the ₹1,00,000 limit");
  const customer = data.customers.find((c) => c.id === input.customerId);
  if (!customer) throw new UserError("Customer not found");
  const bonus = topUpBonus(amount);
  const when = now.toISOString();
  const txs: WalletTx[] = [
    { id: newId(), customerId: customer.id, type: "TOPUP", amount, visitId: null, note: `Paid by ${input.method}`, createdAt: when },
  ];
  if (bonus > 0) {
    txs.push({ id: newId(), customerId: customer.id, type: "BONUS", amount: bonus, visitId: null, note: `Bonus on ₹${amount} top-up`, createdAt: when });
  }
  const balance = customer.walletBalance + amount + bonus;
  return {
    data: {
      ...data,
      customers: data.customers.map((c) => (c.id === customer.id ? { ...c, walletBalance: balance } : c)),
      walletTxs: [...data.walletTxs, ...txs],
    },
    result: { deposit: amount, bonus, balance },
  };
}

// ── Visits ───────────────────────────────────────────────────────────────────

function requireStaff(data: Data, staffId: string) {
  if (!data.staff.some((s) => s.id === staffId && s.active)) throw new UserError("Pick who is doing the service");
}

/** Opens a visit when the customer walks in. */
export function startVisit(
  data: Data,
  input: { customerId: string; serviceIds: string[]; addOnIds: string[]; staffId: string },
  now = new Date(),
): Op<Visit> {
  const customer = data.customers.find((c) => c.id === input.customerId);
  if (!customer) throw new UserError("Customer not found");
  if (data.visits.some((v) => v.customerId === customer.id && v.status === "OPEN")) {
    throw new UserError(`${customer.name} already has a visit in progress`);
  }
  requireStaff(data, input.staffId);
  const { serviceIds, addOnIds, total } = priceItems(input.serviceIds, input.addOnIds);
  const visit: Visit = {
    id: newId(),
    customerId: customer.id,
    serviceIds,
    addOnIds,
    staffId: input.staffId,
    total,
    walletPaid: 0,
    directPaid: 0,
    paymentMethod: null,
    status: "OPEN",
    createdAt: now.toISOString(),
    paidAt: null,
    voidedAt: null,
    voidReason: null,
  };
  return { data: { ...data, visits: [...data.visits, visit] }, result: visit };
}

/** Changes services, add-ons or stylist on a visit that hasn't been paid yet. */
export function updateOpenVisit(
  data: Data,
  input: { visitId: string; serviceIds: string[]; addOnIds: string[]; staffId: string },
): Op<Visit> {
  const visit = data.visits.find((v) => v.id === input.visitId);
  if (!visit || visit.status !== "OPEN") throw new UserError("This visit is no longer open");
  requireStaff(data, input.staffId);
  const { serviceIds, addOnIds, total } = priceItems(input.serviceIds, input.addOnIds);
  const next = { ...visit, serviceIds, addOnIds, staffId: input.staffId, total };
  return { data: { ...data, visits: data.visits.map((v) => (v.id === visit.id ? next : v)) }, result: next };
}

/** The customer left before the service: remove the open visit. No money was involved. */
export function cancelOpenVisit(data: Data, visitId: string): Op<null> {
  const visit = data.visits.find((v) => v.id === visitId);
  if (!visit || visit.status !== "OPEN") throw new UserError("This visit is no longer open");
  return { data: { ...data, visits: data.visits.filter((v) => v.id !== visitId) }, result: null };
}

export function openVisits(data: Data) {
  const byId = new Map(data.customers.map((c) => [c.id, c]));
  return data.visits
    .filter((v) => v.status === "OPEN")
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    .flatMap((v) => {
      const c = byId.get(v.customerId);
      return c ? [{ visit: v, customer: c }] : [];
    });
}

/**
 * Settles an open visit after the service, optionally from the wallet.
 *
 * Referral rule: on a referred customer's FIRST PAID visit, both they and their
 * referrer get wallet credit — never at sign-up.
 */
export function checkoutVisit(
  data: Data,
  input: { visitId: string; walletAmount: number; paymentMethod: PaymentMethod },
  now = new Date(),
): Op<{ visit: Visit; balance: number; referral: { referrerName: string; referrerReward: number; newCustomerReward: number } | null }> {
  const visit = data.visits.find((v) => v.id === input.visitId);
  if (!visit || visit.status !== "OPEN") throw new UserError("This visit is no longer open");
  const { total } = priceItems(visit.serviceIds, visit.addOnIds);
  const walletAmount = input.walletAmount;
  if (!Number.isInteger(walletAmount) || walletAmount < 0) throw new UserError("Invalid wallet amount");
  if (walletAmount > total) throw new UserError("Wallet amount is more than the bill");
  const customer = data.customers.find((c) => c.id === visit.customerId);
  if (!customer) throw new UserError("Customer not found");
  if (walletAmount > customer.walletBalance) throw new UserError("Not enough wallet balance");

  const when = now.toISOString();
  const priorPaidVisits = data.visits.filter((v) => v.customerId === customer.id && paid(v) && v.total > 0).length;
  const settled: Visit = {
    ...visit,
    total,
    walletPaid: walletAmount,
    directPaid: total - walletAmount,
    paymentMethod: input.paymentMethod,
    status: "PAID",
    paidAt: when,
  };
  const txs: WalletTx[] = [];
  const delta = new Map<string, number>([[customer.id, -walletAmount]]);
  if (walletAmount > 0) {
    txs.push({ id: newId(), customerId: customer.id, type: "SPEND", amount: -walletAmount, visitId: visit.id, note: null, createdAt: when });
  }

  let referral: { referrerName: string; referrerReward: number; newCustomerReward: number } | null = null;
  const referrer = customer.referredById ? data.customers.find((c) => c.id === customer.referredById) : undefined;
  const rewardNow = total > 0 && priorPaidVisits === 0 && referrer && !customer.referralRewardedAt;
  if (rewardNow) {
    const { referrerReward, newCustomerReward } = config.referral;
    txs.push(
      { id: newId(), customerId: referrer.id, type: "REFERRAL_REWARD", amount: referrerReward, visitId: visit.id, note: `Referred ${customer.name}`, createdAt: when },
      { id: newId(), customerId: customer.id, type: "REFERRAL_REWARD", amount: newCustomerReward, visitId: visit.id, note: "Welcome reward for joining by referral", createdAt: when },
    );
    delta.set(referrer.id, referrerReward);
    delta.set(customer.id, (delta.get(customer.id) ?? 0) + newCustomerReward);
    referral = { referrerName: referrer.name, referrerReward, newCustomerReward };
  }

  const customers = applyDelta(data.customers, delta, (c) => (rewardNow && c.id === customer.id ? { referralRewardedAt: when } : {}));
  const balance = customers.find((c) => c.id === customer.id)!.walletBalance;
  return {
    data: { ...data, customers, visits: data.visits.map((v) => (v.id === visit.id ? settled : v)), walletTxs: [...data.walletTxs, ...txs] },
    result: { visit: settled, balance, referral },
  };
}

function applyDelta(customers: Customer[], delta: Map<string, number>, extra: (c: Customer) => Partial<Customer> = () => ({})) {
  return customers.map((c) => {
    const d = delta.get(c.id);
    return d === undefined ? c : { ...c, walletBalance: c.walletBalance + d, ...extra(c) };
  });
}

/** Staff may undo a visit themselves only for a short window after payment. */
export function canStaffUndo(visit: Visit, now = new Date()): boolean {
  return visit.status === "PAID" && !!visit.paidAt && now.getTime() - new Date(visit.paidAt).getTime() <= config.undoWindowMinutes * 60 * 1000;
}

/**
 * Reverses a paid visit: refunds any wallet money used and, if this visit paid
 * out a referral reward, takes that reward back from both wallets.
 */
export function voidVisit(
  data: Data,
  input: { visitId: string; by: "staff" | "owner"; reason: string },
  now = new Date(),
): Op<Visit> {
  const visit = data.visits.find((v) => v.id === input.visitId);
  if (!visit || visit.status !== "PAID") throw new UserError("Only a paid visit can be voided");
  if (input.by === "staff" && !canStaffUndo(visit, now)) {
    throw new UserError(`Undo is only possible for ${config.undoWindowMinutes} minutes. Ask the owner to void it.`);
  }
  const when = now.toISOString();
  const txs: WalletTx[] = [];
  const delta = new Map<string, number>();
  const add = (id: string, amt: number) => delta.set(id, (delta.get(id) ?? 0) + amt);

  if (visit.walletPaid > 0) {
    txs.push({ id: newId(), customerId: visit.customerId, type: "REFUND", amount: visit.walletPaid, visitId: visit.id, note: "Visit voided", createdAt: when });
    add(visit.customerId, visit.walletPaid);
  }
  const rewards = data.walletTxs.filter((t) => t.visitId === visit.id && t.type === "REFERRAL_REWARD");
  for (const r of rewards) {
    txs.push({ id: newId(), customerId: r.customerId, type: "REFERRAL_REVERSAL", amount: -r.amount, visitId: visit.id, note: "Referral reward reversed: visit voided", createdAt: when });
    add(r.customerId, -r.amount);
  }
  for (const [id, d] of delta) {
    const c = data.customers.find((x) => x.id === id)!;
    if (c.walletBalance + d < 0) {
      throw new UserError(`${c.name} has already spent the referral reward, so this visit can't be voided automatically.`);
    }
  }
  const customers = applyDelta(data.customers, delta, (c) => (rewards.length && c.id === visit.customerId ? { referralRewardedAt: null } : {}));
  const voided: Visit = { ...visit, status: "VOID", voidedAt: when, voidReason: input.reason.trim() || (input.by === "staff" ? "Undone by staff" : "Voided by owner") };
  return {
    data: { ...data, customers, visits: data.visits.map((v) => (v.id === visit.id ? voided : v)), walletTxs: [...data.walletTxs, ...txs] },
    result: voided,
  };
}

/** The thank-you WhatsApp sent after a paid visit — it carries the referral code. */
export function receiptMessage(data: Data, visitId: string): { phone: string; message: string } {
  const visit = data.visits.find((v) => v.id === visitId);
  const customer = visit && data.customers.find((c) => c.id === visit.customerId);
  if (!visit || !customer) throw new UserError("Visit not found");
  const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;
  return {
    phone: customer.phone,
    // Offers and the referral pitch only go to customers who opted in to messages.
    message: renderTemplate(customer.marketingConsentAt ? config.receiptTemplate : config.receiptTemplatePlain, {
      name: customer.name.split(" ")[0],
      salon: config.displayName,
      total: inr(visit.total),
      balance: inr(customer.walletBalance),
      code: customer.referralCode,
    }),
  };
}

// ── Reminders ────────────────────────────────────────────────────────────────

/**
 * Customers overdue for a repeat visit, computed per service against each service's own cycle,
 * with where each one is on the reminder ladder: WhatsApp 1 when due → WhatsApp 2 some days
 * later → a phone call by the stylist who served them last → then nothing until they visit.
 * Each step is shared by the whole salon: once someone does it, it is done for everyone.
 */
export function overdueReminders(data: Data, now = new Date()) {
  const last = new Map<string, { customerId: string; serviceId: string; at: string; staffId: string }>();
  for (const v of data.visits) {
    if (!paid(v)) continue;
    for (const serviceId of v.serviceIds) {
      const key = `${v.customerId}|${serviceId}`;
      const prev = last.get(key);
      if (!prev || at(v) > prev.at) last.set(key, { customerId: v.customerId, serviceId, at: at(v), staffId: v.staffId });
    }
  }
  const ladder = config.reminderLadder;
  const byId = new Map(data.customers.map((c) => [c.id, c]));
  return [...last.values()]
    .flatMap((v) => {
      const customer = byId.get(v.customerId);
      const service = config.services.find((s) => s.id === v.serviceId);
      const lastVisit = new Date(v.at);
      const dueAt = dueDate(v.serviceId, lastVisit);
      // Only customers who opted in to messages.
      if (!customer?.marketingConsentAt || customer.deletedAt || !service || !dueAt || dueAt > now) return [];
      const since = data.reminders
        .filter((r) => r.customerId === customer.id && r.serviceId === service.id && r.createdAt > v.at)
        .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
      // Called and still not back: stop reminding until their next visit.
      if (since.some((r) => r.status === "CALLED")) return [];
      const messages = since.filter((r) => r.status !== "CALLED");
      const reminded = messages[messages.length - 1];
      const step: "message1" | "message2" | "call" = messages.length === 0 ? "message1" : messages.length === 1 ? "message2" : "call";
      const after = (r: ReminderLog, days: number) => new Date(Date.parse(r.createdAt) + days * DAY_MS);
      const readyAt = step === "message1" ? dueAt : step === "message2" ? after(reminded, ladder.secondAfterDays) : after(reminded, ladder.callAfterDays);
      const caller = data.staff.find((s) => s.id === v.staffId) ?? null;
      return [
        {
          key: `${customer.id}|${service.id}`,
          customerId: customer.id,
          name: customer.name,
          phone: customer.phone,
          serviceId: service.id,
          serviceName: service.name,
          lastVisit,
          dueAt,
          daysOverdue: daysBetween(dueAt, now),
          /** The next step on the ladder. */
          step,
          remindedAt: reminded ? new Date(reminded.createdAt) : null,
          /** Who sent the last message: a stylist's name, "Owner", or null if none sent yet. */
          remindedBy: reminded ? (data.staff.find((s) => s.id === reminded.sentBy)?.name ?? "Owner") : null,
          /** The next step is locked for everyone until then. */
          lockedUntil: readyAt > now ? readyAt : null,
          /** The stylist who served them last: the only one who makes the call. */
          callerId: caller?.id ?? null,
          callerName: caller?.name ?? null,
          message: renderReminder(config.reminderTemplate, { name: customer.name.split(" ")[0], service: service.name.toLowerCase() }),
        },
      ];
    })
    .sort((a, b) => b.daysOverdue - a.daysOverdue);
}

export function logReminder(
  data: Data,
  input: { customerId: string; serviceId: string; message: string; status: ReminderLog["status"]; by?: string | null },
  now = new Date(),
): Op<ReminderLog> {
  const message = input.message.trim();
  if (!message) throw new UserError("Message can't be empty");
  if (message.length > 1000) throw new UserError("Message is too long");
  const customer = data.customers.find((c) => c.id === input.customerId);
  if (!customer) throw new UserError("Customer not found");
  if (!customer.marketingConsentAt || customer.deletedAt) throw new UserError("This customer hasn't agreed to receive messages");
  const item = ladderStep(data, customer.id, input.serviceId, now);
  if (item.step === "call") throw new UserError(`Both messages have gone. The next step is a call from ${item.callerName?.split(" ")[0] ?? "their stylist"}.`);
  const log: ReminderLog = { id: newId(), customerId: customer.id, serviceId: input.serviceId, message, status: input.status, sentBy: input.by ?? null, createdAt: now.toISOString() };
  return { data: { ...data, reminders: [...data.reminders, log] }, result: log };
}

/**
 * Whether a reminder is this person's to do now: any message that isn't locked, and a call
 * only for the stylist who served the customer last (the owner, staffId null, sees all).
 */
export function reminderIsMine(r: ReturnType<typeof overdueReminders>[number], staffId: string | null): boolean {
  if (r.lockedUntil) return false;
  return r.step !== "call" || !staffId || !r.callerId || r.callerId === staffId;
}

/** Where one customer's service is on the ladder now; refuses when nothing is due or the step is locked. */
function ladderStep(data: Data, customerId: string, serviceId: string, now: Date) {
  const item = overdueReminders(data, now).find((r) => r.customerId === customerId && r.serviceId === serviceId);
  if (!item) {
    const called = data.reminders.some((r) => r.customerId === customerId && r.serviceId === serviceId && r.status === "CALLED");
    throw new UserError(called ? "Already called. No more reminders until they visit again." : "This customer isn't due a reminder");
  }
  if (item.lockedUntil) {
    const who = item.remindedBy === "Owner" ? "the owner" : item.remindedBy?.split(" ")[0];
    const next = item.step === "message2" ? "Message 2" : "The call";
    throw new UserError(`Already reminded by ${who} on ${istDate(item.remindedAt!)}. ${next} can go from ${istDate(item.lockedUntil)}.`);
  }
  return item;
}

/**
 * The last step: the stylist who served the customer last calls them. Only that stylist (or
 * the owner) can log it. After the call nobody reminds this customer again until they visit.
 */
export function logReminderCall(data: Data, input: { customerId: string; serviceId: string; by: string | null; note?: string }, now = new Date()): Op<ReminderLog> {
  const item = ladderStep(data, input.customerId, input.serviceId, now);
  if (item.step !== "call") throw new UserError("Send the WhatsApp messages first; the call comes after both");
  if (input.by && item.callerId && input.by !== item.callerId) throw new UserError(`${item.callerName?.split(" ")[0]} served them last, so ${item.callerName?.split(" ")[0]} makes the call`);
  const log: ReminderLog = {
    id: newId(),
    customerId: input.customerId,
    serviceId: input.serviceId,
    message: input.note?.trim().slice(0, 300) || "Phone call",
    status: "CALLED",
    sentBy: input.by,
    createdAt: now.toISOString(),
  };
  return { data: { ...data, reminders: [...data.reminders, log] }, result: log };
}

export function whatsappLink(phone10: string, message: string): string {
  return `https://wa.me/91${phone10}?text=${encodeURIComponent(message)}`;
}


// ── Privacy requests (DPDP) ──────────────────────────────────────────────────

/** Turns WhatsApp reminders and offers on or off. "STOP" replies are handled here. */
export function setMarketingConsent(
  data: Data,
  input: { customerId: string; on: boolean; by: string | null },
  now = new Date(),
): Op<Customer> {
  const customer = data.customers.find((c) => c.id === input.customerId && live(c));
  if (!customer) throw new UserError("Customer not found");
  const updated: Customer = { ...customer, marketingConsentAt: input.on ? now.toISOString() : null };
  const changed = Boolean(customer.marketingConsentAt) !== input.on;
  return {
    data: {
      ...data,
      customers: data.customers.map((c) => (c.id === customer.id ? updated : c)),
      privacyLog: changed ? logPrivacy(data, customer.id, input.on ? "MARKETING_ON" : "MARKETING_OFF", input.by, now) : data.privacyLog,
    },
    result: updated,
  };
}

/**
 * How much of the wallet is refundable. Bonus and referral credit are promotional
 * and not refundable; they count as spent first, so the customer keeps the most
 * refundable money.
 */
export function refundableBalance(data: Data, customerId: string) {
  const customer = data.customers.find((c) => c.id === customerId);
  if (!customer) throw new UserError("Customer not found");
  let promo = 0;
  let spent = 0;
  for (const t of data.walletTxs) {
    if (t.customerId !== customerId) continue;
    if (t.type === "BONUS" || t.type === "REFERRAL_REWARD" || t.type === "REFERRAL_REVERSAL") promo += t.amount;
    if (t.type === "SPEND" || t.type === "REFUND") spent -= t.amount;
  }
  const promoLeft = Math.min(customer.walletBalance, Math.max(0, promo - Math.max(0, spent)));
  return { balance: customer.walletBalance, refundable: customer.walletBalance - promoLeft, promotional: promoLeft };
}

/** Closes a wallet: hands back the refundable money and cancels unused promotional credit. */
export function closeWallet(
  data: Data,
  input: { customerId: string; method: PaymentMethod; by: string | null },
  now = new Date(),
): Op<{ refunded: number; writtenOff: number }> {
  const customer = data.customers.find((c) => c.id === input.customerId && live(c));
  if (!customer) throw new UserError("Customer not found");
  const { refundable, promotional } = refundableBalance(data, customer.id);
  const when = now.toISOString();
  const txs: WalletTx[] = [];
  if (refundable > 0) {
    txs.push({ id: newId(), customerId: customer.id, type: "CASHOUT", amount: -refundable, visitId: null, note: `Refunded by ${input.method}`, createdAt: when });
  }
  if (promotional > 0) {
    txs.push({ id: newId(), customerId: customer.id, type: "WRITE_OFF", amount: -promotional, visitId: null, note: "Unused bonus / referral credit", createdAt: when });
  }
  return {
    data: {
      ...data,
      customers: data.customers.map((c) => (c.id === customer.id ? { ...c, walletBalance: 0 } : c)),
      walletTxs: [...data.walletTxs, ...txs],
      privacyLog: logPrivacy(data, customer.id, "WALLET_CLOSED", input.by, now),
    },
    result: { refunded: refundable, writtenOff: promotional },
  };
}

/** Everything the salon holds about one customer, as plain text they can be sent (right of access). */
export function customerDataExport(data: Data, customerId: string, now = new Date()): Op<string> {
  const p = getProfile(data, customerId);
  if (p.deletedAt) throw new UserError("This customer's data has been erased");
  const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;
  const day = (iso: string) => istDate(new Date(iso));
  const names = new Map([...config.services, ...config.addOns].map((s) => [s.id, s.name]));
  const lines = [
    `Your data at ${config.displayName} (${config.business.legalName})`,
    `Name: ${p.name}`,
    `Mobile: ${p.phone}${p.guardianConsent ? " (parent/guardian)" : ""}`,
    `Customer since: ${day(p.createdAt)}`,
    `Consent to keep details: ${p.consentAt ? day(p.consentAt) : "no"}`,
    `WhatsApp reminders and offers: ${p.marketingConsentAt ? "on since " + day(p.marketingConsentAt) : "off"}`,
    `Wallet balance: ${inr(p.walletBalance)}`,
    `Referral code: ${p.referralCode}`,
    "",
    `Visits (${p.visits.length}):`,
    ...p.visits.map((v) => `- ${day(v.paidAt ?? v.createdAt)}: ${[...v.serviceIds, ...v.addOnIds].map((id) => names.get(id) ?? id).join(", ")}, ${inr(v.total)}${v.status === "VOID" ? " (cancelled)" : ""}`),
    "",
    `Wallet entries (${p.walletTxs.length}):`,
    ...p.walletTxs.map((t) => `- ${day(t.createdAt)}: ${t.type.replace(/_/g, " ").toLowerCase()} ${t.amount > 0 ? "+" : ""}${inr(t.amount)}`),
    "",
    `To correct or delete this data, or to complain, contact ${config.business.grievance.name}, ${config.business.grievance.phone}, ${config.business.grievance.email}.`,
  ];
  return { data: { ...data, privacyLog: logPrivacy(data, customerId, "DATA_SHARED", null, now) }, result: lines.join("\n") };
}

function erase(data: Data, customerId: string, now: Date): Data {
  return {
    ...data,
    customers: data.customers.map((c) =>
      c.id === customerId
        ? { ...c, name: "Deleted customer", phone: "", referralCode: "", consentAt: null, marketingConsentAt: null, deletedAt: now.toISOString() }
        : c,
    ),
    // Copies of messages and bookings carry the name or the customer's words, so they go too.
    reminders: data.reminders.filter((r) => r.customerId !== customerId),
    appointments: data.appointments.filter((a) => a.customerId !== customerId),
  };
}

/**
 * Erases a customer's personal data on request. Their visits and wallet entries
 * stay for the salon's accounts, linked to an anonymous record. The wallet must
 * be closed first so no money is lost silently.
 */
export function deleteCustomer(data: Data, input: { customerId: string; by: string | null }, now = new Date()): Op<null> {
  const customer = data.customers.find((c) => c.id === input.customerId && live(c));
  if (!customer) throw new UserError("Customer not found");
  if (data.visits.some((v) => v.customerId === customer.id && v.status === "OPEN")) {
    throw new UserError("Finish or cancel the open visit first");
  }
  if (customer.walletBalance !== 0) throw new UserError("Close the wallet first: refund the balance, then delete");
  const next = erase(data, customer.id, now);
  return { data: { ...next, privacyLog: logPrivacy(next, customer.id, "DELETED", input.by, now) }, result: null };
}

/**
 * Retention: erases long-inactive customers (wallet ₹0, nothing open), deletes old
 * attendance selfies and old message copies. Returns the selfie keys whose files
 * the platform layer should delete. Safe to run on every app start.
 */
export function purgeExpired(data: Data, now = new Date()): Op<{ photoKeys: string[]; customersErased: number }> {
  const r = config.retention;
  const cutoff = (days: number) => new Date(now.getTime() - days * DAY_MS).toISOString();
  const photoCut = cutoff(r.attendancePhotoDays);
  const photoKeys: string[] = [];
  const attendance = data.attendance.map((a) => {
    if (a.photoKey && a.checkInAt < photoCut) {
      photoKeys.push(a.photoKey);
      return { ...a, photoKey: null };
    }
    return a;
  });
  const reminderCut = cutoff(r.reminderLogDays);
  let next: Data = {
    ...data,
    attendance,
    reminders: data.reminders.filter((x) => x.createdAt >= reminderCut),
    appointments: data.appointments.filter((a) => a.at >= reminderCut),
  };

  const lastActive = new Map<string, string>();
  const bump = (id: string, when: string) => {
    if ((lastActive.get(id) ?? "") < when) lastActive.set(id, when);
  };
  for (const c of next.customers) bump(c.id, c.createdAt);
  for (const v of next.visits) bump(v.customerId, v.paidAt ?? v.createdAt);
  for (const t of next.walletTxs) bump(t.customerId, t.createdAt);
  const customerCut = cutoff(r.inactiveCustomerDays);
  const stale = next.customers.filter(
    (c) =>
      live(c) &&
      c.walletBalance === 0 &&
      (lastActive.get(c.id) ?? "") < customerCut &&
      !next.visits.some((v) => v.customerId === c.id && v.status === "OPEN"),
  );
  for (const c of stale) {
    next = erase(next, c.id, now);
    next = { ...next, privacyLog: logPrivacy(next, c.id, "AUTO_ERASED", "auto", now) };
  }
  return { data: next, result: { photoKeys, customersErased: stale.length } };
}

// ── Appointments ─────────────────────────────────────────────────────────────

const A = () => config.appointments;
const hm = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};
const fmtHm = (mins: number) => `${String(Math.floor(mins / 60)).padStart(2, "0")}:${String(mins % 60).padStart(2, "0")}`;
/** A salon-local (IST) day and "HH:MM" as an instant. */
export function istInstant(day: string, time: string): Date {
  const [y, mo, d] = day.split("-").map(Number);
  return new Date(Date.UTC(y, mo - 1, d) + (hm(time) - 330) * 60000);
}
const istDow = (day: string) => new Date(`${day}T00:00:00Z`).getUTCDay();
const overlaps = (aStart: number, aMin: number, bStart: number, bMin: number) => aStart < bStart + bMin * 60000 && bStart < aStart + aMin * 60000;

/** Minutes the chosen services take together. */
export function appointmentMinutes(serviceIds: string[]): number {
  const total = serviceIds.reduce((sum, id) => sum + (config.services.find((s) => s.id === id)?.minutes ?? 0), 0);
  return Math.max(A().slotMinutes, total);
}

function busyAt(data: Data, start: number, minutes: number, staffId: string | null, ignoreId?: string) {
  const booked = data.appointments.filter((a) => a.status === "BOOKED" && a.id !== ignoreId && overlaps(Date.parse(a.at), a.minutes, start, minutes));
  if (staffId) return booked.some((a) => a.staffId === staffId);
  // "Anyone free": full when every active stylist (or the whole floor) is taken.
  const stylists = Math.max(1, data.staff.filter((x) => x.active).length);
  return booked.length >= stylists;
}

/** Bookable start times for a day. Past times today and closed days give none. */
export function appointmentSlots(data: Data, day: string, input: { staffId: string | null; minutes: number }, now = new Date()) {
  if (A().closedDays.includes(istDow(day))) return [];
  const out: { time: string; free: boolean }[] = [];
  for (let t = hm(A().open); t + input.minutes <= hm(A().close); t += A().slotMinutes) {
    const start = istInstant(day, fmtHm(t)).getTime();
    if (start <= now.getTime()) continue;
    out.push({ time: fmtHm(t), free: !busyAt(data, start, input.minutes, input.staffId) });
  }
  return out;
}

/** Books a customer in, usually straight after they reply to a reminder on WhatsApp. */
export function bookAppointment(
  data: Data,
  input: { customerId: string; serviceIds: string[]; staffId: string | null; day: string; time: string; source: Appointment["source"]; note?: string; by: string | null },
  now = new Date(),
): Op<Appointment> {
  const customer = data.customers.find((c) => c.id === input.customerId && !c.deletedAt);
  if (!customer) throw new UserError("Customer not found");
  if (!customer.consentAt) throw new UserError("Save the customer's consent first");
  const serviceIds = input.serviceIds.filter((id) => config.services.some((s) => s.id === id));
  if (!serviceIds.length) throw new UserError("Pick at least one service");
  if (input.staffId && !data.staff.some((x) => x.id === input.staffId && x.active)) throw new UserError("That stylist isn't available");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.day) || !/^\d{2}:\d{2}$/.test(input.time)) throw new UserError("Pick a day and a time");
  if (A().closedDays.includes(istDow(input.day))) throw new UserError("The salon is closed that day");
  const minutes = appointmentMinutes(serviceIds);
  const startMin = hm(input.time);
  if (startMin < hm(A().open) || startMin + minutes > hm(A().close)) throw new UserError(`Book between ${A().open} and ${A().close}`);
  const at = istInstant(input.day, input.time);
  if (at.getTime() <= now.getTime()) throw new UserError("That time has already passed");
  if (busyAt(data, at.getTime(), minutes, input.staffId)) throw new UserError("That time is already taken");
  if (data.appointments.some((a) => a.customerId === customer.id && a.status === "BOOKED" && overlaps(Date.parse(a.at), a.minutes, at.getTime(), minutes))) {
    throw new UserError(`${customer.name.split(" ")[0]} is already booked then`);
  }
  const appt: Appointment = {
    id: newId(),
    customerId: customer.id,
    serviceIds,
    staffId: input.staffId,
    at: at.toISOString(),
    minutes,
    status: "BOOKED",
    source: input.source,
    note: input.note?.trim().slice(0, 140) || null,
    reminderSentAt: null,
    reminderChannel: null,
    visitId: null,
    createdBy: input.by,
    createdAt: now.toISOString(),
  };
  return { data: { ...data, appointments: [...data.appointments, appt] }, result: appt };
}

function setAppt(data: Data, id: string, patch: Partial<Appointment>): Op<Appointment> {
  const appt = data.appointments.find((a) => a.id === id);
  if (!appt) throw new UserError("Appointment not found");
  const next = { ...appt, ...patch };
  return { data: { ...data, appointments: data.appointments.map((a) => (a.id === id ? next : a)) }, result: next };
}

export function cancelAppointment(data: Data, id: string): Op<Appointment> {
  const appt = data.appointments.find((a) => a.id === id);
  if (appt?.status !== "BOOKED") throw new UserError("Only a booked appointment can be cancelled");
  return setAppt(data, id, { status: "CANCELLED" });
}

export function markNoShow(data: Data, id: string, now = new Date()): Op<Appointment> {
  const appt = data.appointments.find((a) => a.id === id);
  if (appt?.status !== "BOOKED") throw new UserError("Only a booked appointment can be marked");
  if (Date.parse(appt.at) > now.getTime()) throw new UserError("The appointment time hasn't come yet");
  return setAppt(data, id, { status: "NO_SHOW" });
}

/** The customer has arrived: opens their visit with the booked services. */
export function appointmentArrived(data: Data, input: { id: string; staffId: string }, now = new Date()): Op<{ appointment: Appointment; visit: Visit }> {
  const appt = data.appointments.find((a) => a.id === input.id);
  if (appt?.status !== "BOOKED") throw new UserError("This appointment isn't open");
  const started = startVisit(data, { customerId: appt.customerId, serviceIds: appt.serviceIds, addOnIds: [], staffId: appt.staffId ?? input.staffId }, now);
  const marked = setAppt(started.data, appt.id, { status: "ARRIVED", visitId: started.result.id });
  return { data: marked.data, result: { appointment: marked.result, visit: started.result } };
}

function describe(data: Data, a: Appointment) {
  const customer = data.customers.find((c) => c.id === a.customerId);
  const stylist = a.staffId ? data.staff.find((x) => x.id === a.staffId) : null;
  const local = new Date(Date.parse(a.at) + 330 * 60000);
  return {
    ...a,
    day: istDate(new Date(a.at)),
    time: fmtHm(local.getUTCHours() * 60 + local.getUTCMinutes()),
    customerName: customer?.name ?? "Customer",
    phone: customer?.phone ?? "",
    serviceNames: a.serviceIds.map((id) => config.services.find((s) => s.id === id)?.name ?? id),
    stylistName: stylist?.name ?? null,
  };
}

/** One day's appointments in time order, with names ready to show. */
export function appointmentsOn(data: Data, day: string) {
  return data.appointments
    .filter((a) => istDate(new Date(a.at)) === day)
    .sort((a, b) => a.at.localeCompare(b.at))
    .map((a) => describe(data, a));
}

/** Booked count per day of a month (YYYY-MM), for the calendar dots. */
export function appointmentMonth(data: Data, month: string): Record<string, number> {
  const out: Record<string, number> = {};
  for (const a of data.appointments) {
    if (a.status === "CANCELLED") continue;
    const day = istDate(new Date(a.at));
    if (day.startsWith(month)) out[day] = (out[day] ?? 0) + 1;
  }
  return out;
}

/**
 * How full each day of a month is, for the calendar rings: bookings, booked minutes and
 * load (0–1) against the open hours of one stylist, or of every active stylist when
 * `staffId` is null. Cancelled bookings don't count; no-shows do (the time was held).
 */
export function appointmentLoad(data: Data, month: string, staffId: string | null): Record<string, { count: number; minutes: number; load: number }> {
  const stylists = staffId ? 1 : Math.max(1, data.staff.filter((x) => x.active).length);
  const capacity = (hm(A().close) - hm(A().open)) * stylists;
  const out: Record<string, { count: number; minutes: number; load: number }> = {};
  for (const a of data.appointments) {
    if (a.status === "CANCELLED" || (staffId && a.staffId !== staffId)) continue;
    const day = istDate(new Date(a.at));
    if (!day.startsWith(month)) continue;
    const d = (out[day] ??= { count: 0, minutes: 0, load: 0 });
    d.count += 1;
    d.minutes += a.minutes;
    d.load = Math.min(1, d.minutes / capacity);
  }
  return out;
}

/** WhatsApp text for a booking: the confirmation now, or the reminder on the day. */
export function appointmentMessage(data: Data, id: string, kind: "confirm" | "reminder"): { phone: string; message: string } {
  const appt = data.appointments.find((a) => a.id === id);
  if (!appt) throw new UserError("Appointment not found");
  const a = describe(data, appt);
  if (!a.phone) throw new UserError("This customer's number has been deleted");
  // Built by hand: phone locales format dates differently.
  const dd = new Date(`${a.day}T00:00:00Z`);
  const dayLabel = `${"Sun Mon Tue Wed Thu Fri Sat".split(" ")[dd.getUTCDay()]} ${dd.getUTCDate()} ${"Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec".split(" ")[dd.getUTCMonth()]}`;
  const [h, m] = a.time.split(":").map(Number);
  const time = `${((h + 11) % 12) + 1}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
  return {
    phone: a.phone,
    message: renderTemplate(kind === "confirm" ? A().confirmTemplate : A().reminderTemplate, {
      name: a.customerName.split(" ")[0],
      service: a.serviceNames.join(" + ").toLowerCase(),
      salon: config.displayName,
      day: dayLabel,
      time,
      stylist: a.stylistName ? ` with ${a.stylistName.split(" ")[0]}` : "",
    }),
  };
}

/**
 * Today's booked customers who haven't had their reminder yet, once the reminder
 * time has come. Staff send these with one tap; with the WhatsApp Business
 * connection the server sends exactly this list automatically.
 */
export function appointmentRemindersDue(data: Data, now = new Date()) {
  const today = istDate(now);
  if (now.getTime() < istInstant(today, A().reminderAt).getTime()) return [];
  return appointmentsOn(data, today).filter((a) => a.status === "BOOKED" && !a.reminderSentAt && Date.parse(a.at) > now.getTime());
}

export function markAppointmentReminded(data: Data, input: { id: string; channel: "MANUAL" | "AUTO" }, now = new Date()): Op<Appointment> {
  return setAppt(data, input.id, { reminderSentAt: now.toISOString(), reminderChannel: input.channel });
}

// ── Owner dashboard ──────────────────────────────────────────────────────────

export type Range = "today" | "7d" | "30d";

export function ownerDashboard(data: Data, range: Range = "today", now = new Date()) {
  const todayStart = startOfIstDay(now).toISOString();
  const rangeStart = new Date(startOfIstDay(now).getTime() - (range === "today" ? 0 : range === "7d" ? 6 : 29) * DAY_MS).toISOString();

  const today = { visits: 0, total: 0, wallet: 0, cash: 0, upi: 0, card: 0 };
  const staffRevenue = new Map<string, { revenue: number; visits: number }>();
  const spend = new Map<string, { total: number; visits: number }>();
  for (const v of data.visits) {
    if (!paid(v)) continue;
    const when = at(v);
    if (when >= todayStart) {
      today.visits++;
      today.total += v.total;
      today.wallet += v.walletPaid;
      if (v.paymentMethod === "CASH") today.cash += v.directPaid;
      else if (v.paymentMethod === "UPI") today.upi += v.directPaid;
      else today.card += v.directPaid;
    }
    if (when >= rangeStart) {
      const s = staffRevenue.get(v.staffId) ?? { revenue: 0, visits: 0 };
      staffRevenue.set(v.staffId, { revenue: s.revenue + v.total, visits: s.visits + 1 });
    }
    const c = spend.get(v.customerId) ?? { total: 0, visits: 0 };
    spend.set(v.customerId, { total: c.total + v.total, visits: c.visits + 1 });
  }
  const byId = new Map(data.customers.map((c) => [c.id, c]));

  return {
    today,
    range,
    inChair: data.visits.filter((v) => v.status === "OPEN").length,
    byStaff: data.staff
      .filter((s) => s.active || staffRevenue.has(s.id))
      .map((s) => ({ staffId: s.id, name: s.name, chair: s.chair, ...(staffRevenue.get(s.id) ?? { revenue: 0, visits: 0 }) }))
      .sort((a, b) => b.revenue - a.revenue),
    topCustomers: [...spend.entries()]
      .sort((a, b) => b[1].total - a[1].total)
      .slice(0, 20)
      .flatMap(([id, s]) => {
        const c = byId.get(id);
        return c ? [{ id, name: c.name, phone: c.phone, walletBalance: c.walletBalance, lifetimeSpend: s.total, visits: s.visits }] : [];
      }),
    walletLiability: data.customers.reduce((s, c) => s + c.walletBalance, 0),
    customerCount: data.customers.length,
  };
}

/** Recent paid and voided visits, newest first, for the owner's visit log. */
export function recentVisits(data: Data, take = 50) {
  const byId = new Map(data.customers.map((c) => [c.id, c]));
  return data.visits
    .filter((v) => v.status !== "OPEN")
    .sort((a, b) => at(b).localeCompare(at(a)))
    .slice(0, take)
    .map((v) => ({ visit: v, customer: byId.get(v.customerId) ?? null }));
}

// ── Staff & owner accounts ───────────────────────────────────────────────────

export function setOwnerSecret(data: Data, secret: Secret): Op<null> {
  return { data: { ...data, owner: { secret } }, result: null };
}

export function addStaff(
  data: Data,
  input: { name: string; phone: string; chair: string; secret: Secret },
  now = new Date(),
): Op<Staff> {
  const name = input.name.trim().replace(/\s+/g, " ");
  if (!name) throw new UserError("Staff name is required");
  const phone = normalizePhone(input.phone);
  if (!phone) throw new UserError("Enter the staff member's 10-digit mobile number");
  if (data.staff.some((s) => s.phone === phone)) throw new UserError("A staff member with this number already exists");
  const staff: Staff = { id: newId(), name, phone, chair: input.chair.trim() || "Chair", secret: input.secret, active: true, createdAt: now.toISOString() };
  return { data: { ...data, staff: [...data.staff, staff] }, result: staff };
}

export function updateStaff(data: Data, staffId: string, patch: Partial<Pick<Staff, "name" | "chair" | "active" | "secret">>): Op<Staff> {
  const s = data.staff.find((x) => x.id === staffId);
  if (!s) throw new UserError("Staff member not found");
  const next = { ...s, ...patch };
  return { data: { ...data, staff: data.staff.map((x) => (x.id === staffId ? next : x)) }, result: next };
}

export function findStaffByPhone(data: Data, rawPhone: string): Staff | null {
  const phone = normalizePhone(rawPhone);
  return (phone && data.staff.find((s) => s.phone === phone)) || null;
}

// ── Attendance ───────────────────────────────────────────────────────────────

export function todaysAttendance(data: Data, staffId: string, now = new Date()): Attendance | null {
  const day = istDate(now);
  return data.attendance.find((a) => a.staffId === staffId && a.date === day) ?? null;
}

/** One check-in per staff member per day, with the selfie taken at the counter. */
export function markAttendance(data: Data, input: { staffId: string; photoKey: string | null }, now = new Date()): Op<Attendance> {
  const staff = data.staff.find((s) => s.id === input.staffId && s.active);
  if (!staff) throw new UserError("Staff member not found");
  if (todaysAttendance(data, staff.id, now)) throw new UserError("Attendance is already marked for today");
  const rec: Attendance = { id: newId(), staffId: staff.id, date: istDate(now), checkInAt: now.toISOString(), photoKey: input.photoKey };
  return { data: { ...data, attendance: [...data.attendance, rec] }, result: rec };
}

/** A month of attendance: one row per staff member, one cell per day. */
export function attendanceMonth(data: Data, month: string /* YYYY-MM */) {
  const [y, m] = month.split("-").map(Number);
  const days = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const dates = Array.from({ length: days }, (_, i) => `${month}-${String(i + 1).padStart(2, "0")}`);
  const recs = data.attendance.filter((a) => a.date.startsWith(month));
  return {
    month,
    dates,
    rows: data.staff
      .filter((s) => s.active || recs.some((r) => r.staffId === s.id))
      .map((s) => {
        const mine = new Map(recs.filter((r) => r.staffId === s.id).map((r) => [r.date, r]));
        const cells = dates.map((d) => {
          const r = mine.get(d);
          return r ? { date: d, record: r, late: isLate(r.checkInAt) } : { date: d, record: null, late: false };
        });
        return {
          staff: s,
          cells,
          present: cells.filter((c) => c.record).length,
          late: cells.filter((c) => c.late).length,
        };
      }),
  };
}

/** The owner's monthly attendance export: a summary sheet, then one sheet per day. */
export function attendanceSheets(data: Data, month: string, now = new Date()) {
  const m = attendanceMonth(data, month);
  const today = istDate(now);
  const time = (iso: string) => {
    const d = new Date(new Date(iso).getTime() + 330 * 60 * 1000);
    return `${String(d.getUTCHours()).padStart(2, "0")}:${String(d.getUTCMinutes()).padStart(2, "0")}`;
  };
  const pastDates = m.dates.filter((d) => d <= today);
  const summary = {
    name: `Summary ${month}`,
    rows: [
      ["Staff", "Mobile", "Chair", "Days present", "Days late", "Days absent"],
      ...m.rows.map((r) => {
        const absent = r.cells.filter((c) => c.date <= today && !c.record).length;
        return [r.staff.name, r.staff.phone, r.staff.chair, r.present, r.late, absent];
      }),
    ] as (string | number)[][],
  };
  const daySheets = pastDates.map((date) => ({
    name: date,
    rows: [
      ["Staff", "Mobile", "Chair", "Status", "Check-in (IST)", "Selfie"],
      ...m.rows.map((r) => {
        const c = r.cells.find((x) => x.date === date)!;
        return c.record
          ? [r.staff.name, r.staff.phone, r.staff.chair, c.late ? "Late" : "Present", time(c.record.checkInAt), c.record.photoKey ? "Saved in app" : "None"]
          : [r.staff.name, r.staff.phone, r.staff.chair, "Absent", "", ""];
      }),
    ] as (string | number)[][],
  }));
  return [summary, ...daySheets];
}
