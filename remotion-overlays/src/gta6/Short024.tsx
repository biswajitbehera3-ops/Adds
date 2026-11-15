import React from "react";
import { AbsoluteFill, Audio, interpolate, OffthreadVideo, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import w1 from "./r024-1-words.json";
import w2 from "./r024-2-words.json";
import { ANTON, C, clamp, INTER, MONO, outline } from "./theme";

// Shorts 024 — two linked Shorts (1080×1920, 30 fps). Part 1: who Jason & Lucia are. Part 2: their first week, step by step.
// Every shot and graphic is timed to the voice-over's Whisper word timestamps. Script + sources: scripts/024-shorts-bottom-part1-part2.md.
// Footage: official Rockstar trailers (muted). Character shots are framed so only that character is in the 9:16 crop.

const FPS = 30;
const LEAD = 0.3;
const fr = (sec: number) => Math.round((sec + LEAD) * FPS);
type W = { w: string; s: number; e: number };
const P = "clips/024/";
const C14 = "clips/014/c/";
const C06 = "clips/006p/";

/* ---------- background clips ---------- */
type Bg = { a: number; b: number; src: string; start?: number; x?: number; x1?: number; rate?: number; zoom?: number; dim?: number };
const BgClip: React.FC<{ g: Bg }> = ({ g }) => {
  const f = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const p = f / Math.max(durationInFrames, 1);
  const s = (g.zoom ?? 1.08) + 0.05 * p;
  const x = g.x1 !== undefined ? interpolate(p, [0, 1], [g.x ?? 50, g.x1]) : g.x ?? 50;
  return (
    <AbsoluteFill style={{ transform: `scale(${s})`, transformOrigin: `${x}% 50%` }}>
      <OffthreadVideo src={staticFile(g.src)} startFrom={Math.round((g.start ?? 0) * FPS)} playbackRate={g.rate ?? 1} muted
        style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: `${x}% 50%`, filter: "saturate(1.15) contrast(1.06)" }} />
      <AbsoluteFill style={{ background: `linear-gradient(180deg, rgba(6,4,14,${(g.dim ?? 0.3) + 0.25}) 0%, rgba(6,4,14,${g.dim ?? 0.3}) 30%, rgba(6,4,14,${g.dim ?? 0.3}) 70%, rgba(6,4,14,${(g.dim ?? 0.3) + 0.35}) 100%)` }} />
    </AbsoluteFill>
  );
};

/* ---------- graphics ---------- */
const pop = (f: number, fps: number, d = 0) => spring({ frame: f - d, fps, config: { damping: 11, stiffness: 190 } });
const at = (sec: number, a: number) => Math.round((sec - a) * FPS); // local frame for an absolute VO time inside a sequence starting at VO time a

const Big: React.FC<{ text: string; color?: string; size?: number; top?: number; delay?: number }> = ({ text, color = C.white, size = 120, top = 230, delay = 0 }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig(); const k = pop(f, fps, delay);
  if (f < delay) return null;
  return <div style={{ position: "absolute", left: 40, right: 40, top, textAlign: "center", fontFamily: ANTON, fontSize: size, lineHeight: 1.02,
    color, textShadow: outline(8), transform: `scale(${0.6 + 0.4 * k})`, opacity: k }}>{text}</div>;
};

const Stamp: React.FC<{ text: string; color?: string; top: number; delay?: number; rot?: number }> = ({ text, color = C.red, top, delay = 0, rot = -6 }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const k = spring({ frame: f - delay, fps, config: { damping: 9, stiffness: 260 } });
  if (f < delay) return null;
  return <div style={{ position: "absolute", left: 0, right: 0, top, textAlign: "center" }}>
    <span style={{ display: "inline-block", fontFamily: ANTON, fontSize: 96, color, border: `9px solid ${color}`, padding: "0 32px", borderRadius: 14,
      transform: `rotate(${rot}deg) scale(${interpolate(k, [0, 1], [2.2, 1])})`, textShadow: outline(4), background: "rgba(7,7,12,0.55)" }}>{text}</span>
  </div>;
};

