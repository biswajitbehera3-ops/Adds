# Misuse and mistakes: what the app stops, and what still needs building

Asked by the user, 21 Oct: where a staff member or customer could do something wrong, or the app meets something it doesn't know, and how to prevent it.
Status: **Blocked** = the app already refuses it (rule in `src/domain/engine.ts`, tested) · **Gap** = possible today · **Proposed** = the fix, waiting for the user's go-ahead.

| # | What could go wrong | Today | How to prevent it |
|---|---|---|---|
| 1 | **Double payment** for one customer (double tap, or paying the same bill twice) | **Blocked.** A bill can be paid only once; a customer can have only one visit open at a time; wallet use can't exceed the balance or the bill. | With online sync, the server must enforce the same rule so two phones can't both pay one bill. |
| 2 | **Fake extra service** added to a bill (charged but not done) | **Gap.** Prices are fixed (staff can't type a price), but nothing proves the service was done. | Thank-you WhatsApp lists each service and its price, so the customer sees it; owner sees every bill; flag a stylist whose average bill jumps well above their usual. |
| 3 | **Cheaper service recorded, cash pocketed** (customer pays for colour, bill says haircut) | **Gap.** | Same itemised receipt to the customer; end-of-day cash check: owner counts the drawer against the app's "cash today". |
| 4 | **"Left without service" deletes the visit** after the customer was actually served, and the cash is kept | **Gap.** The open visit is removed with no record. | Keep it as a "Left without service" record (who, when, how long in the chair); owner sees the count per stylist; Live floor already shows the customer seated. |
| 5 | **Undo within 2 minutes** after taking cash | **Partly blocked.** Undo only works for 2 minutes and the bill stays as cancelled, but no reason or name is saved. | Undo asks for a reason and records the stylist; owner's day view lists staff undos; alert if one stylist undoes often. |
| 6 | **Customer never entered**, cash pocketed | **Gap.** The app can't see a customer nobody types in. | Give customers a reason to give their number (wallet, referral reward, reminders); compare bookings marked Arrived with visits; owner spot-checks the Live floor. |
| 7 | **Fake customers to farm referral rewards** (staff adds friends' numbers with a code) | **Partly blocked.** New numbers only, no self-referral, reward only after a paid first visit, reversed if that bill is cancelled. | One-time code sent to the new customer's WhatsApp to confirm the number is theirs; limit rewards per referrer per month; owner report of referrals by which stylist added them. |
| 8 | **Customer's wallet spent without them** (used for someone else's service) | **Partly blocked.** Staff can't top up; wallet use is limited to the balance and the bill. | Wallet spends show on the customer's WhatsApp receipt with the new balance; for spends above an amount the owner sets, a one-time code from the customer. |
| 9 | **Attendance tricks**: phone clock moved back to look on time, a photo of a photo, or a friend logging in | **Gap.** Check-in time comes from the phone's clock. | Use the server's time once sync is in; refuse a check-in if the phone's clock is behind the last saved record; owner sees every selfie; each stylist logs in on their own phone with their own password. |
| 10 | **Something the app doesn't know**: a new service or price not in the list, so staff pick the nearest one | **Gap.** Services and prices are set in the config file; there's no settings screen. | Owner can add and edit services and prices in the app; an "Other" service needs the owner's approval before payment. |

Two more to keep in mind:
- **Phone lost or reset**: each phone keeps its own data today, so it would be lost. Fix: online sync and backup (BUILD-SPEC 3.4).
- **A stylist leaving with the customer list**: staff see every customer's number (decided, 4.17). Option: show staff only the last 4 digits, with Call and WhatsApp buttons that work without showing the full number, and no export for staff.
