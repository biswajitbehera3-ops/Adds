#!/usr/bin/env bash
# Re-download the B-roll for Short 009 (Miami Is Turning Into Vice City) into remotion-overlays/public/miami/.
# Needs these hosts allowed: www.pexels.com, videos.pexels.com, images.pexels.com, media-rockstargames-com.akamaized.net
# (and upload.wikimedia.org for the optional Commons photos, which may rate-limit with HTTP 429).
set -euo pipefail
cd "$(dirname "$0")/../remotion-overlays/public"
mkdir -p miami/video
UA="Mozilla/5.0"
for id in 15689208 37461914 28779406 11094699 30679246 36032435 32438231 32438232 8576441 29086963 18010570 37788144 15999293 9620604 29408942; do
  out="miami/video/px-$id.mp4"; [ -s "$out" ] && continue
  loc=$(curl -sI -A "$UA" "https://www.pexels.com/download/video/$id/" | grep -i '^location' | tr -d '\r' | cut -d' ' -f2)
  curl -sfL -A "$UA" -o "$out" "$loc" && echo "ok $out"
done
for id in 32745108 32745107 39415145 32745106; do
  out="miami/px-photo-$id.jpg"; [ -s "$out" ] && continue
  curl -sf -A "$UA" -o "$out" "https://images.pexels.com/photos/$id/pexels-photo-$id.jpeg?w=3840" && echo "ok $out"
done
[ -s miami/festival-poster-rockstar.jpg ] || curl -sf -o miami/festival-poster-rockstar.jpg \
  https://media-rockstargames-com.akamaized.net/tina-uploads/posts/o39o87a435a25a/f14b9244ed05b99e611d0376ad7e0ec3b4f84aab.jpg
# Optional (CC-licensed, credit required — see credits list in scripts/009): Kaseya Center + Miami airport photos.
for pair in "kaseya-day|5/50/Kaseya_Center_Downtown_Miami_FL%2C_5_April_2024.jpg"; do
  name=${pair%%|*}; path=${pair#*|}; out="miami/$name.jpg"; [ -s "$out" ] && continue
  curl -sf -A "GTAFanChannelResearch/1.0" -o "$out" "https://upload.wikimedia.org/wikipedia/commons/$path" && echo "ok $out" || echo "skip $name (Commons refused; retry later)"
done
echo done
