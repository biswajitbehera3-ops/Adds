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

// E — from the user's own scooter-crew artwork (public/frames/user-scooters-source.jpg, 1170×1546 portrait).
// 16:9 crop below the logo (the "grand theft auto" text is cropped out), grade + police-light spill, GTA-style text block.
const USER = "frames/user-scooters-source.jpg";
export const Thumb014E: React.FC = () => {
  const X0 = 44, X1 = 1104, Y0 = 470;          // picture area without the white phone borders; top below the logo
  const s = 1280 / (X1 - X0);
  return (
    <AbsoluteFill style={{ background: C.night, overflow: "hidden" }}>
      <Img src={staticFile(USER)} style={{ position: "absolute", width: 1170 * s, height: 1546 * s, left: -X0 * s, top: -Y0 * s,
        filter: "hue-rotate(-14deg) saturate(1.15) contrast(1.12) brightness(1.03)" }} />
      {/* GTA 6 sunset grade: blue-violet sky up top, orange-gold toward the horizon (less pink overall) */}
      <AbsoluteFill style={{ background: "linear-gradient(180deg, #2A3A8C 0%, #4B3A9A 18%, rgba(120,70,160,0) 42%)", mixBlendMode: "color", opacity: 0.55 }} />
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(255,150,60,0) 18%, #FF9A3C 40%, #FFB35A 55%, rgba(255,150,60,0) 75%)", mixBlendMode: "soft-light", opacity: 0.85 }} />
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(255,170,80,0) 25%, rgba(255,140,50,0.22) 45%, rgba(255,140,50,0) 65%)", mixBlendMode: "screen" }} />
      {/* vignette + bottom shade for the text */}
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 40%, rgba(0,0,0,0) 45%, rgba(0,0,0,0.55) 100%)" }} />
      <AbsoluteFill style={{ background: "linear-gradient(0deg, rgba(8,2,20,0.92) 0%, rgba(8,2,20,0.55) 26%, rgba(8,2,20,0) 46%)" }} />
      {/* hide the last slivers of the logo at the top edge */}
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(40,6,40,0.95) 0%, rgba(40,6,40,0.55) 5%, rgba(40,6,40,0) 12%)" }} />
      {/* police light spill from the edges */}
      <AbsoluteFill style={{ background: "radial-gradient(circle at -8% 15%, rgba(255,30,50,0.70) 0%, rgba(255,30,50,0) 42%), radial-gradient(circle at 108% 15%, rgba(30,110,255,0.70) 0%, rgba(30,110,255,0) 42%)", mixBlendMode: "screen" }} />
      {/* six wanted stars, top-left */}
      <div style={{ position: "absolute", left: 30, top: 26, display: "flex", gap: 8 }}>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <svg key={i} viewBox="0 0 100 100" width={54} height={54} style={{ filter: "drop-shadow(3px 4px 0 rgba(0,0,0,0.9))" }}>
            <path d="M50 4 L61.8 37.6 L97.6 38.2 L69 59.8 L79.4 94 L50 73.6 L20.6 94 L31 59.8 L2.4 38.2 L38.2 37.6 Z" fill="#fff" stroke="#000" strokeWidth={6} strokeLinejoin="round" />
          </svg>
        ))}
      </div>
      {/* GTA-style lettering: heavy condensed, white with thick black outline, slight skew, pink glow on YOU */}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 18, textAlign: "center", transform: "skewX(-6deg)" }}>
        <span style={{ fontFamily: ANTON, fontSize: 150, lineHeight: 1, color: "#FFFFFF", letterSpacing: 2,
          textShadow: "0 0 0 #000, 6px 6px 0 #000, -4px -4px 0 #000, 4px -4px 0 #000, -4px 4px 0 #000, 0 6px 0 #000, 0 -5px 0 #000, 6px 0 0 #000, -5px 0 0 #000, 10px 12px 0 rgba(0,0,0,0.6)" }}>IT JUDGES </span>
        <span style={{ fontFamily: ANTON, fontSize: 150, lineHeight: 1, color: "#FFC93C", letterSpacing: 2,
          textShadow: "6px 6px 0 #000, -4px -4px 0 #000, 4px -4px 0 #000, -4px 4px 0 #000, 0 6px 0 #000, 0 -5px 0 #000, 6px 0 0 #000, -5px 0 0 #000, 0 0 40px rgba(255,170,40,0.85)" }}>YOU</span>
      </div>
    </AbsoluteFill>
  );
};

