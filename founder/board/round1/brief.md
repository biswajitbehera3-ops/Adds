# Board brief: the salon app

# Salon app (working name; no business name chosen yet)

- What it is: a branded Android app made for one salon at a time (its name, logo and prices), used by the owner and each stylist on their own phones: billing, walk-ins, prepaid wallet, WhatsApp bills and reminders, referrals, staff attendance, and an owner view of the salon from anywhere with daily cash and misuse checks.
- Who it is for: owners of small independent hair and beauty salons in Indian tier-1 and tier-2 cities (1 to 8 chairs) who keep bills and customers in a register, a notebook or WhatsApp today.
- What it sells, at what price: ₹4,999 one-time setup (prices, staff and logo entered; team trained at the salon), then ₹999 a month; first month free.
- Where and how: India; sold salon by salon (how customers will find it is not decided yet); delivered as the salon's own Android app, set up in person.
- Budget and constraints: budget, team size and launch date not given. The app is built as a working prototype by one founder with AI help; online sync between phones is not built yet (each phone keeps its own data; a backup file exists). English only today.

## The pitch shown to buyers (word for word)

Your salon's own Android app, with your salon's name and logo, on your phone and on each stylist's phone. In English.
Stylists check in with a selfie, type a walk-in's mobile number, bill the services (cash, UPI, card or the customer's prepaid wallet) and send the bill on WhatsApp; each sees only their own earnings and bookings.
You see from anywhere who is in which chair, today's takings, attendance and leave, your top customers, and daily checks: cancelled bills, customers who left without service, and the cash that should be in the drawer.
Your customers get a WhatsApp reminder when they're due back, a prepaid wallet with bonus on top-ups, and ₹100 for bringing a friend.
₹4,999 one-time setup (we enter your prices, staff and logo, and train your team at the salon), then ₹999 a month. First month free. All prices in Indian rupees.

## What exists today

- A working Expo/React Native app (owner app with 4 tabs: Live floor, Earnings, Staff, Customers; staff app: Home, Customers, walk-in counter, Calendar, Profile), 83 automated tests passing.
- Built misuse checks: bill paid once; itemised WhatsApp receipt; unusual-bill flag; owner cash count against the app's expected cash; "left without service" and staff undo kept with reason; referral confirmed by WhatsApp code and capped per month; WhatsApp code for wallet spends above ₹500; clock-set-back check; services not in the list need owner approval; backup file and restore; staff see only the last 4 digits of customer numbers.
- Not built: online sync between the owner's and stylists' phones (so "see from anywhere" depends on it), Hindi, server-sent WhatsApp messages.
- Known competitors named by buyers: Zylu, MioSalon (not researched yet).

## Simulated buyer panel (100 AI-simulated salon owners; not real customers, likely to overstate buying)

- 9 buy, 91 pass. By segment: 5-8 chair salons 20% (of 20); premium/franchise 20% (of 5); 2-4 chair parlours 10% (of 40); 1-2 chair barbers 0% (of 35).
- By behaviour: owner often away 33%; young tech owner 29%; WhatsApp-run 7%; asks other owners first, counts every rupee, register loyalist, tried an app before: 0%.
- Pass reasons: habit 31, price 24, trust 22, need 13, convenience 1.
- Main objections: staff won't take selfies and type every walk-in at rush hour; ₹4,999 up front; monthly fee in slow months; no owner they know uses it; data loss if a phone breaks or the company shuts; English only; who helps on a busy Sunday; customers who won't give a mobile number; selfie check-in makes staff feel distrusted.
- What would flip a no (most repeated): no setup fee or setup charged only after the free month if staff still use it (~65); proof from a nearby salon or distributor (~30); a ₹299-399 small-shop plan with customer features only (~28); online backup/export (~20); Hindi (~19); Sunday support (~18).
- Price answers (Van Westendorp): acceptable range about ₹206-1,003 a month; least resistance about ₹306; median "too expensive" ₹1,200.

## Open questions nobody has answered yet

Market size, cost to win one salon, cost to run the server and WhatsApp messages per salon, churn, founder's budget and time.
