# Remotion overlays

Animated graphics that sit on top of vertical clips (1080×1920, 30fps).
Built with Remotion (free for individuals and teams of up to 3).

## Compositions

| id | What it is | Props |
|---|---|---|
| `MoneyCounter` | Stakes-first hook: the amount counts up, punches on landing, then the label slides in. Anton font, thick black outline so it reads over bright footage. | `amount`, `label`, `transparent` |
| `MrBeastCaptions` | 1–3 word caps captions, one chunk at a time, the key word in green, pop-in on each chunk. Sits at 62% height, clear of faces and the platform buttons. | `chunks` (`text`, `startMs`, `endMs`, `highlight`), `transparent` |
| `Countdown` | Digital challenge timer, top-centre. Counts down in real time, the last 3 seconds turn red and pulse, then "TIME!" slams in. | `seconds`, `label`, `transparent` |
| `ContestantTracker` | "Who's left" row across the top. On elimination the icon shakes, a red ✕ slams on, it greys out and the "N left" count updates. Uses an initial in a coloured circle, or a face image from `public/`. | `contestants` (`name`, `color`, `image`, `eliminatedAtSec`, −1 = never), `transparent` |
| `ZoomPunch` | An effect on a real clip, not an overlay: a spring zoom-in with a short shake and optional white flash on each beat, then eases back. Put the clip in `public/clips/`. | `src`, `punches` (`atSec`, `scale`), `flash` |

| `WantedHook` *(Gaming)* | Chase hook: a slanted hook band slides in, five stars light up one by one, optional red/blue siren glow on the edges for the first 2.5s. | `hook`, `stars` (1–5), `siren`, `transparent` |
| `ResultStamp` *(Gaming)* | Payoff stamp: the frame tints, an angled band slams in ("PLAN FAILED" red / "STUNT LANDED" green), the subtext drops under it. | `text`, `subtext`, `tone` (`fail` / `win`), `transparent` |

### Account kit (stills, Gaming folder)

| id | Size | Use |
|---|---|---|
| `Avatar` | 1080×1080 | Profile picture for Instagram and YouTube (circle-safe). Prop: `initials`. |
| `YouTubeBanner` | 2560×1440 | Channel banner; text inside the 1546×423 phone-safe area. Props: `name`, `tagline`, `schedule`. |
| `ReelCover` | 1080×1920 | Reel/Shorts cover; title inside the 1080×1440 grid area. Props: `title`, `episode`. |

Original design only: no game logos, fonts or official art. Re-render a still, for example:

```bash
npx remotion still ReelCover out/account-kit/ep2.png --image-format=png --props='{"title":"He jumped the bridge","episode":"Ep. 2"}' --browser-executable=/opt/pw-browsers/chromium
```

Setup guide for the accounts: `../accounts/gaming-page-setup.md`.

Match each composition's length to the clip by passing `--frames=0-<last frame>` or by editing `durationInFrames` in `src/Root.tsx`.
Don't cover graphics that are already in MrBeast's footage (timers, money, name tags). Add what's missing.

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

Check frames before delivering (bundles once, writes PNGs):

```bash
node scripts/check-frames.mjs Countdown out/qa 30,141,200 '{"seconds":6,"label":"Time left","transparent":true}'
```

Regenerate the test clip that `ZoomPunch` uses by default:

```bash
mkdir -p public/clips && ffmpeg -y -f lavfi -i "testsrc2=s=1080x1920:d=4:r=30" -c:v libx264 -pix_fmt yuv420p public/clips/sample.mp4
```

## Rules for MrBeast clips

- Use overlays where they raise retention: the money counter on the hook, a countdown during tension. Not on every second.
- Check the Vyro brief before adding any overlay.
