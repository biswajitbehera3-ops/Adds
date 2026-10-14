# Brand assets (from the user, not yet wired into the app)

| File | What | Notes |
|---|---|---|
| `intro.mp4` | 4.1 s opening animation, 1440×1440, 24 fps, H.264 + AAC stereo, 3.6 MB | Plays first on app launch, then hands off to the login page. Ends on the white logo on black. |
| `logo.jpg` | Salon logo: crossed scissors, two combs, razor blade, shaving brush — white on black, 736×736 | Matches the intro's final frame. |
| (pending) | Login page image | User will upload. |

Open points before building:
- Both files show a small four-point sparkle mark in the bottom-right corner (looks like an AI-generator watermark). Use clean exports if possible.
- Intro sound: play with sound, or muted by default (salon counters are noisy/shared)?
- Square video on a tall phone: centre it on black (the video ends on black, so this is seamless).
- For the app build, re-encode to ~1080×1080 to cut the size to roughly 1 MB.
