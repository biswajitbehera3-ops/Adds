# Design system: grooming-tin label

Recorded from the shipped build (`src/theme/tokens.ts`, `src/components/*`), not from intentions.

## World

Indian grooming packaging: sandal-soap wrappers, shaving tins, hair-oil labels. The app shell is
drenched chocolate; every working surface is cream label paper inside a double rule; burnt orange is
the wax seal and appears only on money and the one primary action per screen.

## Colour (`color.*`)

| Token | Hex | Role |
|---|---|---|
| choc | #2A1710 | Hub ground, ink on paper, selected chips, dark labels |
| choc950 / choc900 / choc700 / choc600 | #160A06 / #1F0F09 / #3A2117 / #54321F | Scrim and outer ground / toast / dark label ground / chart series |
| paper | #F3E8D6 | Label and screen ground |
| paperLight | #FBF5EA | Controls on paper (chips, inputs, keys) |
| paperPressed | #E8D8BF | Pressed key, empty bar track |
| rule / ruleSoft | #2A1710 / #CDB89A | Double-rule frame / dividers and idle borders |
| inkMuted | #6B4A39 | Secondary text on paper (6.5:1) |
| creamMuted | #C9B49A | Secondary text on chocolate (8.5:1) |
| seal / sealPressed / sealBright | #A0471A / #86391A / #E07A3F | Money, primary action (5.1:1 on paper) / pressed / accent on chocolate (5.7:1) |
| positive / danger | #3F6B3A / #9B2C1F | Returning customer, rewards paid / errors, destructive confirm |

## Type (`font.*`, variants in `components/T.tsx`)

- **Rozha One** (Indian Type Foundry) for names, titles and every amount: display 40, title 28, heading 21, amount 24, all tabular numerals.
- **Hind** (Indian Type Foundry) for everything operable: body 16/23, bodyStrong 600, small 13.5 medium, label 12.5 semibold uppercase +1.1 tracking (data labels only, never above a heading).

## Shape and space

- Space scale 4 / 8 / 12 / 16 / 24 / 32 / 48. Screen gutter 16.
- Radius: label 6 (printed paper), control 10, pill for the demo badge only.
- `LabelFrame`: 1px outer rule, 3px gap, 1px inner rule. The only container treatment; no drop-shadow cards.
- Touch targets ≥ 48; keypad keys 64; primary buttons 60.

## Signature components

- `Seal`: oval medallion with solid ring, dashed perforation ring, arced caption, amount in Rozha. Wallet balance everywhere.
- `Stamp`: the seal pressed onto the receipt.
- Monogram: initials in a pill-oval outline, echoing the seal.
- Icons: authored 24-grid line set, 1.75 stroke, round caps (`components/Icon.tsx`).

## Motion grammar

| Moment | Spec |
|---|---|
| Screen open (container transform from tapped element) | spring 460ms, dampingRatio 1; content counter-scaled, fades in over p 0.3–0.85 |
| Screen close | spring 380ms, dampingRatio 1; edge-swipe drives it interactively |
| Hub cascade | once per launch; 520ms ease-out-expo, 55ms stagger, 14px rise |
| Receipt stamp | 260ms delay, spring 520ms dampingRatio 0.62, scale 1.55→1, rotate −18°→−8°, heavy haptic on landing, ink ring 520ms |
| Money change | NumberRoll 700–900ms ease-out-expo |
| Bars | grow from left, 700ms ease-out-expo, 70ms stagger |
| Press | scale 0.97 in 100ms / out 160ms; keypad keys tint only |
| Reduce Motion | every transition becomes a 120–160ms crossfade; stamp and rolls appear set |
