import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { ANTON, C, outline } from "./theme";

// 1280×720 thumbnails for video 006 (A/B test). One focal point, ≤3 words, high contrast.
const STAR = "M50 4 L61.8 37.6 L97.6 38.2 L69 59.8 L79.4 94 L50 73.6 L20.6 94 L31 59.8 L2.4 38.2 L38.2 37.6 Z";

export const Thumb006A: React.FC = () => (
  <AbsoluteFill style={{ background: C.night }}>
    <Img src={staticFile("frames/el-0606-slimjim.jpg")} style={{ position: "absolute", width: 1280 * 1.35, left: -60, top: -170, filter: "brightness(0.62) contrast(1.15) saturate(1.2)" }} />
    <AbsoluteFill style={{ background: "linear-gradient(90deg, rgba(7,7,12,0.85) 0%, rgba(7,7,12,0.2) 55%, rgba(7,7,12,0) 100%)" }} />
    <svg width={1280} height={720} style={{ position: "absolute", inset: 0 }}>
      {[70, 140, 210, 280].map((r, i) => <circle key={r} cx={330} cy={560} r={r} fill="none" stroke={C.red} strokeWidth={10 - i * 2} opacity={1 - i * 0.22} />)}
      <circle cx={330} cy={560} r={22} fill={C.red} />
    </svg>
    <div style={{ position: "absolute", left: 600, top: 70, width: 640, fontFamily: ANTON, fontSize: 150, lineHeight: 0.98, color: C.white, textShadow: outline(9) }}>
      YOUR CAR<br /><span style={{ color: C.red }}>SNITCHED</span>
    </div>
  </AbsoluteFill>
);

export const Thumb006B: React.FC = () => (
  <AbsoluteFill style={{ background: C.night }}>
    <Img src={staticFile("frames/el-1817-filmer.jpg")} style={{ position: "absolute", width: 1280 * 1.3, left: -380, top: -40, filter: "brightness(0.55) contrast(1.15) saturate(1.1)" }} />
    <AbsoluteFill style={{ background: "linear-gradient(0deg, rgba(7,7,12,0.9) 0%, rgba(7,7,12,0.1) 55%)" }} />
    <div style={{ position: "absolute", top: 40, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 18 }}>
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <svg key={i} viewBox="0 0 100 100" width={120} height={120} style={{ filter: i < 4 ? "drop-shadow(0 0 16px #fff)" : "none" }}>
          <path d={STAR} fill={i < 4 ? C.white : "none"} stroke={i < 4 ? "#000" : C.gold} strokeWidth={i < 4 ? 4 : 7} strokeLinejoin="round" />
        </svg>
      ))}
    </div>
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 40, textAlign: "center", fontFamily: ANTON, fontSize: 210, color: C.white, textShadow: outline(10) }}>
      THEY <span style={{ color: C.gold }}>KNOW</span>
    </div>
  </AbsoluteFill>
);
