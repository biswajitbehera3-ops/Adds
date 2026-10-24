/**
 * Pure business rules. No database access here, so they can be tested in
 * isolation. Ported unchanged from ../salon-app/src/lib/rules.ts — keep the two in sync.
 */
import config, { type SalonConfig } from "../config/salon";
import { UserError } from "./errors";

const DAY_MS = 24 * 60 * 60 * 1000;

/** Normalises an Indian mobile number to its 10 digits, or returns null if it isn't one. */
export function normalizePhone(input: string): string | null {
  let digits = input.replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("91")) digits = digits.slice(2);
  else if (digits.length === 11 && digits.startsWith("0")) digits = digits.slice(1);
  return /^[6-9]\d{9}$/.test(digits) ? digits : null;
}

/** Bonus credited on a wallet top-up: the highest tier the deposit reaches. */
export function topUpBonus(deposit: number, tiers = config.topUpTiers): number {
  const tier = [...tiers]
    .sort((a, b) => b.minDeposit - a.minDeposit)
    .find((t) => deposit >= t.minDeposit);
  return tier ? Math.floor((deposit * tier.bonusPercent) / 100) : 0;
}

/** Resolves and prices a checkout against the salon's catalogue. */
export function priceVisit(
  input: { serviceId: string; addOnIds: string[]; staffId: string },
  cfg: SalonConfig = config,
) {
  const service = cfg.services.find((s) => s.id === input.serviceId);
  if (!service) throw new UserError("Pick a service");
  if (!cfg.staff.some((s) => s.id === input.staffId)) throw new UserError("Pick who did the service");
  const addOnIds = [...new Set(input.addOnIds)];
  const addOns = addOnIds.map((id) => {
    const a = cfg.addOns.find((x) => x.id === id);
    if (!a) throw new UserError(`Unknown add-on: ${id}`);
    return a;
  });
  const total = service.price + addOns.reduce((sum, a) => sum + a.price, 0);
  return { service, addOns, addOnIds, total };
}

/** Add-ons to suggest at checkout for a service, minus any already chosen. */
export function upsellsFor(serviceId: string, chosen: string[] = [], cfg: SalonConfig = config) {
  return cfg.addOns.filter((a) => a.suggestWith.includes(serviceId) && !chosen.includes(a.id));
}

/** When a customer is next due for a service, given their last visit for it. */
export function dueDate(serviceId: string, lastVisit: Date, cfg: SalonConfig = config): Date | null {
  const service = cfg.services.find((s) => s.id === serviceId);
  if (!service) return null;
  return new Date(lastVisit.getTime() + service.cycleDays * DAY_MS);
}

/** Whole days between two dates (positive when `to` is later). */
export function daysBetween(from: Date, to: Date): number {
  return Math.floor((to.getTime() - from.getTime()) / DAY_MS);
}

export function renderReminder(template: string, vars: { name: string; service: string }): string {
  return template.replaceAll("{name}", vars.name).replaceAll("{service}", vars.service);
}

/** Start of "today" in India (IST is a fixed +05:30, no DST). */
export function startOfIstDay(now = new Date()): Date {
  const IST_OFFSET = 330 * 60 * 1000;
  const ist = new Date(now.getTime() + IST_OFFSET);
  ist.setUTCHours(0, 0, 0, 0);
  return new Date(ist.getTime() - IST_OFFSET);
}

/** Prices a visit with one or more services plus add-ons (stylist not needed for price). */
export function priceItems(serviceIds: string[], addOnIds: string[], cfg: SalonConfig = config) {
  const ids = [...new Set(serviceIds)];
  if (ids.length === 0) throw new UserError("Pick at least one service");
  const services = ids.map((id) => {
    const s = cfg.services.find((x) => x.id === id);
    if (!s) throw new UserError(`Unknown service: ${id}`);
    return s;
  });
  const addOnIdsUnique = [...new Set(addOnIds)];
  const addOns = addOnIdsUnique.map((id) => {
    const a = cfg.addOns.find((x) => x.id === id);
    if (!a) throw new UserError(`Unknown add-on: ${id}`);
    return a;
  });
  const total = services.reduce((s, x) => s + x.price, 0) + addOns.reduce((s, a) => s + a.price, 0);
  return { services, addOns, serviceIds: ids, addOnIds: addOnIdsUnique, total };
}

/** Add-ons to suggest for any of the chosen services, minus those already chosen. */
export function upsellsForServices(serviceIds: string[], chosen: string[] = [], cfg: SalonConfig = config) {
  return cfg.addOns.filter((a) => a.suggestWith.some((s) => serviceIds.includes(s)) && !chosen.includes(a.id));
}

/** Salon-local (IST) calendar day as YYYY-MM-DD. */
export function istDate(at: Date | string = new Date()): string {
  const d = typeof at === "string" ? new Date(at) : at;
  return new Date(d.getTime() + 330 * 60 * 1000).toISOString().slice(0, 10);
}

/** Minutes after midnight, salon-local (IST). */
export function istMinutes(at: Date | string): number {
  const d = new Date((typeof at === "string" ? new Date(at) : at).getTime() + 330 * 60 * 1000);
  return d.getUTCHours() * 60 + d.getUTCMinutes();
}

/** Whether a check-in counts as late against the configured shift. */
export function isLate(checkInAt: Date | string, cfg: SalonConfig = config, shiftStart?: string): boolean {
  const [h, m] = (shiftStart ?? cfg.shift.start).split(":").map(Number);
  return istMinutes(checkInAt) > h * 60 + m + cfg.shift.graceMinutes;
}

export function renderTemplate(template: string, vars: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (m, k: string) => (k in vars ? vars[k] : m));
}
