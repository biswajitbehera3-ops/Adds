// WCAG 2.2 contrast check for the colour pairs the app (and the chosen palettes) actually use.
// Body text needs 4.5:1 (AA); large text (≥18pt, or ≥14pt bold) and UI parts need 3:1.
const hex = (h) => h.replace("#", "").match(/../g).map((x) => parseInt(x, 16) / 255);
const lin = (c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const lum = (h) => { const [r, g, b] = hex(h).map(lin); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
const mix = (fg, bg, a) => "#" + hex(fg).map((c, i) => Math.round((c * a + hex(bg)[i] * (1 - a)) * 255).toString(16).padStart(2, "0")).join("");
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
const pairs = [
  // current app (grooming-tin tokens)
  ["ink on paper", "#2A1710", "#F3E8D6", 4.5],
  ["inkMuted on paper", "#6B4A39", "#F3E8D6", 4.5],
  ["seal on paper", "#A0471A", "#F3E8D6", 4.5],
  ["positive on paper", "#3F6B3A", "#F3E8D6", 4.5],
  ["danger on paper", "#9B2C1F", "#F3E8D6", 4.5],
  ["cream on choc", "#F3E8D6", "#2A1710", 4.5],
  ["creamMuted on choc", "#C9B49A", "#2A1710", 4.5],
  ["sealBright on choc", "#E07A3F", "#2A1710", 4.5],
  ["seal button text (cream on seal)", "#F3E8D6", "#A0471A", 4.5],
  // Vulcanico / Noturno palette
  ["Vulcanico on Noturno", "#FF4103", "#001621", 4.5],
  ["Noturno on Vulcanico", "#001621", "#FF4103", 4.5],
  ["Vulcanico border on Noturno (UI, 3:1)", "#FF4103", "#001621", 3],
];
let fail = 0;
for (const [name, fg, bg, need] of pairs) {
  const r = ratio(fg, bg);
  const ok = r >= need;
  if (!ok) fail++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${r.toFixed(2)}:1  (needs ${need})  ${name}  ${fg} on ${bg}`);
}
process.exitCode = fail ? 1 : 0;
