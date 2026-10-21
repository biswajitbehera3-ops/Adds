/**
 * The owner's guard rails (MISUSE-CHECKS.md): the day's checks (staff undos, customers who
 * left without service, bookings nobody closed, unusual bills, referrals by who added them),
 * the end-of-day cash count, services and prices the owner edits in the app, the check
 * limits, and a backup file of the whole salon.
 */
import config, { type AddOn, type Service } from "../config/salon";
import { UserError } from "./errors";
import { checkSettings, migrate, newId } from "./engine";
import { istDate } from "./rules";
import type { Catalog, CheckSettings, Data, DayClosing, Visit } from "./types";

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

/** Cash that should be in the drawer for a day: cash bills (not cancelled) and cash wallet top-ups. */
export function expectedCash(data: Data, day: string) {
  const bills = data.visits.filter((v) => v.status === "PAID" && v.paymentMethod === "CASH" && v.paidAt && dayOf(v.paidAt) === day);
  const topUps = data.walletTxs.filter((t) => t.type === "TOPUP" && t.note === "Paid by CASH" && dayOf(t.createdAt) === day);
  const fromBills = bills.reduce((s, v) => s + v.directPaid, 0);
  const fromTopUps = topUps.reduce((s, t) => s + t.amount, 0);
  return { bills: bills.length, fromBills, topUps: topUps.length, fromTopUps, total: fromBills + fromTopUps };
}

/** The owner counts the drawer; the difference is saved with the day. Counting again replaces it. */
export function closeDay(data: Data, input: { counted: number; note?: string }, now = new Date()): Op<DayClosing> {
  if (!Number.isInteger(input.counted) || input.counted < 0) throw new UserError("Enter the cash counted in whole rupees");
  const date = istDate(now);
  const expected = expectedCash(data, date).total;
  const diff = input.counted - expected;
  const note = (input.note ?? "").trim();
  if (diff !== 0 && !note) throw new UserError("The count doesn't match. Add a note saying why");
  const rec: DayClosing = { id: newId(), date, expected, counted: input.counted, note, at: now.toISOString() };
  return { data: { ...data, dayClosings: [...(data.dayClosings ?? []).filter((d) => d.date !== date), rec] }, result: rec };
}

// ── The owner's checks for a day ────────────────────────────────────────────

export type CheckItem = { id: string; kind: "undo" | "left" | "booking" | "unusual" | "other" | "cash" | "referral"; title: string; detail: string; visitId?: string };

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
  const closing = (data.dayClosings ?? []).find((d) => d.date === day) ?? null;
  if (closing && closing.counted !== closing.expected) {
    const diff = closing.counted - closing.expected;
    items.push({ id: `c-${day}`, kind: "cash", title: `Cash ${diff < 0 ? "short" : "over"} by ₹${Math.abs(diff).toLocaleString("en-IN")}`, detail: closing.note });
  }
  return { day, items, cash: expectedCash(data, day), closing, settings: checkSettings(data) };
}

// ── Backup file ─────────────────────────────────────────────────────────────

/** The whole salon as one file the owner keeps (WhatsApp to themselves, Drive, email). */
export function exportBackup(data: Data, now = new Date()): { fileName: string; text: string } {
  return { fileName: `salon-backup-${istDate(now)}.json`, text: JSON.stringify({ kind: "salon-backup", savedAt: now.toISOString(), data }) };
}

/** Reads a backup file back. Anything that isn't a salon backup is refused before it touches the data. */
export function readBackup(text: string): Data {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new UserError("This file isn't a salon backup");
  }
  const p = parsed as { kind?: string; data?: unknown };
  if (p?.kind !== "salon-backup" || !p.data || typeof p.data !== "object") throw new UserError("This file isn't a salon backup");
  const d = migrate(p.data);
  if (!Array.isArray(d.customers) || !Array.isArray(d.visits) || !Array.isArray(d.staff) || !d.owner) throw new UserError("This backup is damaged and can't be used");
  return d;
}
