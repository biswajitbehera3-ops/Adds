# Remotion overlays

Animated graphics that sit on top of vertical clips (1080×1920, 30fps).
Built with Remotion (free for individuals and teams of up to 3).

## Compositions

| id | What it is | Props |
|---|---|---|
| `MoneyCounter` | Stakes-first hook: the amount counts up, punches on landing, then the label slides in. Anton font, thick black outline so it reads over bright footage. | `amount`, `label`, `transparent` |

## Commands

In this cloud workspace, Remotion must be pointed at the pre-installed Chromium.

Preview in the browser:

```bash
npx remotion studio
```

Render a test video with a dark background:

```bash
npx remotion render MoneyCounter out/money.mp4 --browser-executable=/opt/pw-browsers/chromium
```

Render a **transparent** overlay to stack on a clip (ProRes 4444 keeps the alpha):

```bash
npx remotion render MoneyCounter out/money.mov --codec=prores --prores-profile=4444 --pixel-format=yuva444p10le --image-format=png --props='{"amount":100000,"label":"Beat LeBron","transparent":true}' --browser-executable=/opt/pw-browsers/chromium
```

Stack it on a clip with ffmpeg:

```bash
ffmpeg -i clip.mp4 -i out/money.mov -filter_complex "[0][1]overlay=0:0:eof_action=pass" -c:a copy clip_with_counter.mp4
```

## Rules for MrBeast clips

- Use overlays where they raise retention: the money counter on the hook, a countdown during tension. Not on every second.
- Check the Vyro brief before adding any overlay.
