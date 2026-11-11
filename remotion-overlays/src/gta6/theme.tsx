import { loadFont as loadAnton } from "@remotion/google-fonts/Anton";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";
import React from "react";
import { AbsoluteFill, Img, staticFile, useVideoConfig } from "remotion";

// Brand system from production/style-guide.md
export const C = {
  night: "#07070C",
  pink: "#FF2E88",
  blue: "#1FB8FF",
  gold: "#FFC93C",
  green: "#3CFF6B",
  red: "#FF3B3B",
  amber: "#FFB020",
  white: "#FFFFFF",
};

export const ANTON = loadAnton("normal", { weights: ["400"], subsets: ["latin"] }).fontFamily;
export const INTER = loadInter("normal", { weights: ["500", "700", "800"], subsets: ["latin"] }).fontFamily;
export const MONO = loadMono("normal", { weights: ["500", "700"], subsets: ["latin"] }).fontFamily;

// Thick outline that survives bright footage (stacked shadows; -webkit-text-stroke renders thin headless).
export const outline = (px: number, color = "#000") => {
  const out: string[] = [];
  for (let a = 0; a < 360; a += 30) {
    const r = (a * Math.PI) / 180;
    out.push(`${(Math.cos(r) * px).toFixed(1)}px ${(Math.sin(r) * px).toFixed(1)}px 0 ${color}`);
  }
  return out.join(", ");
};

export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/**
 * Every graphic is authored on a 1920×1080 grid and scaled to the composition size,
 * so the same component renders crisp at 1080p previews and the 3840×2160 master.
 * `bg` (a file in public/) is for previews only; leave it empty to render a transparent overlay.
 */
export const Stage: React.FC<{ bg?: string; dim?: number; children: React.ReactNode }> = ({ bg, dim = 0, children }) => {
  const { width, height } = useVideoConfig();
  const s = width / 1920;
  return (
    <AbsoluteFill>
      {bg ? <Img src={staticFile(bg)} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : null}
      {bg && dim > 0 ? <AbsoluteFill style={{ background: `rgba(7,7,12,${dim})` }} /> : null}
      <div style={{ position: "absolute", left: 0, top: 0, width: 1920, height: 1080 * (height / (width * 9 / 16)), transform: `scale(${s})`, transformOrigin: "0 0" }}>
        {children}
      </div>
    </AbsoluteFill>
  );
};

export const TIER = {
  CONFIRMED: C.green,
  REPORTED: C.blue,
  THEORY: C.amber,
} as const;
export type Tier = keyof typeof TIER;
