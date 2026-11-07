/**
 * WhatsApp sending. With no provider credentials configured the app runs in
 * demo mode: sends are simulated and logged. Setting WHATSAPP_TOKEN and
 * WHATSAPP_PHONE_NUMBER_ID switches to real sending — no code change needed.
 */

export function isDemoMode(): boolean {
  return !(process.env.WHATSAPP_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID);
}

export type SendResult = { status: "SIMULATED" | "SENT" | "FAILED"; error?: string };

export async function sendWhatsApp(phone10: string, message: string): Promise<SendResult> {
  if (isDemoMode()) return { status: "SIMULATED" };

  try {
    const res = await fetch(
      `https://graph.facebook.com/v21.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: `91${phone10}`,
          type: "text",
          text: { body: message },
        }),
      },
    );
    if (!res.ok) return { status: "FAILED", error: `${res.status}: ${(await res.text()).slice(0, 300)}` };
    return { status: "SENT" };
  } catch (e) {
    return { status: "FAILED", error: e instanceof Error ? e.message : String(e) };
  }
}

/** Click-to-chat link, for staff who'd rather send from the shop's own WhatsApp. */
export function waMeLink(phone10: string, message: string): string {
  return `https://wa.me/91${phone10}?text=${encodeURIComponent(message)}`;
}
