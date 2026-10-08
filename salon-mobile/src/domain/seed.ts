/**
 * Synthetic demo data so every screen has something to show on first launch.
 * Clearly labelled as demo in the UI; staff can wipe it from the Dashboard.
 */
import config from "../config/salon";
import { priceVisit, topUpBonus } from "./rules";
import type { Customer, Data, PaymentMethod, Visit, WalletTx } from "./types";

const NAMES = [
  "Aarav Sharma", "Priya Patel", "Rohan Gupta", "Ananya Iyer", "Vikram Singh", "Sneha Reddy",
  "Arjun Nair", "Kavya Menon", "Rahul Verma", "Isha Joshi", "Karan Mehta", "Diya Kapoor",
  "Aditya Rao", "Meera Pillai", "Siddharth Das", "Pooja Kulkarni", "Nikhil Bose", "Riya Chatterjee",
  "Varun Malhotra", "Neha Saxena", "Manish Yadav", "Tanvi Desai", "Harsh Agarwal", "Shreya Ghosh",
];
const DAY = 24 * 60 * 60 * 1000;

export function buildDemoData(now = Date.now()): Data {
  // Deterministic pseudo-random so the demo looks the same every reset.
  let seed = 42;
  const rand = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
  const pick = <T,>(xs: readonly T[]) => xs[Math.floor(rand() * xs.length)];
  let n = 0;
  const id = (p: string) => `demo-${p}-${++n}`;

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
      referredById: i > 3 && i % 5 === 0 ? customers[i - 4].id : null,
      referralRewardedAt: null,
      createdAt: created,
    };
    customers.push(c);

    let balance = 0;
    if (i % 3 === 0) {
      const deposit = pick([1000, 2000, 5000] as const);
      const bonus = topUpBonus(deposit);
      const at = new Date(now - 100 * DAY).toISOString();
      walletTxs.push(
        { id: id("t"), customerId: c.id, type: "TOPUP", amount: deposit, visitId: null, note: "Paid by UPI", createdAt: at },
        { id: id("t"), customerId: c.id, type: "BONUS", amount: bonus, visitId: null, note: `Bonus on ₹${deposit} top-up`, createdAt: at },
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
      const { total } = priceVisit({ serviceId: service.id, addOnIds, staffId: config.staff[0].id });
      const walletPaid = balance >= total && rand() < 0.5 ? total : 0;
      balance -= walletPaid;
      const at = new Date(t).toISOString();
      const visit: Visit = {
        id: id("v"),
        customerId: c.id,
        serviceId: service.id,
        staffId: pick(config.staff).id,
        addOnIds,
        total,
        walletPaid,
        directPaid: total - walletPaid,
        paymentMethod: pick(["CASH", "UPI", "UPI", "CARD"] as PaymentMethod[]),
        createdAt: at,
      };
      visits.push(visit);
      if (walletPaid > 0) {
        walletTxs.push({ id: id("t"), customerId: c.id, type: "SPEND", amount: -walletPaid, visitId: visit.id, note: null, createdAt: at });
      }
    });
    c.walletBalance = balance;
  });

  // Pay out referral rewards the way the engine would have, on each referred customer's first visit.
  for (const c of customers) {
    if (!c.referredById) continue;
    const first = visits.filter((v) => v.customerId === c.id).sort((a, b) => a.createdAt.localeCompare(b.createdAt))[0];
    const referrer = customers.find((x) => x.id === c.referredById)!;
    if (!first) continue;
    walletTxs.push(
      { id: id("t"), customerId: referrer.id, type: "REFERRAL_REWARD", amount: config.referral.referrerReward, visitId: first.id, note: `Referred ${c.name}`, createdAt: first.createdAt },
      { id: id("t"), customerId: c.id, type: "REFERRAL_REWARD", amount: config.referral.newCustomerReward, visitId: first.id, note: "Welcome reward for joining by referral", createdAt: first.createdAt },
    );
    referrer.walletBalance += config.referral.referrerReward;
    c.walletBalance += config.referral.newCustomerReward;
    c.referralRewardedAt = first.createdAt;
  }

  return { version: 1, customers, visits, walletTxs, reminders: [], demo: true };
}
