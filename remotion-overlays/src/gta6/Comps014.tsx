import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { ANTON, C, clamp, INTER, outline, Stage } from "./theme";

// Graphics for video 014 (GTA 6 vs GTA 5). All our own vector illustrations — no game art.

const Angel: React.FC<{ size: number }> = ({ size }) => (
  <svg viewBox="0 0 100 100" width={size} height={size}>
    <circle cx="50" cy="50" r="46" fill="#FFFFFF" stroke="#000" strokeWidth="5" />
    <ellipse cx="50" cy="26" rx="22" ry="7" fill="none" stroke={C.gold} strokeWidth="6" />
    <circle cx="50" cy="56" r="17" fill={C.gold} stroke="#000" strokeWidth="4" />
    <path d="M30 60 Q12 50 16 34 Q26 46 34 52 Z M70 60 Q88 50 84 34 Q74 46 66 52 Z" fill="#DDEBFF" stroke="#000" strokeWidth="3" />
  </svg>
);
const Devil: React.FC<{ size: number }> = ({ size }) => (
  <svg viewBox="0 0 100 100" width={size} height={size}>
    <circle cx="50" cy="50" r="46" fill="#FF2222" stroke="#000" strokeWidth="5" />
    <path d="M28 40 L22 12 L42 32 Z M72 40 L78 12 L58 32 Z" fill="#7A0000" stroke="#000" strokeWidth="3" />
    <circle cx="50" cy="56" r="20" fill="#B30000" stroke="#000" strokeWidth="4" />
    <path d="M40 52 L46 56 M60 52 L54 56" stroke="#FFC93C" strokeWidth="5" strokeLinecap="round" />
    <path d="M40 66 Q50 72 60 66" stroke="#000" strokeWidth="4" fill="none" strokeLinecap="round" />
  </svg>
);

/** Angel ↔ devil meter. `stops` = [[sec, position 0..1], ...]; the needle springs between them. */
export const ProfileMeter: React.FC<{ stops?: [number, number][]; label?: string; left?: string; right?: string }> = ({
  stops = [[0, 0.5]], label = "CRIMINAL PROFILE", left = "PROFESSIONAL", right = "IRREDEEMABLE" }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = f / fps;
  let pos = stops[0][1];
  for (let i = 1; i < stops.length; i++) {
    if (t >= stops[i][0]) {
      const k = spring({ frame: f - stops[i][0] * fps, fps, config: { damping: 11, stiffness: 120 } });
      pos = stops[i - 1][1] + (stops[i][1] - stops[i - 1][1]) * k;
    }
  }
  const pop = spring({ frame: f, fps, config: { damping: 12, stiffness: 160 } });
  const W = 1100;
  return (
    <Stage>
      <div style={{ position: "absolute", left: 0, right: 0, top: 250, textAlign: "center", fontFamily: INTER, fontWeight: 800, fontSize: 40,
        letterSpacing: 10, color: C.white, opacity: pop, textShadow: outline(4) }}>{label}</div>
      <div style={{ position: "absolute", left: (1920 - W) / 2 - 190, top: 380, display: "flex", alignItems: "center", gap: 40,
        transform: `scale(${0.8 + 0.2 * pop})` }}>
        <Angel size={150} />
        <div style={{ position: "relative", width: W, height: 56, borderRadius: 28, border: "7px solid #000",
          background: `linear-gradient(90deg, #FFFFFF 0%, ${C.gold} 45%, #FF2222 100%)`, boxShadow: "8px 8px 0 rgba(0,0,0,0.85)" }}>
          <div style={{ position: "absolute", left: W * pos - 12, top: -40, width: 24, height: 122, background: "#000", borderRadius: 6, border: "4px solid #fff" }} />
        </div>
        <Devil size={150} />
      </div>
      <div style={{ position: "absolute", left: (1920 - W) / 2 - 190, width: W + 380, top: 580, display: "flex", justifyContent: "space-between",
        fontFamily: ANTON, fontSize: 64, opacity: pop }}>
        <span style={{ color: C.white, textShadow: outline(5) }}>{left}</span>
        <span style={{ color: "#FF4040", textShadow: outline(5) }}>{right}</span>
      </div>
    </Stage>
  );
};

