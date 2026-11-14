import React from "react";
import { AbsoluteFill, Audio, interpolate, OffthreadVideo, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import words from "./r020-words.json";
import { ANTON, C, clamp, INTER, MONO, outline } from "./theme";

// Short 020 — "The $1 Billion GTA 6 Sick Day" (1080×1920, 30 fps). A receipt-style explainer; every graphic is timed to the
// voice-over's Whisper word timestamps. Script + sources: scripts/020-short-out-of-office.md.

const FPS = 30;
const LEAD = 0.3;                        // voice starts 0.3 s in
const fr = (sec: number) => Math.round((sec + LEAD) * FPS);
export const SHORT020_FRAMES = fr(56.9 + 1.4);

type W = { w: string; s: number; e: number };
const WORDS = words as W[];

/* ---------- background clips (official Rockstar footage, muted) ---------- */
type Bg = { a: number; b: number; src: string; start?: number; dim?: number };
const BG: Bg[] = [
  { a: 0, b: 3.1, src: "clips/006p/lt_0027_hero.mp4", dim: 0.35 },
  { a: 3.1, b: 4.9, src: "clips/006p/t1_0103_cash.mp4", dim: 0.45 },
  { a: 4.9, b: 9.7, src: "clips/014/c/t1_causeway.mp4", dim: 0.4 },
  { a: 9.7, b: 11.1, src: "clips/006p/t1_0022_crowd.mp4", dim: 0.3 },
  { a: 11.1, b: 18.0, src: "clips/006p/el_0906_store.mp4", dim: 0.55 },
  { a: 18.0, b: 25.1, src: "clips/014/c/t1_lowriders.mp4", dim: 0.55 },
  { a: 25.1, b: 27.4, src: "clips/006p/t1_0100_driving.mp4", dim: 0.45 },
  { a: 27.4, b: 32.6, src: "clips/014/c/t2_highway.mp4", dim: 0.5 },
  { a: 32.6, b: 35.5, src: "clips/014/c/lt_supercars.mp4", dim: 0.45 },
  { a: 35.5, b: 39.1, src: "clips/006p/t1_0103_cash.mp4", dim: 0.6 },
  { a: 39.1, b: 43.7, src: "clips/014/c/el_skydive.mp4", dim: 0.55 },
  { a: 43.7, b: 46.1, src: "clips/014/c/t1_highway.mp4", dim: 0.35 },
  { a: 46.1, b: 47.3, src: "clips/006p/el_0906_store.mp4", dim: 0.35 },
  { a: 47.3, b: 51.6, src: "clips/014/c/lt_bycar.mp4", dim: 0.3 },
  { a: 51.6, b: 54.6, src: "clips/014/c/t2_keys.mp4", dim: 0.5 },
  { a: 54.6, b: 58.3, src: "clips/006p/lt_0027_hero.mp4", dim: 0.55 },
];

const BgClip: React.FC<{ g: Bg }> = ({ g }) => {
  const f = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const s = 1.32 + 0.06 * (f / Math.max(durationInFrames, 1));
  return (
    <AbsoluteFill style={{ transform: `scale(${s})` }}>
      <OffthreadVideo src={staticFile(g.src)} startFrom={Math.round((g.start ?? 0) * FPS)} muted
        style={{ width: "100%", height: "100%", objectFit: "cover", filter: "saturate(1.15) contrast(1.06)" }} />
      <AbsoluteFill style={{ background: `rgba(6,4,14,${g.dim ?? 0.4})` }} />
    </AbsoluteFill>
  );
};

/* ---------- helpers ---------- */
const pop = (f: number, fps: number, d = 0) => spring({ frame: f - d, fps, config: { damping: 11, stiffness: 190 } });
const Big: React.FC<{ text: string; color?: string; size?: number; top?: number }> = ({ text, color = C.white, size = 150, top = 760 }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig(); const k = pop(f, fps);
  return <div style={{ position: "absolute", left: 40, right: 40, top, textAlign: "center", fontFamily: ANTON, fontSize: size, lineHeight: 1.02,
    color, textShadow: outline(8), transform: `scale(${0.6 + 0.4 * k})`, opacity: k }}>{text}</div>;
};

const Stamp: React.FC<{ text: string; color?: string; top?: number; delay?: number }> = ({ text, color = C.red, top = 1180, delay = 0 }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const k = spring({ frame: f - delay, fps, config: { damping: 9, stiffness: 260 } });
  if (f < delay) return null;
  return <div style={{ position: "absolute", left: 0, right: 0, top, textAlign: "center" }}>
    <span style={{ display: "inline-block", fontFamily: ANTON, fontSize: 110, color, border: `10px solid ${color}`, padding: "0 36px", borderRadius: 14,
      transform: `rotate(-7deg) scale(${interpolate(k, [0, 1], [2.2, 1])})`, textShadow: outline(4), background: "rgba(7,7,12,0.45)" }}>{text}</span>
  </div>;
};

const Source: React.FC<{ tier: "REPORTED" | "CONFIRMED" | "OUR MATHS"; outlet: string }> = ({ tier, outlet }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig(); const k = pop(f, fps, 6);
  const col = tier === "CONFIRMED" ? C.green : tier === "REPORTED" ? C.blue : C.amber;
  return <div style={{ position: "absolute", left: 60, top: 1500, transform: `translateX(${(1 - k) * -500}px)`, display: "flex", gap: 14,
    alignItems: "center", background: "rgba(7,7,12,0.85)", borderLeft: `8px solid ${col}`, padding: "12px 22px", borderRadius: 8 }}>
    <span style={{ fontFamily: MONO, fontWeight: 700, fontSize: 30, color: col }}>● {tier}</span>
    <span style={{ fontFamily: INTER, fontWeight: 700, fontSize: 30, color: C.white }}>· {outlet}</span>
  </div>;
};

/* ---------- the receipt ---------- */
type Line = { at: number; left: string; right?: string; bold?: boolean; color?: string };
const Receipt: React.FC<{ lines: Line[]; title?: string; total?: { at: number; text: string } }> = ({ lines, title = "RECEIPT · 19 NOV", total }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const t = f / fps;
  const shown = lines.filter((l) => t >= l.at);
  const drop = pop(f, fps);
  return (
    <div style={{ position: "absolute", left: 120, right: 120, top: 330, transform: `translateY(${(1 - drop) * -900}px)`,
      background: "#F7F3EA", color: "#141414", padding: "44px 50px 60px", boxShadow: "0 30px 80px rgba(0,0,0,0.6)",
      clipPath: "polygon(0 0,100% 0,100% 96%,95% 100%,90% 96%,85% 100%,80% 96%,75% 100%,70% 96%,65% 100%,60% 96%,55% 100%,50% 96%,45% 100%,40% 96%,35% 100%,30% 96%,25% 100%,20% 96%,15% 100%,10% 96%,5% 100%,0 96%)" }}>
      <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 40, textAlign: "center", letterSpacing: 4 }}>{title}</div>
      <div style={{ fontFamily: MONO, fontSize: 26, textAlign: "center", opacity: 0.6, marginBottom: 20 }}>GTA 6 LAUNCH DAY · USA</div>
      <div style={{ borderTop: "4px dashed #141414", margin: "10px 0 20px" }} />
      {shown.map((l, i) => {
        const k = Math.min(1, (t - l.at) * 6);
        return <div key={i} style={{ display: "flex", justifyContent: "space-between", fontFamily: MONO, fontWeight: l.bold ? 700 : 500,
          fontSize: l.bold ? 46 : 38, margin: "12px 0", opacity: k, color: l.color ?? "#141414" }}>
          <span>{l.left}</span><span>{l.right}</span></div>;
      })}
      {total && t >= total.at ? <>
        <div style={{ borderTop: "4px dashed #141414", margin: "24px 0 16px" }} />
        <div style={{ display: "flex", justifyContent: "space-between", fontFamily: MONO, fontWeight: 700, fontSize: 52 }}>
          <span>TOTAL</span><span style={{ color: "#D11" }}>{total.text}</span></div>
      </> : null}
    </div>
  );
};

