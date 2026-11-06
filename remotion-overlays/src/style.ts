import { loadFont } from "@remotion/google-fonts/Anton";

export const { fontFamily } = loadFont("normal", {
  weights: ["400"],
  subsets: ["latin"],
});

export const GREEN = "#3CFF6B";
export const RED = "#FF3B3B";

// Thick outline that survives bright footage (stacked shadows, not -webkit-text-stroke,
// which renders thin in headless Chromium).
export const outline = (px: number, color = "#000") => {
  const out: string[] = [];
  for (let a = 0; a < 360; a += 30) {
    const r = (a * Math.PI) / 180;
    out.push(
      `${(Math.cos(r) * px).toFixed(1)}px ${(Math.sin(r) * px).toFixed(1)}px 0 ${color}`,
    );
  }
  return out.join(", ");
};
