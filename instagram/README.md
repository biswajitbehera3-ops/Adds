# Instagram skills — guide

13 Instagram skills are installed in `.claude/skills/ig-*` (from
[Jakeschincariol/instagram-agent-skill](https://github.com/Jakeschincariol/instagram-agent-skill), MIT).
They write and score content. They **never post, log in, or ask for your password**.

## The commands

| Command | What it does for the clipping channel |
|---|---|
| `/ig-reel` | Writes and **scores hooks** from 26 proven formulas, and times the script line by line. |
| `/ig-viral` | Finds reels that are working in your niche and ranks them by how far each beat its account's usual views, not raw views. |
| `/ig-caption` | Writes the caption and shows what people see before the "... more" cut. Enforces Instagram's **5-hashtag limit**. |
| `/ig-human` | Strips wording that sounds AI-written and gives the text a "sounds human" score. |
| `/ig-repurpose` | Turns one long video into a week of reels and carousels. |
| `/ig-plan` | Weekly plan: what to post, when, and which accounts to engage with. |
| `/ig-profile` | Scores the profile out of 100 and rewrites the bio and other weak spots. |
| `/ig-audit` | Reads past post stats and says what worked and what to stop doing. |
| `/ig-carousel` | Carousel cover, slide copy and 1080×1350 files. |
| `/ig-story` | Daily story sequence and which stickers to use. |
| `/ig-comment` | Comments on other people's posts that read like a real person. |
| `/ig-reply` | Replies to comments under your own posts, sorted by which are worth answering. |
| `/ig-dm` | DMs, collab pitches and follow-ups. |

## The workflow for each clip

1. **`whoop-clipper`** picks and cuts the MrBeast moment.
2. **`/ig-reel`** scores the hook and times the clip.
3. **`/ig-caption`** writes the caption.
4. **`/ig-human`** cleans up the caption.
5. **You post it**, then submit the link to Vyro.

## Example hook scores (from the test run)

```
87.0 STRONG  Nobody tells you the first 30 clips are supposed to flop
58.2 OK      MrBeast gave one stranger $100,000 to beat LeBron at one shot...
 9.6 WEAK    Hey guys, today I wanted to talk about MrBeast   <- "Greeting. Nobody came to the feed to be greeted."
```

## Limits to know

- **It never posts for you.** That's on purpose: automated posting breaks Instagram's rules
  and gets accounts blocked. It writes the post; you copy and post it yourself.
- **The hook scorer catches weak hooks but can't pick the winner.** The author says so himself:
  choosing between two decent hooks is close to a coin flip. Use it to cut weak hooks, then go
  by your real retention numbers.
- **The humanizer isn't perfect.** In testing it left a stray "nerve.!" behind. Always read its
  output before posting.

## Your voice file

Fill in `instagram/voice.md` (about 10 minutes), or send Claude 3 reels you like and ask it to
write the file. Every Instagram skill reads it.

The skills look for their files in `~/.claude/instagram/` (`voice.md`, `plan.md`, `swipe.md`,
`log.md`). The cloud workspace resets, so the master copy lives in this `instagram/` folder.
At the start of each session, copy it in:

```bash
mkdir -p ~/.claude/instagram && cp instagram/*.md ~/.claude/instagram/
```

After the skills update those files, copy them back here and commit:

```bash
cp ~/.claude/instagram/*.md instagram/
```