/** Four hearts filling one by one (relationship scale). */
export const Hearts: React.FC<{ every?: number; label?: string }> = ({ every = 0.5, label = "RELATIONSHIP · 4-POINT SCALE" }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const H = "M50 88 C20 66 6 48 6 30 C6 16 17 6 30 6 C39 6 46 11 50 18 C54 11 61 6 70 6 C83 6 94 16 94 30 C94 48 80 66 50 88 Z";
  return (
    <Stage>
      <div style={{ position: "absolute", left: 0, right: 0, top: 300, display: "flex", justifyContent: "center", gap: 50 }}>
        {[0, 1, 2, 3].map((i) => {
          const k = spring({ frame: f - (0.3 + i * every) * fps, fps, config: { damping: 9, stiffness: 220 } });
          const on = f >= (0.3 + i * every) * fps;
          return (
            <svg key={i} viewBox="0 0 100 100" width={230} height={230} style={{ transform: `scale(${on ? 0.7 + 0.3 * k : 0.85})`,
              filter: on ? `drop-shadow(0 0 30px ${C.pink})` : "none" }}>
              <path d={H} fill={on ? C.pink : "rgba(255,255,255,0.08)"} stroke={on ? "#000" : "rgba(255,255,255,0.4)"} strokeWidth="5" />
            </svg>
          );
        })}
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 600, textAlign: "center", fontFamily: ANTON, fontSize: 70, color: C.white,
        textShadow: outline(5) }}>{label}</div>
    </Stage>
  );
};

/** GTA 5's three leads as grey silhouettes (our illustration), then they fold away and "2" neon figures replace them. */
export const ThreeMen: React.FC<{ swapSec?: number }> = ({ swapSec = 99 }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const out = interpolate(f, [swapSec * fps, swapSec * fps + 10], [1, 0], clamp);
  const names = ["MICHAEL", "FRANKLIN", "TREVOR"];
  const Person: React.FC<{ col: string }> = ({ col }) => (
    <svg viewBox="0 0 100 200" width={210} height={420}>
      <circle cx="50" cy="38" r="26" fill={col} stroke="#111" strokeWidth="4" />
      <path d="M8 200 L14 104 Q18 74 50 72 Q82 74 86 104 L92 200 Z" fill={col} stroke="#111" strokeWidth="4" />
    </svg>
  );
  return (
    <Stage>
      <div style={{ position: "absolute", left: 0, right: 0, top: 120, textAlign: "center", fontFamily: ANTON, fontSize: 64, color: "#9A9AA0",
        textShadow: outline(5) }}>GTA 5 · THREE MEN · SWITCH ANY TIME</div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 260, display: "flex", justifyContent: "center", gap: 90 }}>
        {names.map((n, i) => {
          const k = spring({ frame: f - (0.2 + i * 0.25) * fps, fps, config: { damping: 12, stiffness: 180 } });
          return (
            <div key={n} style={{ textAlign: "center", opacity: out * k, transform: `translateY(${(1 - k) * 60 + (1 - out) * 120}px)` }}>
              <Person col="#5A5A62" />
              <div style={{ fontFamily: ANTON, fontSize: 52, color: "#C8C8CC", textShadow: outline(4) }}>{n}</div>
            </div>
          );
        })}
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 60, textAlign: "center", fontFamily: INTER, fontWeight: 700, fontSize: 26,
        letterSpacing: 4, color: "rgba(255,255,255,0.5)" }}>ILLUSTRATION</div>
    </Stage>
  );
};

/** Card for Rockstar's in-game TV show reveal (no third-party footage). */
export const MaccaCard: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const k = spring({ frame: f, fps, config: { damping: 12, stiffness: 170 } });
  return (
    <Stage>
      <div style={{ position: "absolute", left: 360, width: 1200, top: 230, background: "linear-gradient(135deg, #1b0b2e 0%, #2b0f3a 100%)",
        border: `8px solid ${C.pink}`, borderRadius: 30, padding: "40px 60px", boxShadow: `0 0 60px ${C.pink}`, transform: `scale(${0.85 + 0.15 * k})`,
        opacity: k, textAlign: "center" }}>
        <div style={{ fontFamily: INTER, fontWeight: 800, fontSize: 34, letterSpacing: 10, color: C.blue }}>NEW · IN-GAME TV SHOW</div>
        <div style={{ fontFamily: ANTON, fontSize: 150, color: C.white, lineHeight: 1.05, textShadow: `0 0 26px ${C.pink}, 6px 8px 0 #000` }}>MACCA &amp; FRIENDS</div>
        <div style={{ fontSize: 120, lineHeight: 1.1 }}>🐊🕶️</div>
        <div style={{ fontFamily: ANTON, fontSize: 64, color: C.gold, textShadow: outline(4) }}>ON WEAZEL · FROM 19 NOV</div>
      </div>
    </Stage>
  );
};

/** Big text card: one line, optional sub-line. */
export const TextCard: React.FC<{ text: string; sub?: string; color?: string }> = ({ text, sub, color = C.white }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const k = spring({ frame: f, fps, config: { damping: 10, stiffness: 200 } });
  return (
    <Stage>
      <AbsoluteFill />
      <div style={{ position: "absolute", left: 0, right: 0, top: 360, textAlign: "center", transform: `scale(${0.7 + 0.3 * k})` }}>
        <div style={{ fontFamily: ANTON, fontSize: 200, color, lineHeight: 1, textShadow: outline(8) }}>{text}</div>
        {sub ? <div style={{ marginTop: 20, fontFamily: ANTON, fontSize: 72, color: C.gold, textShadow: outline(5) }}>{sub}</div> : null}
      </div>
    </Stage>
  );
};