const Source: React.FC<{ tier: "REPORTED" | "CONFIRMED"; outlet: string }> = ({ tier, outlet }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig(); const k = pop(f, fps, 4);
  const col = tier === "CONFIRMED" ? C.green : C.blue;
  return <div style={{ position: "absolute", left: 50, top: 1500, transform: `translateX(${(1 - k) * -500}px)`, display: "flex", gap: 12,
    alignItems: "center", background: "rgba(7,7,12,0.85)", borderLeft: `8px solid ${col}`, padding: "10px 20px", borderRadius: 8 }}>
    <span style={{ fontFamily: MONO, fontWeight: 700, fontSize: 28, color: col }}>● {tier}</span>
    <span style={{ fontFamily: INTER, fontWeight: 700, fontSize: 28, color: C.white }}>· {outlet}</span>
  </div>;
};

const Chip: React.FC<{ text: string; delay: number; color?: string; i: number }> = ({ text, delay, color = C.gold, i }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig(); const k = pop(f, fps, delay);
  if (f < delay) return null;
  return <span style={{ display: "inline-block", margin: "10px 10px", padding: "10px 24px", borderRadius: 50, background: "rgba(7,7,12,0.82)",
    border: `5px solid ${color}`, fontFamily: ANTON, fontSize: 54, color, transform: `translateY(${(1 - k) * 60}px) scale(${0.7 + 0.3 * k})`, opacity: k,
    textShadow: outline(2) }} key={i}>{text}</span>;
};

/** Character card: name plate at the top + chips that pop in on the right words. */
const CharCard: React.FC<{ name: string; role: string; color: string; chips: { t: string; d: number }[] }> = ({ name, role, color, chips }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig(); const k = pop(f, fps);
  return <>
    <div style={{ position: "absolute", left: 60, top: 200, transform: `translateX(${(1 - k) * -700}px)` }}>
      <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 32, color, letterSpacing: 4 }}>{role}</div>
      <div style={{ fontFamily: ANTON, fontSize: 132, lineHeight: 1, color: C.white, textShadow: outline(8) }}>{name}</div>
      <div style={{ width: 360 * k, height: 12, background: color, marginTop: 8 }} />
    </div>
    <div style={{ position: "absolute", left: 40, right: 40, top: 1180, textAlign: "center" }}>
      {chips.map((c, i) => <Chip key={i} i={i} text={c.t} delay={c.d} color={color} />)}
    </div>
  </>;
};

const Padlock: React.FC<{ delay?: number; top?: number }> = ({ delay = 0, top = 640 }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const k = spring({ frame: f - delay, fps, config: { damping: 8, stiffness: 240 } });
  if (f < delay) return null;
  return <div style={{ position: "absolute", left: 0, right: 0, top, display: "flex", justifyContent: "center", transform: `translateY(${(1 - k) * -600}px)` }}>
    <svg viewBox="0 0 200 240" width={330} height={396} style={{ filter: "drop-shadow(0 18px 30px rgba(0,0,0,0.7))" }}>
      <path d="M50 110 V70 a50 50 0 0 1 100 0 V110" fill="none" stroke="#111" strokeWidth="34" />
      <path d="M50 110 V70 a50 50 0 0 1 100 0 V110" fill="none" stroke="#E8E8E8" strokeWidth="20" />
      <rect x="20" y="105" width="160" height="125" rx="18" fill={C.red} stroke="#111" strokeWidth="10" />
      <circle cx="100" cy="155" r="16" fill="#111" /><rect x="93" y="160" width="14" height="40" rx="5" fill="#111" />
    </svg>
  </div>;
};

const Step: React.FC<{ n: number; label: string }> = ({ n, label }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig(); const k = pop(f, fps);
  return <div style={{ position: "absolute", left: 50, top: 200, display: "flex", alignItems: "center", gap: 22, transform: `translateX(${(1 - k) * -700}px)` }}>
    <div style={{ width: 150, height: 150, borderRadius: 75, background: C.gold, border: "8px solid #111", display: "flex", alignItems: "center",
      justifyContent: "center", fontFamily: ANTON, fontSize: 104, color: "#111" }}>{n}</div>
    <div style={{ fontFamily: ANTON, fontSize: 92, color: C.white, textShadow: outline(7) }}>{label}</div>
    <div style={{ position: "absolute", left: 0, top: 170, display: "flex", gap: 12 }}>
      {[1, 2, 3, 4].map((i) => <div key={i} style={{ width: 120, height: 14, borderRadius: 7, background: i <= n ? C.gold : "rgba(255,255,255,0.25)", border: "3px solid #111" }} />)}
    </div>
  </div>;
};

