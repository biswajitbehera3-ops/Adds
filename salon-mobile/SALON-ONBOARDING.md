# New salon: what to collect, and what stays fixed

The app as built (20 Oct) is the **frame**. When a salon signs up, we fill it with their data and make their live app.
The **look and designs may change later**; the **kinds of data below stay the same**, so a redesign never loses or reshapes a salon's records.

## 1. What stays fixed (the data every salon's app keeps)

These are the records in `src/domain/types.ts`, handled only by `src/domain/engine.ts` (with tests in `tests/`). Screens only show them, so a new look is a change to `src/screens/` and `src/components/`, not to these.

| Record | What it holds |
|---|---|
| Customer | name, mobile, consent (data + WhatsApp), referral code, who referred them, wallet balance |
| Visit / bill | customer, stylist, services + add-ons, total, wallet used, paid direct, payment type (cash / UPI / card), times in and paid, cancelled with reason |
| Wallet | every top-up, bonus, spend, referral reward, refund, cash-out |
| Stylist | name, mobile (login), password, chair, photo, shift start, weekly off, active or not |
| Attendance | one check-in a day per stylist, time, selfie |
| Leave | dates, type, half day, note, waiting / approved / declined, owner's reason, what happened to bookings |
| Booking | customer, services, stylist, day and time, booked / arrived / no-show / cancelled, reminder sent |
| Reminders | the 3-step ladder per customer: message 1, message 2, call, who did each |
| Privacy log | consents, data sent to the customer, deletions |

## 2. What each salon gives us (fill before go-live)

**Salon** → `src/config/salon-details.json`
- [ ] Salon name (shown in the app and on WhatsApp)
- [ ] Logo (for the login, intro and app icon) and the right to use it
- [ ] Legal name, full address, city, GSTIN if any
- [ ] Salon phone and email
- [ ] Owner (grievance contact): name, phone, email
- [ ] Go-live date

**How the salon works** → `src/config/salon.ts`
- [ ] Services: name, price, minutes it takes, how many days until the customer is due again
- [ ] Add-ons: name, price, which services to suggest them with
- [ ] Opening and closing time, booking slot size (e.g. 30 min)
- [ ] Closed day(s) of the week
- [ ] Shift start and the late grace (e.g. 10:00, 15 min)
- [ ] Wallet top-up bonus tiers (e.g. ₹1,000 → 5%, ₹2,000 → 10%, ₹5,000 → 15%)
- [ ] Referral rewards: for the customer who refers, for the new customer
- [ ] Reminder ladder days (now: message 2 after 30 days, call 30 days after that)
- [ ] Time the on-the-day booking reminders go out (now 9:00)
- [ ] WhatsApp wording, if they want their own: thank-you, due-back reminder, booking confirmation, on-the-day reminder

**People** (the owner enters these in the app, Staff tab → +)
- [ ] Owner password (set on first launch)
- [ ] Each stylist: photo, name, mobile (their login), chair, shift start, weekly off, first password

**Existing customers** (only if the salon has a list to bring over)
- [ ] Name, mobile, and whether they agreed to WhatsApp messages; any wallet balance they already hold
- [ ] Never import a number without the customer's consent for messages (DPDP)

## 3. Making their live app

1. Fill the two config files above; any `[bracket]` placeholder blocks a release.
2. Clear the demo data (owner menu → Clear all data) so the salon starts empty.
3. Online sync for live across phones (BUILD-SPEC 3.4, provider still to choose in 10.7).
4. Build the APK (BUILD-SPEC 3.6) with the salon's name and logo icon (9.7).
5. Legal pack: `npm run legal` reads the same details file.
