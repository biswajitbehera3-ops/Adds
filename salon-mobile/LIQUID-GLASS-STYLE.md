# Confirmed app style: liquid glass over the salon (22 Oct)

**Status: confirmed by the user for the whole app; build later (BUILD-SPEC 1.5 and 11.0).**
User, 22 Oct: "Everything is good, the glass is perfect", then "confirm the style and design of the app, it will be built like this, and save it to build later".

Reference picture: `design-studies/glass-home/staff-home-liquid-v4.png` (source `staff-home-liquid-v4.html`).
This replaces the current look in `DESIGN.md` (grooming-tin label / brown glass) and redesign directions A, B and C. Every screen (staff and owner) is rebuilt in this style when the build starts.

## 1. The background (every screen)

Three layers, bottom to top:

| Layer | Value |
|---|---|
| Salon picture | `assets/live/plate2.webp`, cover, blur 3px, saturation .85, brightness .70, sepia .25 |
| Brown wash, fading down | top `rgba(74,50,40,.55)` → 40% `rgba(62,42,34,.62)` → 75% `rgba(48,32,26,.78)` → bottom `rgba(36,24,19,.90)` |
| Soft light, top-left | radial 90%×45% at 20% 0%, `rgba(150,108,88,.25)` → transparent |

Screens without the salon behind them (login, sheets) use the same brown wash over the same picture, so the glass always has something to bend.

## 2. The glass (one recipe, used everywhere)

| Part | Value |
|---|---|
| Fill | 160° gradient: white .14 → .06 (40%) → .03 (70%) → .07 |
| Behind it | blur 6px, saturation 140%, brightness 1.08, plus a gentle lens bend (on web: SVG displacement, scale 34) |
| Bevel | inner highlights: top lip white .75, left lip white .35, bottom lip white .18, hairline white .10, thickness glow top-left white .28 |
| Rim | 1.6px gradient border, 135°: white .95 at the top-left corner, fades to almost nothing in the middle, white .70 at the bottom-right corner |
| Shadow | `0 24px 50px -18px rgba(10,5,2,.55)` |
| Corners | cards 30px · small tiles 16px · pills and buttons fully round |
| Glass inside glass | small pieces (icon tiles, Start, pills, the current tab) are a brighter glass: white .20 → .07, top lip white .80 |

## 3. Colour

Almost none. Glass and white do the work.

| Use | Colour |
|---|---|
| All text | white; secondary white .82; quiet labels white .62 |
| Money, charts, main-button outline, the + tab, arrows ↗ | gold `#F3C27A` (deeper `#D9A15A`) |
| "In chair", confirmed, live | green `#7FD8A2` with a soft glow |
| Alerts (bell dot) | `#FF7A50` |
| Customer and stylist initials | warm photo-like gradients (caramel, rose, sand) with a white ring |

No solid dark buttons and no orange fills on cards.

## 4. Type (Urbanist)

| Role | Size / weight |
|---|---|
| Card label | 11.5px, weight 500, CAPITALS, letter-spacing .12em, white .82 |
| Big number (one per card) | 34px, weight 600, letter-spacing −0.8px; unit after it 16px weight 500 |
| Greeting | 20px weight 600, with a small CAPITAL date line above |
| Body | 12.5–15px, weight 500–600 |

## 5. Building blocks

- **One number per card**, label above it, a small gold ↗ in the top-right corner when the card opens a detail page.
- **Thin-line chart**: 3px gold lines (the past) and dim white lines (still to come), as for earnings by hour.
- **Split pill**: a glass pill with a gold fill for the first part (e.g. Cash/UPI/card ₹900 | Wallet ₹450).
- **Tick bar**: white ticks for time used, dim ticks for time left (e.g. 30 / 45 min in the chair).
- **Main action**: a glass pill with a gold outline that brightens towards the bottom (e.g. Collect ₹450). One per screen.
- **Bottom menu**: a clear glass bar; the current page is a brighter glass pill with icon and name; the + (walk-in) is gold. Owner menu: Live · Earnings · Staff · Customers.
- **Faces**: overlapping round initials with a white ring and a "+N" circle.

## 6. Building it in the app (notes for build day)

- Expo/React Native on Android: the glass is `expo-blur` (blur) + a gradient fill (`expo-linear-gradient`) + the rim and bevel as gradient borders and inner highlights; all available in the project today.
- The lens bend is the one part React Native doesn't do on its own. Try it with a shader (React Native Skia) on a real mid-range Android phone; keep it only if scrolling stays smooth, otherwise ship the glass without the bend.
- On iPhones with iOS 26, Apple's own Liquid Glass view can be used instead.
- Contrast: white text on the glass must still pass `scripts/contrast-check.mjs`; the brown wash is what keeps it readable, so it must not be made lighter.
- Content and rules of every screen stay as built; only the look changes.
