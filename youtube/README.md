# YouTube skills state

The 11 `yt-*` skills in `.claude/skills/` (vendored from Jakeschincariol/youtube-agent-skill, MIT, commit a2feb21) read their
state from `~/.claude/youtube/`. That folder doesn't survive a cloud container reset, so the durable copy is this folder.

```bash
mkdir -p ~/.claude/youtube && cp youtube/*.md ~/.claude/youtube/          # session start
cp ~/.claude/youtube/*.md youtube/                                         # after edits
```

The skills write only. They never upload, log in, or touch YouTube Studio. Python tools need only Python 3:

```bash
python3 .claude/skills/yt-script/hookscore.py --hook "one line"
python3 .claude/skills/yt-package/title.py --title "..." --thumb "..."
python3 .claude/skills/yt-edit/deadair.py transcript.srt
python3 .claude/skills/yt-chapters/chapters.py transcript.srt
python3 .claude/skills/yt-retention/retention.py retention.csv
python3 .claude/skills/yt-viral/swipe.py collected.json --min 2.0
```

How they fit with what's already here:
- `production/style-guide.md` stays the quality standard; `yt-script` hooks/scores are a second check, not a replacement.
- `yt-shorts` picks Short moments from a transcript; `whoop-clipper` / `video-use` / `remotion-overlays` do the actual cut.
- `yt-edit` needs a transcript. There is no transcription key in this environment (ElevenLabs was declined), so use YouTube's
  auto-captions (.srt from Studio) or Firecrawl transcripts of published videos.
