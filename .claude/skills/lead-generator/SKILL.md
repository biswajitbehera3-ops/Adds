---
name: lead-generator
description: Find small, founder-run product brands to sell AI creative services to — AI-generated ads, product visuals, and UGC-style AI video — and build a clean, ready-to-send lead list of real public company emails. Use this skill whenever the user wants to find clients or leads for AI creative, AI ads, AI creatives, product visuals, or UGC / AI-UGC video; build a prospect or lead list; do cold-outreach prospecting; or asks things like "who can I sell AI content to", "find me brands to pitch", "find me beverage/skincare/coffee brands to outreach to", or "build me a lead list" — even if they never say the word "skill". The skill researches the web itself and writes a CSV of small product brands, each with a public email, into the working folder.
---

# Lead Generator

This skill builds a cold-outreach lead list for selling AI creative services — AI-generated ads, product visuals, and UGC-style AI video. The target is always **small, founder-run brands that sell a physical product**, because a physical product is what AI creative makes look premium, and a small founder both feels that pain and can say yes without an agency in the way.

How it works: the user gives a **niche**, and optionally a **region** and a **count**, and you (Claude) do the web research yourself — searching, opening pages, and confirming emails. The output is a **CSV file** of matching small brands, each with a real public email, written into the working folder and ready to load into a cold-email tool. The skill stops at the list; the user sends from their own inbox or sequencer.

Work entirely from web search and page fetches. **Never open or control a browser or any app on the user's machine — search and fetch only.**

## Step 1: Know who you are looking for

The target is fixed: **small, founder-run brands that sell a physical product.** Lean small. A small brand publishes a real inbox a founder actually reads, has a genuine reason to pay for content, and has no agency in the way — that is the whole reason this works. Mid-size is the ceiling, not the goal. Stay on physical-product brands and do not drift into software, services, or B2B companies with nothing physical to show.

Quick size read — signals a brand is the right size: founder-led or a micro-team; sells regionally, direct, via local stores, or via crowdfunding; independent (not owned by a larger group). Treat things like follower counts as soft hints, not hard gates, and don't over-narrow — the goal is a healthy list of plausibly-small brands, not a perfect three.

Good source types, where these brands gather (richest for small first):
- **Local listings** (Google-Maps-style results reached by text search, e.g. "{niche} {city}", "{niche} manufaktur {region}") — the richest vein for genuinely small, local makers.
- **Crowdfunding** on Kickstarter, Indiegogo, and Startnext — founders launching right now. Great for *finding* tiny brands, but many publish an email only on their own site, so follow each campaign through to that site.
- **Online stores on Shopify**, already selling but usually with flat static photos.
- **Startup directories** like Y Combinator — keep only the consumer physical-product ones.
- **Regional "best small {niche}" roundups** and local blogs.

Avoid national "best {niche} brands" lists — they surface big, agency-managed names, which are exactly the ones you would drop.

The user can narrow by **niche + region**, for example "skincare brands in southern Germany" or "coffee roasters in Austin." A region is the single best filter for finding small brands, so if the user gives one, use it. If they give only a niche, search broadly — but still keep the focus on small (at most mid-size) companies.

## Step 2: Collect the leads

Do this yourself with web search. Never answer from memory, and never invent or pattern-guess an email or any fact about a company. If you cannot find a real email on a citable page, leave it blank.

Search concretely, working source by source — local listings and crowdfunding first, since those surface the smallest brands:
- **Local:** queries like "{niche} {city}" / "{niche} manufaktur {region}", and pull brands with a real product and a published email.
- **Crowdfunding:** browse the relevant category, filtered to the region when given, and follow campaigns to the founder's own site.
- **Shopify / online stores:** "{niche} Shopify store", "best small {niche} brands {region}" roundups, then open each brand's own site.
- **Y Combinator:** search the directory for the niche; keep only consumer physical-product companies.

For each brand, open its **own official site** (confirm it is the company's site, not a press article or directory) and pull the email from a real, citable page — the contact page, about page, or footer. Capture exactly:
- **Company Name**
- **Website URL**
- **Email** — a real public address. A generic inbox (`hello@`, `info@`, `contact@`) is perfectly fine; for a small brand that inbox is the founder.
- **Description** — three sentences about the **business** (what the company is and does), not a pitch for the product.

**Volume:** aim for the count the user asks for. If they give no number, target roughly 20–40 solid rows. Keep working through the sources until you hit the target or the niche is genuinely exhausted — do not stop at the first handful. Never pad the list with guessed addresses.

## Step 3: Clean for fit

A raw list always carries noise. Remove it — a smaller list of the right brands beats a large list of the wrong ones:

- **Run the ownership check first — the most important filter.** Drop any brand owned by a larger group or parent company, even if the brand itself looks small. A "small" label owned by a big group already has its creative handled. Check who actually owns and runs it before keeping it.
- Drop **very large or well-known brands** that already have agencies — they will not hire a freelancer.
- Drop anything **off-profile** — software, services, and anything with no physical product to show.
- Drop **true service businesses** like spas, salons, clinics, law firms, and dealerships. Match on whole words so a "PowerBank" is not mistaken for a bank and a "Workspace" is not mistaken for a spa.
- Drop **dead-end department addresses** such as legal@, careers@, jobs@, hr@, pr@, and press@. If the company is a good fit, look for a better inbox like hello@ or info@ on the same domain before dropping it.
- Where a description exists, prefer **distinctive, visual, design-led products** — the easiest to sell AI creative to.
- **Deduplicate** within the run by website domain first, then by email, so the same brand appears once.
- **Apply a suppression list if one exists:** if the working folder holds a file of already-contacted domains or emails (for example a previous CSV from this skill), exclude those so the same brand is never surfaced twice across runs.

**Finally, drop every row that has no email.** A blank-email row errors on import into the cold-email tool, so it does not belong in the output. You may still report how many brands you found but had to drop for a missing email.

## Step 4: Output the CSV file

Write a real `.csv` file **directly into the working folder** — do not produce an Excel file, and do not stop to ask the user for a download. Use one consistent column schema with a header row:

`Company Name, Website URL, Email, Description`

Every row must have an email (the blank ones were dropped in Step 3). Save it under the working directory with a descriptive name so the user knows what the list is, for example `leads-beverage-bavaria.csv` or `leads-skincare-austin.csv`. Then report the counts: how many brands you found in total, and how many made the final list (i.e. had a usable email).

## Guardrails

- Gather only contact details a business has chosen to publish. This is normal prospecting, not anything covert.
- Never fabricate an email or a fact about a company. A blank cell is fine — and those rows are dropped before output, so a guessed address never reaches the file.
- Work **search-and-fetch only** — never open or control a browser or any app on the user's machine.
- This skill builds the list only. Sending happens in the user's own tool — when they get there, remind them to send in small daily batches from warmed inboxes, keep one link and a plain-text style, and include an opt-out and a business address so the outreach stays compliant and out of spam.
