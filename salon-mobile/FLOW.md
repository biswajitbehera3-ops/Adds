# How the app is used in a salon

Edit anything here. Each step has a number so you can say "change C1.4" or "remove C6".
**[Built]** = already in the app. **[Proposed]** = my suggestion, not built yet.

---

## A. Delivery day (one visit, about 1 hour)

| # | Who | What happens |
|---|---|---|
| A1 | You | Install the app on the salon's phone (one phone per salon). **[Built]** |
| A2 | You + owner | Fill in the salon's details: name, year established, services + prices, add-ons + which service they go with, stylists + chairs, wallet bonus tiers, referral reward, how many days until each service is "due back", the WhatsApp reminder message. **[Built — set in the config file by you; no in-app settings screen yet]** |
| A3 | You | Clear the demo customers so the salon starts empty. **[Built — Dashboard → Clear all data]** |
| A4 | You + owner | Set an owner PIN so staff can't open the Owner Dashboard. **[Proposed]** |
| A5 | You | If the salon has a register or Excel sheet of regulars, load them in so the app isn't empty on day one. **[Proposed]** |
| A6 | You | 10-minute training with counter staff: one regular customer, one new customer, one top-up, one reminder. |
| A7 | You | Leave a small printed card at the counter: "Give us your number — earn wallet bonus & referral rewards." **[Proposed]** |

---

## B. Opening the shop (every morning)

