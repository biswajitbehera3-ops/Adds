# Live client brief — Headtrixx

Carried over from the cloud session that set this project up. Read this before
doing any Headtrixx work.

## The brand

**Headtrixx**, Nagpur. Founders **Om Nandekar** and **Somnath Dhande**. India's hard-water
haircare specialist. Site: headtrixx.com. WhatsApp +91 81808 99884.

Products and real prices:

| Product | MRP | Sale |
|---|---|---|
| Advanced Hair Strengthening Bundle | ₹2,400 | ₹1,800 |
| Hard Water Hair Care Duo | ₹1,800 | ₹999 |
| Hard Water Defence Shampoo (200ml) | ₹1,011 | ₹899 |
| Hard Water Repair Conditioner | ₹999 | ₹850 |

Plus a Scalp Activation Serum (50ml). Free serum when the Duo is added; free shipping
over ₹1,999; 10% off two or more items.

The system is a **sequence**, not a bundle: chelating shampoo removes mineral deposits →
conditioner restores → serum shields.

## Their founder story, verbatim

> "The products were not the problem. The water was."

> "We kept asking — why is nobody talking about this? And then we realised, that silence
> was the opportunity."

> "Millions of Indians are solving the wrong problem every single morning."

> "It might be the 200 litres of hard water your hair is washed with every month."

Built deliberately for **Tier 2, 3 and 4 cities**, not metros. Their stated go-to-market is
education, not transformation reels.

## The gap

All four of their live Meta ads lead with a discount — "Limited-time 20% OFF",
"Shop Now & Get FLAT 20% Off". That only converts most-aware and product-aware buyers.

**Their advertising contradicts their own brand thesis.** They founded an education-first
company for an unaware audience, then bought ads that only reach people who already know.
Their ad headline also does not match their landing page headline, which is the congruence
leak worth 15-20% (ad-strategist Section 7.6).

## Competitive picture (Meta Ads Library, India)

| Brand | Active ads | Message |
|---|---|---|
| Bare Anatomy | 942 | B1G1 / B2G3 — pure discount |
| Traya | 647 | "results in 3 months" — **localised into Marathi** |
| Detoxie | 1 | 35% off — the only direct hard-water competitor, barely advertising |

Traya's Marathi localisation is the strongest signal in the dataset: nobody translates a
loser. The hard-water mechanism itself is **uncontested**.

Caveat: the API sorts by recency and exposes no spend data, so 30-day longevity could not
be verified. Volume, repetition and localisation are proxies.

## Claim discipline

Headtrixx's own label language is hedged — "helps reduce", "supports". Never write copy
that out-claims their label. The minerals **calcium, magnesium and iron** are safe to name;
they come from the brand's own product copy. Avoid timeframe promises without sign-off.

## Where the creative got to

Selected script: **"Pause This Video"**, 30s, five acts — showerhead test hook → doctor
names the three minerals → she researches and finds the product → the change → cinematic
product hero. The doctor never names the brand; she names the cause.

Open decisions:
1. Act 2 as one-directional (doctor states) or a real back-and-forth exchange.
2. Whether to run a cheap 480p `fast` calibration pass before a full render.

## Budget reality

Higgsfield balance **252.66** credits. Verified real costs:

- Images (`nano_banana_pro`): **2 credits** each
- Seedance 2.5 video: **65-143 credits** per run

That is two to four video generations total, with no room for retries. Quote with
`get_cost` before every run and wait for an explicit go-ahead, per CLAUDE.md.

## Two generated images, never inspected

Generated in the cloud session but never checked, because that container could not fetch
them back:

- Product hero: job `24d14637-ca4b-4cd5-bb6d-ca4b1df0e647`
- Two sisters: job `cc805865-4100-4309-93ae-8573b6958b8b`

Retrieve both with `show_generation_by_ids` and actually look. Check specifically: did the
real Headtrixx label survive or come back as gibberish, and do the two sisters read as two
distinct people rather than one averaged face.

## First job locally

Tear down a Traya ad with `ad-teardown`. Their hook is the most tested structure in the
category and the one worth stealing for Headtrixx.