// F — AI-edited version of the user's scooter artwork (GPT Image 2.6, 0.25 cr: police officer in the back, logo removed,
// GTA VI sunset sky). 16:9 crop from heads to the officer's chest; red ring on the officer's side-eye; text lower right.
const AIV = "frames/scoot-ai-2.png"; // 880×1168, picture x 27–835
export const Thumb014F: React.FC = () => {
  const X0 = 27, X1 = 835, Y0 = 292;
  const s = 1280 / (X1 - X0);
  const fx = (310 - X0) * s, fy = (652 - Y0) * s; // officer's face
  return (
    <AbsoluteFill style={{ background: C.night, overflow: "hidden" }}>
      <Img src={staticFile(AIV)} style={{ position: "absolute", width: 880 * s, height: 1168 * s, left: -X0 * s, top: -Y0 * s,
        filter: "saturate(1.12) contrast(1.1)" }} />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 45% 45%, rgba(0,0,0,0) 50%, rgba(0,0,0,0.5) 100%)" }} />
      <AbsoluteFill style={{ background: "linear-gradient(300deg, rgba(8,2,20,0.85) 0%, rgba(8,2,20,0.35) 30%, rgba(8,2,20,0) 50%)" }} />
      {/* police light spill */}
      <AbsoluteFill style={{ background: "radial-gradient(circle at -6% 100%, rgba(255,30,50,0.55) 0%, rgba(255,30,50,0) 35%), radial-gradient(circle at 30% 105%, rgba(30,110,255,0.5) 0%, rgba(30,110,255,0) 30%)", mixBlendMode: "screen" }} />
      {/* red ring on the officer's side-eye */}
      <svg width="1280" height="720" style={{ position: "absolute", left: 0, top: 0 }}>
        <circle cx={fx} cy={fy} r={82} fill="none" stroke="#000" strokeWidth={16} />
        <circle cx={fx} cy={fy} r={82} fill="none" stroke="#FF2222" strokeWidth={9} />
      </svg>
      {/* six wanted stars */}
      <div style={{ position: "absolute", left: 28, top: 24, display: "flex", gap: 8 }}>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <svg key={i} viewBox="0 0 100 100" width={52} height={52} style={{ filter: "drop-shadow(3px 4px 0 rgba(0,0,0,0.9))" }}>
            <path d="M50 4 L61.8 37.6 L97.6 38.2 L69 59.8 L79.4 94 L50 73.6 L20.6 94 L31 59.8 L2.4 38.2 L38.2 37.6 Z" fill="#fff" stroke="#000" strokeWidth={6} strokeLinejoin="round" />
          </svg>
        ))}
      </div>
      {/* GTA-style lettering, lower right */}
      <div style={{ position: "absolute", right: 30, bottom: 22, textAlign: "right", transform: "skewX(-6deg)", lineHeight: 0.92 }}>
        <div style={{ fontFamily: ANTON, fontSize: 132, color: "#FFFFFF", letterSpacing: 2,
          textShadow: "6px 6px 0 #000, -4px -4px 0 #000, 4px -4px 0 #000, -4px 4px 0 #000, 0 6px 0 #000, 0 -5px 0 #000, 6px 0 0 #000, -5px 0 0 #000, 10px 12px 0 rgba(0,0,0,0.55)" }}>IT JUDGES</div>
        <div style={{ fontFamily: ANTON, fontSize: 200, color: "#FFC93C", letterSpacing: 3,
          textShadow: "7px 7px 0 #000, -5px -5px 0 #000, 5px -5px 0 #000, -5px 5px 0 #000, 0 7px 0 #000, 0 -6px 0 #000, 7px 0 0 #000, -6px 0 0 #000, 0 0 40px rgba(255,170,40,0.8)" }}>YOU</div>
      </div>
    </AbsoluteFill>
  );
};

