# App sounds (24 Oct): plan, build later

Made with the **earshot** skill's sound bank (installed 24 Oct, `.claude/skills/earshot`, MIT; sounds made in code, no recordings, no licence to track). Listening page: `design-studies/sounds/listen.html`; app-ready files: `design-studies/sounds/app/*.wav` (mono, 44.1 kHz, 16-bit, ~300 KB for all 11); list with earshot ids and levels: `design-studies/sounds/sounds.json`. Each file passed `earshot sfx check` (no clicks, cut tails or clipping).

## Which moment gets which sound

| Moment | Sound | earshot id | Level (peak) |
|---|---|---|---|
| Payment collected (PAID stamp) | **short chime run (option C, picked by the founder 24 Oct)** | mallet/flourish | −9 |
| Walk-in customer saved | soft rounded pop | ui_pop/soft | −12 |
| Morning check-in done | warm wooden ding | notify/mid_wood | −10 |
| Owner: new item in Today's checks | mid tine ding | notify/mid_tine | −9 |
| Bill undone | single wood knock | knock/wood | −12 |
| Not allowed / error | double knock (no buzzer) | knock/double | −11 |
| Wallet switch on / off | latch toggle | toggle/on · toggle/off | −16 |
| Reminder or bill sent on WhatsApp | soft tap | pro_tap/soft | −14 |

Why these: wood, marimba and soft pops fit the salon's warm wood-and-brass world; nothing glassy, digital or loud. Payment is the loudest and the only musical one, because it's the moment that matters most.

## Rules (from the apple-design skill: causality, harmony, utility)

- Sound only at the moments above; **no sound on ordinary taps, scrolling or page changes**.
- Sound, haptic and the visual (stamp, toast, knock animation) start on the **same frame**.
- Follow the phone: silent or vibrate mode → no sound (haptic only); media volume controls the level.
- A **Sounds on/off** switch in each person's profile (owner and stylist); on by default.
- Short files bundled in the app, loaded once at start (no delay on the first play); played with `expo-audio`.
- Nothing plays while the phone is on a call.
