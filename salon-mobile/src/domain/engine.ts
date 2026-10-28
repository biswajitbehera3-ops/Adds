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
import type { Appointment, Attendance, CheckSettings, Customer, Data, LeaveRequest, PaymentMethod, PrivacyEvent, ReminderLog, Secret, Staff, Visit, VisitExtra, WalletTx } from "./types";

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
const inrText = (n: number) => `₹${n.toLocaleString("en-IN")}`;

/** The misuse-check limits: the owner's settings, or the config file's defaults. */
export function checkSettings(data: Data): CheckSettings {
  return { walletCodeAbove: data.checks?.walletCodeAbove ?? config.checks.walletCodeAbove, referralMonthlyLimit: data.checks?.referralMonthlyLimit ?? config.checks.referralMonthlyLimit };
}

/**
 * The newest time already saved on this phone; a phone clock earlier than this has been set back.
 * Every saved timestamp counts (SECURITY-LESSONS 5), but never a booking's own start time, which is in the future.
 */
export function latestRecordTime(data: Data): number {
  let t = 0;
  const see = (iso: string | null | undefined) => {
    const ms = iso ? Date.parse(iso) : NaN;
    if (ms > t) t = ms;
  };
  for (const v of data.visits) (see(v.createdAt), see(v.paidAt), see(v.voidedAt), see(v.leftAt));
  for (const a of data.attendance) see(a.checkInAt);
  for (const w of data.walletTxs) see(w.createdAt);
  for (const c of data.customers) (see(c.createdAt), see(c.deletedAt));
  for (const a of data.appointments) (see(a.createdAt), see(a.reminderSentAt), see(a.closedAt));
  for (const l of data.leaves) (see(l.createdAt), see(l.decidedAt), see(l.seenAt));
  for (const r of data.reminders) see(r.createdAt);
  for (const d of data.dayClosings ?? []) see(d.at);
  for (const p of data.privacyLog) see(p.at);
  for (const s of data.staff) see(s.createdAt);
  return t;
}

/** Normal use moves the trusted time forward at most this far per app start, return to the app or save. */
const CLOCK_STEP_DAYS = 3;
/** Automatic clean-up runs only within this many days of the owner last confirming the date. */
const CONFIRM_VALID_DAYS = 30;

/** The time this phone trusts (SECURITY-LESSONS 1): the clock anchor, or for data never watched, the newest saved record. */
export function trustedTime(data: Data): number {
  return data.clock?.anchor ? Date.parse(data.clock.anchor) : latestRecordTime(data);
}

/**
 * Refuses a change made while the phone's clock is behind the trusted time (MISUSE-CHECKS 9). A record
 * saved with the clock ahead never raises the trusted time, and the owner can always reset it by
 * confirming the date, so a clock trick can't lock the salon out for good (run 3).
 */
export function assertClockNotBehind(data: Data, now: Date) {
  if (now.getTime() < trustedTime(data) - 5 * 60000) {
    throw new UserError("This phone's clock is behind the last date the salon used. Set the date and time to automatic, or ask the owner to confirm today's date in Today's checks.");
  }
}

/** The phone's clock is behind the trusted time: saves are refused until it is put right or the owner confirms the date. */
export function clockBehind(data: Data, now = new Date()): boolean {
  return !!data.clock?.anchor && now.getTime() < Date.parse(data.clock.anchor) - 5 * 60000;
}

/**
 * Whether automatic clean-up may delete anything now (SECURITY-LESSONS 1). The trusted time can be walked
 * forward in small steps by changing the date again and again, so clean-up also needs the owner to have
 * confirmed the date in the last 30 days, at a time not after now. The owner sees the date when confirming.
 */
export function cleanupAllowed(data: Data, now = new Date()): boolean {
  const c = data.clock;
  if (!c?.confirmedAt || c.hold) return false;
  const confirmed = Date.parse(c.confirmedAt);
  const t = now.getTime();
  return t >= confirmed - 5 * 60000 && t <= confirmed + CONFIRM_VALID_DAYS * DAY_MS && !clockBehind(data, now);
}

/**
 * Watches the phone's clock on every app start, return to the app and save (SECURITY-LESSONS 1, 2).
 * A clock set back is logged once for the owner's checks. The trusted time follows the clock only in
 * small forward steps; a bigger jump is noted as a hold until the owner confirms the date.
 * Run it on the data as it was before a change, so a record saved at the new time can't vouch for it.
 */
export function observeClock(data: Data, now = new Date()): Data {
  const seen = data.clock?.lastSeen ? Date.parse(data.clock.lastSeen) : 0;
  const t = now.getTime();
  let backJumps = data.clock?.backJumps ?? [];
  // One entry per set-back: repeated looks while the clock stays behind don't push older ones out.
  if (seen && t < seen - 5 * 60000 && !backJumps.some((j) => j.from === new Date(seen).toISOString())) {
    backJumps = [...backJumps, { from: new Date(seen).toISOString(), to: now.toISOString() }].slice(-20);
  }
  let anchor = trustedTime(data) || t;
  let hold = data.clock?.hold ?? null;
  if (t > anchor + CLOCK_STEP_DAYS * DAY_MS) {
    if (!hold) hold = { from: new Date(anchor).toISOString(), to: now.toISOString() };
  } else anchor = Math.max(anchor, t);
  return { ...data, clock: { ...data.clock, lastSeen: new Date(Math.max(seen, t)).toISOString(), anchor: new Date(anchor).toISOString(), backJumps, hold } };
}

/**
 * The owner confirms the phone's date is right (owner password): it becomes the trusted time, forward or
 * back, and clean-up may run for the next 30 days. Never blocked by the clock checks, so the owner can
 * always undo a clock trick.
 */