const Checklist: React.FC<{ items: { t: string; d: number }[] }> = ({ items }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  return <div style={{ position: "absolute", left: 110, right: 110, top: 520, background: "rgba(7,7,12,0.82)", borderRadius: 18, padding: "26px 40px", border: `5px solid ${C.gold}` }}>
    {items.map((it, i) => { const k = pop(f, fps, it.d); const on = f >= it.d;
      return <div key={i} style={{ display: "flex", alignItems: "center", gap: 24, margin: "16px 0", opacity: on ? 1 : 0.35 }}>
        <div style={{ width: 70, height: 70, borderRadius: 12, border: `6px solid ${on ? C.green : "#888"}`, display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: ANTON, fontSize: 60, color: C.green, transform: `scale(${on ? 0.7 + 0.3 * k : 1})` }}>{on ? "✓" : ""}</div>
        <div style={{ fontFamily: ANTON, fontSize: 72, color: C.white, textShadow: outline(4) }}>{it.t}</div>
      </div>; })}
  </div>;
};

const Hearts: React.FC<{ fillFrom: number; fillTo: number }> = ({ fillFrom, fillTo }) => {
  const f = useCurrentFrame();
  const n = Math.round(interpolate(f, [fillFrom, fillTo], [0, 5], clamp));
  return <div style={{ position: "absolute", left: 0, right: 0, top: 560, display: "flex", justifyContent: "center", gap: 22 }}>
    {[0, 1, 2, 3, 4].map((i) => <div key={i} style={{ fontSize: 120, filter: i < n ? "none" : "grayscale(1) brightness(0.5)", transform: `scale(${i === n - 1 ? 1.2 : 1})` }}>❤️</div>)}
  </div>;
};

const Quote: React.FC<{ text: string; who: string }> = ({ text, who }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig(); const k = pop(f, fps);
  return <div style={{ position: "absolute", left: 80, right: 80, top: 470, background: "rgba(7,7,12,0.86)", borderRadius: 20, padding: "40px 46px",
    borderLeft: `14px solid ${C.pink}`, transform: `scale(${0.85 + 0.15 * k})`, opacity: k }}>
    <div style={{ fontFamily: ANTON, fontSize: 150, lineHeight: 0.6, color: C.pink }}>“</div>
    <div style={{ fontFamily: ANTON, fontSize: 96, lineHeight: 1.05, color: C.white, textShadow: outline(4) }}>{text}</div>
    <div style={{ fontFamily: INTER, fontWeight: 800, fontSize: 36, color: C.gold, marginTop: 18 }}>— {who}</div>
  </div>;
};

const PartTag: React.FC<{ part: 1 | 2 }> = ({ part }) => (
  <div style={{ position: "absolute", left: 40, top: 70, fontFamily: ANTON, fontSize: 46, color: "#111", background: C.gold, padding: "4px 22px", borderRadius: 10, border: "4px solid #111" }}>
    PART {part} / 2
  </div>
);

const EndCard: React.FC<{ big: string; sub: string; arrow: "➜" | "↩" }> = ({ big, sub, arrow }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig(); const k = pop(f, fps);
  const bob = Math.sin(f / 5) * 10;
  return <>
    <AbsoluteFill style={{ background: `rgba(6,4,14,${0.45 * k})` }} />
    <div style={{ position: "absolute", left: 60, right: 60, top: 620, textAlign: "center", transform: `scale(${0.6 + 0.4 * k})`, opacity: k }}>
      <div style={{ display: "inline-block", background: C.gold, color: "#111", fontFamily: ANTON, fontSize: 150, padding: "6px 50px", borderRadius: 24, border: "10px solid #111" }}>
        {big} {arrow}</div>
      <div style={{ fontFamily: ANTON, fontSize: 80, color: C.white, textShadow: outline(7), marginTop: 30 }}>{sub}</div>
    </div>
    <div style={{ position: "absolute", left: 0, right: 0, top: 1420 + bob, textAlign: "center", fontFamily: ANTON, fontSize: 120, color: C.gold, textShadow: outline(6), opacity: k }}>⬇</div>
  </>;
};

