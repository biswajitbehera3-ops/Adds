# Running this project locally

The skills in this repo work anywhere Claude Code runs. Running locally instead of
in a cloud session removes the network restrictions that block live web pages and
video downloads.

## 1. Clone

```bash
git clone https://github.com/biswajitbehera3-ops/Adds.git
cd Adds
```

## 2. Install Claude Code

Follow the install for your platform at https://claude.com/claude-code, then start
a session from inside the repo:

```bash
claude
```

## 3. Skills load themselves

`.claude/skills/` is read automatically on startup — nothing to install. Confirm with
`/skills`. Nine should be listed:

| Skill | Job |
|---|---|
| `ad-strategist` | research, angles, psychology, algorithm, outreach |
| `lead-generator` | builds a CSV lead list of founder-run product brands |
| `story-bible-builder` | locks a recurring character across a campaign |
| `banana-pro-director-30` | image prompts — face locks, outfits, scene plates |
| `ugc` | guided 15s UGC selfie-review ad |
| `cinema-director-v3` | full Seedance 2.0/2.5 video prompt engine |
| `seedance-clean` | single-shot Seedance prompts |
| `seedance-multishot-prompter` | multi-reference Seedance sequences |
| `yt-dlp` | downloads competitor ad videos for transcription |

`CLAUDE.md` is read automatically too, so the pipeline order and the
generation cost policy apply from the first message.

## 4. Connect the MCP servers

Sign in with the same account used on claude.ai and run `/mcp` to see which
servers came across. Four matter here:

| Server | What it does |
|---|---|
| Higgsfield | generates the images and videos |
| Meta Ads | Ad Library research, benchmarks, campaign tools |
| Firecrawl | reads live brand pages and landing pages |
| GitHub | repository access |

Anything missing can be added directly, for example:

```bash
claude mcp add --transport http firecrawl https://mcp.firecrawl.dev/v2/mcp-oauth
```

Never put an API key in a server URL or paste one into chat — use the client's
secret/header setting.

## 5. Install the yt-dlp dependencies

```bash
pip install yt-dlp
# macOS
brew install ffmpeg
# Debian/Ubuntu
sudo apt install ffmpeg
```

## What changes locally

A cloud session reaches only GitHub, package registries and MCP endpoints. Locally
there is no egress proxy, so:

- **Live brand pages open directly** — `WebFetch` works on any site, not just what
  a search index has crawled.
- **Competitor ad videos download and transcribe** — this is the `ad-strategist`
  brand-research step that a cloud session cannot complete.
- **Generated images and videos can be viewed** — a cloud session cannot fetch its
  own Higgsfield results back to inspect them.

MCP-based work — Higgsfield generation, Meta Ads research — behaves the same in
both places, because those calls run on the provider's infrastructure either way.
