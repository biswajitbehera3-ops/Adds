# Direction C · The Register

**Logic:** 3, best designer (unlimited budget).
**Designer chosen:** Ishan Khosla Design (New Delhi). The studio is known for Indian vernacular lettering, its work with traditional sign-painters and craftspeople (the Typecraft Initiative), and for turning everyday Indian material culture into disciplined systems. That fits this product better than a global brand studio would. The app is for a neighbourhood shop, it replaces a paper register, and it has to feel proud of its trade without looking like a bank. Their approach: find the object the shop already trusts, keep its craft, and make its logic strict.

**Files:** `c-designer.html` (static HTML/CSS, Google Fonts only), `c-designer.png` (all five), `c-designer-1.png` … `-5.png` (one phone each).

## The structural idea: the salon's register (khata)
The spec says the app *"replaces a paper register"*. So the whole app is built as that register:

- **Every staff screen is a ruled page.** Paper is `#FFF8F1` and rows are 44px+ with hairline rules. Rows double as touch targets.
- **The rupee column.** Money sits in one fixed right-hand column with a gold double rule, at the same x (250px) on every page: earnings, bill lines, wallet balance after the bill, and the owner's chair takings. A stylist's eye learns where money is and goes straight there. This is the main way money is kept the clearest thing on each screen.
- **The book-keeper's double underline** marks the one total that matters on a screen: ₹1,350 my earnings, ₹2,000 the bill total, ₹6,800 today.
- **The rubber stamp.** "Owner approved" is stamped on the Keratin line, the way a register entry gets a stamp. Stamp red is used only for exceptions: the approval stamp, reminders to send, and Today's checks.
- **The leather cover.** The register's brown cover with gold stitching is used for the login (the cover itself), the walk-in panel, the bottom bar (the spine), the Today card and the owner's Live chrome. Login is a paper label pasted on the cover.
- **The appointment book.** The calendar is a ruled month page. Each day's load fills from the bottom like ink in a cell (count shown in the corner, 7 to 8 turns full gold). Tuesdays are hatched as the weekly off, and today is boxed in ink.

## Palette
| Role | Hex |
|---|---|
| Leather (cover, bars, ink) | `#2A1A15` / `#3A251E` |
| Paper (page) | `#FFF8F1` (brand cream) / `#F6EADC` |
| Ruling | `#EBDCCB` |
| Secondary ink | `#6A4E41` (7.2:1 on paper) |
| Brand gold (main action, money on leather) | `#E4A67B` (ink on gold 8.0:1) |
| Gold rule / deep gold | `#D9A57F` / `#8F5630` |
| Stamp red (exceptions only) | `#A8361F` (6.2:1) |
| Confirmed green | `#2F6B3A` |

## Fonts
- **Rozha One** (Indian Type Foundry): the display face and big money. It is a high-contrast face in the spirit of shop signboards and has a proper ₹ glyph.
- **Anek Latin** (Ek Type, India): UI and body text, with tabular figures for ledger amounts.

Both are Indian foundries, chosen on purpose. Body text is 14px or larger, labels 12px or larger, and all text pairs pass 4.5:1.

## Phone frame
The geometry comes from huashu `ios_frame.jsx`: 12px bezel, 60/48 corner radii, 390×844 screen, and a gesture pill at the bottom. It is fitted out as Android: punch-hole camera, 40px status bar with 11:40, signal, wifi and battery 82. It is the same on all five phones.

## What would change in the app if this were chosen
- The glass cards, radial backdrop and floating tab bar go. In their place come paper pages, a leather spine bar with a raised gold **Walk-in** tab, and the leather walk-in panel at the top of Home.
- A shared `<LedgerRow>` / `<MoneyColumn>` component would fix the rupee column x in one token (`--col`), and totals would get the double underline.
- Urbanist is replaced by Rozha One and Anek Latin.
- Stamp red becomes a reserved "needs attention" colour.
- The clay Live plate stays as it is. It now sits under a leather header and above a paper sheet of chair rows, with paper chair tags pointing at the chairs and the real sprites seated in chairs 1 and 2.
- One derived line was added on the Bill screen: "Wallet after this bill ₹2,850" (₹4,850 less ₹2,000). It is not in the spec strings and can be dropped.