/* ---------- people icons (1 in N) ---------- */
const Person: React.FC<{ on: boolean; size: number }> = ({ on, size }) => (
  <svg viewBox="0 0 100 160" width={size} height={size * 1.6}>
    <circle cx="50" cy="32" r="24" fill={on ? C.gold : "rgba(255,255,255,0.25)"} stroke="#000" strokeWidth="4" />
    <path d="M10 160 L14 86 Q18 62 50 60 Q82 62 86 86 L90 160 Z" fill={on ? C.gold : "rgba(255,255,255,0.25)"} stroke="#000" strokeWidth="4" />
  </svg>
);
const OneIn: React.FC<{ n: number; lightAt: number; label: string; sub: string }> = ({ n, lightAt, label, sub }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig(); const t = f / fps;
  const size = n === 5 ? 150 : 210;
  return <>
    <div style={{ position: "absolute", left: 0, right: 0, top: 420, textAlign: "center", fontFamily: ANTON, fontSize: 120, color: C.white, textShadow: outline(7) }}>{label}</div>
    <div style={{ position: "absolute", left: 0, right: 0, top: 640, display: "flex", justifyContent: "center", gap: 24 }}>
      {Array.from({ length: n }).map((_, i) => <div key={i} style={{ transform: `scale(${i === 0 && t >= lightAt ? 1.12 : 1})` }}>
        <Person on={i === 0 && t >= lightAt} size={size} /></div>)}
    </div>
    <div style={{ position: "absolute", left: 0, right: 0, top: 1090, textAlign: "center", fontFamily: ANTON, fontSize: 70, color: C.gold, textShadow: outline(5) }}>{sub}</div>
  </>;
};

