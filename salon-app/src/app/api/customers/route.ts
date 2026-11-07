import { z } from "zod";
import { handle, parseBody } from "@/lib/api";
import { createCustomer, searchCustomers } from "@/lib/customers";

export const GET = handle(async (req: Request) => {
  const q = new URL(req.url).searchParams.get("q") ?? "";
  return { customers: await searchCustomers(q) };
});

const CreateCustomer = z.object({
  phone: z.string(),
  name: z.string().max(80),
  consent: z.boolean(),
  referralCode: z.string().max(20).optional(),
});

export const POST = handle(async (req: Request) => ({
  customer: await createCustomer(await parseBody(req, CreateCustomer)),
}));
