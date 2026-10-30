# Direction B: the apothecary label (real-world reference)

**Logic:** huashu-design Logic 2, real-world reference / benchmark transfer.
**Files:** `b-reference.html`, `b-reference.png` (full row), `b-reference-1.png` to `-5.png` (one phone each).

## Reference: Aesop's digital design
We chose Aesop because the brand began as a hair salon. In 1987 Dennis Paphitis ran **Emeis**, a salon in Armadale, Melbourne, and blended hair products there. Emeis was later renamed Aesop. It is a crafted, salon-born brand that does not look like a bank, which is what this app needs to feel like. Paphitis reportedly spent nearly all of his first business loan on a flush-mount mirror for the salon.

- Award: *Aesop presents: Three Aromatique Candles & Other Stories* by Studio Regale won two awards at the 2021 Webby Awards (Webby Winner and People's Voice Winner, Websites: Corporate Communications). *Aesop · Taxonomy of Design* by Pollen won the Webby for Best Art Direction in 2016.
  - https://winners.webbyawards.com/2021/websites-and-mobile-sites/general-websites-and-mobile-sites/corporate-communications/185374/aesop-presents-three-aromatique-candles-other-stories
  - https://winners.webbyawards.com/2016/advertising-media-pr/craft/best-art-direction/161365/aesop-taxonomy-of-design
- Salon origin: https://en.wikipedia.org/wiki/Aesop_(brand) and https://www.smartcompany.com.au/retail/aesops-journey-to-2-billion-valuation/
- Design language: https://www.webdesignhot.com/design.md/aesop/ and https://fontalternatives.com/inspiration/aesop-suisse/. Both are third-party reconstructions of aesop.com, not official Aesop documentation.

**What Aesop's design is:** a warm ivory ground `#FFFEF2` that reads as paper, and a single charcoal ink `#333`. Type is the neo-grotesque Suisse Int'l, set small and calm, with a serif used only for the wordmark and a few display moments. Every corner is square (0px). There are no shadows, gradients or saturated accents, and 1px ink rules do the work that cards usually do. A taupe inset panel `#F7ECDD` is used sparingly. Navigation is text, and the copy is laid out like an ingredient list on the brand's amber apothecary bottles.

**What we took from Aesop:** the ivory paper ground, a single ink, square corners, hairlines in place of cards, no shadows, a small calm grotesque with a serif kept for display moments, label-left / value-right ingredient-list rows, and a text-only bottom bar.

**How it maps onto this salon:**
- Aesop's amber bottle becomes the salon's own gold `#E4A67B`, used in two places only:
  1. the single main action on each screen (Log in, the walk-in arrow, Collect ₹2,000, Book, Count the cash);
  2. how full a day is, on the calendar.
- The charcoal ink is the salon's own brown-black.

## Palette
| Role | Hex | Notes |
|---|---|---|
| Paper (ground) | `#FFFEF2` | Aesop ivory |
| Label stock / inset | `#F4E8D6` | Bill label, walk-in band, login band |
| Weekly off | `#EDE3D3` | Tuesdays |
| Ink | `#2B211C` | 15.5:1 on paper |
| Secondary ink | `#6B5B51` | 6.4:1 on paper, 5.4:1 on sand |
| Soft rule | `#DCCFBC` | Hairlines between rows |
| Amber / brand gold | `#E4A67B` | Main action fill and calendar load. Ink on amber is 7.5:1 |
| Amber as text | `#8E4A22` | LIVE, "owner approved", "2 to look at". 6.6:1 on paper |
| Confirmed | `#3A5A40` | WhatsApp, number confirmed. 7.6:1 |

## Fonts (Google Fonts)
- **Hanken Grotesk** (400/500/600/700, tabular lining figures) stands in for Suisse Int'l, which is not on Google Fonts. It carries everything: labels, values, buttons, and all money.
- **Newsreader** 400 stands in for Aesop's serif display moments. It is used only for names and titles: "Welcome back", "Imran Khan", "Aditya Rao", "October 2026", "Live floor".
- Sizes: body 14 to 17px, labels 12 to 13px, money 30 to 52px.

## Motif: the apothecary label
The salon's world (receipt, appointment book, till) is set the way Aesop sets a product label. Each screen is a printed sheet of ruled lines rather than a stack of floating cards.

- **Staff Home** reads as one sheet. A small label column on the left ("My earnings today", "My customers today", "My chair") faces values on the right. ₹1,350 is the largest thing on the screen.
- **Bill** is a literal label: a sand panel with an ink border, ingredient-style lines (Hair colour ₹1,200, Keratin touch-up ₹800, owner approved), and the Total ₹2,000 set as the largest figure.
- **Calendar** is the appointment book drawn as a Swiss grid. Each day fills with amber from the bottom, like the level in an amber bottle (full at 8 bookings). Today has an ink frame, and Tuesdays are greyed out.
- **Live floor** keeps the approved clay plate full-bleed and slightly enlarged (centre crop, 262px tall). Chairs are labelled with square ink tags. The chair list below is a ruled ledger.

**Where the form comes from in the content:** this app replaces a paper register. A register, a salon bill and an Aesop label are the same kind of object: dense, ruled text where a name sits against a value. So the structure is rows and rules, not cards, and money always sits right-aligned in the value column, where a register would put it.

## Layout skeleton (how it differs from a card stack)
- Full-bleed ruled bands with a fixed 108px label column. Containers have no radius and no shadow.
- The bottom bar is text only, with a 3px ink bar over the active tab. The walk-in action is a solid ink square in the middle.
- The owner bar has the same text style with four slots.
- The phone frame is an Android punch-hole adaptation of the huashu `ios_frame.jsx` geometry: 12px bezel padding, an inset screen, a status-bar row, a centred camera and a bottom gesture pill.

## What would change in the app if chosen
- **Theme:** replace the brown glass theme with light paper tokens (`paper`, `sand`, `ink`, `ink2`, `rule`, `amber`, `amberInk`). Set all radii to 0. Remove `backdrop-filter` and the radial brown backdrop.
- **Fonts:** swap Urbanist for Hanken Grotesk with `tnum`, and add Newsreader for names and titles only.
- **Bottom bar:** replace the floating 5-slot pill tab bar with the ruled text bar and the ink walk-in square. The owner bar gets the same treatment.
- **Components:** cards become ruled `Row` / `Sheet` components (label column plus value column). The bill becomes a bordered "label" component. Calendar day cells get a bottom fill for load.
- **Live floor:** stays as it is; only its frame changes (full-bleed, square ink chair tags).
- **Gold:** narrowed from "money and actions" to actions only. Money moves to the strongest ink weight and size.