/* ---------- leave form ---------- */
const Form: React.FC<{ who: string; what: string; stampAt: number }> = ({ who, what, stampAt }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig(); const k = pop(f, fps);
  return <>
    <div style={{ position: "absolute", left: 110, right: 110, top: 520, background: "#FFFFFF", color: "#111", padding: "40px 46px",
      borderRadius: 10, boxShadow: "0 30px 80px rgba(0,0,0,0.6)", transform: `rotate(-2deg) translateY(${(1 - k) * 700}px)` }}>
      <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 34, letterSpacing: 3, opacity: 0.6 }}>LEAVE REQUEST FORM</div>
      <div style={{ fontFamily: ANTON, fontSize: 84, margin: "18px 0 6px" }}>{who}</div>
      <div style={{ fontFamily: INTER, fontWeight: 800, fontSize: 48 }}>{what}</div>
      <div style={{ fontFamily: MONO, fontSize: 30, marginTop: 24, opacity: 0.6 }}>DATE: 19 NOV 2026 · REASON: GTA 6</div>
    </div>
    <Stamp text="APPROVED" color={C.green} top={1000} delay={Math.round(stampAt * FPS)} />
  </>;
};

/* ---------- 1% bar ---------- */
const OnePercent: React.FC = () => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig(); const t = f / fps;
  const grow = interpolate(t, [0.2, 1.4], [0, 1], clamp);
  return <>
    <div style={{ position: "absolute", left: 0, right: 0, top: 380, textAlign: "center", fontFamily: ANTON, fontSize: 90, color: C.white, textShadow: outline(6) }}>ONE DAY OF US OUTPUT</div>
    <div style={{ position: "absolute", left: 90, top: 560, width: 900 * grow, height: 180, background: C.blue, borderRadius: 14, border: "6px solid #000" }} />
    <div style={{ position: "absolute", left: 90, top: 760, width: 900, textAlign: "right", fontFamily: ANTON, fontSize: 70, color: C.blue, textShadow: outline(5), opacity: grow }}>≈ $80+ BILLION</div>
    {t > 1.4 ? <>
      <div style={{ position: "absolute", left: 90, top: 560, width: 12, height: 180, background: C.red }} />
      <div style={{ position: "absolute", left: 60, top: 900, fontFamily: ANTON, fontSize: 120, color: C.red, textShadow: outline(7) }}>$1B ≈ 1%</div>
    </> : null}
  </>;
};

