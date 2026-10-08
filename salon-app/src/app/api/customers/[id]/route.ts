import { handle } from "@/lib/api";
import { getProfile } from "@/lib/customers";

export const GET = handle(async (_req: Request, ctx: { params: Promise<{ id: string }> }) => ({
  customer: await getProfile((await ctx.params).id),
}));
