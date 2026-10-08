/**
 * The salon's business logic, running on the device. Every operation takes the
 * current data and returns the next data plus its result, so the store can
 * commit atomically and tests can run without storage.
 *
 * Mirrors ../salon-app/src/lib/{customers,wallet,visits,reminders,dashboard}.ts —
 * the rules must stay identical between the two.
 */
import config from "../config/salon";
import { UserError } from "./errors";
import { daysBetween, dueDate, normalizePhone, priceVisit, renderReminder, startOfIstDay, topUpBonus } from "./rules";
import type { Customer, Data, PaymentMethod, ReminderLog, Visit, WalletTx } from "./types";

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

// ── Customers ────────────────────────────────────────────────────────────────

export function findByPhone(data: Data, rawPhone: string) {
  const phone = normalizePhone(rawPhone);
  if (!phone) throw new UserError("Enter a valid 10-digit mobile number");
  const customer = data.customers.find((c) => c.phone === phone) ?? null;
  if (!customer) return { phone, customer: null };
  const visits = visitsOf(data, customer.id);
  return { phone, customer: { ...customer, visitCount: visits.length, lastVisit: visits[0] ?? null } };
}

export function createCustomer(
  data: Data,
  input: { phone: string; name: string; consent: boolean; referralCode?: string },
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
  const code = input.referralCode?.trim().toUpperCase();
  if (code) {
    const referrer = data.customers.find((c) => c.referralCode === code);
    if (!referrer) throw new UserError("That referral code doesn't exist");
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

function visitsOf(data: Data, customerId: string) {
  return data.visits.filter((v) => v.customerId === customerId).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/** Per-service due dates for one customer, soonest first. */
export function serviceDueDates(data: Data, customerId: string) {
  const last = new Map<string, string>();
  for (const v of data.visits) {
    if (v.customerId !== customerId) continue;
    const prev = last.get(v.serviceId);
    if (!prev || v.createdAt > prev) last.set(v.serviceId, v.createdAt);
  }
  return [...last.entries()]
    .flatMap(([serviceId, at]) => {
      const service = config.services.find((s) => s.id === serviceId);
      const lastVisit = new Date(at);
      const dueAt = dueDate(serviceId, lastVisit);
      return service && dueAt ? [{ serviceId, serviceName: service.name, lastVisit, dueAt }] : [];
    })
    .sort((a, b) => a.dueAt.getTime() - b.dueAt.getTime());
}

export function getProfile(data: Data, id: string) {
  const customer = data.customers.find((c) => c.id === id);
  if (!customer) throw new UserError("Customer not found");
  const visits = visitsOf(data, id);
  const walletTxs = data.walletTxs
    .filter((t) => t.customerId === id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const dues = serviceDueDates(data, id);
  const referredBy = customer.referredById ? data.customers.find((c) => c.id === customer.referredById) ?? null : null;
  const referrals = data.customers.filter((c) => c.referredById === id);
  return {
    ...customer,
    visits,
    walletTxs,
    referredBy,
    referrals,
    lifetimeSpend: visits.reduce((s, v) => s + v.total, 0),
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
  const at = now.toISOString();
  const txs: WalletTx[] = [
    { id: newId(), customerId: customer.id, type: "TOPUP", amount, visitId: null, note: `Paid by ${input.method}`, createdAt: at },
  ];
  if (bonus > 0) {
    txs.push({ id: newId(), customerId: customer.id, type: "BONUS", amount: bonus, visitId: null, note: `Bonus on ₹${amount} top-up`, createdAt: at });
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

/**
 * Logs a visit, optionally paid partly or fully from the wallet.
 *
 * Referral rule: when a referred customer's FIRST PAID visit is logged, both
 * they and their referrer get wallet credit — never at sign-up.
 */
export function logVisit(
  data: Data,
  input: { customerId: string; serviceId: string; addOnIds: string[]; staffId: string; walletAmount: number; paymentMethod: PaymentMethod },
  now = new Date(),
): Op<{ visit: Visit; balance: number; referral: { referrerName: string; referrerReward: number; newCustomerReward: number } | null }> {
  const { total, addOnIds } = priceVisit(input);
  const walletAmount = input.walletAmount;
  if (!Number.isInteger(walletAmount) || walletAmount < 0) throw new UserError("Invalid wallet amount");
  if (walletAmount > total) throw new UserError("Wallet amount is more than the bill");
  const customer = data.customers.find((c) => c.id === input.customerId);
  if (!customer) throw new UserError("Customer not found");
  if (walletAmount > customer.walletBalance) throw new UserError("Not enough wallet balance");

  const at = now.toISOString();
  const priorPaidVisits = data.visits.filter((v) => v.customerId === customer.id && v.total > 0).length;
  const visit: Visit = {
    id: newId(),
    customerId: customer.id,
    serviceId: input.serviceId,
    staffId: input.staffId,
    addOnIds,
    total,
    walletPaid: walletAmount,
    directPaid: total - walletAmount,
    paymentMethod: input.paymentMethod,
    createdAt: at,
  };
  const txs: WalletTx[] = [];
  const delta = new Map<string, number>([[customer.id, -walletAmount]]);
  if (walletAmount > 0) {
    txs.push({ id: newId(), customerId: customer.id, type: "SPEND", amount: -walletAmount, visitId: visit.id, note: null, createdAt: at });
  }

  let referral: { referrerName: string; referrerReward: number; newCustomerReward: number } | null = null;
  const referrer = customer.referredById ? data.customers.find((c) => c.id === customer.referredById) : undefined;
  const rewardNow = total > 0 && priorPaidVisits === 0 && referrer && !customer.referralRewardedAt;
  if (rewardNow) {
    const { referrerReward, newCustomerReward } = config.referral;
    txs.push(
      { id: newId(), customerId: referrer.id, type: "REFERRAL_REWARD", amount: referrerReward, visitId: visit.id, note: `Referred ${customer.name}`, createdAt: at },
      { id: newId(), customerId: customer.id, type: "REFERRAL_REWARD", amount: newCustomerReward, visitId: visit.id, note: "Welcome reward for joining by referral", createdAt: at },
    );
    delta.set(referrer.id, referrerReward);
    delta.set(customer.id, (delta.get(customer.id) ?? 0) + newCustomerReward);
    referral = { referrerName: referrer.name, referrerReward, newCustomerReward };
  }

  const customers = data.customers.map((c) => {
    const d = delta.get(c.id);
    if (d === undefined) return c;
    return { ...c, walletBalance: c.walletBalance + d, ...(rewardNow && c.id === customer.id ? { referralRewardedAt: at } : {}) };
  });
  const balance = customers.find((c) => c.id === customer.id)!.walletBalance;
  return {
    data: { ...data, customers, visits: [...data.visits, visit], walletTxs: [...data.walletTxs, ...txs] },
    result: { visit, balance, referral },
  };
}

// ── Reminders ────────────────────────────────────────────────────────────────

/** Customers overdue for a repeat visit, computed per service against each service's own cycle. */
export function overdueReminders(data: Data, now = new Date()) {
  const last = new Map<string, Visit>();
  for (const v of data.visits) {
    const key = `${v.customerId}|${v.serviceId}`;
    const prev = last.get(key);
    if (!prev || v.createdAt > prev.createdAt) last.set(key, v);
  }
  const byId = new Map(data.customers.map((c) => [c.id, c]));
  return [...last.values()]
    .flatMap((v) => {
      const customer = byId.get(v.customerId);
      const service = config.services.find((s) => s.id === v.serviceId);
      const lastVisit = new Date(v.createdAt);
      const dueAt = dueDate(v.serviceId, lastVisit);
      // Only customers who consented to reminders.
      if (!customer?.consentAt || !service || !dueAt || dueAt > now) return [];
      const reminded = data.reminders
        .filter((r) => r.customerId === customer.id && r.serviceId === service.id && r.createdAt > v.createdAt)
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
    if (v.createdAt >= todayStart) {
      today.visits++;
      today.total += v.total;
      today.wallet += v.walletPaid;
      if (v.paymentMethod === "CASH") today.cash += v.directPaid;
      else if (v.paymentMethod === "UPI") today.upi += v.directPaid;
      else today.card += v.directPaid;
    }
    if (v.createdAt >= rangeStart) {
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
    // Every configured staff member appears, including those with no visits yet.
    byStaff: config.staff
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
