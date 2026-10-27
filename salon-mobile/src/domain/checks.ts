/**
 * The owner's guard rails (MISUSE-CHECKS.md): the day's checks (staff undos, customers who
 * left without service, bookings nobody closed, unusual bills, referrals by who added them),
 * the end-of-day cash count, services and prices the owner edits in the app, the check
 * limits, and a backup file of the whole salon.
 */
import config, { type AddOn, type Service } from "../config/salon";
import { UserError } from "./errors";
import { assertClockNotBehind, checkSettings, eraseCustomer, migrate, newId } from "./engine";
import { istDate } from "./rules";
import type { Catalog, CheckSettings, Data, DayClosing, Visit } from "./types";
import { PAYMENT_METHODS } from "./types";

type Op<T> = { data: Data; result: T };
const dayOf = (iso: string) => istDate(new Date(iso));
const staffName = (data: Data, id: string | null | undefined) => (id === "owner" ? "Owner" : (data.staff.find((s) => s.id === id)?.name ?? "Staff"));
const customerName = (data: Data, id: string) => data.customers.find((c) => c.id === id)?.name ?? "Customer";

// ── Services and prices the owner edits ─────────────────────────────────────

const DEFAULT_SERVICES: Service[] = config.services.map((s) => ({ ...s }));
const DEFAULT_ADDONS: AddOn[] = config.addOns.map((a) => ({ ...a }));

/** The salon's current list: the owner's edits, or the config file's list. */
export function catalogOf(data: Data): Catalog {
  return data.catalog ?? { services: DEFAULT_SERVICES.map((s) => ({ ...s })), addOns: DEFAULT_ADDONS.map((a) => ({ ...a })) };
}

/**
 * Points the app's price list at this data's catalog. The store calls it after loading and
 * after each change, so every screen and rule prices from the owner's current list.
 */
export function applyCatalog(data: Data) {
  const c = catalogOf(data);
  config.services = c.services;
  config.addOns = c.addOns;
}

const slug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) || "item";

/** Adds or edits a service. A price change applies to bills from now on; paid bills keep theirs. */
export function saveService(data: Data, input: { id?: string; name: string; price: number; minutes: number; cycleDays: number }): Op<Catalog> {
  const name = input.name.trim().replace(/\s+/g, " ");
  if (!name) throw new UserError("Name the service");
  if (!Number.isInteger(input.price) || input.price <= 0 || input.price > 100000) throw new UserError("Enter the price in whole rupees");
  if (!Number.isInteger(input.minutes) || input.minutes < 5 || input.minutes > 600) throw new UserError("Time taken must be 5 to 600 minutes");
  if (!Number.isInteger(input.cycleDays) || input.cycleDays < 1 || input.cycleDays > 365) throw new UserError("Due back after must be 1 to 365 days");
  const c = catalogOf(data);
  if (c.services.some((s) => s.name.toLowerCase() === name.toLowerCase() && s.id !== input.id)) throw new UserError("A service with this name already exists");
  let services;
  if (input.id) {
    if (!c.services.some((s) => s.id === input.id)) throw new UserError("Service not found");
    services = c.services.map((s) => (s.id === input.id ? { ...s, name, price: input.price, minutes: input.minutes, cycleDays: input.cycleDays } : s));
  } else {
    let id = slug(name);
    while (c.services.some((s) => s.id === id) || c.addOns.some((a) => a.id === id)) id = `${slug(name)}-${newId().slice(0, 4)}`;
    services = [...c.services, { id, name, price: input.price, minutes: input.minutes, cycleDays: input.cycleDays, active: true }];
  }
  const catalog = { ...c, services };
  return { data: { ...data, catalog }, result: catalog };
}

export function saveAddOn(data: Data, input: { id?: string; name: string; price: number; suggestWith: string[] }): Op<Catalog> {
  const name = input.name.trim().replace(/\s+/g, " ");
  if (!name) throw new UserError("Name the add-on");
  if (!Number.isInteger(input.price) || input.price <= 0 || input.price > 100000) throw new UserError("Enter the price in whole rupees");
  const c = catalogOf(data);
  if (c.addOns.some((a) => a.name.toLowerCase() === name.toLowerCase() && a.id !== input.id)) throw new UserError("An add-on with this name already exists");
  let addOns;
  if (input.id) {
    if (!c.addOns.some((a) => a.id === input.id)) throw new UserError("Add-on not found");
    addOns = c.addOns.map((a) => (a.id === input.id ? { ...a, name, price: input.price, suggestWith: input.suggestWith } : a));
  } else {
    let id = slug(name);
    while (c.services.some((s) => s.id === id) || c.addOns.some((a) => a.id === id)) id = `${slug(name)}-${newId().slice(0, 4)}`;
    addOns = [...c.addOns, { id, name, price: input.price, suggestWith: input.suggestWith, active: true }];
  }
  const catalog = { ...c, addOns };
  return { data: { ...data, catalog }, result: catalog };
}

