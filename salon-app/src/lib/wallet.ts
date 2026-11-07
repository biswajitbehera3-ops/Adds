import { db } from "./db";
import { UserError } from "./errors";
import { topUpBonus } from "./rules";

export const PAYMENT_METHODS = ["CASH", "UPI", "CARD"] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

/** Deposit money into a customer's wallet and credit the tiered bonus on top. */
export async function topUp(input: { customerId: string; amount: number; method: PaymentMethod }) {
  const amount = input.amount;
  if (!Number.isInteger(amount) || amount <= 0) throw new UserError("Top-up must be a whole rupee amount above 0");
  const bonus = topUpBonus(amount);

  return db.$transaction(async (tx) => {
    const customer = await tx.customer.findUnique({ where: { id: input.customerId } });
    if (!customer) throw new UserError("Customer not found", 404);
    await tx.walletTransaction.create({
      data: { customerId: customer.id, type: "TOPUP", amount, note: `Paid by ${input.method}` },
    });
    if (bonus > 0) {
      await tx.walletTransaction.create({
        data: { customerId: customer.id, type: "BONUS", amount: bonus, note: `Bonus on ₹${amount} top-up` },
      });
    }
    const updated = await tx.customer.update({
      where: { id: customer.id },
      data: { walletBalance: { increment: amount + bonus } },
    });
    return { deposit: amount, bonus, balance: updated.walletBalance };
  });
}
