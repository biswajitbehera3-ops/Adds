import { handle } from "@/lib/api";
import { overdueReminders } from "@/lib/reminders";
import { isDemoMode } from "@/lib/whatsapp";

export const dynamic = "force-dynamic";

export const GET = handle(async () => ({ demoMode: isDemoMode(), reminders: await overdueReminders() }));