/** Stops offering a service or add-on (or brings it back). It is never deleted, so old bills keep its name. */
export function setOffered(data: Data, input: { id: string; offered: boolean }): Op<Catalog> {
  const c = catalogOf(data);
  const inServices = c.services.some((s) => s.id === input.id);
  if (!inServices && !c.addOns.some((a) => a.id === input.id)) throw new UserError("Not found");
  if (inServices && !input.offered && c.services.filter((s) => s.active !== false).length <= 1) throw new UserError("Keep at least one service on offer");
  const catalog = {
    services: c.services.map((s) => (s.id === input.id ? { ...s, active: input.offered } : s)),
    addOns: c.addOns.map((a) => (a.id === input.id ? { ...a, active: input.offered } : a)),
  };
  return { data: { ...data, catalog }, result: catalog };
}

export function saveCheckSettings(data: Data, input: CheckSettings): Op<CheckSettings> {
  if (!Number.isInteger(input.walletCodeAbove) || input.walletCodeAbove < 0 || input.walletCodeAbove > 100000) throw new UserError("Wallet code limit must be ₹0 to ₹1,00,000");
  if (!Number.isInteger(input.referralMonthlyLimit) || input.referralMonthlyLimit < 0 || input.referralMonthlyLimit > 100) throw new UserError("Referral limit must be 0 to 100 a month");
  return { data: { ...data, checks: { ...input } }, result: input };
}

// ── End-of-day cash count ───────────────────────────────────────────────────

/** Cash that should be in the drawer for a day: cash bills (not cancelled) and cash wallet top-ups, less wallets refunded in cash. */
export function expectedCash(data: Data, day: string) {
  const bills = data.visits.filter((v) => v.status === "PAID" && v.paymentMethod === "CASH" && v.paidAt && dayOf(v.paidAt) === day);
  const topUps = data.walletTxs.filter((t) => t.type === "TOPUP" && t.note === "Paid by CASH" && dayOf(t.createdAt) === day);
  const refunds = data.walletTxs.filter((t) => t.type === "CASHOUT" && t.note === "Refunded by CASH" && dayOf(t.createdAt) === day);
  const fromBills = bills.reduce((s, v) => s + v.directPaid, 0);
  const fromTopUps = topUps.reduce((s, t) => s + t.amount, 0);
  const refunded = refunds.reduce((s, t) => s - t.amount, 0);
  return { bills: bills.length, fromBills, topUps: topUps.length, fromTopUps, refunds: refunds.length, refunded, total: fromBills + fromTopUps - refunded };
}

/** The owner counts the drawer; the difference is saved with the day. Counting again replaces it. */
export function closeDay(data: Data, input: { counted: number; note?: string }, now = new Date()): Op<DayClosing> {
  if (!Number.isInteger(input.counted) || input.counted < 0) throw new UserError("Enter the cash counted in whole rupees");
  assertClockNotBehind(data, now);
  const date = istDate(now);
  const expected = expectedCash(data, date).total;
  const diff = input.counted - expected;
  const note = (input.note ?? "").trim();
  if (diff !== 0 && !note) throw new UserError("The count doesn't match. Add a note saying why");
  const rec: DayClosing = { id: newId(), date, expected, counted: input.counted, note, at: now.toISOString() };
  return { data: { ...data, dayClosings: [...(data.dayClosings ?? []).filter((d) => d.date !== date), rec] }, result: rec };
}

// ── The owner's checks for a day ────────────────────────────────────────────

export type CheckItem = { id: string; kind: "undo" | "left" | "booking" | "unusual" | "other" | "cash" | "referral" | "clock" | "attendance"; title: string; detail: string; visitId?: string };

