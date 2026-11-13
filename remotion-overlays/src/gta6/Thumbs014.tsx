import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { ANTON, C } from "./theme";

// 1280×720 thumbnails for video 014 "GTA 6 vs GTA 5: 12 Things Rockstar Changed" (A/B test).
// Built on Rockstar's official "Jason and Lucia Robbery" artwork (art © Rockstar Games) + its free rembg cut-out.
// Thumbnail text never repeats the title (linted with yt-package/title.py: 100/100 for both).
const ART = "frames/art-robbery.jpg";      // 3840×2160
const CUT = "frames/art-robbery-cut.png";  // same size, transparent; people span x 1461–3259

const Block: React.FC<{ text: string; bg: string; color: string; size: number; rot?: number }> = ({ text, bg, color, size, rot = -3 }) => (
  <div style={{ display: "inline-block", background: bg, color, fontFamily: ANTON, fontSize: size, lineHeight: 1, padding: "10px 26px 6px",
    transform: `rotate(${rot}deg)`, boxShadow: "8px 8px 0 rgba(0,0,0,0.85)", letterSpacing: 1 }}>{text}</div>
);

// Angel (halo + wings) and devil (horns + tail) badges — our own vector icons.
const Angel: React.FC<{ size: number }> = ({ size }) => (
  <svg viewBox="0 0 100 100" width={size} height={size} style={{ filter: "drop-shadow(4px 5px 0 rgba(0,0,0,0.85))" }}>
    <circle cx="50" cy="50" r="46" fill="#FFFFFF" stroke="#000" strokeWidth="5" />
    <ellipse cx="50" cy="26" rx="22" ry="7" fill="none" stroke={C.gold} strokeWidth="6" />
    <circle cx="50" cy="56" r="17" fill={C.gold} stroke="#000" strokeWidth="4" />
    <path d="M30 60 Q12 50 16 34 Q26 46 34 52 Z M70 60 Q88 50 84 34 Q74 46 66 52 Z" fill="#DDEBFF" stroke="#000" strokeWidth="3" />
  </svg>
);
const Devil: React.FC<{ size: number }> = ({ size }) => (
  <svg viewBox="0 0 100 100" width={size} height={size} style={{ filter: "drop-shadow(4px 5px 0 rgba(0,0,0,0.85))" }}>
    <circle cx="50" cy="50" r="46" fill="#FF2222" stroke="#000" strokeWidth="5" />
    <path d="M28 40 L22 12 L42 32 Z M72 40 L78 12 L58 32 Z" fill="#7A0000" stroke="#000" strokeWidth="3" />
    <circle cx="50" cy="56" r="20" fill="#B30000" stroke="#000" strokeWidth="4" />
    <path d="M40 52 L46 56 M60 52 L54 56" stroke="#FFC93C" strokeWidth="5" strokeLinecap="round" />
    <path d="M40 66 Q50 72 60 66" stroke="#000" strokeWidth="4" fill="none" strokeLinecap="round" />
  </svg>
);

// A meter from angel to devil with the needle pinned near the devil end.
const Meter: React.FC<{ w: number }> = ({ w }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
    <Angel size={92} />
    <div style={{ position: "relative", width: w, height: 30, borderRadius: 15, border: "5px solid #000",
      background: `linear-gradient(90deg, #FFFFFF 0%, ${C.gold} 45%, #FF2222 100%)`, boxShadow: "6px 6px 0 rgba(0,0,0,0.85)" }}>
      <div style={{ position: "absolute", left: w * 0.84, top: -22, width: 14, height: 64, background: "#000", borderRadius: 4,
        border: "3px solid #fff" }} />
    </div>
    <Devil size={92} />
  </div>
);

const layer = (scale: number, ox: number, oy: number): React.CSSProperties =>
  ({ position: "absolute", left: ox, top: oy, width: 3840 * scale, height: 2160 * scale });

// A — "IT JUDGES YOU": the two leads big on the right, the angel ↔ devil meter + text on the left.
export const Thumb014A: React.FC = () => {
  const L = layer(0.5, -330, -20);
  return (
    <AbsoluteFill style={{ background: C.night, overflow: "hidden" }}>
      <Img src={staticFile(ART)} style={{ ...L, filter: "brightness(0.5) saturate(1.2) blur(3px)" }} />
      <AbsoluteFill style={{ background: "linear-gradient(90deg, rgba(10,4,24,0.92) 0%, rgba(10,4,24,0.55) 42%, rgba(10,4,24,0) 62%)" }} />
      <AbsoluteFill style={{ background: "radial-gradient(circle at 100% 100%, rgba(255,34,34,0.55) 0%, rgba(255,34,34,0) 45%), radial-gradient(circle at 60% 0%, rgba(255,201,60,0.35) 0%, rgba(255,201,60,0) 40%)", mixBlendMode: "screen" }} />
      <Img src={staticFile(CUT)} style={{ ...L, filter: "brightness(1.2) contrast(1.1) saturate(1.25) drop-shadow(0 0 3px rgba(255,255,255,0.7)) drop-shadow(0 14px 24px rgba(0,0,0,0.8))" }} />
      <div style={{ position: "absolute", left: 34, top: 60 }}><Meter w={250} /></div>
      <div style={{ position: "absolute", left: 30, bottom: 44, display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 20 }}>
        <Block text="IT JUDGES" bg="#FFFFFF" color="#0B0B10" size={118} />
        <Block text="YOU" bg="#FF2222" color="#FFFFFF" size={200} rot={-4} />
      </div>
    </AbsoluteFill>
  );
};

