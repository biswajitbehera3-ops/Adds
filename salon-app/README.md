# Salon app

Loyalty & CRM counter app for a single salon: Counter, Customers, Reminders, Refer & Earn, Owner Dashboard.
Each salon runs its own copy — customise it in `salon.config.ts`.

```bash
npm install
cp .env.example .env          # leave WhatsApp vars empty for demo mode
npx prisma db push            # creates prisma/salon.db
npm run db:seed               # optional demo data (wipes the database)
npm run dev
npm test                      # business-rule + flow tests on a throwaway test.db
```

Project brief and rules for contributors (and Claude): [`CLAUDE.md`](./CLAUDE.md).