export function ownerChecks(data: Data, now = new Date()) {
  const day = istDate(now);
  const items: CheckItem[] = [];
  for (const v of data.visits) {
    if (v.status === "VOID" && v.voidedBy && v.voidedBy !== "owner" && v.voidedAt && dayOf(v.voidedAt) === day) {
      items.push({ id: `u-${v.id}`, kind: "undo", visitId: v.id, title: `${staffName(data, v.voidedBy).split(" ")[0]} undid a ₹${v.total.toLocaleString("en-IN")} bill`, detail: `${customerName(data, v.customerId)} · "${v.voidReason ?? ""}"` });
    }
    if (v.status === "LEFT" && v.leftAt && dayOf(v.leftAt) === day) {
      const sat = Math.round((Date.parse(v.leftAt) - Date.parse(v.createdAt)) / 60000);
      items.push({ id: `l-${v.id}`, kind: "left", visitId: v.id, title: `${customerName(data, v.customerId)} left without service`, detail: `${staffName(data, v.staffId).split(" ")[0]}'s chair · sat ${sat} min · recorded by ${staffName(data, v.leftBy).split(" ")[0]}` });
    }
    if (v.status === "PAID" && v.paidAt && dayOf(v.paidAt) === day && (v.extras ?? []).length) {
      items.push({ id: `o-${v.id}`, kind: "other", visitId: v.id, title: `"Other" on ${customerName(data, v.customerId).split(" ")[0]}'s bill`, detail: (v.extras ?? []).map((x) => `${x.name} ₹${x.price}`).join(", ") });
    }
  }
  const late = data.appointments.filter((a) => a.status === "BOOKED" && dayOf(a.at) === day && Date.parse(a.at) < now.getTime() - 30 * 60000);
  for (const a of late) {
    items.push({ id: `b-${a.id}`, kind: "booking", title: `${customerName(data, a.customerId)}'s booking not closed`, detail: `Not marked Arrived or No-show · ${staffName(data, a.staffId).split(" ")[0]}` });
  }
  // A booking closed by a stylist stays visible to the owner, with their name (SECURITY-LESSONS 4).
  for (const a of data.appointments) {
    if (!a.closedAt || dayOf(a.closedAt) !== day || a.closedBy === "owner") continue;
    const late = a.status === "NO_SHOW" || (a.status === "CANCELLED" && Date.parse(a.closedAt) >= Date.parse(a.at));
    if (!late) continue;
    items.push({ id: `n-${a.id}`, kind: "booking", title: `${customerName(data, a.customerId)}'s booking marked ${a.status === "NO_SHOW" ? "no-show" : "cancelled"}`, detail: `By ${staffName(data, a.closedBy).split(" ")[0]} · check the customer really didn't come` });
  }
  // A check-in saved for a day that hasn't come yet means the phone's clock was moved forward (SECURITY-LESSONS 2).
  for (const a of data.attendance) {
    if (a.date > day) items.push({ id: `f-${a.id}`, kind: "attendance", title: `${staffName(data, a.staffId).split(" ")[0]} has a check-in saved for ${a.date}`, detail: "Saved before that day came: the phone's clock was moved forward" });
  }
  // The phone's clock went back, or jumped far ahead (SECURITY-LESSONS 1, 2, 3).
  for (const j of data.clock?.backJumps ?? []) {
    if (dayOf(j.to) !== day && dayOf(j.from) !== day && Date.parse(j.to) < now.getTime() - 7 * 86400000) continue;
    items.push({ id: `k-${j.to}`, kind: "clock", title: "The phone's clock was set back", detail: `From ${j.from.slice(0, 16).replace("T", " ")} to ${j.to.slice(0, 16).replace("T", " ")} UTC · check check-ins, undos and bills saved around then` });
  }
  if (data.clock?.hold) {
    items.push({ id: "k-hold", kind: "clock", title: "The phone's date jumped ahead", detail: `Automatic clean-up is paused. If the phone shows the right date (${day}), tap here to confirm it` });
  }
  // A stylist whose average bill today is far above their usual (last 30 days).
  const since = now.getTime() - 30 * 86400000;
  for (const s of data.staff.filter((x) => x.active)) {
    const mine = data.visits.filter((v) => v.staffId === s.id && v.status === "PAID" && v.paidAt);
    const today = mine.filter((v) => dayOf(v.paidAt!) === day);
    const before = mine.filter((v) => dayOf(v.paidAt!) !== day && Date.parse(v.paidAt!) >= since);
    if (today.length < 2 || before.length < 5) continue;
    const avg = (xs: Visit[]) => xs.reduce((t, v) => t + v.total, 0) / xs.length;
    if (avg(today) > avg(before) * config.checks.unusualBillRatio) {
      items.push({ id: `x-${s.id}`, kind: "unusual", title: `${s.name.split(" ")[0]}'s bills are unusually high today`, detail: `Average ₹${Math.round(avg(today)).toLocaleString("en-IN")} vs usual ₹${Math.round(avg(before)).toLocaleString("en-IN")} · ${today.length} bills` });
    }
  }
  // Referred customers added in the last 30 days, by who added them.
  const byStaff = new Map<string, number>();
  for (const c of data.customers) if (c.referredById && Date.parse(c.createdAt) >= since) byStaff.set(c.consentTakenBy ?? "owner", (byStaff.get(c.consentTakenBy ?? "owner") ?? 0) + 1);
  for (const [who, n] of byStaff) if (n >= 5) items.push({ id: `r-${who}`, kind: "referral", title: `${staffName(data, who).split(" ")[0]} added ${n} referred customers this month`, detail: "Check these are real new customers" });
  // Each count of the last 7 days is checked against the cash bills as they stand now, so a bill rung up
  // after the count, or backdated into a counted day, still shows (SECURITY-LESSONS 3).
  const closing = (data.dayClosings ?? []).find((d) => d.date === day) ?? null;
  for (const c of data.dayClosings ?? []) {
    if (Date.parse(c.at) < now.getTime() - 7 * 86400000) continue;
    const expectedNow = expectedCash(data, c.date).total;
    if (c.counted === expectedNow) continue;
    const diff = c.counted - expectedNow;
    const when = c.date === day ? "" : ` on ${c.date}`;
    items.push({ id: `c-${c.date}`, kind: "cash", title: `Cash ${diff < 0 ? "short" : "over"} by ₹${Math.abs(diff).toLocaleString("en-IN")}${when}`, detail: expectedNow !== c.expected ? `Cash bills changed after the count (was ₹${c.expected.toLocaleString("en-IN")}, now ₹${expectedNow.toLocaleString("en-IN")})${c.note ? " · " + c.note : ""}` : c.note });
  }
  return { day, items, cash: expectedCash(data, day), closing, settings: checkSettings(data) };
}

