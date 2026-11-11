import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { ANTON, C } from "./theme";

// 1280×720 thumbnails for video 006 (A/B test). Built on Rockstar's official "Jason and Lucia Robbery" artwork (no-logo version):
// bright, one big focal subject, ≤3 words in solid colour blocks — the style the top GTA 6 videos use.
const STAR = "M50 4 L61.8 37.6 L97.6 38.2 L69 59.8 L79.4 94 L50 73.6 L20.6 94 L31 59.8 L2.4 38.2 L38.2 37.6 Z";
const ART = "frames/art-robbery.jpg"; // 3840×2160

const Block: React.FC<{ text: string; bg: string; color: string; size: number; rot?: number }> = ({ text, bg, color, size, rot = -3 }) => (
  <div style={{ display: "inline-block", background: bg, color, fontFamily: ANTON, fontSize: size, lineHeight: 1, padding: "10px 26px 6px",
    transform: `rotate(${rot}deg)`, boxShadow: "8px 8px 0 rgba(0,0,0,0.85)", letterSpacing: 1 }}>{text}</div>
);

const PoliceGlow: React.FC = () => (
  <AbsoluteFill style={{ background: "radial-gradient(circle at 0% 0%, rgba(255,40,60,0.55) 0%, rgba(255,40,60,0) 38%), radial-gradient(circle at 100% 0%, rgba(30,120,255,0.55) 0%, rgba(30,120,255,0) 38%)", mixBlendMode: "screen" }} />
);

const Stars: React.FC<{ lit: number; size: number; hollowColor?: string }> = ({ lit, size, hollowColor = C.gold }) => (
  <div style={{ display: "flex", gap: size * 0.12 }}>
    {[0, 1, 2, 3, 4, 5].map((i) => (
      <svg key={i} viewBox="0 0 100 100" width={size} height={size} style={{ filter: "drop-shadow(3px 4px 0 rgba(0,0,0,0.85))" }}>
        <path d={STAR} fill={i < lit ? "#fff" : "none"} stroke={i < lit ? "#000" : hollowColor} strokeWidth={i < lit ? 5 : 8} strokeLinejoin="round" />
      </svg>
    ))}
  </div>
);

// A — "DON'T GET CAUGHT": both of them masking up, text blocks on the left.
export const Thumb006A: React.FC = () => (
  <AbsoluteFill style={{ background: C.night, overflow: "hidden" }}>
    <Img src={staticFile(ART)} style={{ position: "absolute", width: 2432, left: -700, top: -30, filter: "saturate(1.25) contrast(1.08)" }} />
    <AbsoluteFill style={{ background: "linear-gradient(0deg, rgba(20,8,40,0.7) 0%, rgba(20,8,40,0.15) 45%, rgba(20,8,40,0) 60%)" }} />
    <PoliceGlow />
    <div style={{ position: "absolute", left: 36, top: 34 }}><Stars lit={6} size={64} /></div>
    <div style={{ position: "absolute", left: 30, bottom: 40, display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 22 }}>
      <Block text="DON'T GET" bg="#FFFFFF" color="#0B0B10" size={112} />
      <Block text="CAUGHT" bg={C.pink} color="#FFFFFF" size={170} rot={-4} />
    </div>
  </AbsoluteFill>
);

// B — "THEY KNOW": tight on Lucia's masked face, hollow stars + text on the right.
export const Thumb006B: React.FC = () => (
  <AbsoluteFill style={{ background: C.night, overflow: "hidden" }}>
    <Img src={staticFile(ART)} style={{ position: "absolute", width: 4992, left: -2250, top: -230, filter: "saturate(1.25) contrast(1.1)" }} />
    <AbsoluteFill style={{ background: "linear-gradient(270deg, rgba(20,8,40,0.8) 0%, rgba(20,8,40,0.35) 40%, rgba(20,8,40,0) 58%)" }} />
    <PoliceGlow />
    <div style={{ position: "absolute", right: 46, top: 60, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 24 }}>
      <Stars lit={4} size={74} />
      <Block text="THEY" bg="#FFFFFF" color="#0B0B10" size={150} rot={3} />
      <Block text="KNOW" bg={C.gold} color="#0B0B10" size={190} rot={-3} />
    </div>
  </AbsoluteFill>
);

// PRO — the "ALL GANGS" technique on a real 4K game frame (Trailer 1, 1:09): background frame, then huge text,
// then the cut-out characters (rembg / BiRefNet, free) placed IN FRONT of the text for depth. No AI imagery.
const FRAME = "frames/c5-t1-lucia-mask.jpg"; // 3840×2160
const CUT = "frames/c5-cut.png";             // same size, transparent background
const SCALE = 1280 / 3840 * 1.12;            // slight zoom-in
const OX = -250, OY = -30;
const layer: React.CSSProperties = { position: "absolute", left: OX, top: OY, width: 3840 * SCALE, height: 2160 * SCALE };

export const Thumb006Pro: React.FC = () => (
  <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
    {/* 1. background frame, darker + cooler so the people pop */}
    <Img src={staticFile(FRAME)} style={{ ...layer, filter: "brightness(0.55) contrast(1.15) saturate(1.15) blur(2px)" }} />
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at 45% 55%, rgba(0,0,0,0) 30%, rgba(0,0,0,0.7) 100%)" }} />
    {/* police light spill */}
    <AbsoluteFill style={{ background: "radial-gradient(circle at -5% 30%, rgba(255,30,50,0.65) 0%, rgba(255,30,50,0) 45%), radial-gradient(circle at 105% 30%, rgba(30,110,255,0.65) 0%, rgba(30,110,255,0) 45%)", mixBlendMode: "screen" }} />
    {/* 2. the text, BEHIND the people */}
    <div style={{ position: "absolute", right: 26, top: 6, fontFamily: ANTON, fontSize: 124, lineHeight: 1, color: "#FFFFFF", letterSpacing: 1,
      textShadow: "0 0 0 #000, 5px 6px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000" }}>DON'T GET</div>
    <div style={{ position: "absolute", right: 20, top: 112, fontFamily: ANTON, fontSize: 246, lineHeight: 0.95, color: "#FF2222", letterSpacing: 2,
      textShadow: "6px 8px 0 #000, -3px -3px 0 #000, 3px -3px 0 #000, -3px 3px 0 #000, 0 0 40px rgba(255,0,0,0.45)" }}>CAUGHT</div>
    {/* 3. cut-out characters IN FRONT of the text, brightened, with a soft rim light */}
    <Img src={staticFile(CUT)} style={{ ...layer, filter: "brightness(1.45) contrast(1.15) saturate(1.3) drop-shadow(0 0 3px rgba(255,255,255,0.75)) drop-shadow(0 12px 22px rgba(0,0,0,0.75))" }} />
    {/* 4. small wanted stars, bottom-right */}
    <div style={{ position: "absolute", right: 30, bottom: 30 }}><Stars lit={6} size={60} /></div>
  </AbsoluteFill>
);