export function confirmClock(data: Data, now = new Date()): Op<null> {
  const iso = now.toISOString();
  return { data: { ...data, clock: { lastSeen: iso, anchor: iso, confirmedAt: iso, backJumps: data.clock?.backJumps ?? [], hold: null } }, result: null };
}

const at = (v: Visit) => v.paidAt ?? v.createdAt;

// ── Migration ────────────────────────────────────────────────────────────────

/** Upgrades stored data from older versions of the app. */
export function migrate(raw: unknown): Data {
  const data = migrateShape(raw);
  // Notes from before SECURITY-LESSONS 6 named the friend; no stored note may hold a name (run 3).
  if (!Array.isArray(data.walletTxs)) return data;
  return { ...data, walletTxs: data.walletTxs.map((t) => (t?.type === "REFERRAL_REWARD" && typeof t.note === "string" && t.note.startsWith("Referred ") && t.note !== REFERRAL_NOTE ? { ...t, note: REFERRAL_NOTE } : t)) };
}

function migrateShape(raw: unknown): Data {
  const d = raw as Record<string, unknown> & { version?: number };
  // Leave requests arrived within version 4, so older v4 data simply has none yet.
  if (d.version === 4) return { ...(d as unknown as Data), leaves: (d.leaves as LeaveRequest[] | undefined) ?? [] };
  if (d.version === 3) return { ...(d as unknown as Omit<Data, "version" | "appointments" | "leaves">), version: 4, appointments: [], leaves: [] };
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
    leaves: [],
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

/** The referrer's reward note. It never holds the friend's name, so deleting the friend erases them everywhere (SECURITY-LESSONS 6). */
export const REFERRAL_NOTE = "Referred a friend";

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
    /** The new customer read back the code sent to their WhatsApp (MISUSE-CHECKS 7). */
    referralVerified?: boolean;
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
    if (!input.referralVerified) throw new UserError("Confirm the new customer's number with the WhatsApp code first");
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
    referralVerifiedAt: referredById ? when : null,
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
    .filter((v) => v.customerId === id && v.status !== "OPEN" && v.status !== "LEFT")
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
  assertClockNotBehind(data, now);
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

/** Services + add-ons at today's prices, plus any "Other" items typed in at the counter. */
export function visitTotal(serviceIds: string[], addOnIds: string[], extras: VisitExtra[] = []) {
  const extra = extras.reduce((s, x) => s + x.price, 0);
  if (!serviceIds.length) {
    if (!extras.length) throw new UserError("Pick at least one service");
    if (addOnIds.length) throw new UserError("Add-ons go with a service from the list");
    return { serviceIds: [], addOnIds: [], total: extra };
  }
  const p = priceItems(serviceIds, addOnIds);
  return { serviceIds: p.serviceIds, addOnIds: p.addOnIds, total: p.total + extra };
}

function requireStaff(data: Data, staffId: string) {
  if (!data.staff.some((s) => s.id === staffId && s.active)) throw new UserError("Pick who is doing the service");
}

/** Opens a visit when the customer walks in. */
export function startVisit(
  data: Data,
  input: { customerId: string; serviceIds: string[]; addOnIds: string[]; staffId: string },
  now = new Date(),
): Op<Visit> {
  assertClockNotBehind(data, now);
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
  const { serviceIds, addOnIds, total } = visitTotal(input.serviceIds, input.addOnIds, visit.extras);
  const next = { ...visit, serviceIds, addOnIds, staffId: input.staffId, total };
  return { data: { ...data, visits: data.visits.map((v) => (v.id === visit.id ? next : v)) }, result: next };
}

/**
 * The customer left before being served. The visit is kept as LEFT with who recorded it and
 * when, never deleted, so the owner can see it (MISUSE-CHECKS 4). No money was involved.
 */
export function cancelOpenVisit(data: Data, visitId: string, by: string | null = null, now = new Date()): Op<Visit> {
  assertClockNotBehind(data, now);
  const visit = data.visits.find((v) => v.id === visitId);
  if (!visit || visit.status !== "OPEN") throw new UserError("This visit is no longer open");
  const left: Visit = { ...visit, status: "LEFT", leftAt: now.toISOString(), leftBy: by };
  return { data: { ...data, visits: data.visits.map((v) => (v.id === visitId ? left : v)) }, result: left };
}

/** Adds an "Other" service not in the salon's list. It waits for the owner's approval. */
export function addVisitExtra(data: Data, input: { visitId: string; name: string; price: number }): Op<Visit> {
  const visit = data.visits.find((v) => v.id === input.visitId);
  if (!visit || visit.status !== "OPEN") throw new UserError("This visit is no longer open");
  const name = input.name.trim().replace(/\s+/g, " ");
  if (!name) throw new UserError("Name the service");
  if (!Number.isInteger(input.price) || input.price <= 0 || input.price > 100000) throw new UserError("Enter the price in whole rupees");
  const extras = [...(visit.extras ?? []), { name, price: input.price, approvedAt: null }];
  const next = { ...visit, extras, total: visitTotal(visit.serviceIds, visit.addOnIds, extras).total };
  return { data: { ...data, visits: data.visits.map((v) => (v.id === visit.id ? next : v)) }, result: next };
}

export function removeVisitExtra(data: Data, input: { visitId: string; index: number }): Op<Visit> {
  const visit = data.visits.find((v) => v.id === input.visitId);
  if (!visit || visit.status !== "OPEN") throw new UserError("This visit is no longer open");
  const extras = (visit.extras ?? []).filter((_, i) => i !== input.index);
  if (!extras.length && !visit.serviceIds.length) throw new UserError("Pick a service first, then remove this one");
  const next = { ...visit, extras, total: visitTotal(visit.serviceIds, visit.addOnIds, extras).total };
  return { data: { ...data, visits: data.visits.map((v) => (v.id === visit.id ? next : v)) }, result: next };
}

/** The owner approves the "Other" items on a bill (after typing the owner password on the phone). */
export function approveVisitExtras(data: Data, visitId: string, now = new Date()): Op<Visit> {
  const visit = data.visits.find((v) => v.id === visitId);
  if (!visit || visit.status !== "OPEN") throw new UserError("This visit is no longer open");
  const next = { ...visit, extras: (visit.extras ?? []).map((x) => (x.approvedAt ? x : { ...x, approvedAt: now.toISOString() })) };
  return { data: { ...data, visits: data.visits.map((v) => (v.id === visit.id ? next : v)) }, result: next };
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
  input: { visitId: string; walletAmount: number; paymentMethod: PaymentMethod; walletCodeOk?: boolean },
  now = new Date(),
): Op<{ visit: Visit; balance: number; referral: { referrerName: string; referrerReward: number; newCustomerReward: number } | null }> {
  const visit = data.visits.find((v) => v.id === input.visitId);
  if (!visit || visit.status !== "OPEN") throw new UserError("This visit is no longer open");
  // A cash bill backdated into a day already counted would escape the cash check (SECURITY-LESSONS 3).
  assertClockNotBehind(data, now);
  const waiting = (visit.extras ?? []).find((x) => !x.approvedAt);
  if (waiting) throw new UserError(`Ask the owner to approve "${waiting.name}" first`);
  const { total } = visitTotal(visit.serviceIds, visit.addOnIds, visit.extras);
  const walletAmount = input.walletAmount;
  if (!Number.isInteger(walletAmount) || walletAmount < 0) throw new UserError("Invalid wallet amount");
  if (walletAmount > total) throw new UserError("Wallet amount is more than the bill");
  const customer = data.customers.find((c) => c.id === visit.customerId);
  if (!customer) throw new UserError("Customer not found");
  if (walletAmount > customer.walletBalance) throw new UserError("Not enough wallet balance");
  const codeAbove = checkSettings(data).walletCodeAbove;
  if (walletAmount > codeAbove && !input.walletCodeOk) throw new UserError(`Wallet use above ${inrText(codeAbove)} needs the code sent to the customer's WhatsApp`);

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
    walletCodeAt: walletAmount > codeAbove ? when : null,
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
    const { newCustomerReward } = config.referral;
    // A customer earns at most N referral rewards a month (MISUSE-CHECKS 7); the new customer still gets theirs.
    const month = istDate(now).slice(0, 7);
    const earned = data.walletTxs.filter((t) => t.customerId === referrer.id && t.type === "REFERRAL_REWARD" && t.note?.startsWith("Referred") && istDate(new Date(t.createdAt)).startsWith(month)).length;
    const reversed = data.walletTxs.filter((t) => t.customerId === referrer.id && t.type === "REFERRAL_REVERSAL" && istDate(new Date(t.createdAt)).startsWith(month)).length;
    const referrerReward = earned - reversed < checkSettings(data).referralMonthlyLimit ? config.referral.referrerReward : 0;
    if (referrerReward) txs.push({ id: newId(), customerId: referrer.id, type: "REFERRAL_REWARD", amount: referrerReward, visitId: visit.id, note: REFERRAL_NOTE, createdAt: when });
    txs.push({ id: newId(), customerId: customer.id, type: "REFERRAL_REWARD", amount: newCustomerReward, visitId: visit.id, note: "Welcome reward for joining by referral", createdAt: when });
    if (referrerReward) delta.set(referrer.id, referrerReward);
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
  if (visit.status !== "PAID" || !visit.paidAt) return false;
  // A clock set back before the payment must not reopen the window (SECURITY-LESSONS R1-3).
  const elapsed = now.getTime() - new Date(visit.paidAt).getTime();
  return elapsed >= 0 && elapsed <= config.undoWindowMinutes * 60 * 1000;
}

/**
 * Reverses a paid visit: refunds any wallet money used and, if this visit paid
 * out a referral reward, takes that reward back from both wallets.
 */
export function voidVisit(
  data: Data,
  input: { visitId: string; by: "staff" | "owner"; reason: string; staffId?: string | null },
  now = new Date(),
): Op<Visit> {
  const visit = data.visits.find((v) => v.id === input.visitId);
  if (!visit || visit.status !== "PAID") throw new UserError("Only a paid visit can be voided");
  // Staff say why and are named on the record (MISUSE-CHECKS 5).
  if (input.by === "staff" && !input.reason.trim()) throw new UserError("Say why you're undoing this bill");
  assertClockNotBehind(data, now);
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
  const voided: Visit = { ...visit, status: "VOID", voidedAt: when, voidReason: input.reason.trim() || "Voided by owner", voidedBy: input.by === "owner" ? "owner" : (input.staffId ?? visit.staffId) };
  return {
    data: { ...data, customers, visits: data.visits.map((v) => (v.id === visit.id ? voided : v)), walletTxs: [...data.walletTxs, ...txs] },
    result: voided,
  };
}

/** The thank-you WhatsApp sent after a paid visit — it carries the referral code. */
/** Each line of a bill with its price at the time: services, add-ons, then "Other" items. */
export function billLines(visit: Visit): { name: string; price: number }[] {
  return [
    ...visit.serviceIds.map((id) => config.services.find((s) => s.id === id)).filter(Boolean).map((s) => ({ name: s!.name, price: s!.price })),
    ...visit.addOnIds.map((id) => config.addOns.find((a) => a.id === id)).filter(Boolean).map((a) => ({ name: a!.name, price: a!.price })),
    ...(visit.extras ?? []).map((x) => ({ name: x.name, price: x.price })),
  ];
}

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
      items: billLines(visit).map((l) => `${l.name} ${inr(l.price)}`).join(", "),
      total: inr(visit.total),
      wallet: visit.walletPaid ? ` (${inr(visit.walletPaid)} from your wallet)` : "",
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
  // Replayed in the order the entries were saved, so an old spend can't use up a newer bonus (SECURITY-LESSONS R1-4).
  let promo = 0;
  const promoSpent = new Map<string, number>();
  for (const t of data.walletTxs) {
    if (t.customerId !== customerId) continue;
    if (t.type === "BONUS" || t.type === "REFERRAL_REWARD") promo += t.amount;
    else if (t.type === "REFERRAL_REVERSAL") promo = Math.max(0, promo + t.amount);
    else if (t.type === "SPEND") {
      const used = Math.min(promo, -t.amount);
      promo -= used;
      if (t.visitId) promoSpent.set(t.visitId, (promoSpent.get(t.visitId) ?? 0) + used);
    } else if (t.type === "REFUND" && t.visitId) {
      // A voided visit gives back the promotional part of its spend as promotional credit.
      promo += Math.min(t.amount, promoSpent.get(t.visitId) ?? 0);
      promoSpent.delete(t.visitId);
    } else if (t.type === "CASHOUT" || t.type === "WRITE_OFF") promo = 0;
  }
  const promoLeft = Math.min(customer.walletBalance, promo);
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
  assertClockNotBehind(data, now);
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
  // Older referral rewards named the friend in the referrer's history; those notes go too (SECURITY-LESSONS 6).
  const theirVisits = new Set(data.visits.filter((v) => v.customerId === customerId).map((v) => v.id));
  return {
    ...data,
    walletTxs: data.walletTxs.map((t) => (t.type === "REFERRAL_REWARD" && t.customerId !== customerId && t.visitId && theirVisits.has(t.visitId) ? { ...t, note: REFERRAL_NOTE } : t)),
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

/** Erases one customer again, e.g. after restoring an older backup that still holds them (SECURITY-LESSONS 7). */
export function eraseCustomer(data: Data, customerId: string, now = new Date()): Data {
  return erase(data, customerId, now);
}

/**
 * Erases a customer's personal data on request. Their visits and wallet entries
 * stay for the salon's accounts, linked to an anonymous record. The wallet must
 * be closed first so no money is lost silently.
 */
export function deleteCustomer(data: Data, input: { customerId: string; by: string | null }, now = new Date()): Op<null> {
  assertClockNotBehind(data, now);
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
export function purgeExpired(data: Data, now = new Date()): Op<{ photoKeys: string[]; customersErased: number; held?: boolean }> {
  // A phone clock far ahead of everything saved must not delete anything (SECURITY-LESSONS 1).
  const watched = observeClock(data, now);
  if (!cleanupAllowed(watched, now)) return { data: watched, result: { photoKeys: [], customersErased: 0, held: true } };
  data = watched;
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
  const day = istDate(new Date(start));
  // A stylist on approved leave is never free that day.
  if (staffId) return !!leaveOn(data, staffId, day) || staffOff(data.staff.find((x) => x.id === staffId), day) || booked.some((a) => a.staffId === staffId);
  // "Anyone free": full when every active stylist who isn't on leave (or the whole floor) is taken.
  const stylists = Math.max(1, data.staff.filter((x) => x.active && !leaveOn(data, x.id, day) && !staffOff(x, day)).length);
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
  assertClockNotBehind(data, now);
  const customer = data.customers.find((c) => c.id === input.customerId && !c.deletedAt);
  if (!customer) throw new UserError("Customer not found");
  if (!customer.consentAt) throw new UserError("Save the customer's consent first");
  const serviceIds = input.serviceIds.filter((id) => config.services.some((s) => s.id === id));
  if (!serviceIds.length) throw new UserError("Pick at least one service");
  if (input.staffId && !data.staff.some((x) => x.id === input.staffId && x.active)) throw new UserError("That stylist isn't available");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.day) || !/^\d{2}:\d{2}$/.test(input.time)) throw new UserError("Pick a day and a time");
  if (A().closedDays.includes(istDow(input.day))) throw new UserError("The salon is closed that day");
  if (input.staffId && leaveOn(data, input.staffId, input.day)) {
    throw new UserError(`${data.staff.find((x) => x.id === input.staffId)?.name.split(" ")[0]} is on leave that day`);
  }
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

/**
 * Cancels a booking. Who did it and when are saved; staff can cancel only before the booked time,
 * after that it is a No-show, which the owner's checks list (SECURITY-LESSONS 4).
 */
export function cancelAppointment(data: Data, id: string, by: string | null, now = new Date()): Op<Appointment> {
  const appt = data.appointments.find((a) => a.id === id);
  if (appt?.status !== "BOOKED") throw new UserError("Only a booked appointment can be cancelled");
  if (by !== "owner" && Date.parse(appt.at) <= now.getTime()) throw new UserError("The booked time has passed. Mark it No-show instead");
  assertClockNotBehind(data, now);
  return setAppt(data, id, { status: "CANCELLED", closedBy: by, closedAt: now.toISOString() });
}

export function markNoShow(data: Data, id: string, by: string | null, now = new Date()): Op<Appointment> {
  const appt = data.appointments.find((a) => a.id === id);
  if (appt?.status !== "BOOKED") throw new UserError("Only a booked appointment can be marked");
  if (Date.parse(appt.at) > now.getTime()) throw new UserError("The appointment time hasn't come yet");
  assertClockNotBehind(data, now);
  return setAppt(data, id, { status: "NO_SHOW", closedBy: by, closedAt: now.toISOString() });
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

export function setOwnerSecret(data: Data, secret: Secret, now = new Date()): Op<null> {
  // Setting up the salon is the owner's first confirmation of the date.
  const next = { ...data, owner: { secret } };
  return { data: data.owner ? next : confirmClock(next, now).data, result: null };
}

export function addStaff(
  data: Data,
  input: { name: string; phone: string; chair: string; secret: Secret; photoKey?: string | null; shiftStart?: string; weeklyOff?: number | null },
  now = new Date(),
): Op<Staff> {
  const name = input.name.trim().replace(/\s+/g, " ");
  if (!name) throw new UserError("Staff name is required");
  const phone = normalizePhone(input.phone);
  if (!phone) throw new UserError("Enter the staff member's 10-digit mobile number");
  if (data.staff.some((s) => s.phone === phone)) throw new UserError("A staff member with this number already exists");
  const staff: Staff = {
    id: newId(),
    name,
    phone,
    chair: input.chair.trim() || "Chair",
    secret: input.secret,
    active: true,
    createdAt: now.toISOString(),
    ...staffExtras(input),
  };
  return { data: { ...data, staff: [...data.staff, staff] }, result: staff };
}

/** Validates the optional photo, shift start and weekly off of a stylist (BUILD-SPEC 6.5). */
function staffExtras(input: { photoKey?: string | null; shiftStart?: string; weeklyOff?: number | null }): Partial<Staff> {
  const out: Partial<Staff> = {};
  if (input.photoKey !== undefined) out.photoKey = input.photoKey || null;
  if (input.shiftStart !== undefined) {
    const m = /^([01]?\d|2[0-3]):([0-5]\d)$/.exec(input.shiftStart.trim());
    if (!m) throw new UserError("Enter the shift start as HH:MM, e.g. 10:00");
    out.shiftStart = `${m[1].padStart(2, "0")}:${m[2]}`;
  }
  if (input.weeklyOff !== undefined) {
    if (input.weeklyOff !== null && !(Number.isInteger(input.weeklyOff) && input.weeklyOff >= 0 && input.weeklyOff <= 6)) throw new UserError("Pick a weekly off day");
    out.weeklyOff = input.weeklyOff;
  }
  return out;
}

export function updateStaff(
  data: Data,
  staffId: string,
  patch: Partial<Pick<Staff, "name" | "chair" | "active" | "secret" | "phone" | "photoKey" | "shiftStart" | "weeklyOff">>,
): Op<Staff> {
  const s = data.staff.find((x) => x.id === staffId);
  if (!s) throw new UserError("Staff member not found");
  const { photoKey, shiftStart, weeklyOff, ...rest } = patch;
  const next: Staff = { ...s, ...rest, ...staffExtras({ photoKey, shiftStart, weeklyOff }) };
  if (patch.name !== undefined) {
    next.name = patch.name.trim().replace(/\s+/g, " ");
    if (!next.name) throw new UserError("Staff name is required");
  }
  if (patch.chair !== undefined) next.chair = patch.chair.trim() || s.chair;
  if (patch.phone !== undefined) {
    const phone = normalizePhone(patch.phone);
    if (!phone) throw new UserError("Enter the staff member's 10-digit mobile number");
    if (data.staff.some((x) => x.id !== staffId && x.phone === phone)) throw new UserError("A staff member with this number already exists");
    next.phone = phone;
  }
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
  // A phone clock set back to look on time (MISUSE-CHECKS 9): refuse a time earlier than what's already saved.
  assertClockNotBehind(data, now);
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
          // An approved leave or the weekly off is never an absence.
          const off = !r && staffOff(s, d);
          const leave = !r && !off && !!leaveOn(data, s.id, d);
          return r ? { date: d, record: r, late: staffLate(s, r.checkInAt), leave: false, off: false } : { date: d, record: null, late: false, leave, off };
        });
        return {
          staff: s,
          cells,
          present: cells.filter((c) => c.record).length,
          late: cells.filter((c) => c.late).length,
          leave: cells.filter((c) => c.leave).length,
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
      ["Staff", "Mobile", "Chair", "Days present", "Days late", "Days on leave", "Days absent"],
      ...m.rows.map((r) => {
        const absent = r.cells.filter((c) => c.date <= today && !c.record && !c.leave && !c.off).length;
        const leave = r.cells.filter((c) => c.date <= today && c.leave).length;
        return [r.staff.name, r.staff.phone, r.staff.chair, r.present, r.late, leave, absent];
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
          : [r.staff.name, r.staff.phone, r.staff.chair, c.leave ? "Leave" : c.off ? "Weekly off" : "Absent", "", ""];
      }),
    ] as (string | number)[][],
  }));
  return [summary, ...daySheets];
}

