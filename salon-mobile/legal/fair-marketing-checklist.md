# Fair Marketing, Pricing and Dark-Pattern Checklist

Follows the Consumer Protection Act 2019, the CCPA Guidelines on Dark Patterns 2023 and on Misleading Advertisements 2022, the BIS standard IS 19000:2022 on online consumer reviews, and the DPDP Act.

## Dark patterns: audit of the app
| Pattern (CCPA list) | In our app? | Notes |
|---|---|---|
| Pre-ticked consent / trick question | **No** | All consent boxes start unticked. Messages consent is separate and optional, and the wording is plain |
| Forced action (must accept marketing to get service) | **No** | Service works without the messages opt-in; the receipt is sent without offers |
| Confirm-shaming ("No, I don't like discounts") | **No** | Neutral wording |
| Subscription trap / hard to cancel | **No** | Salons cancel by message; customers stop messages with one tap or STOP |
| Drip pricing / hidden fees | **No** | All app fees are in the Terms table with GST shown; customer bills show every service and add-on with its price |
| Basket sneaking | **No** | Suggested add-ons are shown but never added unless staff tap them |
| False urgency / scarcity | **No** | No countdowns or "only 2 left" |
| Nagging | **No** | No repeated prompts |
| Disguised ads / bait and switch | **No** | |
| Interface interference | **No** | Delete is a clear two-tap action, not hidden; Accept and Reject look identical in the cookie banner |

## Prices
- Show salon prices **including GST** if the salon is registered, or state "+ GST" next to every price. Set this per salon in config.
- The top-up bonus is shown as an exact rupee amount before paying ("Bonus ₹200 · new balance ₹2,200").
- The non-refundable status of bonus and referral credit is stated in the Refund Policy and on the Privacy & terms screen.

## Reviews and testimonials
- **Never** invent reviews, ratings, customer counts or before/after results, in the app, the pitch deck, ads or the launch video (PRODUCT.md already forbids this).
- Use a real salon owner's quote only with their written permission, their real name, and no payment. If any benefit was given, say so ("received a free month").
- Demo data is fictional and labelled as demo.

## Claims when pitching the app
| Don't say | Say instead |
|---|---|
| "Guaranteed 30% more customers" | "Sends reminders to customers who are due back, so fewer are forgotten" |
| "100% secure" / "hack-proof" | "Private logins for each person; with online backup on, encrypted and stored in India" |
| "Fully DPDP certified" (no such certificate exists) | "Built to follow the DPDP Act: consent, opt-out, deletion, retention" |
| "Face-recognition attendance" | "Selfie attendance with the time" |
Every number in an ad or the launch video must come from real data we can show.

## Data minimisation
- Customers: name and mobile only (plus visits and wallet). No email, birthday, address, photo or ID.
- Staff: name, mobile, chair, hashed password, check-in time, selfie (auto-deleted after 12 months).
- If anyone asks to add a field, write down why it is needed before adding it.

## Messages and emails
- WhatsApp: opt-in only; each marketing message ends "Reply STOP to stop these messages."; STOP is honoured the same day (Profile → Privacy).
- The app sends **no emails**. If emails are ever added, every marketing email needs a working one-click unsubscribe link and the salon's address in the footer.
- Messages are sent from the salon's own WhatsApp, which must follow WhatsApp's Business and Commerce policies (opt-in required).
