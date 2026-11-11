# GTA VI: An Extended Look — shot list (official Rockstar master)

**Source:** https://media-rockstargames-com.akamaized.net/VI/downloads/videos/GTAVI_An_Extended_Look/GTAVI_An_Extended_Look.mp4
(listed on https://www.rockstargames.com/VI/media/videos). **14.1 GB**, 3840×2160 H.264, 30 fps, 70 Mbps, **26:48**.

**Don't download the whole file.** ffmpeg can read single frames and short ranges straight from Rockstar's server (it seeks with
range requests):
```bash
U=https://media-rockstargames-com.akamaized.net/VI/downloads/videos/GTAVI_An_Extended_Look/GTAVI_An_Extended_Look.mp4
P="-http_proxy $HTTPS_PROXY -ca_file /root/.ccr/ca-bundle.crt"
ffmpeg $P -ss 1084 -i "$U" -frames:v 1 frame.png                      # one 4K frame at 18:04
ffmpeg $P -ss 1084 -t 8 -i "$U" -c copy clip_hollow_stars.mp4         # an 8 s clip, no re-encode
```
Other files on the same host: `GTAVI_Trailer_1` (713 MB), `GTAVI_Trailer_2` (1.3 GB), `GTAVI_Launch_Trailer` (782 MB), and
`GTAVI_Videos.zip` (121 MB, 9 character clips + the cover-art animation). Same path pattern: `/VI/downloads/videos/<Name>/<Name>.mp4`.

**How this list was made:** a frame every 20 s for the whole video, every 4 s from 13:20 to 18:56, every second around key moments,
and 4 frames/s on the star HUD to tell hollow stars from flashing ones. Times are ±2 s. Re-check exact in/out points in the edit.

## Police / getaway sequence (13:20–16:56) — the core of script 006
| Time | Shot | HUD | Use |
|---|---|---|---|
| 13:20–14:00 | Crew in a car, masks/bandanas going on, tense | — | "Before the job", masks (#3 face icon) |
| **14:04–14:05** | **Police helicopter** over high-rises, a police SUV below | **4 solid stars + 4 heat icons** | **#6 searchlight/air unit**, #3 icons |
| 14:08–14:32 | Jason shooting at police from a car and an alley | stars | ⚠ gunfire: never in the first 7 s, keep it short |
| 14:40 | A street with a bus, smoke | — | Aftermath |
| 14:44–15:16 | Interior of the getaway car, dark, faces | — | Tension |
| 15:17–15:23 | The car drives out of a dark tunnel into sunlight | 4 solid stars (they look different only because of the bright sky; **not hollow**) | Escape |
| 15:24–15:40 | Fast getaway through streets and alleys | 4 solid stars + icons | #5 chase |
| **15:44–15:48** | **Police cars pass right by**, lights on | — | **#5 "they talk to each other"** |
| **15:52–16:16** | **Parking garage: they swap cars, Lucia torches the old one** (explosion 16:04) | stars fading | **#3 "car icon → swap car"**, #7 |
| **16:20–16:32** | **Driving the swapped van calmly** through streets and a toll-style arch | no stars | **Clean getaway** |
| 16:40–16:56 | Van parked; the crew splits, bandana off, walking away | — | **#3 "split up"** |
| **17:04** | Lucia passes a sign: **"WARNING: WE OPERATE CAMERAS IN THIS AREA"** | — | **#3 CCTV icon** (a perfect detail) |

## Jewellery store → hollow stars (17:52–18:28)
| Time | Shot | HUD | Use |
|---|---|---|---|
| 17:52–17:56 | Strip mall: pawn shop, "JOYERÍA" (jewellery), repairs | — | **Robbery target**, #1 |
| 18:00–18:03 | Inside a jewellery store: a woman in a #69 jersey robs it, someone ends up on the floor | ammo | ⚠ scuffle: cut before 18:01 if you want no violence |
| **18:04–18:11** | **She runs out and escapes on the back of a motorbike** | **2 hollow stars, no heat icons** (checked at 4 frames/s) | **#2 HOLLOW STARS — the payoff shot** |
| **18:12–18:23** | A woman at an open car boot; **a man films her on his phone** | — | **#1 witnesses / everyone films** |
| **18:24–18:28** | Driving with a **"LIVE 51k" livestream** chat on screen | 2 stars + **3 icons** (one fewer than in the chase) | Witnesses stream you |

## Other useful shots (from the 20-second scan)
| ~Time | Shot | Use |
|---|---|---|
| 0:25–3:05 | Jason in a run-down apartment block, crowded hallways, a drug lab | Story, dark B-roll |
| 3:45 | A phone call screen ("Unknown") | Phone/dispatch transitions |
| ~6:05 | Jason by a parked car with the prompts **"SLIM JIM / SMASH WINDOW"** | **#8 car theft has options** |
| ~7:45 | Wildlife in a forest (boar) | Nature B-roll |
| ~8:45 | Jason walking past a red car, the minimap visible | Driving |
| ~9:05 | Jason outside a clothing store | **#3 change clothes** |
| ~11:45–12:05 | A man in a dust mask; someone vaulting a store counter | Robbery |
| ~12:25–12:45 | Skyline; a highway with a helicopter | Establishing |
| 17:08–17:28 | Scooter, airboat, gym, swimming, binoculars | Lifestyle |
| 17:44 / ~20:45 | Street-race HUDs (lap, position) | Activities |
| 18:48–18:56 | Skydive over Vice City | Outro |
| 20:05–26:25 | A night heist in a high-rise office | Story, dark B-roll |
| 26:25 | Logo end card | ⚠ title card |

**Rules:** mute the Rockstar audio (licensed music); no violence in a video's first 7 s; don't use 14:08–14:32 or 18:00–18:03
as a highlight; use them only as brief context.
