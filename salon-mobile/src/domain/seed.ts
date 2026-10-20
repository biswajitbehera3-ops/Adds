/**
 * Synthetic demo data so every screen has something to show on first launch.
 * Clearly labelled as demo in the UI; the owner wipes it before real use.
 *
 * Demo logins: owner password "owner1234"; staff 98111 00001 / 98111 00002 /
 * 98111 00003, password "1234".
 */
import config from "../config/salon";
import { istDate, priceItems, topUpBonus } from "./rules";
import type { Appointment, Attendance, Customer, Data, PaymentMethod, Secret, Staff, Visit, WalletTx } from "./types";

export const DEMO_OWNER_PASSWORD = "owner1234";
export const DEMO_STAFF_PASSWORD = "1234";
const SALT = "demosalt0123456789abcdef";
const OWNER_SECRET: Secret = { salt: SALT, hash: "35f9b0747f3a284e25884cff17da38c34b79aa455133d9e6d2f6a1355ccd200b" };
const STAFF_SECRET: Secret = { salt: SALT, hash: "d3418963e6c899c21ed54aff2f7fb55aeb1f090b6762f36f5b92038f3cb67be0" };

const NAMES = [
  "Aarav Sharma", "Priya Patel", "Rohan Gupta", "Ananya Iyer", "Vikram Singh", "Sneha Reddy",
  "Arjun Nair", "Kavya Menon", "Rahul Verma", "Isha Joshi", "Karan Mehta", "Diya Kapoor",
  "Aditya Rao", "Meera Pillai", "Siddharth Das", "Pooja Kulkarni", "Nikhil Bose", "Riya Chatterjee",
  "Varun Malhotra", "Neha Saxena", "Manish Yadav", "Tanvi Desai", "Harsh Agarwal", "Shreya Ghosh",
];
const STAFF_NAMES = ["Imran Khan", "Sunita Devi", "Rakesh Kumar"];
const DAY = 24 * 60 * 60 * 1000;

