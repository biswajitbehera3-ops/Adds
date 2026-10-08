import { handle } from "@/lib/api";
import { ownerDashboard, type Range } from "@/lib/dashboard";

export const dynamic = "force-dynamic";

const RANGES: Range[] = ["today", "7d", "30d"];

export const GET = handle(async (req: Request) => {
  const r = new URL(req.url).searchParams.get("range") as Range | null;
  return ownerDashboard(r && RANGES.includes(r) ? r : "today");
});
