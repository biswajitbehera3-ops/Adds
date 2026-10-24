# Review: the "apple-design" skill vs our app (24 Oct)

Skill: https://github.com/emilkowalski/skills/blob/main/skills/apple-design/SKILL.md (MIT, Emil Kowalski; one Markdown file, no scripts). Read in full; not installed.

## What the skill is

Apple's WWDC design talks turned into rules for **how an interface feels**: motion with springs, touch feedback, gestures, glass "materials", type, accessibility, and Apple's eight design principles. Its code examples are for websites (CSS, Pointer Events, Motion); in our React Native app the same ideas are done with Reanimated springs and Gesture Handler (both already in the project).

**It is not a visual style.** It has no colours, layouts, screens or components. It does not replace the confirmed liquid glass look (`../LIQUID-GLASS-STYLE.md`); it is a quality checklist that makes that look feel like an Apple app when you touch it.

## Already in our app

| Skill says | Our app today |
|---|---|
| Feedback on press-down, scale 0.97 | `Press.tsx`: 0.97 squeeze on press-in, 100 ms (MOTION.md R6) |
| Respect reduced motion | `useReducedMotion` used in 25 files |
| Materialize, don't just fade | MOTION.md R1: opacity + y + blur → clear |
| Swipe-to-dismiss sheets | MOTION.md R8: top-up sheet (threshold or speed) |
| Translucent chrome, content scrolls under | Glass dock and header in the confirmed style |
| Tighter tracking on big numbers, wider on small caps | Liquid glass style: big numbers −0.8 px, labels +0.12 em |
| Easy undo instead of confirm dialogs | Bill undo within 2 minutes with a reason |

## What it would make better (apply in the build)

| # | Skill rule | Gap in our app or design | Change |
|---|---|---|---|
| 1 | **Never stack light glass on light glass** (text becomes hard to read) | The v4 Home puts brighter glass pills on glass cards (Start, the split pill, "1 in chair", the active tab) | Small pieces inside a card become a **heavier, darker material** (espresso glass), not a lighter one; text on them stays white |
| 2 | **Reduce transparency mode**: frosted or solid when needed | Blur is heavy work on cheap Android phones and there's no fallback | A "solid glass" mode: switched on automatically on slow phones and in the owner's settings; same look, no live blur |
| 3 | **Springs for anything touched**: interruptible, start from where it is, carry the finger's speed, project the flick, rubber-band at edges | Most motion uses fixed-time animations (13 files use timing, 2 use springs); sheets close on a fixed threshold | All sheets (top-up, book, cash count, Help, bill) become spring sheets: follow the finger 1:1, can be grabbed mid-way, land where the flick throws them, soft resistance at the top. Defaults: no bounce; a little bounce only after a flick |
| 4 | **Sound and haptics in the same frame as the visual, only for meaningful moments** | Haptics used in 3 files, no list of when | Haptic on: payment collected (PAID stamp), bill undone, walk-in saved, check-in done, error. Nothing on ordinary taps |
| 5 | **Respect the phone's text size** and scale layout with it | Not tested at large text; many owners aged 40–55 use large text | Test every screen at 1.3× text; cap the giant ₹ numbers so they don't break cards |
| 6 | **Default to the system font unless there's a reason** | Urbanist has no Hindi letters, and Hindi is planned for V1 | Keep Urbanist for English (brand reason), add Noto Sans Devanagari for Hindi |
| 7 | **Scroll edge effect, not hard lines** | Content can meet the header and the dock with a hard edge | A soft blur fade where lists slide under the glass header and dock |
| 8 | **Sheets grow from the button that opened them and leave the same way** | Sheets slide up from the bottom whatever opened them | Popups (bell, Help "?", chair details on the live floor) open from their button and close back into it |
| 9 | **Specific labels beat generic ones** ("Home" is vague) | Staff tab "Home" | Rename to **"My day"**; owner tabs (Live, Earnings, Staff, Customers) are already specific |
| 10 | **Four kinds of feedback: status, completion, warning, error; check input as it's typed** | Mixed: some forms check only on Save | Mobile number checked as typed (10 digits, starts 6–9), status line for save/offline, one consistent error style |
| 11 | **Responsibility with AI**: previews, disclaimers | The planned Help-to-Claude answers | Mark Claude's answers as "Answer from the help assistant" with **Call the team** always one tap away; money and data issues always go to the founder (already in PLAN-24-OCT) |

## Verdict

- **Better design?** It does not give a better *look*; our liquid glass look stays. It gives a better *feel*: interruptible spring sheets, readable glass-on-glass, a solid mode for slow phones, haptics at the right moments, Hindi-ready type and large-text support. Points 1, 2 and 6 fix real problems in what we've designed.
- **Install?** Worth installing as a reference skill (one file, MIT, nothing runs) so it guides every screen during the build.
