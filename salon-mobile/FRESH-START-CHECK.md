# Fresh start check: demo data cleared, a new salon starts (21 Oct)

What was done, in the web build: owner menu → Clear all data → set the owner password → looked at every owner tab empty → Services & prices → added stylist Ravi Sharma (no photo) → Ravi logged in, took the check-in selfie → every staff tab empty → first walk-in customer Anil Kumar, Haircut ₹300, paid cash → owner tabs again. No crashes and no page errors. Screens: 25 screenshots in the session scratchpad.

| # | Where | What goes wrong | What we can do |
|---|---|---|---|
| 1 | Whole app | **Each phone keeps its own data.** In a real salon the owner's phone and each stylist's phone are separate, so after clearing the demo the owner's Live floor, Earnings, Staff and Customers stay empty whatever the stylists do (in this test they filled only because both logins were in one browser). | Online sync (BUILD-SPEC 3.4; provider still to choose in 10.7). Until then, one shared salon phone at the counter. This is the biggest gap for a real launch. |
| 2 | First launch | Setup asks only for the owner password. The salon's name stays "Salon" (header "SALON · OWNER", WhatsApp messages, receipts); nothing asks for address, opening hours, closed day or shift time. | A short first-run setup: salon name and phone → hours, weekly off, shift start → check prices → add stylists. |
| 3 | Services & prices | After clearing, the sample price list (Haircut ₹300, Facial ₹900…) is still there, unconfirmed. Staff can bill at sample prices from day one. | Make "Check your prices" a setup step; mark the list "sample" until the owner saves it once. |
| 4 | Owner · Live · Today's checks | Shows "Cash in the drawer should be ₹0 · Count the cash" before anything is sold. | Hide the cash row until the first cash bill; show "No sales yet today". |
| 5 | Owner · Earnings | Empty salon shows ₹0 cards with flat lines, a zero chart and "Last Wed by 9:30 AM: ₹0" (there was no last Wednesday). | An empty state ("Your first bill shows here") until there are bills; hide comparisons that have no history. |
| 6 | Customers (owner and staff) | Empty list says "No customers here yet · Try another filter" and still shows the filters and sort. | "No customers yet. They're added when a stylist types a walk-in's mobile number." Hide filters and sort until there is at least one customer. |
| 7 | Staff · My profile | With no photo, the photo box is a blank gold square (no initials). The owner's Staff card shows "RS" correctly. | Show the initials, as on the Staff card. |
| 8 | Staff · My profile | "With the salon: 0 days" on the joining day; "1 days present this month". | "Joined today"; "1 day present". |
| 9 | Customers header | "1 CUSTOMERS · 1 NEW". | Singular/plural: "1 customer". |
| 10 | Staff · Home | "Your bookings today · 0 · All reminders sent" when there are no bookings. | "No bookings today". |
| 11 | Staff · Calendar | Today card says "Nothing left today" and "Your day is 0% booked" when nothing was ever booked. | "No bookings today · Tap + Book". |
| 12 | Receipt | "Wallet now ₹0" for a customer who has never had a wallet. | Hide the wallet line when the balance is ₹0 and there is no wallet history. |
| 13 | Owner menu | "Load demo data" and "Clear all data" stay in the menu once the salon is live, behind one confirm tap. One mistaken tap wipes real data. | Once real data exists: hide Load demo data; Clear all data asks for the owner password and offers a backup first. |
| 14 | Owner · Live | With one stylist the clay salon still shows three chairs; only chair 1 has a label. Correct, but a 1–2 chair salon may find it odd. | Later: plates for 1–2, 3 and 4–6 chairs (needs new Higgsfield art, quote first). |
| 15 | Add a stylist | Chair is pre-filled "Chair 1" and the weekly off pre-set to Tuesday, so a second stylist can quietly get the same chair. | Suggest the next free chair; warn if a chair is already taken. |

Working well on a fresh start: the clear confirmation wording, the "No stylists yet" empty states on Live and Staff, adding a stylist (toast tells the owner the login number), the check-in selfie, the first walk-in from number to receipt, the PAID stamp, and the owner's tabs updating once data exists.
