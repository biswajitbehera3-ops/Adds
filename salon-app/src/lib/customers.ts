import { randomInt } from "node:crypto";
import { Prisma } from "@prisma/client";
import config from "@config";
import { db } from "./db";
import { UserError } from "./errors";
import { dueDate, normalizePhone } from "./rules";

// No 0/O/1/I so codes read cleanly over the phone.
const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function makeReferralCode(name: string): string {
  const prefix = (name.replace(/[^a-z]/gi, "").toUpperCase() + "XXX").slice(0, 3);
  let suffix = "";
  for (let i = 0; i < 4; i++) suffix += CODE_ALPHABET[randomInt(CODE_ALPHABET.length)];
  return prefix + suffix;
}

export function referralLink(code: string): string {
  return `${config.publicUrl.replace(/\/$/, "")}/r/${code}`;
}

export async function findByPhone(rawPhone: string) {
  const phone = normalizePhone(rawPhone);
  if (!phone) throw new UserError("Enter a valid 10-digit mobile number");
  const customer = await db.customer.findUnique({
    where: { phone },
    include: { visits: { orderBy: { createdAt: "desc" }, take: 1 }, _count: { select: { visits: true } } },
  });
  if (!customer) return { phone, customer: null };
  const { visits, _count, ...rest } = customer;
  return {
    phone,
    customer: { ...rest, visitCount: _count.visits, lastVisit: visits[0] ?? null },
  };
}

export async function createCustomer(input: {
  phone: string;
  name: string;
  consent: boolean;
  referralCode?: string;
}) {
  const phone = normalizePhone(input.phone);
  if (!phone) throw new UserError("Enter a valid 10-digit mobile number");
  const name = input.name.trim();
  if (!name) throw new UserError("Name is required");
  if (!input.consent) throw new UserError("The customer's consent is needed to save their details");

  let referredById: string | undefined;
  if (input.referralCode?.trim()) {
    const referrer = await db.customer.findUnique({
      where: { referralCode: input.referralCode.trim().toUpperCase() },
    });
    if (!referrer) throw new UserError("That referral code doesn't exist");
    referredById = referrer.id;
  }

  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      return await db.customer.create({
        data: { phone, name, consentAt: new Date(), referredById, referralCode: makeReferralCode(name) },
      });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
        const target = String(e.meta?.target ?? "");
        if (target.includes("phone")) throw new UserError("A customer with this number already exists", 409);
        continue; // referral code collision — try another
      }
      throw e;
    }
  }
  throw new Error("Could not generate a unique referral code");
}

export async function searchCustomers(q: string, take = 50) {
  const term = q.trim();
  const digits = term.replace(/\D/g, "");
  const where: Prisma.CustomerWhereInput = term
    ? {
        OR: [
          { name: { contains: term } },
          ...(digits ? [{ phone: { contains: digits } }] : []),
          { referralCode: { equals: term.toUpperCase() } },
        ],
      }
    : {};
  return db.customer.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take,
    select: { id: true, name: true, phone: true, walletBalance: true, referralCode: true, createdAt: true },
  });
}

/** Per-service due dates for one customer, soonest first. */
export async function serviceDueDates(customerId: string) {
  const last = await db.visit.groupBy({
    by: ["serviceId"],
    where: { customerId },
    _max: { createdAt: true },
  });
  return last
    .map((row) => {
      const lastVisit = row._max.createdAt!;
      const service = config.services.find((s) => s.id === row.serviceId);
      const due = dueDate(row.serviceId, lastVisit);
      return service && due ? { serviceId: service.id, serviceName: service.name, lastVisit, dueAt: due } : null;
    })
    .filter((x): x is NonNullable<typeof x> => x !== null)
    .sort((a, b) => a.dueAt.getTime() - b.dueAt.getTime());
}

export async function getProfile(id: string) {
  const customer = await db.customer.findUnique({
    where: { id },
    include: {
      visits: { orderBy: { createdAt: "desc" } },
      walletTransactions: { orderBy: { createdAt: "desc" } },
      referredBy: { select: { id: true, name: true, referralCode: true } },
      referrals: { select: { id: true, name: true, referralRewardedAt: true, createdAt: true } },
    },
  });
  if (!customer) throw new UserError("Customer not found", 404);
  const dues = await serviceDueDates(id);
  const lifetimeSpend = customer.visits.reduce((sum, v) => sum + v.total, 0);
  return {
    ...customer,
    visits: customer.visits.map((v) => ({ ...v, addOnIds: JSON.parse(v.addOnIds) as string[] })),
    lifetimeSpend,
    referralLink: referralLink(customer.referralCode),
    serviceDues: dues,
    nextDue: dues[0] ?? null,
  };
}
