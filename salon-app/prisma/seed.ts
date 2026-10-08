/**
 * Demo data so every screen has something to show. Never run against a real
 * salon's database — it wipes it first.
 */
import { PrismaClient } from "@prisma/client";
import config from "../salon.config";
import { priceVisit } from "../src/lib/rules";

const db = new PrismaClient();
const DAY = 24 * 60 * 60 * 1000;

const NAMES = [
  "Aarav Sharma", "Priya Patel", "Rohan Gupta", "Ananya Iyer", "Vikram Singh", "Sneha Reddy",
  "Arjun Nair", "Kavya Menon", "Rahul Verma", "Isha Joshi", "Karan Mehta", "Diya Kapoor",
  "Aditya Rao", "Meera Pillai", "Siddharth Das", "Pooja Kulkarni", "Nikhil Bose", "Riya Chatterjee",
  "Varun Malhotra", "Neha Saxena", "Manish Yadav", "Tanvi Desai", "Harsh Agarwal", "Shreya Ghosh",
];

// Deterministic pseudo-random so the demo looks the same every reset.
let seed = 42;
const rand = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
const pick = <T,>(xs: T[]) => xs[Math.floor(rand() * xs.length)];

async function main() {
  await db.reminderLog.deleteMany();
  await db.walletTransaction.deleteMany();
  await db.visit.deleteMany();
  await db.customer.deleteMany();

  const now = Date.now();
  for (const [i, name] of NAMES.entries()) {
    const code = name.replace(/[^A-Z]/g, "").padEnd(3, "X").slice(0, 3) + String(1000 + i);
    const customer = await db.customer.create({
      data: {
        phone: String(9800000000 + i * 7919),
        name,
        referralCode: code,
        consentAt: new Date(now - 200 * DAY),
        createdAt: new Date(now - 200 * DAY),
      },
    });

    let balance = 0;
    if (i % 3 === 0) {
      const deposit = pick([1000, 2000, 5000]);
      const bonus = Math.floor((deposit * (deposit >= 5000 ? 15 : deposit >= 2000 ? 10 : 5)) / 100);
      await db.walletTransaction.createMany({
        data: [
          { customerId: customer.id, type: "TOPUP", amount: deposit, note: "Paid by UPI", createdAt: new Date(now - 120 * DAY) },
          { customerId: customer.id, type: "BONUS", amount: bonus, note: `Bonus on ₹${deposit} top-up`, createdAt: new Date(now - 120 * DAY) },
        ],
      });
      balance = deposit + bonus;
    }

    const visitCount = 1 + Math.floor(rand() * 6);
    for (let v = 0; v < visitCount; v++) {
      const service = pick(config.services);
      const addOnIds = rand() < 0.4 ? [pick(config.addOns.filter((a) => a.suggestWith.includes(service.id))).id] : [];
      const { total } = priceVisit({ serviceId: service.id, addOnIds, staffId: config.staff[0].id });
      const daysAgo = v === 0 && i < 6 ? 0 : Math.floor(rand() * 90);
      const createdAt = new Date(now - daysAgo * DAY - Math.floor(rand() * 8) * 3600 * 1000);
      const walletPaid = balance >= total && rand() < 0.5 ? total : 0;
      balance -= walletPaid;
      const visit = await db.visit.create({
        data: {
          customerId: customer.id,
          serviceId: service.id,
          staffId: pick(config.staff).id,
          addOnIds: JSON.stringify(addOnIds),
          total,
          walletPaid,
          directPaid: total - walletPaid,
          paymentMethod: pick(["CASH", "UPI", "UPI", "CARD"]),
          createdAt,
        },
      });
      if (walletPaid > 0) {
        await db.walletTransaction.create({
          data: { customerId: customer.id, type: "SPEND", amount: -walletPaid, visitId: visit.id, createdAt },
        });
      }
    }
    await db.customer.update({ where: { id: customer.id }, data: { walletBalance: balance } });
  }

  console.log(`Seeded ${NAMES.length} customers`);
}

main().finally(() => db.$disconnect());