// G — the whole edited artwork (all three people head to toe) on the right, blurred copy filling the frame,
// "IT / JUDGES / YOU" stacked in the open space on the left.
export const Thumb014G: React.FC = () => {
  const X0 = 27, X1 = 835;                 // picture area (no white borders)
  const h = 720, s = h / 1168, w = (X1 - X0) * s;   // ≈ 498 px wide
  const left = 1280 - w;
  return (
    <AbsoluteFill style={{ background: C.night, overflow: "hidden" }}>
      {/* blurred fill */}
      <Img src={staticFile(AIV)} style={{ position: "absolute", width: 1280 * 1.2, height: 1280 * 1.2 * 1168 / 880, left: -128, top: -500,
        filter: "blur(28px) brightness(0.55) saturate(1.2)" }} />
      <AbsoluteFill style={{ background: "linear-gradient(90deg, rgba(8,2,20,0.75) 0%, rgba(8,2,20,0.35) 55%, rgba(8,2,20,0) 100%)" }} />
      {/* the full picture */}
      <div style={{ position: "absolute", left, top: 0, width: w, height: h, overflow: "hidden", boxShadow: "-18px 0 40px rgba(0,0,0,0.7)" }}>
        <Img src={staticFile(AIV)} style={{ position: "absolute", width: 880 * s, height: h, left: -X0 * s, top: 0, filter: "saturate(1.1) contrast(1.08)" }} />
        <svg width={w} height={h} style={{ position: "absolute", left: 0, top: 0 }}>
          <circle cx={(310 - X0) * s} cy={652 * s} r={44} fill="none" stroke="#000" strokeWidth={12} />
          <circle cx={(310 - X0) * s} cy={652 * s} r={44} fill="none" stroke="#FF2222" strokeWidth={6} />
        </svg>
      </div>
      {/* police light spill */}
      <AbsoluteFill style={{ background: "radial-gradient(circle at -5% 0%, rgba(255,30,50,0.55) 0%, rgba(255,30,50,0) 40%), radial-gradient(circle at -5% 100%, rgba(30,110,255,0.55) 0%, rgba(30,110,255,0) 40%)", mixBlendMode: "screen" }} />
      {/* stars + stacked GTA-style text */}
      <div style={{ position: "absolute", left: 46, top: 40, display: "flex", gap: 8 }}>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <svg key={i} viewBox="0 0 100 100" width={56} height={56} style={{ filter: "drop-shadow(3px 4px 0 rgba(0,0,0,0.9))" }}>
            <path d="M50 4 L61.8 37.6 L97.6 38.2 L69 59.8 L79.4 94 L50 73.6 L20.6 94 L31 59.8 L2.4 38.2 L38.2 37.6 Z" fill="#fff" stroke="#000" strokeWidth={6} strokeLinejoin="round" />
          </svg>
        ))}
      </div>
      <div style={{ position: "absolute", left: 40, top: 130, transform: "skewX(-6deg)", lineHeight: 0.9 }}>
        {[["IT", "#FFFFFF", 170], ["JUDGES", "#FFFFFF", 170], ["YOU", "#FFC93C", 230]].map(([t, col, fs]) => (
          <div key={t as string} style={{ fontFamily: ANTON, fontSize: fs as number, color: col as string, letterSpacing: 2,
            textShadow: "7px 7px 0 #000, -5px -5px 0 #000, 5px -5px 0 #000, -5px 5px 0 #000, 0 7px 0 #000, 0 -6px 0 #000, 7px 0 0 #000, -6px 0 0 #000" + (t === "YOU" ? ", 0 0 40px rgba(255,170,40,0.85)" : "") }}>{t}</div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

// H — the AI-widened 16:9 scene (GPT Image 2.6, 0.25 cr): everyone head to toe, text ON the photo in the open sky.
const WIDE = "frames/scoot-wide.png"; // 1344×752
export const Thumb014H: React.FC = () => {
  const s = 1280 / 1344;
  return (
    <AbsoluteFill style={{ background: C.night, overflow: "hidden" }}>
      <Img src={staticFile(WIDE)} style={{ position: "absolute", width: 1280, height: 752 * s, left: 0, top: (720 - 752 * s) / 2,
        filter: "saturate(1.1) contrast(1.08)" }} />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 30% 30%, rgba(20,6,40,0.45) 0%, rgba(20,6,40,0) 55%)" }} />
      <svg width="1280" height="720" style={{ position: "absolute", left: 0, top: 0 }}>
        <circle cx={783} cy={402} r={40} fill="none" stroke="#000" strokeWidth={12} />
        <circle cx={783} cy={402} r={40} fill="none" stroke="#FF2222" strokeWidth={6} />
      </svg>
      <div style={{ position: "absolute", left: 40, top: 28, display: "flex", gap: 8 }}>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <svg key={i} viewBox="0 0 100 100" width={50} height={50} style={{ filter: "drop-shadow(3px 4px 0 rgba(0,0,0,0.9))" }}>
            <path d="M50 4 L61.8 37.6 L97.6 38.2 L69 59.8 L79.4 94 L50 73.6 L20.6 94 L31 59.8 L2.4 38.2 L38.2 37.6 Z" fill="#fff" stroke="#000" strokeWidth={6} strokeLinejoin="round" />
          </svg>
        ))}
      </div>
      <div style={{ position: "absolute", left: 34, top: 90, transform: "skewX(-6deg)", lineHeight: 0.9 }}>
        <div style={{ fontFamily: ANTON, fontSize: 150, color: "#FFFFFF", letterSpacing: 2,
          textShadow: "7px 7px 0 #000, -5px -5px 0 #000, 5px -5px 0 #000, -5px 5px 0 #000, 0 7px 0 #000, 0 -6px 0 #000, 7px 0 0 #000, -6px 0 0 #000, 12px 14px 0 rgba(0,0,0,0.45)" }}>IT JUDGES</div>
        <div style={{ fontFamily: ANTON, fontSize: 210, color: "#FFC93C", letterSpacing: 3,
          textShadow: "8px 8px 0 #000, -6px -6px 0 #000, 6px -6px 0 #000, -6px 6px 0 #000, 0 8px 0 #000, 0 -7px 0 #000, 8px 0 0 #000, -7px 0 0 #000, 0 0 40px rgba(255,170,40,0.85)" }}>YOU</div>
      </div>
    </AbsoluteFill>
  );
};
