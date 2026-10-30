# Salon day test: 20 customers, 4 stylists, 1 owner (25 Oct)

**What this was.** The real app (today's build, the single-file web version) was driven through one full Saturday, 31 Oct 2026, 9:15 AM to 7:45 PM. A script did every tap and keystroke a person would make, on one phone, with the phone's clock moved through the day. The 4 stylists and the owner each logged in and out to take their turn, as in the one-phone demo. Each customer had a written "what really happened" so the app's records could be checked against the truth at the end.

**Every number below comes from that run.** The app's own data at closing, the WhatsApp messages it opened, 45 screenshots and the full task log are in `design-studies/salon-day/`.

## The answer in short

**The app worked for the normal day.** All 14 paid customers were billed, the booking, the no-show, the referral, the wallet with its WhatsApp code, the undo and the "left without a service" all worked, and there were no crashes or errors in the app. At closing the cash count told the owner the drawer was **₹1,550 over**.

**What it could not handle:**
- a customer with no mobile number;
- a wallet top-up while the owner was away;
- a service not on the list while the owner was away;
- a customer who was never entered;
- a payment tapped as UPI when it was really cash.

**In money:** customers really paid **₹10,650 for services**. The app recorded **₹9,100**. Of the ₹1,550 that never reached the app:
- **₹1,250 was in the drawer**, and the cash count caught it as "over";
- **₹300 went into a stylist's pocket**, and nothing in the app can show that.

## The cast

| Who | Login | What they did on the day |
|---|---|---|
| Owner (Sasmita) | owner password | Set up the salon at 9:15, came in at 1:10 PM, closed at 7:45 PM |
| Bikash Nayak, Chair 1 | 98610 00001 | Fast and careful |
| Lipsa Mohanty, Chair 2 | 98610 00002 | Slow typist |
| Manas Sahoo, Chair 3 | 98610 00003 | Skips entries in the rush |
| Rashmita Das, Chair 4 | 98610 00004 | New joiner, came 25 minutes late |

Prices from the app's list: Haircut ₹300, Beard trim ₹150, Hair spa ₹1,000, Facial ₹900, Hair colour ₹1,200.

## What happened, customer by customer

| # | Time | Customer | Stylist | What really happened | What the app recorded | Result |
|---|---|---|---|---|---|---|
| C01 | 10:05 | Amit Panda | Bikash | Haircut, ₹300 cash | ₹300 cash | ✅ |
| C02 | 10:15 | Sneha Rath | Lipsa | Facial, ₹900 UPI | ₹900 UPI | ✅ |
| C03 | 10:20 → 11:00 | Dev Mohanty | Bikash | Phoned to book hair colour at 11:00, came, ₹1,200 cash | Booking → "Arrived · start visit" → ₹1,200 cash | ✅ |
| C04 | 10:40 | Ritu Patnaik | Rashmita | Refused to give a mobile number; haircut, ₹300 cash into the drawer | **Nothing.** The app needs a valid mobile number; "0000000000" is refused ("That isn't a valid Indian mobile number") and there is no other way | ❌ app can't |
| C05 | 11:05 | Ankit Mishra | Manas | Haircut + beard, ₹450 cash | ₹450 cash | ✅ |
| C06 | 11:30 | Pooja Jena | Lipsa | Wanted to put ₹2,000 in her wallet | Stylists have no top-up button; she was told to come back when the owner is in | ⚠️ by design, lost sale |
| C07 | 11:45 → 13:00 | Kiran Behera | Bikash | Booked a 12:30 haircut by phone, never came | Booking marked No-show | ✅ |
| C08 | 12:00 | Suresh Swain | Rashmita | Billed beard trim by mistake (₹150), undid it at once, billed haircut ₹300 cash | ₹150 bill undone with reason "Wrong service", new ₹300 cash bill; owner sees "Rashmita undid a ₹150 bill" | ✅ |
| C09 | 12:35 | Neha Sahu | Lipsa | Came with Amit's referral, haircut ₹300 UPI | Referral confirmed by WhatsApp code; ₹100 to each; ₹300 UPI | ✅ |
| C06 | 13:10 | Pooja Jena | owner | Came back; paid ₹2,000 cash into her wallet | ₹2,000 cash top-up + ₹200 bonus = ₹2,200 | ✅ (no receipt sent, see finding 6) |
| C10 | 13:30 | Pooja Jena | Bikash | Hair spa ₹1,000 from her wallet | Wallet code sent on WhatsApp, read out, ₹1,000 from wallet; ₹1,200 left | ✅ |
| C11 | 14:00 | Rahul Dash | Lipsa | Hair colour ₹1,200 UPI + keratin touch-up ₹800 (not on the list) | Keratin added via "Not in the list?" → Collect locked "Waiting for owner's approval"; owner away; Lipsa removed it, billed ₹1,200 UPI and took the ₹800 cash off the books | ⚠️ ₹800 off the books |
| C12 | 15:35 | Priya Nanda | Manas | Sat 15 minutes, left without a service | "Customer left without a service"; shows in owner's checks | ✅ |
| C13 | 15:55 | Soumya Kar | Manas | Haircut ₹300 cash | ₹300 cash | ✅ |
| C14 | 16:00 | Anjali Pati | Rashmita | Facial ₹900 card | ₹900 card | ✅ |
| C15 | 17:05 | Rohit Sethi | Bikash | Haircut + beard ₹450 cash; Bikash double-tapped Collect | One bill only (right), but the thank-you WhatsApp opened twice | ⚠️ see finding 7 |
| C16 | 17:05 | Vivek Rout | Manas | Haircut in the rush, never entered, **Manas kept the ₹300** | Nothing, and no check can see it | ❌ invisible |
| C17 | 17:20 | Mamata Swain | Lipsa | Hair colour ₹1,200 UPI | ₹1,200 UPI | ✅ |
| C18 | 17:30 | Tapan Jena | Rashmita | Haircut, **paid ₹300 cash**, Rashmita tapped UPI | ₹300 UPI | ❌ wrong method, not caught |
| C19 | 17:40 | Sanjay Pradhan | Manas | Beard trim, forgot to enter, ₹150 cash into the drawer | Nothing | ⚠️ only seen as "cash over" |
| C20 | 18:05 | Arjun Behera | Bikash | Haircut ₹300 cash | ₹300 cash | ✅ |

## The money at closing

| | Really | In the app | Caught? |
|---|---|---|---|
| Services paid | ₹10,650 | ₹9,100 (14 bills) | Revenue ₹1,550 short |
| Cash in the drawer | ₹6,850 | Expected ₹5,300 (8 cash bills ₹3,300 + cash top-up ₹2,000) | **Yes: "Cash over by ₹1,550"** |
| UPI received | ₹3,600 | ₹3,900 | **No.** The app never asks the owner to match UPI with the bank app |
| Cash pocketed (C16) | ₹300 | — | **No** |

**Where the ₹1,550 "over" came from:**
- C04: the customer with no number, ₹300;
- C11: the off-list keratin, ₹800;
- C19: the forgotten beard trim, ₹150;
- C18: the cash tapped as UPI, ₹300.

The count tells the owner something is wrong, but not which customer or which stylist.

**What each person saw at closing:**
- **The stylists' Home:** Bikash ₹3,250 (₹1,000 of it from a wallet), Lipsa ₹3,600, Rashmita ₹1,500, Manas ₹750. The real figures were Lipsa ₹4,400 (with the keratin) and Manas ₹1,200.
- **The owner's Live screen:** ₹9,100 today, 14 paid, and these checks:
  - "Rashmita undid a ₹150 bill · Wrong service";
  - "Priya Nanda left without service · sat 15 min";
  - "Cash over by ₹1,550";
  - Rashmita marked "came in late".
- **The owner's Staff tab:** check-in times 9:45, 9:52, 9:58 and "Late 10:25".

## Time on the phone

The times below are worked out from the taps and typing in each task: 1.5 seconds a tap, 0.5 seconds a typed character, 4 seconds to read a screen, 6 seconds for each WhatsApp hand-off. They are estimates, not stopwatch times.

| Job | How many | Time each | Total |
|---|---|---|---|
| Owner first setup (clear demo, password, 4 stylists) | 6 | ~23 s (a stylist ~28 s) | 2.3 min |
| New walk-in, door to "in the chair" | 15 | ~30 s, 16 taps (referral 50 s; a returning customer 20 s) | 7.4 min |
| Collect payment | 14 | ~19 s (wallet with code 31 s) | 4.4 min |
| Booking by phone | 2 | ~29 s | 1.1 min |
| **Logging in and out to share the one phone** | **80** | ~12 s | **15.5 min** |
| Everything | 133 tasks, 700 taps | | **34 min** |

**Logging in and out was 45% of all phone time.** That cost comes from the one-phone demo. With a phone for each stylist (the live-sync plan), it disappears. The walk-in at ~30 seconds is inside the board's "one-minute entry" condition.

## Findings: what the app misses or can't handle

Most serious first. "Already planned" means it is on the build-later list.

1. **No bill without a mobile number (C04).** The customer was served and paid, and the app recorded nothing. In real salons this is common: older customers, quick beard trims, people who won't share a number. *Already planned* (buyer-panel feedback: "bill without mobile number"). This test shows it is needed in version 1: the alternative is cash off the books.
2. **A customer who is never entered is invisible (C16).** The ₹300 left no trace, and no screen, check or count could find it.
   - No app can fully stop this, so the owner needs other signals:
     - a gap check: a stylist checked in but with no customer for a long stretch on a busy day;
     - a daily "customers today" count on each stylist's own Home that the owner can compare with what they saw;
     - customers learning to expect the WhatsApp bill.
   - *Partly planned* ("missed-entry check", board round 2).
3. **UPI is never checked (C18).** The app checks cash against a count, but it doesn't ask the owner to compare UPI with the bank or UPI app. Had it asked, C18 would have shown up as UPI ₹300 short next to cash ₹300 over: the same stylist, at the same time. *New.*
4. **The owner's approval needs the owner holding this phone (C11).** "Not in the list?" correctly locks Collect, but the only way to unlock it is "Owner approves here", on this phone, with the owner's password. With the owner away, the customer couldn't wait, so the extra went off the books. Fix:
   - send the approval to the owner's own phone (needs live sync);
   - or let staff collect with the extra marked "needs owner check", up to a limit the owner sets.

   *New.*
5. **Stylists can't top up a wallet (C06).** This is by design, to stop misuse, but here it meant a customer with ₹2,000 in hand was sent away. A fix: let staff do the top-up, send the customer a WhatsApp receipt, and show it in the owner's checks. Or make it a setting the owner can switch on. *New.*
6. **A wallet top-up sends no receipt, and the sheet opens on UPI.** The owner's ₹2,000 cash top-up showed only "Added ₹2,000 + ₹200 bonus" on screen. There was no WhatsApp proof for the customer. Also, the sheet opens with UPI already picked, so an owner who doesn't notice would record cash as UPI and the cash count would be ₹2,000 out. Fix: no method picked until one is tapped, and a "Send receipt on WhatsApp" button after a top-up. *New.*
7. **A double tap on Collect opens the thank-you WhatsApp (C15).** The bill was saved once, which is right. But "Send thank-you on WhatsApp" appears exactly where Collect was, so the second tap opened WhatsApp by itself. Fix: ignore taps for half a second after Collect, or move the thank-you button lower. *New.*
8. **Every message says "Salon", never the salon's name.** Every message read "Thanks for visiting Salon…" and "your hair colour at Salon", and the owner's screen says "SALON · OWNER". The first setup never asks for the salon's name. Fix: ask for it in setup, along with the WhatsApp number shown to customers. *New.*
9. **"Reply C to cancel" in the booking WhatsApp.** The reply arrives in the salon's WhatsApp, and the app never sees it. A customer who cancels this way still shows as booked until a stylist marks it. Fix the wording: "To change or cancel, call or WhatsApp us." *New.*
10. **A wrong bill can be undone only in the first 2 minutes, from the receipt (C08).** After that the customer page says "Wrong bill? Ask the owner". This worked as designed. It is noted here so the stylists are taught it on setup day.
11. **Sharing one phone costs 15 minutes a day (80 logins and logouts).** For the one-phone demo this is fine. For a real salon on one shared phone, add a quick switch: tap your name, then a 4-digit PIN. *Covered by the live-sync plan.*
12. **Small things:**
    - The no-show customer (Kiran) shows in the owner's customer list as an ordinary "New · No visits yet", with no no-show mark.
    - The owner's live picture shows only 3 chairs for a 4-chair salon; the list below has all 4.

## What worked well

- **Setup took about 2½ minutes:** clear demo data, set a password, add 4 stylists.
- **Check-in:** first log-in of the day with a selfie, about 22 seconds. Lateness was marked by itself, against each stylist's 10:00 shift.
- **Booking:** booking → "Arrived · start visit" → bill. The booking message went out with the right time and stylist.
- **No-show** took one tap from the booking.
- **Referral:** a WhatsApp code to the new customer, then ₹100 to each person, both shown on the receipt.
- **Wallet:** the app switched "Pay from wallet" on by itself when the balance covered the bill. Above the limit it asked for a WhatsApp code read out by the customer. The thank-you message showed "₹1,000 from your wallet".
- **Undo and "left without a service"** both asked for a reason and named the stylist on the owner's checks.
- **Double tap** did not create two bills.
- **The cash count** caught the over by itself, showed the exact amount, and kept the owner's note.
- **Backup** offered a file named `salon-backup-2026-10-31.json`. Staff passwords are stored scrambled (hashed), not as plain text.
- **No errors or crashes** in 133 tasks.

## How honest is this test

- **People.** The stylists and customers were played by a script, not real people. Taps and typing are real, but the times are estimates, and real people are slower when the salon is busy and noisy.
- **One phone, web build.** Everyone shared one phone, as in the planned demo. The app ran as the web build in a browser at phone size, not the Android APK. Selfies used a stand-in picture. WhatsApp links were captured, not sent.
- **Script mistakes fixed before this run.** Several first attempts failed because of mistakes in the test script, not the app. Each one was fixed and the whole day was run again from the start:
  - the script didn't go back Home before logging out;
  - it tapped booking cards by first name;
  - it checked a visit before the screen had opened;
  - it moved the clock backwards;
  - it turned off a wallet switch the app had already turned on;
  - it didn't pick Cash on the top-up;
  - it read the locked Collect button wrongly.

  The run reported here is the clean one. The only failure in it is the app's own (C04).

## Files

`design-studies/salon-day/` holds:

| File | What it is |
|---|---|
| `run.log` | Every task with its time, taps and characters |
| `run.json` | Tasks, the "what really happened" notes, the 19 WhatsApp messages with their full text, notes, errors (none) |
| `screens.txt` | The text of all 45 screenshots |
| `shots/` | The screenshots |
| `app-data-end-of-day.json` | The app's whole data at closing |
| `customers-truth.json` | What really happened to each customer |
| `harness.mjs`, `day.mjs` | The test script, to run the day again on a new build |
