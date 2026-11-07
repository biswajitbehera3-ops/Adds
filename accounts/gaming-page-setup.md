# Gaming clip page — account setup (Instagram + YouTube)

Built for the GTA 6 launch (19 Nov 2026), but the brand is general gaming, so the page survives after launch week and can take any
gaming campaign (Call of Duty, Fortnite, Roblox and others).

## 1. Pick the name

The default in the templates is **Wanted Clips** (initials **WC**). Check that the handle is free on **both** Instagram and YouTube
before you decide. Other options in the same style:

| Name | Handle idea |
|---|---|
| Wanted Clips | @wantedclips / @wanted.clips |
| Five Star Clips | @fivestarclips |
| Max Wanted | @maxwantedclips |
| Night Drive Clips | @nightdriveclips |
| Clutch Clips Daily | @clutchclipsdaily |

**Don't put "GTA", "Rockstar" or "official" in the name, and never use Rockstar logos, the GTA font or official art in your
profile.** A page that looks official can be reported for impersonation and taken down. "GTA 6" belongs in captions and hashtags, not
in the account name.

To change the name, edit `defaultProps` for `Avatar`, `YouTubeBanner` and `ReelCover` in `remotion-overlays/src/Root.tsx` and
re-render (commands below), or ask Claude to do it.

## 2. Profile images (already rendered)

| File | Use |
|---|---|
| `remotion-overlays/out/account-kit/Avatar.png` (1080×1080) | Profile picture on Instagram **and** YouTube. Both crop to a circle, and the design is centred for it. |
| `remotion-overlays/out/account-kit/YouTubeBanner.png` (2560×1440) | YouTube banner. Text sits inside the phone-safe area. |
| `remotion-overlays/out/account-kit/ReelCover.png` (1080×1920) | Reel / Shorts cover template. Make one per post so the grid looks like a series. |

## 3. Instagram setup

1. Create the account with a **new email and your phone number**, and verify both.
2. Settings → Account type → **Switch to Professional → Creator**. Category: **Gaming video creator**. This unlocks insights and
   scheduling in Meta Business Suite.
3. Name field: `Wanted Clips | Gaming Clips`. The name field is searchable, so the keywords help.
4. Bio:
   ```
   🎮 Gaming's wildest moments, daily
   ⭐ GTA 6 clips from 19 Nov
   🔔 Follow so you don't miss launch week
   ```
5. Keep **likes and comments ON** (campaigns require it). Don't hide like counts.
6. Turn on **two-factor authentication**.

## 4. YouTube setup

1. Create a channel on a new Google account → choose **Use a custom name** → `Wanted Clips`.
2. Handle: the same as Instagram if it's free.
3. Upload `Avatar.png` and `YouTubeBanner.png`.
4. Description:
   ```
   The wildest gaming moments, clipped daily — chases, stunts, fails and funny physics.
   GTA 6 clips from launch day (19 Nov 2026). Fan channel, not affiliated with Rockstar Games.
   New Shorts every day.
   ```
5. Verify the channel with your phone (Settings → Channel → Feature eligibility). This unlocks longer uploads and custom thumbnails.

## 5. What to post before launch (now to 18 Nov)

New accounts do best when they warm up: **1 post a day for the first week, then 2–3 a day.** Don't mass-post on day one.

Safe pre-launch posts:
- **Countdown posts:** "12 days until GTA 6" on the Reel cover template, made from your own graphics.
- **"Everything we know"** text posts (release date, platforms, pre-load on 10 Nov), with sources.
- **Questions for the community:** "First thing you're doing in GTA 6?" These build comments.
- **Clips from other games' campaigns you're already in** (for example, CoD MW4) to build the page's gaming audience.

Never post: **leaked or pre-release footage, "early unboxing" videos, cutscene compilations, story spoilers, cheats or mod menus.**
These are Rockstar takedown triggers and can get the account struck.

## 6. Launch week (19–26 Nov)

- Check Content Rewards and Vyro daily for streamer GTA 6 campaigns that are **Global**.
- Clip with `WantedHook` on chases and `ResultStamp` on the payoff ("PLAN FAILED", "STUNT LANDED").
- Keep the first 7 seconds free of violence (YouTube ads) and never post rampages against civilians (age restriction).
- Submit every live link in the campaign dashboard right away.

## Never

- Buy followers, views or likes, or join engagement pods. It tanks reach, and campaigns reverse payouts for botted views.
- Use a VPN or fake country to join region-locked campaigns.