// ── Backup file ─────────────────────────────────────────────────────────────

/** The whole salon as one file the owner keeps (WhatsApp to themselves, Drive, email). */
export function exportBackup(data: Data, now = new Date()): { fileName: string; text: string } {
  return { fileName: `salon-backup-${istDate(now)}.json`, text: JSON.stringify({ kind: "salon-backup", savedAt: now.toISOString(), data }) };
}

/** Backups bigger than this are refused before they are read into memory. */
export const MAX_BACKUP_BYTES = 20 * 1024 * 1024;

/**
 * Reads a backup file back. A backup is untrusted: it may have been made or edited by someone else,
 * so every record is checked against the same rules the app uses when saving (SECURITY-LESSONS R1-2).
 * Anything that fails is refused before it touches the data.
 */
export function readBackup(text: string): Data {
  if (text.length > MAX_BACKUP_BYTES) throw new UserError("This file is too big to be a salon backup");
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new UserError("This file isn't a salon backup");
  }
  const p = parsed as { kind?: string; data?: unknown };
  if (p?.kind !== "salon-backup" || !p.data || typeof p.data !== "object" || Array.isArray(p.data)) throw new UserError("This file isn't a salon backup");
  let d: Data;
  try {
    d = migrate(p.data);
  } catch {
    throw new UserError("This backup is damaged and can't be used");
  }
  const problem = backupProblem(d);
  if (problem) throw new UserError(`This backup can't be used: ${problem}`);
  return d;
}

const isStr = (x: unknown): x is string => typeof x === "string";
const isIso = (x: unknown) => isStr(x) && !Number.isNaN(Date.parse(x));
const isIsoOrNull = (x: unknown) => x === null || x === undefined || isIso(x);
const isInt = (x: unknown, lo: number, hi: number) => Number.isInteger(x) && (x as number) >= lo && (x as number) <= hi;
const SAFE_KEY = /^[A-Za-z0-9_-][A-Za-z0-9._-]{0,99}$/;
const PHONE = /^[6-9]\d{9}$/;
const DAY_RE = /^\d{4}-\d{2}-\d{2}$/;
const MAX_RUPEES = 10_000_000;

