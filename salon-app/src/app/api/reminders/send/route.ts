import { z } from "zod";
import { handle, parseBody } from "@/lib/api";
import { sendReminder } from "@/lib/reminders";

const Send = z.object({ customerId: z.string(), serviceId: z.string(), message: z.string() });

export const POST = handle(async (req: Request) => sendReminder(await parseBody(req, Send)));