const Flash: React.FC = () => { const f = useCurrentFrame(); return <AbsoluteFill style={{ background: C.red, opacity: interpolate(f, [0, 8], [0.55, 0], clamp) }} />; };

/* ---------- captions ---------- */
const makeCaptions = (WORDS: W[]) => {
  const chunks: { s: number; e: number; ws: W[] }[] = [];
  for (let i = 0; i < WORDS.length; ) {
    const ws: W[] = [];
    while (i < WORDS.length && ws.length < 3) { ws.push(WORDS[i]); i++; if (/[.?!,]$/.test(ws[ws.length - 1].w)) break; }
    chunks.push({ s: ws[0].s, e: ws[ws.length - 1].e, ws });
  }
  const Captions: React.FC = () => {
    const f = useCurrentFrame(); const t = f / FPS - LEAD;
    const c = chunks.find((x, i) => t >= x.s && t < (chunks[i + 1]?.s ?? x.e + 0.6));
    if (!c) return null;
    const clean = (w: string) => w.replace(/^VI([,.]?)$/, "6$1").replace(/^-/, "").toUpperCase();
    return <div style={{ position: "absolute", left: 30, right: 30, top: 1640, textAlign: "center" }}>
      {c.ws.map((w, i) => <span key={i} style={{ fontFamily: ANTON, fontSize: 80, marginRight: 18,
        color: t >= w.s && t < w.e + 0.15 ? C.gold : C.white, textShadow: outline(6) }}>{clean(w.w)}</span>)}
    </div>;
  };
  return Captions;
};

type Ov = { a: number; b: number; el: (a: number) => React.ReactNode; sfx?: "hit" | "whoosh" | "tick" };
const render = (BG: Bg[], OV: Ov[], vo: string, part: 1 | 2, Captions: React.FC) => (
  <AbsoluteFill style={{ background: C.night }}>
    {BG.map((g, i) => <Sequence key={`b${i}`} from={fr(g.a)} durationInFrames={Math.max(fr(g.b) - fr(g.a), 1)}><BgClip g={g} /></Sequence>)}
    {OV.map((o, i) => <Sequence key={`o${i}`} from={fr(o.a)} durationInFrames={Math.max(fr(o.b) - fr(o.a), 1)}><AbsoluteFill>{o.el(o.a)}</AbsoluteFill></Sequence>)}
    <PartTag part={part} />
    <Captions />
    <Sequence from={fr(0)}><Audio src={staticFile(vo)} /></Sequence>
    {OV.filter((o) => o.sfx).map((o, i) => <Sequence key={`s${i}`} from={fr(o.a)}><Audio src={staticFile(`clips/006/sfx/${o.sfx}.wav`)} volume={0.4} /></Sequence>)}
  </AbsoluteFill>
);