// ── Leave (BUILD-SPEC 4.15, 4.16) ────────────────────────────────────────────

const dayAdd = (day: string, n: number) => new Date(Date.parse(`${day}T00:00:00Z`) + n * DAY_MS).toISOString().slice(0, 10);
const closedOn = (day: string) => A().closedDays.includes(istDow(day));
/** A stylist's day off: the salon's closed days, plus their own weekly off when the owner set one. */
export const staffOff = (staff: Pick<Staff, "weeklyOff"> | null | undefined, day: string) => closedOn(day) || (staff?.weeklyOff != null && istDow(day) === staff.weeklyOff);
/** Late against the stylist's own shift start when they have one. */
export const staffLate = (staff: Pick<Staff, "shiftStart"> | null | undefined, at: string | Date) => isLate(at, config, staff?.shiftStart);
function daysOf(from: string, to: string) {
  const out: string[] = [];
  for (let d = from; d <= to; d = dayAdd(d, 1)) out.push(d);
  return out;
}
const dayLabel = (day: string) => {
  const d = new Date(`${day}T00:00:00Z`);
  return `${"Sun Mon Tue Wed Thu Fri Sat".split(" ")[d.getUTCDay()]} ${d.getUTCDate()} ${"Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec".split(" ")[d.getUTCMonth()]}`;
};
const clock12 = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return `${((h + 11) % 12) + 1}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
};

/** Working days a leave takes: the weekly off doesn't count; a single half day is 0.5. */
export function leaveWorkingDays(from: string, to: string, halfDay = false, staff?: Pick<Staff, "weeklyOff"> | null): number {
  const n = daysOf(from, to).filter((d) => !staffOff(staff, d)).length;
  return halfDay && n === 1 ? 0.5 : n;
}

/** The approved leave covering this stylist's day, if any. */
export function leaveOn(data: Data, staffId: string, day: string): LeaveRequest | null {
  return data.leaves.find((l) => l.staffId === staffId && l.status === "APPROVED" && l.from <= day && day <= l.to) ?? null;
}

/** A stylist asks for leave from Profile → Leave. It waits for the owner. */
export function requestLeave(
  data: Data,
  input: { staffId: string; from: string; to: string; type: LeaveRequest["type"]; halfDay?: boolean; note?: string },
  now = new Date(),
): Op<LeaveRequest> {
  assertClockNotBehind(data, now);
  if (!data.staff.some((x) => x.id === input.staffId && x.active)) throw new UserError("Staff member not found");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.from) || !/^\d{4}-\d{2}-\d{2}$/.test(input.to)) throw new UserError("Pick the dates");
  if (input.to < input.from) throw new UserError("The last day is before the first day");
  if (input.from < istDate(now)) throw new UserError("Leave can't start in the past");
  if (daysOf(input.from, input.to).length > 31) throw new UserError("Ask for at most a month at a time");
  const halfDay = Boolean(input.halfDay);
  if (halfDay && input.from !== input.to) throw new UserError("A half day is a single day");
  if (!leaveWorkingDays(input.from, input.to, false, data.staff.find((x) => x.id === input.staffId))) throw new UserError("Those days are the weekly off already");
  if (data.leaves.some((l) => l.staffId === input.staffId && (l.status === "WAITING" || l.status === "APPROVED") && l.from <= input.to && input.from <= l.to)) {
    throw new UserError("You've already asked for leave on some of those days");
  }
  const leave: LeaveRequest = {
    id: newId(),
    staffId: input.staffId,
    from: input.from,
    to: input.to,
    type: input.type,
    halfDay,
    note: input.note?.trim().slice(0, 200) || null,
    status: "WAITING",
    reason: null,
    decidedAt: null,
    bookings: null,
    seenAt: null,
    createdAt: now.toISOString(),
  };
  return { data: { ...data, leaves: [...data.leaves, leave] }, result: leave };
}

function setLeave(data: Data, id: string, patch: Partial<LeaveRequest>): Op<LeaveRequest> {
  const l = data.leaves.find((x) => x.id === id);
  if (!l) throw new UserError("Leave request not found");
  const next = { ...l, ...patch };
  return { data: { ...data, leaves: data.leaves.map((x) => (x.id === id ? next : x)) }, result: next };
}

/** A stylist takes back a request the owner hasn't answered yet. */
export function withdrawLeave(data: Data, input: { id: string; staffId: string }): Op<LeaveRequest> {
  const l = data.leaves.find((x) => x.id === input.id);
  if (!l || l.staffId !== input.staffId) throw new UserError("Leave request not found");
  if (l.status !== "WAITING") throw new UserError("Only a request still waiting for the owner can be withdrawn");
  return setLeave(data, l.id, { status: "WITHDRAWN" });
}

/** What approving would touch: the stylist's bookings on those days, and who else is in or off. */
export function leaveImpact(data: Data, id: string) {
  const leave = data.leaves.find((x) => x.id === id);
  if (!leave) throw new UserError("Leave request not found");
  const days = daysOf(leave.from, leave.to).filter((d) => !staffOff(data.staff.find((x) => x.id === leave.staffId), d));
  const bookings = data.appointments
    .filter((a) => a.staffId === leave.staffId && a.status === "BOOKED" && days.includes(istDate(new Date(a.at))))
    .sort((a, b) => a.at.localeCompare(b.at))
    .map((a) => describe(data, a));
  const others = data.staff.filter((x) => x.active && x.id !== leave.staffId);
  return {
    leave,
    staffName: data.staff.find((x) => x.id === leave.staffId)?.name ?? "Stylist",
    workingDays: leaveWorkingDays(leave.from, leave.to, leave.halfDay, data.staff.find((x) => x.id === leave.staffId)),
    bookings,
    working: others.filter((x) => days.every((d) => !leaveOn(data, x.id, d))).map((x) => x.name),
    alsoOff: others.filter((x) => days.some((d) => leaveOn(data, x.id, d))).map((x) => x.name),
  };
}

type Affected = { appointmentId: string; customerName: string; phone: string; day: string; time: string; toStylist: string | null; message: string };

/**
 * The owner approves. The stylist's bookings on those days are either given to a stylist who
 * is free at that time ("REASSIGN"; if nobody is, that one is cancelled for rebooking) or all
 * cancelled for the customers to rebook ("REBOOK"). Returns the WhatsApp message for each
 * customer so the owner can tell them. The stylist sees the decision next time they open the app.
 */
export function approveLeave(data: Data, input: { id: string; bookings: "REASSIGN" | "REBOOK" }, now = new Date()): Op<{ leave: LeaveRequest; moved: Affected[]; cancelled: Affected[] }> {
  assertClockNotBehind(data, now);
  const l = data.leaves.find((x) => x.id === input.id);
  if (!l) throw new UserError("Leave request not found");
  if (l.status !== "WAITING") throw new UserError("This request has already been answered");
  const impact = leaveImpact(data, l.id);
  const stylist = impact.staffName.split(" ")[0];
  let next = setLeave(data, l.id, { status: "APPROVED", decidedAt: now.toISOString(), bookings: input.bookings === "REASSIGN" ? "REASSIGNED" : "REBOOK", seenAt: null }).data;
  const moved: Affected[] = [];
  const cancelled: Affected[] = [];
  for (const b of impact.bookings) {
    const first = b.customerName.split(" ")[0];
    const service = b.serviceNames.join(" + ").toLowerCase();
    const start = Date.parse(b.at);
    const to =
      input.bookings === "REASSIGN"
        ? next.staff.find((x) => x.active && x.id !== l.staffId && !busyAt(next, start, b.minutes, x.id, b.id))
        : undefined;
    if (to) {
      next = { ...next, appointments: next.appointments.map((a) => (a.id === b.id ? { ...a, staffId: to.id } : a)) };
      moved.push({
        appointmentId: b.id, customerName: b.customerName, phone: b.phone, day: b.day, time: b.time, toStylist: to.name,
        message: `Hi ${first}, ${stylist} is on leave on ${dayLabel(b.day)}, so ${to.name.split(" ")[0]} will do your ${service} at ${clock12(b.time)} at ${config.displayName}. Reply C to cancel.`,
      });
    } else {
      next = { ...next, appointments: next.appointments.map((a) => (a.id === b.id ? { ...a, status: "CANCELLED" as const, closedBy: "owner", closedAt: now.toISOString() } : a)) };
      cancelled.push({
        appointmentId: b.id, customerName: b.customerName, phone: b.phone, day: b.day, time: b.time, toStylist: null,
        message: `Hi ${first}, sorry: ${stylist} is away on ${dayLabel(b.day)}, so we've had to move your ${service} at ${clock12(b.time)}. Reply with a day and time that suits you and we'll book it.`,
      });
    }
  }
  return { data: next, result: { leave: next.leaves.find((x) => x.id === l.id)!, moved, cancelled } };
}

/** The owner says no, with a reason the stylist will see. */
export function declineLeave(data: Data, input: { id: string; reason: string }, now = new Date()): Op<LeaveRequest> {
  assertClockNotBehind(data, now);
  const l = data.leaves.find((x) => x.id === input.id);
  if (!l) throw new UserError("Leave request not found");
  if (l.status !== "WAITING") throw new UserError("This request has already been answered");
  const reason = input.reason.trim();
  if (!reason) throw new UserError("Give a reason, so they know what to ask for instead");
  return setLeave(data, l.id, { status: "DECLINED", reason: reason.slice(0, 200), decidedAt: now.toISOString(), seenAt: null });
}

/** Requests waiting for the owner, oldest first. */
export function leaveRequestsWaiting(data: Data) {
  return data.leaves.filter((l) => l.status === "WAITING").sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

/** The owner's decisions this stylist hasn't seen yet: shown as a notification in their app. */
export function leaveUpdates(data: Data, staffId: string) {
  return data.leaves.filter((l) => l.staffId === staffId && (l.status === "APPROVED" || l.status === "DECLINED") && !l.seenAt);
}

export function markLeaveSeen(data: Data, staffId: string, now = new Date()): Op<number> {
  const ids = new Set(leaveUpdates(data, staffId).map((l) => l.id));
  if (!ids.size) return { data, result: 0 };
  return { data: { ...data, leaves: data.leaves.map((l) => (ids.has(l.id) ? { ...l, seenAt: now.toISOString() } : l)) }, result: ids.size };
}

/** Profile → Leave: next approved leave, every request newest first, and days taken this year. */
export function myLeave(data: Data, staffId: string, now = new Date()) {
  const today = istDate(now);
  const mine = data.leaves.filter((l) => l.staffId === staffId && l.status !== "WITHDRAWN");
  const year = today.slice(0, 4);
  const staff = data.staff.find((x) => x.id === staffId);
  return {
    next: mine.filter((l) => l.status === "APPROVED" && l.to >= today).sort((a, b) => a.from.localeCompare(b.from))[0] ?? null,
    requests: [...mine].sort((a, b) => b.from.localeCompare(a.from)).map((l) => ({ ...l, workingDays: leaveWorkingDays(l.from, l.to, l.halfDay, staff) })),
    takenThisYear: mine.filter((l) => l.status === "APPROVED" && l.from.startsWith(year)).reduce((sum, l) => sum + leaveWorkingDays(l.from, l.to, l.halfDay, staff), 0),
    waiting: mine.filter((l) => l.status === "WAITING").length,
    declined: mine.filter((l) => l.status === "DECLINED" && l.from.startsWith(year)).length,
  };
}

/**
 * Profile → Attendance: when they joined, totals since then, and one month's calendar of
 * present / late / leave / weekly off / absent. Days before joining or still to come are blank.
 */
export function myAttendance(data: Data, staffId: string, month: string, now = new Date()) {
  const staff = data.staff.find((x) => x.id === staffId);
  if (!staff) throw new UserError("Staff member not found");
  const today = istDate(now);
  const joined = istDate(new Date(staff.createdAt));
  const kindOf = (d: string): "present" | "late" | "leave" | "off" | "absent" | "future" | "before" => {
    if (d < joined) return "before";
    const r = data.attendance.find((a) => a.staffId === staffId && a.date === d);
    if (r) return staffLate(staff, r.checkInAt) ? "late" : "present";
    // The weekly off stays "off" even inside a leave; it isn't a leave day.
    if (staffOff(staff, d)) return "off";
    if (leaveOn(data, staffId, d)) return "leave";
    return d >= today ? "future" : "absent";
  };
  const [y, m] = month.split("-").map(Number);
  const n = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const cells = Array.from({ length: n }, (_, i) => {
    const date = `${month}-${String(i + 1).padStart(2, "0")}`;
    return { date, kind: kindOf(date) };
  });
  const count = (k: string) => cells.filter((c) => c.kind === k).length;
  const sinceJoin = daysOf(joined, today < joined ? joined : today).map(kindOf);
  return {
    joined,
    daysWithSalon: Math.max(0, Math.round((Date.parse(`${today}T00:00:00Z`) - Date.parse(`${joined}T00:00:00Z`)) / DAY_MS)),
    presentSinceJoin: sinceJoin.filter((k) => k === "present" || k === "late").length,
    leaveSinceJoin: sinceJoin.filter((k) => k === "leave").length,
    month: { present: count("present") + count("late"), late: count("late"), leave: count("leave"), absent: count("absent") },
    cells,
    lastCheckIns: data.attendance
      .filter((a) => a.staffId === staffId)
      .sort((a, b) => b.checkInAt.localeCompare(a.checkInAt))
      .slice(0, 5)
      .map((a) => ({ date: a.date, at: a.checkInAt, late: staffLate(staff, a.checkInAt), photoKey: a.photoKey })),
  };
}

// ── A stylist's own day and month (BUILD-SPEC 4.2, 4.3, 4.4: only their own numbers) ──

/**
 * Staff Home: what this stylist earned today (wallet vs cash/UPI/card), this month's total,
 * today's customers one by one (paid or still in the chair), whether each was new, and who
 * is in their chair now. The salon line counts busy chairs only, never others' money.
 */
export function staffDay(data: Data, staffId: string, now = new Date()) {
  const today = istDate(now);
  const month = today.slice(0, 7);
  const firstVisit = new Map<string, string>();
  for (const v of data.visits) {
    if (v.status === "VOID") continue;
    const prev = firstVisit.get(v.customerId);
    if (!prev || v.createdAt < prev) firstVisit.set(v.customerId, v.createdAt);
  }
  const byId = new Map(data.customers.map((c) => [c.id, c]));
  const mine = data.visits.filter((v) => v.staffId === staffId && (v.status === "OPEN" || v.status === "PAID"));
  const todays = mine
    .filter((v) => istDate(new Date(v.status === "PAID" ? at(v) : v.createdAt)) === today)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    .map((v) => ({
      visit: v,
      customerName: byId.get(v.customerId)?.name ?? "Customer",
      services: [...v.serviceIds.map((id) => config.services.find((s) => s.id === id)?.name ?? id), ...v.addOnIds.map((id) => config.addOns.find((a) => a.id === id)?.name ?? id)],
      amount: v.status === "PAID" ? v.total : priceItems(v.serviceIds, v.addOnIds).total,
      isNew: istDate(new Date(firstVisit.get(v.customerId) ?? v.createdAt)) === today,
    }));
  const paidToday = todays.filter((t) => t.visit.status === "PAID");
  const monthTotal = mine.filter((v) => paid(v) && istDate(new Date(at(v))).startsWith(month)).reduce((s, v) => s + v.total, 0);
  const busy = new Set(data.visits.filter((v) => v.status === "OPEN").map((v) => v.staffId));
  return {
    earned: paidToday.reduce((s, t) => s + t.visit.total, 0),
    wallet: paidToday.reduce((s, t) => s + t.visit.walletPaid, 0),
    direct: paidToday.reduce((s, t) => s + t.visit.directPaid, 0),
    monthTotal,
    customers: todays,
    counts: {
      handled: todays.length,
      paid: paidToday.length,
      inChair: todays.filter((t) => t.visit.status === "OPEN").length,
      new: new Set(todays.filter((t) => t.isNew).map((t) => t.visit.customerId)).size,
    },
    chair: todays.find((t) => t.visit.status === "OPEN") ?? null,
    salonBusy: busy.size,
    salonChairs: data.staff.filter((s) => s.active && !leaveOn(data, s.id, today)).length,
  };
}

/** My customers → the month so far: one bar per day, customers served and the best day. */
export function staffMonth(data: Data, staffId: string, month: string) {
  const [y, m] = month.split("-").map(Number);
  const n = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const days = Array.from({ length: n }, (_, i) => ({ date: `${month}-${String(i + 1).padStart(2, "0")}`, total: 0, customers: 0 }));
  for (const v of data.visits) {
    if (v.staffId !== staffId || !paid(v)) continue;
    const d = istDate(new Date(at(v)));
    if (!d.startsWith(month)) continue;
    const slot = days[Number(d.slice(8, 10)) - 1];
    slot.total += v.total;
    slot.customers += 1;
  }
  const best = days.reduce((b, d) => (d.total > b.total ? d : b), days[0]);
  return { days, total: days.reduce((s, d) => s + d.total, 0), customers: days.reduce((s, d) => s + d.customers, 0), best: best.total ? best : null };
}
