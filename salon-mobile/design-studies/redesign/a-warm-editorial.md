# Direction A · Warm Editorial: "The Register"

Files: `a-warm-editorial.html`, `a-warm-editorial.png` (the whole row) and `a-warm-editorial-1.png` to `-5.png` (one phone each). Screenshots taken with Playwright at deviceScaleFactor 2.

## Logic and style
- **Logic 1 · seconds roulette.** The draw landed on huashu web style #12, **Warm Editorial**: cream paper, terracotta accent, near-black ink, a serif display face with a clean sans body, book-like rhythm and hairline rules. I kept to that style throughout and adapted it to a native Android app.
- **References:** the style's own sources (Anthropic's warm-paper editorial look, Penguin/Pelican paperback typesetting), plus the thing the app replaces: an Indian salon's hand-ruled register and bill book.
- **Adaptation:** I moved the style's terracotta (#CC785C/#D97757) toward the salon's henna-brown, giving **#A4532F**. The original terracotta fails contrast on cream (2.9:1), and the darker shade sits closer to the salon's current brown and gold. The original terracotta survives as the light margin rule.

## Palette
| Token | Hex | Use |
|---|---|---|
| paper | #F5F0E8 | page |
| sheet | #FBF8F2 | bill slip, input fields, chair tags |
| deep | #ECE4D6 | monogram, pressed paper |
| rule | #D8CCBA / #C6B49C | hairlines / input borders |
| margin | #D9957A | the ledger's double margin line (decorative only) |
| ink | #191919 | text, money (15.5:1) |
| ink-2 / ink-3 | #5E5247 / #6B5D50 | secondary text (6.7:1) / meta text (5.6:1) |
| henna (accent) | #A4532F | primary buttons (cream text 5.1:1), tally strokes, stamp. Accent text uses #8C4223 (6.3:1) |

The app has one accent and one radius rule: controls are 10px, and paper surfaces are square.

## Fonts
- **Newsreader** (display and every money figure, lining tabular numerals). It has an opsz axis, so the same family works from 14px margin notes up to the 50px total.
- **Hanken Grotesk** for body and UI text.
- **Material Symbols Outlined** for Android-native icons.
- Size floor: body text is 14–17px and labels are at least 12px.

## The motif, and where its form comes from
The spec says the app **replaces a paper register**, so each screen is laid out like a page of that register:
- **Double margin rule** down every page, like ledger paper. The **margin column holds when/where**: "Now", "Today", "11:10", "10:30 AM", and chair numbers 1/2/3 on the Live floor. The **body holds who/what**, and **money always sits flush right** in the money column.
- **Earnings are written as a sum.** The Cash/UPI/card and Wallet lines sit above a **double accounting rule**, and ₹1,350 is the total underneath. Money is the biggest thing on the screen because it is the sum line, not a decorative stat.
- **The bill is a slip from the bill book**, with perforated edges, dotted leaders from each service to its price, and a double rule above the total. "Owner approved" is a **rubber stamp**, the way an owner would initial a paper bill.
- **The calendar keeps bookings as tally strokes** (five-bar gates), the way a register counts heads. Closed Tuesdays are **hatched out like a struck-through column**. Today is circled in ink.
- **The Live floor is a tipped-in plate.** The approved clay salon runs full width across the margin, framed by ink rules like a book illustration. Small paper chair tags and seated sprites sit at the app's real plate coordinates. Below it, the chair list goes back to the ledger, numbered 1/2/3 in the margin.

## What would change in the app if chosen
- The theme flips from dark glass to light paper: new tokens in `src/theme/tokens.ts`, Urbanist is replaced by Newsreader + Hanken Grotesk via expo-font, and the frosted cards and radial backdrop are removed.
- A shared `<LedgerRow margin=… money=…>` primitive (margin column, body, right-aligned money) would replace most cards. The margin rule becomes one absolutely-positioned element per screen.
- New components: a bill-slip component (mask-cut perforated edges, dotted leaders, a Stamp component for owner-approved lines), a tally-mark day cell for the calendar, and paper chair tags on the Live plate.
- The tab bar changes from a floating glass dock to a flat Android bottom bar with a top hairline. The walk-in "+" becomes an ink key in the centre.
- Business logic, flows and copy stay as they are.
- A dark variant ("night ledger": ink paper with cream text) would need its own design pass. This direction is light-first, chosen for bright shop lighting.
