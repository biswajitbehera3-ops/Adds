import config from "@config";
import { db } from "./db";
import { UserError } from "./errors";
import { daysBetween, dueDate, renderReminder } from "./rules";
import { isDemoMode, sendWhatsApp, waMeLink } from "./whatsapp";

/**
 * Customers overdue for a repeat visit, computed per service: each service a
 * customer has had is tracked against its own cycle from config.
 */
export async function overdueReminders(now = new Date()) {
  const lastByService = await db.visit.groupBy({
    by: ["customerId", "serviceId"],
    _max: { createdAt: true },
  });

  const overdue = lastByService
    .map((row) => {
      const lastVisit = row._max.createdAt!;
      const due = dueDate(row.serviceId, lastVisit);
      return due && due <= now ? { ...row, lastVisit, dueAt: due } : null;
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);
  if (overdue.length === 0) return [];

  const customerIds = [...new Set(overdue.map((o) => o.customerId))];
  const [customers, logs] = await Promise.all([
    // Only customers who consented to reminders.
    db.customer.findMany({ where: { id: { in: customerIds }, consentAt: { not: null } } }),
    db.reminderLog.findMany({
      where: { customerId: { in: customerIds }, status: { in: ["SENT", "SIMULATED"] } },
      orderBy: { createdAt: "desc" },
    }),
  ]);
  const byId = new Map(customers.map((c) => [c.id, c]));

  return overdue
    .flatMap((o) => {
      const customer = byId.get(o.customerId);
      const service = config.services.find((s) => s.id === o.serviceId);
      if (!customer || !service) return [];
      const lastReminder = logs.find(
        (l) => l.customerId === o.customerId && l.serviceId === o.serviceId && l.createdAt > o.lastVisit,
      );
      return [
        {
          customerId: customer.id,
          name: customer.name,
          phone: customer.phone,
          serviceId: service.id,
          serviceName: service.name,
          lastVisit: o.lastVisit,
          dueAt: o.dueAt,
          daysOverdue: daysBetween(o.dueAt, now),
          remindedAt: lastReminder?.createdAt ?? null,
          message: renderReminder(config.reminderTemplate, { name: customer.name, service: service.name }),
        },
      ];
    })
    .sort((a, b) => b.daysOverdue - a.daysOverdue);
}

export async function sendReminder(input: { customerId: string; serviceId: string; message: string }) {
  const message = input.message.trim();
  if (!message) throw new UserError("Message can't be empty");
  if (message.length > 1000) throw new UserError("Message is too long");
  if (!config.services.some((s) => s.id === input.serviceId)) throw new UserError("Unknown service");

  const customer = await db.customer.findUnique({ where: { id: input.customerId } });
  if (!customer) throw new UserError("Customer not found", 404);
  if (!customer.consentAt) throw new UserError("This customer hasn't agreed to receive reminders", 403);

  const result = await sendWhatsApp(customer.phone, message);
  const log = await db.reminderLog.create({
    data: {
      customerId: customer.id,
      serviceId: input.serviceId,
      message,
      status: result.status,
      error: result.error,
    },
  });
  return { ...result, demoMode: isDemoMode(), logId: log.id, waMeLink: waMeLink(customer.phone, message) };
}