| # | What staff do | What the app shows |
|---|---|---|
| B1 | Open the app. | Launch animation plays once (salon name letter by letter, tiles pop in). **[Motion #9, #8]** |
| B2 | Glance at the home screen. | Today's takings ₹0, number of customers "due back", customer count. **[Built]** |
| B3 | Optional, before customers arrive: open **Reminders** and send 5–10 WhatsApp reminders. | See section D. |

---

## C. A customer arrives

**When to use the app:** at payment time, after the service. By then the staff know the service,
the add-ons and who did it. (Change this if you prefer logging when the customer walks in.)

### C1. Regular customer (most common — target under 15 seconds)
| # | Staff action | App response |
|---|---|---|
| C1.1 | Tap **Next customer** on the home screen. | The button grows into the Counter screen. **[Motion #12]** |
| C1.2 | Ask "Your mobile number?" and type 10 digits on the big keypad. | Keypad reacts instantly, no animation. **[Built]** |
| C1.3 | — | On the 10th digit the customer appears automatically: name, "Returning customer", number of visits, last service and when, wallet balance. **[Built · Motion R1]** |
| C1.4 | Tap the service (e.g. Haircut ₹300). | Matching add-ons are highlighted as "suggested". **[Built]** |
| C1.5 | Ask about the suggested add-on ("Head massage today?"); tap it if yes. | Total updates. **[Built]** |
| C1.6 | Check the stylist (remembered from the last customer); change if needed. | **[Built]** |
| C1.7 | Payment: if the wallet covers the bill, "Pay from wallet" is already on. Otherwise pick Cash / UPI / Card. | **[Built]** |
| C1.8 | Tap **Log visit · ₹450**. | Receipt prints top to bottom with a PAID stamp; wallet balance shown. **[Built · Motion R4]** |
| C1.9 | Tap **Next customer**. | Back to an empty keypad. |

### C2. First-time customer (about 30 seconds)
| # | Staff action | App response |
|---|---|---|
| C2.1 | Type the number as in C1.2. | "New customer — not on file yet." **[Built]** |
| C2.2 | Ask their name and type it. | |
| C2.3 | Ask: "Can we save your number for wallet offers and WhatsApp reminders?" Tick the consent box only if they say yes. | Without consent the customer can't be saved (DPDP law). **[Built]** |
| C2.4 | Tap **Add customer**. | Continues exactly like C1.4 onwards. |

### C3. New customer sent by a friend
| # | Staff action | App response |
|---|---|---|
| C3.1 | Same as C2, but ask "Did a friend give you a code?" and type it in the Referral code box. | Wrong codes are rejected. **[Built]** |
| C3.2 | Finish the visit as in C1. | On this **first paid visit**, ₹100 goes to the new customer and ₹100 to the friend, automatically. Receipt says so. **[Built]** |
| C3.3 | Tell the customer: "You and your friend just got ₹100 in your wallets." | |

### C4. Customer wants to add money to their wallet
| # | Staff action | App response |
|---|---|---|
| C4.1 | After the customer appears (C1.3), tap **Top up wallet**. | A sheet slides up. Swipe down to close. **[Built · Motion R8]** |
| C4.2 | Pick ₹500 / ₹1,000 / ₹2,000 / ₹5,000 or type an amount; pick Cash / UPI / Card. | Shows the bonus live: "Bonus ₹200 · new balance ₹2,200", and "Add ₹X more for 15% bonus". **[Built]** |
| C4.3 | Take the money, tap **Add ₹2,000**. | Balance updates; the visit can now be paid from the wallet. **[Built]** |

### C5. Customer pays partly from wallet, partly cash
| # | Staff action | App response |
|---|---|---|
| C5.1 | Leave "Pay from wallet" on. | The wallet pays what it can; the rest shows "₹150 by cash". **[Built]** |
| C5.2 | Pick how the rest is paid, then Log visit. | |

### C6. Customer won't give their number
| # | What happens |
|---|---|
| C6.1 | Today: the visit isn't recorded, so it's missing from the day's takings. |
| C6.2 | **[Proposed]** A "Walk-in, no number" button that records the service and money only, so the owner's totals stay complete. |

### C7. Staff made a mistake
| # | What happens |
|---|---|
| C7.1 | Wrong number typed before logging: tap **Clear** and retype. **[Built]** |
| C7.2 | Wrong service or amount after logging: **no undo today.** **[Proposed]** "Undo last visit" for 2 minutes, and an owner-only "void visit" that refunds any wallet money used. |

### C8. Customer asks "How much is in my wallet?"
| # | Staff action |
|---|---|
| C8.1 | Open **Customers**, search name or number, tap them. Profile shows balance, every visit and every wallet entry. **[Built · Motion #12, #7]** |

---

## D. Quiet time: bring customers back

| # | Staff action | App response |
|---|---|---|
| D1 | Open **Reminders**. | List of customers past their due date, per service (beard trim after 14 days, colour after 45, etc.), most overdue first. **[Built]** |
| D2 | Tap a customer. | The message appears, ready to edit. **[Built]** |
| D3 | Tap **Send on WhatsApp**. | WhatsApp opens with the message written; staff press send. Customer moves to the "Reminded" tab. **[Built · Motion R3]** |

---

## E. Closing the shop (every evening, owner)

| # | Owner action | App shows |
|---|---|---|
| E1 | Unlock the Owner Dashboard with the PIN. | **[PIN proposed]** |
| E2 | Check today's takings. | Total, split into cash / UPI / card / wallet. Count the cash drawer against the cash figure. **[Built]** |
| E3 | Check stylists. | Revenue and visits per stylist: today / 7 days / 30 days. **[Built · Motion R5]** |
| E4 | Back up the day's data. | Barber-pole progress bar while it saves. **[Proposed · Motion 08]** |

---

## F. Weekly / monthly (owner)

| # | What the owner looks at |
|---|---|
| F1 | Top 20 customers by lifetime spend — thank them, give them offers. **[Built]** |
| F2 | Wallet money held — money already paid for future visits. **[Built]** |
| F3 | How many reminded customers came back. **[Proposed]** |
| F4 | How many new customers came through referrals. **[Proposed]** |

---

## G. Open decisions for you
1. Log the visit at **payment** (as above) or when the customer **walks in**?
2. Should staff each log in with their own name, or share one phone as now?
3. Add "Walk-in, no number" (C6.2)?
4. Add "Undo last visit" + owner "void visit" (C7.2)?
5. Owner PIN on the Dashboard (A4)?
6. Daily backup (E4) — to Google Drive, or to your own server?
7. Should customers also get a WhatsApp message after each visit ("Thanks! Wallet balance ₹1,400")?
