import config from "@config";
import { db } from "./db";
import { UserError } from "./errors";
import { priceVisit } from "./rules";
import type { PaymentMethod } from "./wallet";

/**
 * Logs a visit. Optionally pays part or all of it from the wallet.
 *
 * Referral rule: when a referred customer's FIRST PAID visit is logged, both
 * they and their referrer get wallet credit — never at sign-up, so there's
 * always a real visit behind the reward.
 */
export async function logVisit(input: {
  customerId: string;
  serviceId: string;
  addOnIds: string[];
  staffId: string;
  walletAmount: number;
  paymentMethod: PaymentMethod;
}) {
  const { total, addOnIds } = priceVisit(input);
  const walletAmount = input.walletAmount;
  if (!Number.isInteger(walletAmount) || walletAmount < 0) throw new UserError("Invalid wallet amount");
  if (walletAmount > total) throw new UserError("Wallet amount is more than the bill");

  return db.$transaction(async (tx) => {
    const customer = await tx.customer.findUnique({ where: { id: input.customerId } });
    if (!customer) throw new UserError("Customer not found", 404);

    const priorPaidVisits = await tx.visit.count({ where: { customerId: customer.id, total: { gt: 0 } } });

    if (walletAmount > 0) {
      // Conditional decrement guards against two counters spending the same balance.
      const debited = await tx.customer.updateMany({
        where: { id: customer.id, walletBalance: { gte: walletAmount } },
        data: { walletBalance: { decrement: walletAmount } },
      });
      if (debited.count === 0) throw new UserError("Not enough wallet balance");
    }

    const visit = await tx.visit.create({
      data: {
        customerId: customer.id,
        serviceId: input.serviceId,
        staffId: input.staffId,
        addOnIds: JSON.stringify(addOnIds),
        total,
        walletPaid: walletAmount,
        directPaid: total - walletAmount,
        paymentMethod: input.paymentMethod,
      },
    });

    if (walletAmount > 0) {
      await tx.walletTransaction.create({
        data: { customerId: customer.id, type: "SPEND", amount: -walletAmount, visitId: visit.id },
      });
    }

    let referral: { referrerId: string; referrerReward: number; newCustomerReward: number } | null = null;
    if (total > 0 && priorPaidVisits === 0 && customer.referredById && !customer.referralRewardedAt) {
      // Claim the reward atomically so it can only ever be paid once.
      const claimed = await tx.customer.updateMany({
        where: { id: customer.id, referralRewardedAt: null },
        data: { referralRewardedAt: new Date() },
      });
      if (claimed.count === 1) {
        const { referrerReward, newCustomerReward } = config.referral;
        await tx.walletTransaction.createMany({
          data: [
            {
              customerId: customer.referredById,
              type: "REFERRAL_REWARD",
              amount: referrerReward,
              visitId: visit.id,
              note: `Referred ${customer.name}`,
            },
            {
              customerId: customer.id,
              type: "REFERRAL_REWARD",
              amount: newCustomerReward,
              visitId: visit.id,
              note: "Welcome reward for joining by referral",
            },
          ],
        });
        await tx.customer.update({
          where: { id: customer.referredById },
          data: { walletBalance: { increment: referrerReward } },
        });
        await tx.customer.update({
          where: { id: customer.id },
          data: { walletBalance: { increment: newCustomerReward } },
        });
        referral = { referrerId: customer.referredById, referrerReward, newCustomerReward };
      }
    }

    const after = await tx.customer.findUniqueOrThrow({ where: { id: customer.id } });
    return { visit, balance: after.walletBalance, referral };
  });
}
