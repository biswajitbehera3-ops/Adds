import { handle } from "@/lib/api";
import { findByPhone } from "@/lib/customers";

export const GET = handle(async (req: Request) =>
  findByPhone(new URL(req.url).searchParams.get("phone") ?? ""),
);
