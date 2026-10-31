#!/usr/bin/env bash
# One step: start the scraper, search the 33 Bhubaneswar salon terms, rank, write the phone PDF.
# Needs Docker and access to Google Maps. Output goes to founder/leads/ (git-ignored: personal data).
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"; KIT="$HERE/../../tools/google-maps-scraper-kit"; OUT="$HERE/../leads"
mkdir -p "$OUT"
cd "$KIT" && docker compose up -d && sleep 10
python3 scripts/scrape.py --keywords-file "$HERE/bbsr-salons.txt" --city "Bhubaneswar, Odisha" \
  --depth 5 --min-rating 4.3 --min-reviews 150 --has-phone --socials --tech \
  --fields "title,phone,emails,website,category,address,review_rating,review_count,open_hours,popular_times,place_id" \
  --out "$OUT/bhubaneswar-salons.csv"
python3 "$HERE/rank_salons.py" "$OUT/bhubaneswar-salons.csv" --top 20 --out "$OUT/first-20-salons.pdf"