/* ================= PART 1 ================= */
const BG1: Bg[] = [
  { a: 0.0, b: 2.2, src: P + "lucia_cell.mp4", start: 0, x: 20, rate: 0.65 },
  { a: 2.2, b: 3.6, src: P + "prison_fence.mp4", start: 1.4, rate: 0.85 },
  { a: 3.6, b: 5.9, src: P + "brian_keys.mp4", start: 0, x: 45, rate: 0.35 },
  { a: 5.9, b: 7.3, src: P + "lucia_cell.mp4", start: 0.4, x: 20, rate: 0.7 },
  { a: 7.3, b: 9.9, src: P + "lucia_gate.mp4", start: 1.6, x: 44 },
  { a: 9.9, b: 11.5, src: P + "lucia_parole.mp4", start: 0.3, x: 58, rate: 0.62 },
  { a: 11.5, b: 12.9, src: P + "prison_fence.mp4", start: 1.4, rate: 0.9 },
  { a: 12.9, b: 15.4, src: P + "lucia_gate.mp4", start: 2.0, x: 44, rate: 0.9 },
  { a: 15.4, b: 16.5, src: P + "jason_porch.mp4", start: 2.4, x: 45, rate: 0.7 },
  { a: 16.5, b: 18.5, src: P + "jason_porch.mp4", start: 6.4, x: 52, rate: 0.8 },
  { a: 18.5, b: 19.6, src: P + "jason_drive.mp4", start: 2.6, x: 70 },
  { a: 19.6, b: 21.1, src: P + "keys_aerial.mp4", start: 1.6 },
  { a: 21.1, b: 23.0, src: P + "brian_keys.mp4", start: 6.0, x: 72 },
  { a: 23.0, b: 24.8, src: P + "brian_keys.mp4", start: 1.0, x: 62, rate: 0.67 },
  { a: 24.8, b: 26.3, src: P + "jason_porch.mp4", start: 0.0, x: 38 },
  { a: 26.3, b: 27.4, src: P + "jason_t1drive.mp4", start: 2.1, x: 60 },
  { a: 27.4, b: 29.1, src: P + "jason_drive.mp4", start: 4.0, x: 70 },
  { a: 29.1, b: 32.2, src: C06 + "lt_0027_hero.mp4", start: 0, x: 28, x1: 72, rate: 0.45 },
  { a: 32.2, b: 34.3, src: P + "keys_aerial.mp4", start: 2.7, x: 50, rate: 0.4 },
  { a: 34.3, b: 35.5, src: C14 + "lt_supercars.mp4", start: 0, x: 34 },
  { a: 35.5, b: 37.5, src: P + "robbery_guns.mp4", start: 1.0, x: 38 },
  { a: 37.5, b: 38.4, src: P + "cctv.mp4", start: 2.6 },
  { a: 38.4, b: 39.7, src: C14 + "lt_night_cop.mp4", start: 0 },
  { a: 39.7, b: 46.0, src: C14 + "lt_supercars.mp4", start: 0, x: 34, rate: 0.22, dim: 0.4 },
];
const OV1: Ov[] = [
  { a: 0, b: 5.9, el: () => <Big text="STARTS YOU BROKE" size={130} />, sfx: "whoosh" },
  { a: 5.9, b: 15.4, el: (a) => <><CharCard name="LUCIA" role="MEET" color={C.pink}
      chips={[{ t: "FIGHTER", d: at(7.8, a) }, { t: "PRISON", d: at(11.0, a) }, { t: "OUT — BY LUCK", d: at(13.6, a) }]} />
      <Source tier="CONFIRMED" outlet="Rockstar · Lucia's profile" /></>, sfx: "whoosh" },
  { a: 15.4, b: 21.1, el: (a) => <><CharCard name="JASON" role="NOW MEET" color={C.blue}
      chips={[{ t: "CROOKS", d: at(17.2, a) }, { t: "EX-ARMY", d: at(18.2, a) }, { t: "THE KEYS", d: at(19.3, a) }, { t: "DRUG RUNNERS", d: at(20.2, a) }]} />
      <Source tier="CONFIRMED" outlet="Rockstar · Jason's profile" /></>, sfx: "whoosh" },
  { a: 21.1, b: 26.3, el: (a) => <><CharCard name="BRIAN" role="OLD SMUGGLER" color={C.amber}
      chips={[{ t: "RENT-FREE HOUSE", d: at(23.4, a) }, { t: "= SHAKEDOWNS", d: at(25.2, a) }]} />
      <Source tier="CONFIRMED" outlet="Rockstar · Brian's profile" /></>, sfx: "whoosh" },
  { a: 26.3, b: 27.4, el: () => <Big text="HER PLAN" color={C.pink} size={150} /> },
  { a: 27.4, b: 29.1, el: () => <Big text="HIS EASY LIFE" color={C.blue} size={140} /> },
  { a: 29.1, b: 32.2, el: () => <><Big text="HER WAY OUT?" color={C.gold} size={150} /><Source tier="CONFIRMED" outlet="Rockstar" /></>, sfx: "whoosh" },
  { a: 32.2, b: 35.5, el: (a) => <><Stamp text="NO MONEY" top={300} delay={0} rot={-6} /><Stamp text="NO MANSION" top={470} delay={at(33.7, a)} rot={4} />
      <Stamp text="NO SUPERCAR" top={640} delay={at(34.5, a)} rot={-4} /><Padlock delay={at(34.6, a)} top={860} /></>, sfx: "hit" },
  { a: 35.5, b: 39.7, el: () => <><Quote text="AN EASY SCORE GOES WRONG" who="Rockstar's story for GTA 6" /><Source tier="CONFIRMED" outlet="Rockstar" /></>, sfx: "hit" },
  { a: 39.7, b: 43.0, el: () => <><Big text="WHAT DO THEY DO FOR MONEY?" size={112} /><Padlock top={720} /></>, sfx: "whoosh" },
  { a: 43.0, b: 46.0, el: () => <EndCard big="PART 2" sub="THEIR FIRST WEEK" arrow="➜" />, sfx: "hit" },
];
export const SHORT024A_FRAMES = fr(45.6);
const Cap1 = makeCaptions(w1 as W[]);
export const Short024A: React.FC = () => render(BG1, OV1, P + "vo1.mp3", 1, Cap1);

