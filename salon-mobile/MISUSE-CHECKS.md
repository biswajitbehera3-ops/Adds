# Misuse and mistakes: what the app stops, and what still needs building

Asked by the user, 21 Oct: where a staff member or customer could do something wrong, or the app meets something it doesn't know, and how to prevent it.
Status: **Blocked** = the app already refuses it (rule in `src/domain/engine.ts`, tested) · **Gap** = possible today · **Proposed** = the fix, waiting for the user's go-ahead.

## Built (21 Oct, user: "build all")

| # | Check | How it works in the app |
|---|---|---|
| 1 | Double payment | Unchanged: a bill is paid once; one open visit per customer; wallet use within the balance and the bill. |
| 2, 3, 8 | Itemised receipt | The thank-you WhatsApp lists each service and its price, the wallet amount used and the new balance (`billLines`, `receiptMessage`). |
| 2 | Unusual bills | Owner's **Today's checks** (Live tab) flags a stylist whose average bill today is 1.6× their usual over 30 days (at least 2 bills today, 5 before). |
| 3 | Cash count | Today's checks shows the cash the drawer should hold (cash bills + cash top-ups). **Count the cash**: the owner types the count; a difference needs a note and shows in the checks. |
| 4 | Left without service | Kept as a LEFT record (who recorded it, when, minutes in the chair), never deleted; shown in Today's checks. |
| 5 | Staff undo | Undo asks why (Wrong customer / Wrong service / Entered twice / Wrong payment type / Other); the stylist and reason are saved; shown in Today's checks and on the bill. |
| 6 | Customer never entered | Bookings still "Booked" 30 minutes after their time show in Today's checks ("not closed"). The Live floor shows who is seated. |
| 7 | Referral farming | The friend's code is checked as typed, then a 4-digit code is sent to the new customer's WhatsApp and read back before saving. The referring customer earns at most 5 rewards a month (owner sets it in **Check limits**); the new customer still gets theirs. Five or more referred customers added by one stylist in 30 days shows in Today's checks. |
| 8 | Wallet spent without the customer | Paying more than ₹500 (owner sets it) from a wallet needs the WhatsApp code from the customer. Staff can't top up. |
| 9 | Clock set back | A check-in is refused when the phone's clock is earlier than the newest record already saved ("Set the date and time to automatic"). |
| 10 | Service not in the list | **Not in the list?** on the bill: name + price; payment waits until the owner approves by typing the owner password on that phone. The owner edits services, add-ons and prices in **Services & prices** (switch one off to stop offering it; old bills keep it). |
| extra | Phone lost | Owner menu → **Back up data** makes one file of the whole salon (share it to WhatsApp, Drive or email); **Restore from a backup** reads it back after a check that it really is a salon backup. |
| extra | Customer list leaving with a stylist | Staff see only the last 4 digits of a customer's number on the profile, referral and code screens; Call and WhatsApp still work. |

**Limits, said plainly:**
- The WhatsApp codes are sent from the salon phone, so the person sending can see the code. They stop mistakes and a customer who isn't present, not a staff member set on cheating. A code nobody at the salon can see needs messages sent by a server (WhatsApp Business API, paid per message), which comes with the online sync.
- The clock check only catches a clock set earlier than records already on the phone; exact time needs the server's clock (online sync).
- When WhatsApp opens for Call/WhatsApp, the full number is visible there. Masking stops casual copying from the app, not a determined person.

## The original list (21 Oct)

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