/* ---------- calendar (80 hours = 2 work weeks) ---------- */
const Calendar: React.FC = () => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig(); const t = f / fps;
  const days = ["MON", "TUE", "WED", "THU", "FRI"];
  return <div style={{ position: "absolute", left: 80, right: 80, top: 520, display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 16 }}>
    {Array.from({ length: 10 }).map((_, i) => {
      const on = t > 0.2 + i * 0.22;
      return <div key={i} style={{ height: 190, borderRadius: 12, border: "5px solid #000", background: on ? C.pink : "rgba(255,255,255,0.15)",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: ANTON, color: C.white, textShadow: outline(3) }}>
        <div style={{ fontSize: 34 }}>{days[i % 5]}</div><div style={{ fontSize: 60 }}>{on ? "🎮" : ""}</div></div>;
    })}
  </div>;
};

/* ---------- captions (3-word chunks, current word highlighted) ---------- */
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
  const clean = (w: string) => w.replace(/^VI$/, "6").replace("GTA", "GTA").toUpperCase();
  return <div style={{ position: "absolute", left: 40, right: 40, top: 1640, textAlign: "center" }}>
    {c.ws.map((w, i) => <span key={i} style={{ fontFamily: ANTON, fontSize: 78, marginRight: 18,
      color: t >= w.s && t < w.e + 0.15 ? C.gold : C.white, textShadow: outline(6) }}>{clean(w.w)}</span>)}
  </div>;
};

/* ---------- overlays timeline (VO seconds) ---------- */
type Ov = { a: number; b: number; el: React.ReactNode; sfx?: "hit" | "whoosh" | "tick" };
const OV: Ov[] = [
  { a: 0, b: 3.1, el: <Big text="THE BILL FOR GTA 6 DAY" size={130} top={700} />, sfx: "whoosh" },
  { a: 3.1, b: 4.9, el: <Big text="$1,000,000,000" color={C.red} size={150} top={760} />, sfx: "hit" },
  { a: 4.9, b: 9.7, el: <><Big text="WHAT AMERICA LOSES?" size={110} top={720} /><Source tier="REPORTED" outlet="estimate via WGN / Nexstar" /></> },
  { a: 9.7, b: 11.1, el: <Big text="WHO'S SKIPPING?" color={C.gold} size={140} top={760} />, sfx: "whoosh" },
  { a: 11.1, b: 18.0, el: <><Receipt lines={[
      { at: 1.1, left: "WORKERS TRACKED", right: "3,400,000" },
      { at: 3.7, left: "LEAVE REQUESTS", right: "" },
      { at: 5.5, left: "  vs. 2024 & 2025", right: "+13%", bold: true, color: "#D11" }]} title="RECEIPT · WHO'S OFF" />
      <Source tier="REPORTED" outlet="BambooHR" /></>, sfx: "tick" },
  { a: 18.0, b: 22.7, el: <><OneIn n={5} lightAt={2.2} label="1 IN 5" sub="PLAN TO TAKE THE DAY OFF" /><Source tier="REPORTED" outlet="BambooHR survey" /></> },
  { a: 22.7, b: 25.1, el: <OneIn n={3} lightAt={1.1} label="GEN Z: 1 IN 3" sub="32% OF GEN Z WORKERS" /> },
  { a: 25.1, b: 27.4, el: <Big text="SOME BOSSES SAID YES" color={C.green} size={120} top={760} />, sfx: "whoosh" },
  { a: 27.4, b: 32.6, el: <><Form who="US ARMY BATTALION" what="4-DAY PASS (IF YOU RE-ENLIST)" stampAt={2.6} /><Source tier="REPORTED" outlet="Business Insider" /></>, sfx: "hit" },
  { a: 32.6, b: 35.5, el: <><Form who="CALIFORNIA CAR SHOP" what="CLOSED FOR THE DAY" stampAt={1.7} /><Source tier="REPORTED" outlet="ABP Live" /></>, sfx: "hit" },
  { a: 35.5, b: 36.7, el: <Big text="THE TWIST" color={C.gold} size={190} top={760} />, sfx: "whoosh" },
  { a: 36.7, b: 39.1, el: <Big text="$1 BILLION SOUNDS HUGE…" size={120} top={740} /> },
  { a: 39.1, b: 43.7, el: <><OnePercent /><Source tier="OUR MATHS" outlet="$1B ÷ one day of US GDP" /></> },
  { a: 43.7, b: 46.1, el: <Big text="ECONOMY: 😴" size={150} top={760} /> },
  { a: 46.1, b: 47.3, el: <Big text="YOUR BOSS: 😡" color={C.red} size={150} top={760} />, sfx: "hit" },
  { a: 47.3, b: 51.6, el: <><Big text="80 HOURS" color={C.gold} size={220} top={700} /><Source tier="REPORTED" outlet="Rob Nelson, Rockstar · NYT via IGN" /></>, sfx: "hit" },
  { a: 51.6, b: 54.6, el: <><Big text="= 2 WORK WEEKS" size={110} top={360} /><Calendar /></>, sfx: "tick" },
  { a: 54.6, b: 58.3, el: <Receipt lines={[{ at: 0.2, left: "GTA 6 LAUNCH DAY", right: "$1B" }, { at: 0.5, left: "YOUR NEXT 2 WEEKS", right: "80 HRS" }]}
      title="FINAL BILL" total={{ at: 1.2, text: "PAID BY: ???" }} />, sfx: "hit" },
];