export function buildDemoData(now = Date.now()): Data {
  // Deterministic pseudo-random so the demo looks the same every reset.
  let seed = 42;
  const rand = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
  const pick = <T,>(xs: readonly T[]) => xs[Math.floor(rand() * xs.length)];
  let n = 0;
  const id = (p: string) => `demo-${p}-${++n}`;

  const staff: Staff[] = STAFF_NAMES.map((name, i) => ({
    id: id("s"),
    name,
    phone: `981110000${i + 1}`,
    chair: `Chair ${i + 1}`,
    secret: STAFF_SECRET,
    active: true,
    createdAt: new Date(now - 200 * DAY).toISOString(),
  }));

  // 30 days of check-ins: mostly on time, some late, a few days off. Today is left
  // empty so the attendance step can be tried.
  const attendance: Attendance[] = [];
  for (let d = 30; d >= 1; d--) {
    const day = new Date(now - d * DAY);
    if (new Date(day.getTime() + 330 * 60000).getUTCDay() === 2) continue; // salon closed on Tuesdays
    for (const s of staff) {
      if (rand() < 0.08) continue; // day off
      const date = istDate(day);
      const minutes = 9 * 60 + 40 + Math.floor(rand() * (rand() < 0.2 ? 70 : 30)); // 09:40 to ~10:50 IST
      const checkIn = new Date(`${date}T00:00:00.000Z`).getTime() - 330 * 60000 + minutes * 60000;
      attendance.push({ id: id("a"), staffId: s.id, date, checkInAt: new Date(checkIn).toISOString(), photoKey: null });
    }
  }

  const customers: Customer[] = [];
  const visits: Visit[] = [];
  const walletTxs: WalletTx[] = [];

  NAMES.forEach((name, i) => {
    const created = new Date(now - (120 + i * 3) * DAY).toISOString();
    const c: Customer = {
      id: id("c"),
      phone: String(9800000000 + i * 7919),
      name,
      referralCode: name.replace(/[^A-Z]/g, "").padEnd(3, "X").slice(0, 3) + (2300 + i * 37),
      walletBalance: 0,
      consentAt: created,
      // Most demo customers opted in to messages; every fourth did not.
      marketingConsentAt: i % 4 === 3 ? null : created,
      consentNotice: config.legal.noticeVersion,
      consentTakenBy: null,
      guardianConsent: false,
      deletedAt: null,
      referredById: i > 3 && i % 5 === 0 ? customers[i - 4].id : null,
      referralRewardedAt: null,
      createdAt: created,
    };
    customers.push(c);

    let balance = 0;
    if (i % 3 === 0) {
      const deposit = pick([1000, 2000, 5000] as const);
      const bonus = topUpBonus(deposit);
      const when = new Date(now - 100 * DAY).toISOString();
      walletTxs.push(
        { id: id("t"), customerId: c.id, type: "TOPUP", amount: deposit, visitId: null, note: "Paid by UPI", createdAt: when },
        { id: id("t"), customerId: c.id, type: "BONUS", amount: bonus, visitId: null, note: `Bonus on ₹${deposit} top-up`, createdAt: when },
      );
      balance = deposit + bonus;
    }

    const count = 1 + Math.floor(rand() * 6);
    const times = Array.from({ length: count }, (_, v) =>
      v === 0 && i < 7 ? now - Math.floor(rand() * 7) * 3600 * 1000 : now - (1 + Math.floor(rand() * 95)) * DAY,
    ).sort((a, b) => a - b);
    times.forEach((t) => {
      const service = pick(config.services);
      const upsells = config.addOns.filter((a) => a.suggestWith.includes(service.id));
      const addOnIds = rand() < 0.4 && upsells.length ? [pick(upsells).id] : [];
      const { total } = priceItems([service.id], addOnIds);
      const walletPaid = balance >= total && rand() < 0.5 ? total : 0;
      balance -= walletPaid;
      const when = new Date(t).toISOString();
      const visit: Visit = {
        id: id("v"),
        customerId: c.id,
        serviceIds: [service.id],
        staffId: pick(staff).id,
        addOnIds,
        total,
        walletPaid,
        directPaid: total - walletPaid,
        paymentMethod: pick(["CASH", "UPI", "UPI", "CARD"] as PaymentMethod[]),
        status: "PAID",
        createdAt: new Date(t - 40 * 60000).toISOString(),
        paidAt: when,
        voidedAt: null,
        voidReason: null,
      };
      visits.push(visit);
      if (walletPaid > 0) {
        walletTxs.push({ id: id("t"), customerId: c.id, type: "SPEND", amount: -walletPaid, visitId: visit.id, note: null, createdAt: when });
      }
    });
    c.walletBalance = balance;
  });

  // Pay out referral rewards the way the engine would have, on each referred customer's first visit.
  for (const c of customers) {
    if (!c.referredById) continue;
    const first = visits.filter((v) => v.customerId === c.id).sort((a, b) => a.paidAt!.localeCompare(b.paidAt!))[0];
    const referrer = customers.find((x) => x.id === c.referredById)!;
    if (!first) continue;
    walletTxs.push(
      { id: id("t"), customerId: referrer.id, type: "REFERRAL_REWARD", amount: config.referral.referrerReward, visitId: first.id, note: `Referred ${c.name}`, createdAt: first.paidAt! },
      { id: id("t"), customerId: c.id, type: "REFERRAL_REWARD", amount: config.referral.newCustomerReward, visitId: first.id, note: "Welcome reward for joining by referral", createdAt: first.paidAt! },
    );
    referrer.walletBalance += config.referral.referrerReward;
    c.walletBalance += config.referral.newCustomerReward;
    c.referralRewardedAt = first.paidAt;
  }

  // Bookings from ten days back to three weeks ahead, so the calendar has busy and quiet
  // days: weekends fuller. Its own random stream keeps the visits above unchanged.
  let aSeed = 7;
  const aRand = () => ((aSeed = (aSeed * 16807) % 2147483647) - 1) / 2147483646;
  const appointments: Appointment[] = [];
  const { open, close, slotMinutes, closedDays } = config.appointments;
  const [oh, om] = open.split(":").map(Number);
  const [ch, cm] = close.split(":").map(Number);
  for (let d = -10; d <= 21; d++) {
    const date = istDate(new Date(now + d * DAY));
    const dow = new Date(`${date}T00:00:00Z`).getUTCDay();
    if (closedDays.includes(dow)) continue;
    const weekend = dow === 0 || dow === 6;
    for (const s of staff) {
      let t = oh * 60 + om + Math.floor(aRand() * 3) * slotMinutes;
      const count = (weekend ? 5 : 2) + Math.floor(aRand() * (weekend ? 4 : 4));
      for (let k = 0; k < count; k++) {
        const service = config.services[Math.floor(aRand() * config.services.length)];
        const minutes = Math.max(slotMinutes, Math.ceil(service.minutes / slotMinutes) * slotMinutes);
        if (t + minutes > ch * 60 + cm) break;
        const at = new Date(`${date}T00:00:00.000Z`).getTime() + (t - 330) * 60000;
        const past = at + minutes * 60000 < now;
        appointments.push({
          id: id("ap"),
          customerId: customers[Math.floor(aRand() * customers.length)].id,
          serviceIds: [service.id],
          staffId: s.id,
          at: new Date(at).toISOString(),
          minutes,
          status: past ? "ARRIVED" : "BOOKED",
          source: aRand() < 0.6 ? "WHATSAPP" : "PHONE",
          note: null,
          reminderSentAt: null,
          reminderChannel: null,
          visitId: null,
          createdBy: s.id,
          createdAt: new Date(at - 3 * DAY).toISOString(),
        });
        t += minutes + slotMinutes * Math.floor(aRand() * (weekend ? 2 : 4));
      }
    }
  }

  return { version: 4, customers, visits, walletTxs, reminders: [], staff, attendance, appointments, privacyLog: [], owner: { secret: OWNER_SECRET }, demo: true };
}