// B — "OLD HABITS DIE": left third is a grey "2013" panel with a red cross, right two-thirds the neon 2026 artwork.
export const Thumb014B: React.FC = () => {
  const L = layer(0.42, -150, -40);
  return (
    <AbsoluteFill style={{ background: C.night, overflow: "hidden" }}>
      <Img src={staticFile(ART)} style={{ ...L, filter: "saturate(1.3) contrast(1.08)" }} />
      <div style={{ position: "absolute", left: 0, top: 0, width: 420, height: 720, background: "#2A2A2E",
        borderRight: "10px solid #000", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
        <div style={{ fontFamily: ANTON, fontSize: 210, color: "#7A7A80", lineHeight: 1 }}>2013</div>
        <svg viewBox="0 0 100 100" width={360} height={360} style={{ position: "absolute" }}>
          <path d="M12 12 L88 88 M88 12 L12 88" stroke="#FF2222" strokeWidth="13" strokeLinecap="round" />
        </svg>
      </div>
      <Img src={staticFile(CUT)} style={{ ...L, filter: "brightness(1.12) contrast(1.08) saturate(1.3) drop-shadow(0 12px 22px rgba(0,0,0,0.8))" }} />
      <div style={{ position: "absolute", right: 24, bottom: 34, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 16 }}>
        <Block text="OLD HABITS" bg="#FFFFFF" color="#0B0B10" size={100} rot={3} />
        <Block text="DIE" bg={C.pink} color="#FFFFFF" size={180} rot={-3} />
      </div>
    </AbsoluteFill>
  );
};

// C — COMPARISON (v2 main): left, grey 2013 panel with three generic silhouettes (our illustration = GTA 5's three leads);
// right, Rockstar's Launch Trailer 0:41 frame of Jason & Lucia (official 4K master). VS badge on the seam, angel ↔ devil meter,
// "IT JUDGES YOU". Text ≠ title words (title.py 100/100).
const LT = "frames/lt-41.5.jpg"; // 3840×2160, picture rows 120–2039

const Person: React.FC<{ x: number; s: number }> = ({ x, s }) => (
  <svg viewBox="0 0 100 200" width={100 * s} height={200 * s} style={{ position: "absolute", left: x, bottom: 0 }}>
    <circle cx="50" cy="38" r="26" fill="#5A5A60" stroke="#1A1A1E" strokeWidth="4" />
    <path d="M8 200 L14 104 Q18 74 50 72 Q82 74 86 104 L92 200 Z" fill="#4A4A50" stroke="#1A1A1E" strokeWidth="4" />
  </svg>
);

export const Thumb014C: React.FC = () => {
  const s = 0.36; // frame scale (both leads in frame)
  const SEAM = 470;
  return (
    <AbsoluteFill style={{ background: C.night, overflow: "hidden" }}>
      {/* right: the GTA 6 frame */}
      <Img src={staticFile(LT)} style={{ position: "absolute", width: 3840 * s, height: 2160 * s, left: 330, top: -120 * s,
        filter: "saturate(1.35) contrast(1.12) brightness(1.05)" }} />
      <AbsoluteFill style={{ background: "linear-gradient(0deg, rgba(10,4,24,0.75) 0%, rgba(10,4,24,0) 40%)" }} />
      {/* left: grey 2013 panel, slanted seam */}
      <div style={{ position: "absolute", left: 0, top: 0, width: SEAM + 70, height: 720, background: "linear-gradient(160deg, #3A3A40 0%, #222226 100%)",
        clipPath: `polygon(0 0, 100% 0, ${SEAM - 10}px 100%, 0 100%)`, borderRight: "8px solid #000" }}>
        <div style={{ position: "absolute", left: 34, top: 40, fontFamily: ANTON, fontSize: 110, color: "#8A8A90", lineHeight: 1 }}>2013</div>
        <div style={{ position: "absolute", left: 30, bottom: 0, width: 420, height: 360, filter: "grayscale(1)" }}>
          <Person x={0} s={1.5} /><Person x={130} s={1.75} /><Person x={270} s={1.5} />
        </div>
        <svg viewBox="0 0 100 100" width={300} height={300} style={{ position: "absolute", left: 70, top: 300 }}>
          <path d="M14 14 L86 86 M86 14 L14 86" stroke="#FF2222" strokeWidth="12" strokeLinecap="round" />
        </svg>
      </div>
      <svg width="1280" height="720" style={{ position: "absolute", left: 0, top: 0 }}>
        <line x1={SEAM + 70} y1={0} x2={SEAM - 10} y2={720} stroke="#000" strokeWidth={14} />
        <line x1={SEAM + 70} y1={0} x2={SEAM - 10} y2={720} stroke={C.gold} strokeWidth={6} />
      </svg>
      {/* VS badge on the seam */}
      <div style={{ position: "absolute", left: SEAM - 40, top: 300, width: 130, height: 130, borderRadius: 65, background: C.gold, border: "7px solid #000",
        display: "flex", alignItems: "center", justifyContent: "center", fontFamily: ANTON, fontSize: 74, color: "#000", boxShadow: "6px 6px 0 rgba(0,0,0,0.85)" }}>VS</div>
      <div style={{ position: "absolute", right: 30, top: 34, fontFamily: ANTON, fontSize: 110, color: "#FFFFFF", lineHeight: 1,
        textShadow: "5px 6px 0 #000, 0 0 30px rgba(255,46,136,0.6)" }}>2026</div>
      {/* meter + text */}
      <div style={{ position: "absolute", right: 34, bottom: 172, transform: "scale(0.82)", transformOrigin: "right bottom" }}><Meter w={230} /></div>
      <div style={{ position: "absolute", right: 26, bottom: 30 }}>
        <Block text="IT JUDGES YOU" bg="#FF2222" color="#FFFFFF" size={112} rot={-2} />
      </div>
    </AbsoluteFill>
  );
};

// D — full-bleed Launch Trailer 0:27 (Lucia looking back from the convertible, Jason driving). Grey "V" struck out → neon "VI",
// six wanted stars, "IT JUDGES YOU". One focal face, high contrast. Official Rockstar 4K frame; no AI.
const LT27 = "frames/lt-27.5.jpg"; // picture rows ~120–2039

const Stars6: React.FC<{ size: number }> = ({ size }) => (
  <div style={{ display: "flex", gap: size * 0.1 }}>
    {[0, 1, 2, 3, 4, 5].map((i) => (
      <svg key={i} viewBox="0 0 100 100" width={size} height={size} style={{ filter: "drop-shadow(3px 4px 0 rgba(0,0,0,0.85))" }}>
        <path d="M50 4 L61.8 37.6 L97.6 38.2 L69 59.8 L79.4 94 L50 73.6 L20.6 94 L31 59.8 L2.4 38.2 L38.2 37.6 Z"
          fill={i === 5 ? C.gold : "#fff"} stroke="#000" strokeWidth={5} strokeLinejoin="round" />
      </svg>
    ))}
  </div>
);

export const Thumb014D: React.FC = () => {
  const s = 0.43;
  return (
    <AbsoluteFill style={{ background: C.night, overflow: "hidden" }}>
      <Img src={staticFile(LT27)} style={{ position: "absolute", width: 3840 * s, height: 2160 * s, left: -40, top: -120 * s - 40,
        filter: "saturate(1.35) contrast(1.15) brightness(1.05)" }} />
      <AbsoluteFill style={{ background: "linear-gradient(270deg, rgba(10,4,24,0.88) 0%, rgba(10,4,24,0.45) 30%, rgba(10,4,24,0) 48%)" }} />
      <AbsoluteFill style={{ background: "radial-gradient(circle at 100% 0%, rgba(255,46,136,0.55) 0%, rgba(255,46,136,0) 40%)", mixBlendMode: "screen" }} />
      {/* V (old, grey, struck) → VI (neon) */}
      <div style={{ position: "absolute", right: 40, top: 20, display: "flex", alignItems: "center", gap: 18 }}>
        <div style={{ position: "relative", fontFamily: ANTON, fontSize: 150, color: "#8A8A90", lineHeight: 1, textShadow: "5px 6px 0 #000" }}>
          V
          <svg viewBox="0 0 100 100" width={130} height={130} style={{ position: "absolute", left: -18, top: 18 }}>
            <path d="M10 90 L90 10" stroke="#FF2222" strokeWidth="14" strokeLinecap="round" />
          </svg>
        </div>
        <div style={{ fontFamily: ANTON, fontSize: 90, color: "#fff", textShadow: "4px 5px 0 #000" }}>→</div>
        <div style={{ fontFamily: ANTON, fontSize: 210, color: "#fff", lineHeight: 1,
          textShadow: `0 0 18px ${C.pink}, 0 0 40px ${C.pink}, 6px 8px 0 #000` }}>VI</div>
      </div>
      <div style={{ position: "absolute", right: 44, top: 262 }}><Stars6 size={62} /></div>
      <div style={{ position: "absolute", right: 30, bottom: 34, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 18 }}>
        <Block text="IT JUDGES" bg="#FFFFFF" color="#0B0B10" size={104} rot={2} />
        <Block text="YOU" bg="#FF2222" color="#FFFFFF" size={170} rot={-3} />
      </div>
    </AbsoluteFill>
  );
};
