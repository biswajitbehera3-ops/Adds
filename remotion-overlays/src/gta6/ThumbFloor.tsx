import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { ANTON } from "./theme";

// Thumbnail on Rockstar's official "Jason and Lucia Robbery" artwork (no-logo version, 3840×2160 → 1280×720).
// Layers: artwork → text ON THE GROUND (behind them) → cut-out characters (rembg BiRefNet, free) in front.
const ART = "frames/art-robbery.jpg";
const CUT = "frames/art-robbery-cut.png";
const full: React.CSSProperties = { position: "absolute", left: 0, top: 0, width: 1280, height: 720 };
const grade = "saturate(1.18) contrast(1.06)";

// Extruded 3D letters: stacked shadows give thickness, then a soft cast shadow.
const extrude = (depth: number, color: string) => {
  const s: string[] = [];
  for (let i = 1; i <= depth; i++) s.push(`${i * 0.6}px ${i}px 0 ${color}`);
  s.push(`${depth * 0.6 + 6}px ${depth + 10}px 18px rgba(20,0,40,0.6)`);
  return s.join(", ");
};

// A — painted on the asphalt in perspective: "DON'T GET" on the ground left of them, "CAUGHT" right of them.
const FloorWord: React.FC<{ text: string; color: string; glow: string; size: number; center: number; width: number; bottom?: number }> = ({ text, color, glow, size, center, width, bottom = -18 }) => (
  <div style={{ position: "absolute", left: center - width / 2, width, bottom, height: 240, perspective: 560, perspectiveOrigin: "50% 0%" }}>
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, textAlign: "center", transform: "rotateX(52deg)", transformOrigin: "50% 100%",
      fontFamily: ANTON, fontSize: size, lineHeight: 1, letterSpacing: 4, whiteSpace: "nowrap", color, textShadow: glow }}>{text}</div>
  </div>
);
export const ThumbFloorPaint: React.FC = () => (
  <AbsoluteFill style={{ overflow: "hidden", background: "#000" }}>
    <Img src={staticFile(ART)} style={{ ...full, filter: grade }} />
    <FloorWord text="DON'T GET" size={118} center={262} width={540} bottom={58} color="rgba(255,255,255,0.95)" glow="0 0 14px rgba(255,46,136,0.6), 3px 4px 0 rgba(60,20,90,0.55)" />
    <FloorWord text="CAUGHT" size={176} center={250} width={560} bottom={-26} color="rgba(255,46,136,0.97)" glow="0 0 24px rgba(255,46,136,0.85), 3px 4px 0 rgba(60,20,90,0.55)" />
    <Img src={staticFile(CUT)} style={{ ...full, filter: `${grade} drop-shadow(0 10px 18px rgba(30,0,50,0.55))` }} />
  </AbsoluteFill>
);

// B — giant 3D letters standing on the ground behind them (big enough to read on a phone).
export const ThumbFloorStand: React.FC = () => (
  <AbsoluteFill style={{ overflow: "hidden", background: "#000" }}>
    <Img src={staticFile(ART)} style={{ ...full, filter: grade }} />
    <div style={{ position: "absolute", left: 26, top: 268, fontFamily: ANTON, lineHeight: 0.9, letterSpacing: 2 }}>
      <div style={{ fontSize: 116, color: "#FFFFFF", textShadow: extrude(10, "#B3a7c9") }}>DON'T GET</div>
      <div style={{ fontSize: 178, color: "#FF2E88", textShadow: extrude(14, "#7a0f45") }}>CAUGHT</div>
    </div>
    <Img src={staticFile(CUT)} style={{ ...full, filter: `${grade} drop-shadow(0 10px 18px rgba(30,0,50,0.55))` }} />
  </AbsoluteFill>
);