/** The first rule a restored backup breaks, or null. */
function backupProblem(d: Data): string | null {
  const arrays = ["customers", "visits", "walletTxs", "reminders", "staff", "attendance", "appointments", "leaves", "privacyLog"] as const;
  for (const k of arrays) if (!Array.isArray(d[k])) return `${k} is missing`;
  if (!d.owner || !d.owner.secret || !isStr(d.owner.secret.salt) || !isStr(d.owner.secret.hash)) return "the owner record is missing";
  const ids = (xs: { id: unknown }[]) => xs.every((x) => isStr(x.id) && x.id.length > 0 && x.id.length <= 100);
  for (const k of arrays) if (!ids(d[k] as { id: unknown }[])) return `a record in ${k} has no id`;
  for (const c of d.customers) {
    if (!isStr(c.name) || c.name.length > 80) return "a customer's name is too long";
    if (!c.deletedAt && !PHONE.test(c.phone)) return "a customer's mobile number isn't valid";
    if (!isInt(c.walletBalance, 0, MAX_RUPEES)) return "a wallet balance is out of range";
    if (!isIso(c.createdAt) || !isIsoOrNull(c.deletedAt)) return "a customer's dates aren't valid";
  }
  // Each wallet balance must equal its ledger, the rule the app keeps on every save.
  const ledger = new Map<string, number>();
  for (const t of d.walletTxs) {
    if (!isInt(Math.abs(t.amount), 0, MAX_RUPEES) || !isIso(t.createdAt)) return "a wallet entry isn't valid";
    ledger.set(t.customerId, (ledger.get(t.customerId) ?? 0) + t.amount);
  }
  for (const c of d.customers) if ((ledger.get(c.id) ?? 0) !== c.walletBalance) return "a wallet balance doesn't match its entries";
  for (const v of d.visits) {
    if (!["OPEN", "PAID", "VOID", "LEFT"].includes(v.status)) return "a visit has an unknown status";
    if (!isInt(v.total, 0, MAX_RUPEES) || !isInt(v.walletPaid, 0, MAX_RUPEES) || !isInt(v.directPaid, 0, MAX_RUPEES)) return "a bill amount is out of range";
    if (v.paymentMethod !== null && v.paymentMethod !== undefined && !PAYMENT_METHODS.includes(v.paymentMethod)) return "a bill has an unknown payment method";
    if (!isIso(v.createdAt) || !isIsoOrNull(v.paidAt) || !isIsoOrNull(v.voidedAt)) return "a bill's dates aren't valid";
  }
  for (const s of d.staff) {
    if (!isStr(s.name) || s.name.length > 80 || !PHONE.test(s.phone)) return "a staff record isn't valid";
    if (!s.secret || !isStr(s.secret.salt) || !isStr(s.secret.hash)) return "a staff password record is missing";
    if (s.photoKey !== null && s.photoKey !== undefined && !SAFE_KEY.test(s.photoKey)) return "a staff photo name isn't valid";
  }
  for (const a of d.attendance) {
    if (!DAY_RE.test(a.date) || !isIso(a.checkInAt)) return "an attendance record isn't valid";
    if (a.photoKey !== null && a.photoKey !== undefined && !SAFE_KEY.test(a.photoKey)) return "a selfie name isn't valid";
  }
  for (const a of d.appointments) if (!isIso(a.at) || !isIso(a.createdAt)) return "a booking's dates aren't valid";
  if (d.checks) {
    if (!isInt(d.checks.walletCodeAbove, 0, 100000) || !isInt(d.checks.referralMonthlyLimit, 0, 100)) return "the check limits are out of range";
  }
  if (d.catalog) {
    for (const x of [...d.catalog.services, ...d.catalog.addOns]) if (!isStr(x.name) || !x.name.trim() || !isInt(x.price, 1, 100000)) return "a price in the service list is out of range";
    for (const x of d.catalog.services) if (!isInt(x.minutes, 5, 600) || !isInt(x.cycleDays, 1, 365)) return "a service's time or due-back days are out of range";
  }
  for (const c of d.dayClosings ?? []) if (!DAY_RE.test(c.date) || !isInt(c.counted, 0, MAX_RUPEES) || !isInt(c.expected, 0, MAX_RUPEES)) return "a cash count isn't valid";
  return null;
}

/**
 * What a restore really saves (SECURITY-LESSONS R1-2, 7): the backup's records, but the owner password
 * already on this phone, and every customer erased on this phone stays erased.
 */
export function prepareRestore(current: Data, restored: Data, now = new Date()): Data {
  let next: Data = { ...restored, owner: current.owner ?? restored.owner, clock: current.clock, demo: false };
  const erased = current.privacyLog.filter((e) => e.type === "DELETED" || e.type === "AUTO_ERASED");
  for (const e of erased) {
    const c = next.customers.find((x) => x.id === e.customerId);
    if (c && !c.deletedAt) next = eraseCustomer(next, c.id, now);
    if (!next.privacyLog.some((x) => x.id === e.id)) next = { ...next, privacyLog: [...next.privacyLog, e] };
  }
  return next;
}
