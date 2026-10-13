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
import type { Attendance, Customer, Data, PaymentMethod, ReminderLog, Secret, Staff, Visit, WalletTx } from "./types";

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
  if (d.version === 2) return d as unknown as Data;
  // v1: one service per visit, every visit paid, staff lived in config.
  const v1Visits = (d.visits as Array<Record<string, unknown>>) ?? [];
  return {
    version: 2,
    customers: (d.customers as Customer[]) ?? [],
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
      status: "PAID",
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

// ── Customers ────────────────────────────────────────────────────────────────

export function findByPhone(data: Data, rawPhone: string) {
  const phone = normalizePhone(rawPhone);
  if (!phone) throw new UserError("Enter a valid 10-digit mobile number");
  const customer = data.customers.find((c) => c.phone === phone) ?? null;
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
  if (phone) return data.customers.find((c) => c.phone === phone) ?? null;
  return data.customers.find((c) => c.referralCode === raw.toUpperCase()) ?? null;
}

export function createCustomer(
  data: Data,
  input: { phone: string; name: string; consent: boolean; referredBy?: string },
  now = new Date(),
): Op<Customer> {
  const phone = normalizePhone(input.phone);
  if (!phone) throw new UserError("Enter a valid 10-digit mobile number");
  const name = input.name.trim().replace(/\s+/g, " ");
  if (!name) throw new UserError("Name is required");
  if (name.length > 80) throw new UserError("Name is too long");
  if (!input.consent) throw new UserError("The customer's consent is needed to save their details");
  if (data.customers.some((c) => c.phone === phone)) throw new UserError("A customer with this number already exists");

  let referredById: string | null = null;
  if (input.referredBy?.trim()) {
    const referrer = findReferrer(data, input.referredBy);
    if (!referrer) throw new UserError("No customer found with that referral code or number");
    if (referrer.phone === phone) throw new UserError("A customer can't refer themselves");
    referredById = referrer.id;
  }

  const customer: Customer = {
    id: newId(),
    phone,
    name,
    referralCode: makeReferralCode(name, new Set(data.customers.map((c) => c.referralCode))),
    walletBalance: 0,
    consentAt: now.toISOString(),
    referredById,
    referralRewardedAt: null,
    createdAt: now.toISOString(),
  };
  return { data: { ...data, customers: [...data.customers, customer] }, result: customer };
}

export function searchCustomers(data: Data, q: string, take = 60) {
  const term = q.trim().toLowerCase();
  const digits = term.replace(/\D/g, "");
  const list = term
    ? data.customers.filter(
        (c) =>
          c.name.toLowerCase().includes(term) ||
          (digits.length > 0 && c.phone.includes(digits)) ||
          c.referralCode === term.toUpperCase(),
      )
    : data.customers;
  return [...list].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, take);
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
    message: renderTemplate(config.receiptTemplate, {
      name: customer.name.split(" ")[0],
      salon: config.displayName,
      total: inr(visit.total),
      balance: inr(customer.walletBalance),
      code: customer.referralCode,
    }),
  };
}

// ── Reminders ────────────────────────────────────────────────────────────────

/** Customers overdue for a repeat visit, computed per service against each service's own cycle. */
export function overdueReminders(data: Data, now = new Date()) {
  const last = new Map<string, { customerId: string; serviceId: string; at: string }>();
  for (const v of data.visits) {
    if (!paid(v)) continue;
    for (const serviceId of v.serviceIds) {
      const key = `${v.customerId}|${serviceId}`;
      const prev = last.get(key);
      if (!prev || at(v) > prev.at) last.set(key, { customerId: v.customerId, serviceId, at: at(v) });
    }
  }
  const byId = new Map(data.customers.map((c) => [c.id, c]));
  return [...last.values()]
    .flatMap((v) => {
      const customer = byId.get(v.customerId);
      const service = config.services.find((s) => s.id === v.serviceId);
      const lastVisit = new Date(v.at);
      const dueAt = dueDate(v.serviceId, lastVisit);
      // Only customers who consented to reminders.
      if (!customer?.consentAt || !service || !dueAt || dueAt > now) return [];
      const reminded = data.reminders
        .filter((r) => r.customerId === customer.id && r.serviceId === service.id && r.createdAt > v.at)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
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
          remindedAt: reminded ? new Date(reminded.createdAt) : null,
          message: renderReminder(config.reminderTemplate, { name: customer.name.split(" ")[0], service: service.name.toLowerCase() }),
        },
      ];
    })
    .sort((a, b) => b.daysOverdue - a.daysOverdue);
}

export function logReminder(
  data: Data,
  input: { customerId: string; serviceId: string; message: string; status: ReminderLog["status"] },
  now = new Date(),
): Op<ReminderLog> {
  const message = input.message.trim();
  if (!message) throw new UserError("Message can't be empty");
  if (message.length > 1000) throw new UserError("Message is too long");
  const customer = data.customers.find((c) => c.id === input.customerId);
  if (!customer) throw new UserError("Customer not found");
  if (!customer.consentAt) throw new UserError("This customer hasn't agreed to receive reminders");
  const log: ReminderLog = { id: newId(), customerId: customer.id, serviceId: input.serviceId, message, status: input.status, createdAt: now.toISOString() };
  return { data: { ...data, reminders: [...data.reminders, log] }, result: log };
}

export function whatsappLink(phone10: string, message: string): string {
  return `https://wa.me/91${phone10}?text=${encodeURIComponent(message)}`;
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
