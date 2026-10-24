import { z } from "zod";
import { handle, parseBody } from "@/lib/api";
import { PAYMENT_METHODS, topUp } from "@/lib/wallet";

const TopUp = z.object({
  customerId: z.string(),
  amount: z.number().int().positive().max(100000),
  method: z.enum(PAYMENT_METHODS).default("CASH"),
});

export const POST = handle(async (req: Request) => topUp(await parseBody(req, TopUp)));