export const Short020: React.FC = () => (
  <AbsoluteFill style={{ background: C.night }}>
    {BG.map((g, i) => <Sequence key={`b${i}`} from={fr(g.a)} durationInFrames={Math.max(fr(g.b) - fr(g.a), 1)}><BgClip g={g} /></Sequence>)}
    {OV.map((o, i) => <Sequence key={`o${i}`} from={fr(o.a)} durationInFrames={Math.max(fr(o.b) - fr(o.a), 1)}><AbsoluteFill>{o.el}</AbsoluteFill></Sequence>)}
    <Captions />
    <Sequence from={fr(0)}><Audio src={staticFile("clips/020/vo.mp3")} /></Sequence>
    {OV.filter((o) => o.sfx).map((o, i) => <Sequence key={`s${i}`} from={fr(o.a)}><Audio src={staticFile(`clips/006/sfx/${o.sfx}.wav`)} volume={0.45} /></Sequence>)}
  </AbsoluteFill>
);

/* ---------- cover / thumbnail (1080×1920 and 1280×720) ---------- */
const CoverArt: React.FC<{ w: number; h: number }> = ({ w, h }) => {
  const vertical = h > w;
  return (
    <AbsoluteFill style={{ background: C.night, overflow: "hidden" }}>
      <img src={staticFile("frames/lt-27.5.jpg")} style={{ position: "absolute", height: h * (vertical ? 1.0 : 1.25), left: vertical ? -h * 0.42 : -40,
        top: vertical ? 0 : -h * 0.12, filter: "saturate(1.3) contrast(1.12) brightness(0.9)" }} />
      <AbsoluteFill style={{ background: "linear-gradient(0deg, rgba(8,2,20,0.9) 0%, rgba(8,2,20,0.2) 55%, rgba(8,2,20,0.4) 100%)" }} />
      <div style={{ position: "absolute", left: vertical ? 90 : 680, right: vertical ? 90 : 40, top: vertical ? 300 : 40, background: "#F7F3EA",
        padding: vertical ? "40px 44px" : "22px 26px", transform: "rotate(4deg)", boxShadow: "0 20px 60px rgba(0,0,0,0.7)" }}>
        <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: vertical ? 40 : 26, textAlign: "center", letterSpacing: 3, color: "#141414" }}>RECEIPT · 19 NOV</div>
        <div style={{ borderTop: "4px dashed #141414", margin: "12px 0" }} />
        <div style={{ fontFamily: MONO, fontSize: vertical ? 34 : 22, color: "#141414", display: "flex", justifyContent: "space-between" }}><span>SICK DAY</span><span>x 1</span></div>
        <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: vertical ? 72 : 46, color: "#D11", marginTop: 10 }}>$1,000,000,000</div>
      </div>
      <div style={{ position: "absolute", left: vertical ? 40 : 30, right: vertical ? 40 : 600, bottom: vertical ? 260 : 30, fontFamily: ANTON,
        fontSize: vertical ? 170 : 120, lineHeight: 0.95, color: C.white, textShadow: outline(8), transform: "skewX(-5deg)" }}>
        GTA 6<br /><span style={{ color: C.gold }}>SICK DAY</span>
      </div>
    </AbsoluteFill>
  );
};
export const Short020Cover: React.FC = () => <CoverArt w={1080} h={1920} />;
export const Thumb020: React.FC = () => <CoverArt w={1280} h={720} />;
