import { z } from "zod";
import { handle, parseBody } from "@/lib/api";
import { logVisit } from "@/lib/visits";
import { PAYMENT_METHODS } from "@/lib/wallet";

const LogVisit = z.object({
  customerId: z.string(),
  serviceId: z.string(),
  addOnIds: z.array(z.string()).default([]),
  staffId: z.string(),
  walletAmount: z.number().int().min(0).default(0),
  paymentMethod: z.enum(PAYMENT_METHODS).default("CASH"),
});

export const POST = handle(async (req: Request) => logVisit(await parseBody(req, LogVisit)));