/* ================= PART 2 ================= */
const BG2: Bg[] = [
  { a: 0.0, b: 2.9, src: P + "lucia_gate.mp4", start: 2.0, x: 44 },
  { a: 2.9, b: 4.6, src: P + "store_masks.mp4", start: 0, x: 34, x1: 60 },
  { a: 4.6, b: 5.6, src: P + "robbery_guns.mp4", start: 1.9, x: 45 },
  { a: 5.6, b: 6.2, src: P + "cctv.mp4", start: 2.6 },
  { a: 6.2, b: 7.5, src: C14 + "lt_night_cop.mp4", start: 0 },
  { a: 7.5, b: 9.6, src: P + "brian_keys.mp4", start: 0, x: 45, rate: 0.38 },
  { a: 9.6, b: 12.6, src: C14 + "el_slimjim.mp4", start: 0, x: 58 },
  { a: 12.6, b: 18.0, src: C14 + "lt_supercars.mp4", start: 0, x: 34, rate: 0.2, dim: 0.4 },
  { a: 18.0, b: 20.0, src: P + "jason_t1drive.mp4", start: 0.9, x: 55, rate: 0.55 },
  { a: 20.0, b: 23.4, src: C14 + "el_chase.mp4", start: 0, x: 40 },
  { a: 23.4, b: 26.4, src: C06 + "el_0906_store.mp4", start: 0, x: 25, rate: 0.85 },
  { a: 26.4, b: 27.8, src: C14 + "t2_storedoor.mp4", start: 0, x: 50 },
  { a: 27.8, b: 29.6, src: P + "cctv.mp4", start: 1.8, rate: 0.45 },
  { a: 29.6, b: 30.5, src: C14 + "el_cctv_sign.mp4", start: 0, x: 15 },
  { a: 30.5, b: 31.9, src: C06 + "lt_0027_hero.mp4", start: 0, x: 28 },
  { a: 31.9, b: 34.9, src: P + "store_masks.mp4", start: 0, x: 34, x1: 58, rate: 0.53 },
  { a: 34.9, b: 36.1, src: C06 + "t1_0103_cash.mp4", start: 0, x: 62, rate: 0.5 },
  { a: 36.1, b: 37.4, src: P + "motel.mp4", start: 1.0, x: 25 },
  { a: 37.4, b: 40.0, src: P + "robbery_guns.mp4", start: 1.0, x: 35, x1: 55, rate: 0.77 },
  { a: 40.0, b: 41.8, src: C14 + "lt_night_cop.mp4", start: 0 },
  { a: 41.8, b: 42.7, src: P + "aerial_chase.mp4", start: 1.4, rate: 0.55 },
  { a: 42.7, b: 43.8, src: C14 + "lt_night_heli.mp4", start: 0.8, rate: 0.4 },
  { a: 43.8, b: 45.3, src: P + "lucia_gate.mp4", start: 4.6, x: 50 },
  { a: 45.3, b: 46.4, src: C14 + "el_slimjim.mp4", start: 1.5, x: 58 },
  { a: 46.4, b: 48.0, src: P + "robbery_guns.mp4", start: 1.0, x: 32, rate: 0.55 },
  { a: 48.0, b: 49.6, src: P + "prison_fence.mp4", start: 0, rate: 0.8 },
  { a: 49.6, b: 51.6, src: P + "keys_aerial.mp4", start: 1.6, rate: 0.55 },
  { a: 51.6, b: 54.0, src: P + "lucia_parole.mp4", start: 0.3, x: 58, rate: 0.42 },
  { a: 54.0, b: 58.0, src: P + "lucia_cell.mp4", start: 0, x: 20, rate: 0.37 },
];
const G = <Source tier="REPORTED" outlet="The Guardian · Rockstar North visit" />;
const OV2: Ov[] = [
  { a: 0, b: 2.9, el: () => <><Big text="PART 1 LEFT YOU BROKE" size={120} /><Small text="WATCH PART 1 ↩" /></>, sfx: "whoosh" },
  { a: 2.9, b: 7.5, el: (a) => <><Big text="ZERO → FIRST ROBBERY" size={112} /><Big text="…AND IT GOES WRONG" color={C.red} size={100} top={400} delay={at(4.7, a)} /></>, sfx: "whoosh" },
  { a: 7.5, b: 12.6, el: (a) => <><Step n={1} label="START SMALL" />{G}
      <div style={{ position: "absolute", left: 40, right: 40, top: 1180, textAlign: "center" }}>
        <Chip i={0} text="CHEAP CARS" delay={at(9.8, a)} /><Chip i={1} text="BASIC LOCKS" delay={at(11.4, a)} /></div></>, sfx: "hit" },
  { a: 12.6, b: 18.0, el: (a) => <><Step n={1} label="START SMALL" />{G}<Padlock delay={at(14.8, a)} top={560} />
      <Big text="TOOLS = LATER" color={C.gold} size={110} top={1080} delay={at(15.9, a)} /></> },
  { a: 18.0, b: 23.4, el: (a) => <><Step n={1} label="START SMALL" />{G}
      <div style={{ position: "absolute", left: 40, right: 40, top: 1180, textAlign: "center" }}>
        <Chip i={0} text="HOTWIRE ✓" delay={0} color={C.green} /><Chip i={1} text="CARJACK = STILL WORKS" delay={at(20.3, a)} color={C.green} /></div></> },
  { a: 23.4, b: 30.5, el: (a) => <><Step n={2} label="CASH" />{G}
      <Checklist items={[{ t: "BACK DOOR", d: at(26.5, a) }, { t: "SAFE CODE", d: at(27.4, a) }, { t: "CCTV", d: at(28.4, a) }]} /></>, sfx: "hit" },
  { a: 30.5, b: 36.1, el: (a) => <><Step n={3} label="THE DATE" />{G}<Hearts fillFrom={at(31.9, a)} fillTo={at(35.6, a)} />
      <Big text="ROBBERY = DATE" color={C.pink} size={120} top={1100} delay={at(33.6, a)} /></>, sfx: "hit" },
  { a: 36.1, b: 43.8, el: (a) => <><Step n={4} label="IT GOES WRONG" />{G}
      <Sequence from={at(37.6, a)}><Flash /></Sequence>
      <Big text="POLICE + HELICOPTERS" color={C.red} size={110} top={1080} delay={at(40.6, a)} /></>, sfx: "hit" },
  { a: 43.8, b: 48.0, el: (a) => <><Stamp text="BROKE" top={360} delay={at(44.2, a)} rot={-6} /><Stamp text="SMALL JOBS" top={540} delay={at(45.4, a)} rot={4} />
      <Stamp text="IT GOES WRONG" top={720} delay={at(46.6, a)} rot={-4} /></>, sfx: "hit" },
  { a: 48.0, b: 51.6, el: () => <><Quote text="AN EASY SCORE GOES WRONG" who="Rockstar's story for GTA 6" /><Source tier="CONFIRMED" outlet="Rockstar" /></>, sfx: "whoosh" },
  { a: 51.6, b: 54.1, el: () => <Big text="WHY SO DESPERATE?" color={C.gold} size={130} />, sfx: "whoosh" },
  { a: 54.1, b: 58.0, el: () => <EndCard big="PART 1" sub="IT STARTS IN A PRISON CELL" arrow="↩" />, sfx: "hit" },
];
function Small({ text }: { text: string }) {
  const f = useCurrentFrame(); const { fps } = useVideoConfig(); const k = pop(f, fps, 6);
  return <div style={{ position: "absolute", right: 40, top: 70, fontFamily: ANTON, fontSize: 44, color: C.white, background: "rgba(7,7,12,0.8)",
    padding: "4px 20px", borderRadius: 10, border: `4px solid ${C.gold}`, opacity: k }}>{text}</div>;
}
export const SHORT024B_FRAMES = fr(57.6);
const Cap2 = makeCaptions(w2 as W[]);
export const Short024B: React.FC = () => render(BG2, OV2, P + "vo2.mp3", 2, Cap2);
