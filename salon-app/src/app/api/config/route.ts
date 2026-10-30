import config from "@config";
import { handle } from "@/lib/api";
import { isDemoMode } from "@/lib/whatsapp";

export const dynamic = "force-dynamic";

export const GET = handle(async () => ({ ...config, whatsappDemoMode: isDemoMode() }));
