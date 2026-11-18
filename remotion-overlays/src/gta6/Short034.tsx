import React from "react";
import { AbsoluteFill, Audio, interpolate, OffthreadVideo, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import words from "./r034-words.json";
import { ANTON, C, clamp, INTER, MONO, outline } from "./theme";

// Short 034 — "GTA 6 Got a 99. Here's What's Hiding in Hour One" (1080×1920, 30 fps).
// VO: performed Fenrir take (production/audio/034-vo-performed-fenrir.mp3), every cut and graphic timed to its Whisper word timestamps.
// Footage: official Rockstar trailers only (muted). No stream footage, no in-game TV, no story. Script: scripts/034-short-99-and-first-hour.md.

const FPS = 30;
const LEAD = 0.3;
const fr = (sec: number) => Math.round((sec + LEAD) * FPS);
const at = (sec: number, a: number) => Math.round((sec - a) * FPS);
type W = { w: string; s: number; e: number };
const T1 = "clips/GTAVI_Trailer_1.mp4";
const P = "clips/024/";
const E = "clips/006p/";

/* ---------- background clips ---------- */
type Bg = { a: number; b: number; src: string; start?: number; x?: number; x1?: number; rate?: number; zoom?: number; dim?: number };
const BgClip: React.FC<{ g: Bg }> = ({ g }) => {
  const f = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const p = f / Math.max(durationInFrames, 1);
  const s = (g.zoom ?? 1.08) + 0.06 * p;
  const x = g.x1 !== undefined ? interpolate(p, [0, 1], [g.x ?? 50, g.x1]) : g.x ?? 50;
  const d = g.dim ?? 0.25;
  return (
    <AbsoluteFill style={{ transform: `scale(${s})`, transformOrigin: `${x}% 50%` }}>
      <OffthreadVideo src={staticFile(g.src)} startFrom={Math.round((g.start ?? 0) * FPS)} playbackRate={g.rate ?? 1} muted
        style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: `${x}% 50%`, filter: "saturate(1.15) contrast(1.06)" }} />
      <AbsoluteFill style={{ background: `linear-gradient(180deg, rgba(6,4,14,${d + 0.25}) 0%, rgba(6,4,14,${d}) 30%, rgba(6,4,14,${d}) 70%, rgba(6,4,14,${d + 0.4}) 100%)` }} />
    </AbsoluteFill>
  );
};

/* ---------- graphics ---------- */
const pop = (f: number, fps: number, d = 0) => spring({ frame: f - d, fps, config: { damping: 11, stiffness: 190 } });

const Big: React.FC<{ text: string; color?: string; size?: number; top?: number; delay?: number }> = ({ text, color = C.white, size = 120, top = 240, delay = 0 }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig(); const k = pop(f, fps, delay);
  if (f < delay) return null;
  return <div style={{ position: "absolute", left: 40, right: 40, top, textAlign: "center", fontFamily: ANTON, fontSize: size, lineHeight: 1.02,
    color, textShadow: outline(8), transform: `scale(${0.6 + 0.4 * k})`, opacity: k }}>{text}</div>;
};

const Stamp: React.FC<{ text: string; color?: string; top: number; delay?: number; rot?: number; size?: number }> = ({ text, color = C.red, top, delay = 0, rot = -6, size = 104 }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const k = spring({ frame: f - delay, fps, config: { damping: 9, stiffness: 260 } });
  if (f < delay) return null;
  return <div style={{ position: "absolute", left: 0, right: 0, top, textAlign: "center" }}>
    <span style={{ display: "inline-block", fontFamily: ANTON, fontSize: size, color, border: `10px solid ${color}`, padding: "0 34px", borderRadius: 16,
      transform: `rotate(${rot}deg) scale(${interpolate(k, [0, 1], [2.2, 1])})`, textShadow: outline(4), background: "rgba(7,7,12,0.6)" }}>{text}</span>
  </div>;
};

const Tag: React.FC<{ tier: "REPORTED" | "SEEN IN-GAME" | "LIVE CHAT"; text: string; top?: number }> = ({ tier, text, top = 1470 }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig(); const k = pop(f, fps, 4);
  const col = tier === "REPORTED" ? C.blue : tier === "SEEN IN-GAME" ? C.green : C.pink;
  return <div style={{ position: "absolute", left: 50, top, transform: `translateX(${(1 - k) * -600}px)`, display: "flex", gap: 12,
    alignItems: "center", background: "rgba(7,7,12,0.85)", borderLeft: `8px solid ${col}`, padding: "10px 20px", borderRadius: 8 }}>
    <span style={{ fontFamily: MONO, fontWeight: 700, fontSize: 28, color: col }}>● {tier}</span>
    <span style={{ fontFamily: INTER, fontWeight: 700, fontSize: 28, color: C.white }}>· {text}</span>
  </div>;
};

const Chip: React.FC<{ text: string; delay: number; color?: string }> = ({ text, delay, color = C.gold }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig(); const k = pop(f, fps, delay);
  if (f < delay) return null;
  return <span style={{ display: "inline-block", margin: "10px 10px", padding: "10px 26px", borderRadius: 50, background: "rgba(7,7,12,0.85)",
    border: `5px solid ${color}`, fontFamily: ANTON, fontSize: 62, color, transform: `translateY(${(1 - k) * 60}px) scale(${0.7 + 0.3 * k})`, opacity: k,
    textShadow: outline(2) }}>{text}</span>;
};

/** Phone-style clock: 11:59 PM IST, flips to 12:00 AM at `flipAt` (local frame). */
const Clock: React.FC<{ flipAt?: number }> = ({ flipAt }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig(); const k = pop(f, fps);
  const flipped = flipAt !== undefined && f >= flipAt;
  const fk = flipAt !== undefined ? spring({ frame: f - flipAt, fps, config: { damping: 10, stiffness: 220 } }) : 0;
  const blink = Math.floor(f / 15) % 2 === 0;
  return <div style={{ position: "absolute", left: 0, right: 0, top: 150, textAlign: "center", opacity: k, transform: `translateY(${(1 - k) * -80}px)` }}>
    <div style={{ display: "inline-block", background: "rgba(7,7,12,0.82)", border: `6px solid ${flipped ? C.pink : C.gold}`, borderRadius: 28, padding: "10px 46px",
      transform: `scale(${flipped ? 1 + 0.15 * (1 - fk) : 1})` }}>
      <span style={{ fontFamily: ANTON, fontSize: 150, color: flipped ? C.pink : C.white, textShadow: outline(5) }}>
        {flipped ? "12" : "11"}<span style={{ opacity: blink ? 1 : 0.25 }}>:</span>{flipped ? "00" : "59"}</span>
      <span style={{ fontFamily: ANTON, fontSize: 60, color: C.gold, marginLeft: 18 }}>{flipped ? "AM" : "PM"} IST</span>
    </div>
  </div>;
};

/** Metacritic-style score box (our design, no logo) counting up to 99, then the IGN 10/10 card. */
const Score: React.FC<{ ignAt: number }> = ({ ignAt }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig(); const k = pop(f, fps);
  const n = Math.round(interpolate(f, [0, 14], [70, 99], clamp));
  const ik = pop(f, fps, ignAt);
  return <>
    <div style={{ position: "absolute", left: 0, right: 0, top: 330, display: "flex", justifyContent: "center", transform: `scale(${0.4 + 0.6 * k})` }}>
      <div style={{ width: 430, height: 430, borderRadius: 40, background: "#22C55E", border: "12px solid #0b0b0b", display: "flex", alignItems: "center",
        justifyContent: "center", fontFamily: ANTON, fontSize: 300, color: "#fff", textShadow: outline(6), boxShadow: "0 30px 60px rgba(0,0,0,0.6)" }}>{n}</div>
    </div>
    <div style={{ position: "absolute", left: 0, right: 0, top: 800, textAlign: "center", fontFamily: ANTON, fontSize: 76, color: C.white, textShadow: outline(6), opacity: k }}>ON METACRITIC</div>
    {f >= ignAt && <div style={{ position: "absolute", left: 0, right: 0, top: 940, textAlign: "center", transform: `scale(${0.5 + 0.5 * ik})`, opacity: ik }}>
      <span style={{ display: "inline-block", background: C.red, color: "#fff", fontFamily: ANTON, fontSize: 110, padding: "4px 40px", borderRadius: 18, border: "8px solid #111" }}>IGN 10/10</span>
    </div>}
  </>;
};

/** One big word label per cut (WATER / STORMS / HAIR). */
const Word: React.FC<{ text: string; color: string }> = ({ text, color }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig(); const k = pop(f, fps);
  return <div style={{ position: "absolute", left: 0, right: 0, top: 760, textAlign: "center", fontFamily: ANTON, fontSize: 210, color,
    textShadow: `${outline(9)}, 0 0 60px ${color}`, transform: `scale(${1.6 - 0.6 * k})`, opacity: k, letterSpacing: 6 }}>{text}</div>;
};

/** A chat bubble (our design; no username, no Twitch UI). */
const ChatBubble: React.FC<{ text: string; delay?: number }> = ({ text, delay = 0 }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig(); const k = pop(f, fps, delay);
  if (f < delay) return null;
  const n = Math.min(text.length, Math.floor((f - delay) * 1.6) + 1); // typing effect
  return <div style={{ position: "absolute", left: 70, right: 70, top: 640, transform: `scale(${0.7 + 0.3 * k}) rotate(-2deg)`, opacity: k }}>
    <div style={{ background: "#fff", borderRadius: 46, padding: "40px 50px", boxShadow: "0 24px 50px rgba(0,0,0,0.55)", border: `8px solid ${C.pink}` }}>
      <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 34, color: C.pink, marginBottom: 10 }}>💬 LIVE CHAT</div>
      <div style={{ fontFamily: ANTON, fontSize: 104, lineHeight: 1.03, color: "#111" }}>{text.slice(0, n)}<span style={{ opacity: n < text.length ? 1 : 0 }}>|</span></div>
    </div>
    <div style={{ width: 0, height: 0, marginLeft: 120, borderLeft: "40px solid transparent", borderRight: "40px solid transparent", borderTop: `56px solid ${C.pink}` }} />
  </div>;
};

/** Our illustrated book: closed cover → opens on `openAt` → pages flip on `flipAt`; placeholder lines only (never Rockstar's text). */
const Book: React.FC<{ openAt: number; flipAt: number; countAt: number }> = ({ openAt, flipAt, countAt }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig(); const k = pop(f, fps);
  const o = spring({ frame: f - openAt, fps, config: { damping: 14, stiffness: 120 } });
  const flip = interpolate(f, [flipAt, flipAt + 10], [0, 180], clamp);
  const ck = pop(f, fps, countAt);
  const lines = (seed: number) => Array.from({ length: 11 }, (_, i) => <div key={i} style={{ height: 14, margin: "15px 0", borderRadius: 7, background: "#9a8f7c",
    width: `${70 + ((i * 37 + seed) % 28)}%`, opacity: 0.7 }} />);
  return <>
    <div style={{ position: "absolute", left: 0, right: 0, top: 380, display: "flex", justifyContent: "center", transform: `translateY(${(1 - k) * 400}px)`, perspective: 2000 }}>
      <div style={{ position: "relative", width: 760, height: 560 }}>
        {/* right page */}
        <div style={{ position: "absolute", left: 380, top: 0, width: 380, height: 560, background: "#f4ecd8", borderRadius: "0 14px 14px 0", padding: "40px 36px",
          boxShadow: "0 30px 60px rgba(0,0,0,0.6)", opacity: o }}>
          <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 26, color: "#5b5140", marginBottom: 8 }}>[ CHAPTER 7 ]</div>{lines(3)}</div>
        {/* left page */}
        <div style={{ position: "absolute", left: 0, top: 0, width: 380, height: 560, background: "#efe5cf", borderRadius: "14px 0 0 14px", padding: "40px 36px",
          boxShadow: "0 30px 60px rgba(0,0,0,0.6)", opacity: o }}>{lines(11)}</div>
        {/* turning page */}
        {f >= flipAt && <div style={{ position: "absolute", left: 380, top: 0, width: 380, height: 560, background: "#fbf5e6", transformOrigin: "0% 50%",
          transform: `rotateY(${-flip}deg)`, padding: "40px 36px", backfaceVisibility: "hidden" }}>{lines(23)}</div>}
        {/* cover */}
        <div style={{ position: "absolute", left: 380, top: 0, width: 380, height: 560, background: "linear-gradient(160deg,#2453d8,#14308f)", borderRadius: "0 14px 14px 0",
          border: "6px solid #0d1d5c", transformOrigin: "0% 50%", transform: `rotateY(${-178 * o}deg)`, backfaceVisibility: "hidden", display: "flex",
          flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <div style={{ fontFamily: ANTON, fontSize: 64, color: "#cfe0ff", textAlign: "center", lineHeight: 1 }}>A GOOD<br />BOOK</div>
          <div style={{ width: 120, height: 8, background: "#cfe0ff", margin: "26px 0", borderRadius: 4 }} />
          <div style={{ fontFamily: MONO, fontSize: 24, color: "#cfe0ff" }}>ILLUSTRATION</div>
        </div>
      </div>
    </div>
    {f >= countAt && <div style={{ position: "absolute", left: 0, right: 0, top: 1000, textAlign: "center", transform: `scale(${0.5 + 0.5 * ck})`, opacity: ck }}>
      <span style={{ display: "inline-block", fontFamily: ANTON, fontSize: 92, color: "#111", background: C.gold, padding: "4px 36px", borderRadius: 16, border: "8px solid #111" }}>
        📖 1 / 27 TO COLLECT</span>
    </div>}
  </>;
};

/** Cash counter that drains to $0, then the STEAL → STASH → PAID LATER flow. */
const CashFlow: React.FC<{ drainAt: number; stashAt: number; paidAt: number }> = ({ drainAt, stashAt, paidAt }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig(); const k = pop(f, fps);
  const cash = Math.round(interpolate(f, [drainAt, drainAt + 12], [600, 0], clamp));
  const shake = f >= drainAt && f < drainAt + 12 ? Math.sin(f * 2.3) * 8 : 0;
  return <>
    <div style={{ position: "absolute", right: 60, top: 210, transform: `translateX(${(1 - k) * 500 + shake}px)`, fontFamily: ANTON, fontSize: 130,
      color: cash > 0 ? C.green : C.red, textShadow: outline(6) }}>${cash}</div>
    <div style={{ position: "absolute", left: 30, right: 30, top: 1150, textAlign: "center" }}>
      <Chip text="STEAL" delay={0} color={C.red} />
      <Chip text="→ STASH" delay={stashAt} color={C.amber} />
      <Chip text="→ PAID LATER ⏳" delay={paidAt} color={C.green} />
    </div>
  </>;
};

/** GPS turn banner (our design) sliding down from the top. */
const Gps: React.FC<{ delay: number }> = ({ delay }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig(); const k = pop(f, fps, delay);
  if (f < delay) return null;
  return <div style={{ position: "absolute", left: 80, right: 80, top: 260, transform: `translateY(${(1 - k) * -300}px)`, display: "flex", alignItems: "center",
    gap: 30, background: "rgba(10,24,40,0.92)", borderRadius: 26, padding: "26px 40px", border: `6px solid ${C.blue}` }}>
    <div style={{ width: 150, height: 150, borderRadius: 22, background: C.blue, display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: ANTON, fontSize: 120, color: "#fff" }}>↱</div>
    <div>
      <div style={{ fontFamily: ANTON, fontSize: 88, color: "#fff", lineHeight: 1 }}>TURN RIGHT</div>
      <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 48, color: C.blue }}>323 FT</div>
    </div>
  </div>;
};

/** Icon row for the close. */
const Icons: React.FC<{ delay: number }> = ({ delay }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  return <div style={{ position: "absolute", left: 0, right: 0, top: 1050, display: "flex", justifyContent: "center", gap: 36 }}>
    {["📖", "💰", "🧭", "👁️"].map((e, i) => { const k = pop(f, fps, delay + i * 4);
      return f < delay + i * 4 ? null : <div key={i} style={{ width: 170, height: 170, borderRadius: 30, background: "rgba(7,7,12,0.85)", border: `6px solid ${C.gold}`,
        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 100, transform: `scale(${0.4 + 0.6 * k})` }}>{e}</div>; })}
  </div>;
};

const Flash: React.FC<{ color?: string }> = ({ color = "#fff" }) => { const f = useCurrentFrame();
  return <AbsoluteFill style={{ background: color, opacity: interpolate(f, [0, 6], [0.5, 0], clamp) }} />; };

/** 30 FPS joke: a few held frames + shake on the chip. */
const FpsChip: React.FC = () => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig(); const k = pop(f, fps);
  const step = Math.floor(f / 3) * 3; // stuttery 10 fps feel on the chip only
  return <div style={{ position: "absolute", left: 0, right: 0, top: 700, textAlign: "center", transform: `scale(${0.5 + 0.5 * k}) translateX(${Math.sin(step) * 10}px)` }}>
    <span style={{ display: "inline-block", fontFamily: ANTON, fontSize: 170, color: "#111", background: C.amber, padding: "0 46px", borderRadius: 24, border: "10px solid #111" }}>30 FPS</span>
    <div style={{ fontFamily: ANTON, fontSize: 70, color: C.white, textShadow: outline(6), marginTop: 26 }}>THE ONLY REAL COMPLAINT</div>
  </div>;
};

/* ---------- captions ---------- */
const WORDS = words as W[];
const chunks: { s: number; e: number; ws: W[] }[] = [];
for (let i = 0; i < WORDS.length; ) {
  const ws: W[] = [];
  while (i < WORDS.length && ws.length < 3) { ws.push(WORDS[i]); i++; if (/[.?!,]$/.test(ws[ws.length - 1].w)) break; }
  chunks.push({ s: ws[0].s, e: ws[ws.length - 1].e, ws });
}
const Captions: React.FC = () => {
  const f = useCurrentFrame(); const t = f / FPS - LEAD;
  const c = chunks.find((x, i) => t >= x.s && t < (chunks[i + 1]?.s ?? x.e + 0.6));
  if (!c || t > c.e + 0.8) return null;
  return <div style={{ position: "absolute", left: 30, right: 30, top: 1640, textAlign: "center" }}>
    {c.ws.map((w, i) => <span key={i} style={{ fontFamily: ANTON, fontSize: 84, marginRight: 18,
      color: t >= w.s && t < w.e + 0.15 ? C.gold : C.white, textShadow: outline(6) }}>{w.w.toUpperCase()}</span>)}
  </div>;
};

/* ---------- timeline (VO seconds) ---------- */
const BG: Bg[] = [
  { a: 0.0, b: 2.0, src: P + "x_lt_0027_hero.mp4", start: 0, x: 26, x1: 70, rate: 0.5 },          // "You're playing GTA 6 tonight"
  { a: 2.0, b: 5.9, src: T1, start: 2.2, x: 50, rate: 0.7 },                                      // sunset over the highway
  { a: 5.9, b: 10.0, src: E + "el_1848_skydive.mp4", start: 1.0, x: 50, dim: 0.4 },                 // 99 / IGN 10
  { a: 10.0, b: 12.1, src: T1, start: 18.0, x: 50 },                                              // "you can see why"
  { a: 12.1, b: 13.0, src: P + "keys_aerial.mp4", start: 1.4, x: 50 },                             // WATER
  { a: 13.0, b: 14.2, src: T1, start: 52.6, x: 55 },                                              // STORMS (wind-whipped palms)
  { a: 14.2, b: 16.4, src: P + "x_lt_0027_hero.mp4", start: 0.6, x: 24, rate: 0.5 },               // HAIR
  { a: 16.4, b: 19.6, src: T1, start: 11.6, x: 50, rate: 0.8 },                                   // "Is this real life?" beach aerial
  { a: 19.6, b: 23.6, src: E + "el_1812_phone.mp4", start: 1.0, x: 45, rate: 0.8 },                // the small stuff
  { a: 23.6, b: 29.4, src: T1, start: 71.6, x: 45, rate: 0.6, dim: 0.62 },                         // book (lamp-lit room, dimmed)
  { a: 29.4, b: 32.7, src: T1, start: 67.8, x: 45, rate: 0.8 },                                    // steal: masked store robbery
  { a: 32.7, b: 36.2, src: P + "brian_official.mp4", start: 0, x: 55 },                            // the lockup owner
  { a: 36.2, b: 37.4, src: P + "jason_t1drive.mp4", start: 0.5, x: 55 },                           // get in a car
  { a: 37.4, b: 40.6, src: E + "el_1524_chase.mp4", start: 2.0, x: 35 },                           // GPS
  { a: 40.6, b: 44.2, src: P + "jason_drive.mp4", start: 2.0, x: 70, rate: 0.7 },                   // first person missing
  { a: 44.2, b: 47.2, src: P + "robbery_guns.mp4", start: 0.6, x: 40, rate: 0.6 },                  // when you aim
  { a: 47.2, b: 51.3, src: P + "x_lt_supercars.mp4", start: 0, x: 34, rate: 0.4 },                  // 30 FPS
  { a: 51.3, b: 55.7, src: T1, start: 36.05, x: 50, rate: 0.28 },                                    // "bad fps but looks good though" bridge aerial
  { a: 55.7, b: 57.3, src: T1, start: 75.4, x: 50 },                                               // see you at midnight
  { a: 57.3, b: 59.6, src: T1, start: 80.2, x: 50, dim: 0.1 },                                     // VI logo
];

type Ov = { a: number; b: number; el: (a: number) => React.ReactNode; sfx?: "hit" | "whoosh" | "tick" };
const OV: Ov[] = [
  { a: 0.0, b: 5.9, el: (a) => <><Clock /><Big text="BEFORE YOU PLAY…" size={110} top={1180} delay={at(2.1, a)} /></>, sfx: "tick" },
  { a: 5.9, b: 10.0, el: (a) => <><Score ignAt={at(8.24, a)} /><Tag tier="REPORTED" text="Metacritic · IGN" /></>, sfx: "hit" },
  { a: 10.0, b: 12.1, el: (a) => <Big text="YOU CAN SEE WHY 👀" size={110} top={760} delay={at(10.9, a)} /> },
  { a: 12.1, b: 13.0, el: () => <Word text="WATER" color={C.blue} />, sfx: "whoosh" },
  { a: 13.0, b: 14.2, el: () => <Word text="STORMS" color={C.amber} />, sfx: "whoosh" },
  { a: 14.2, b: 16.4, el: () => <Word text="HAIR" color={C.pink} />, sfx: "whoosh" },
  { a: 16.4, b: 19.6, el: (a) => <><ChatBubble text="IS THIS REAL LIFE?" delay={at(17.9, a)} /><Tag tier="LIVE CHAT" text="first GTA 6 streams · 18 Nov" /></> },
  { a: 19.6, b: 23.6, el: (a) => <><Big text="THE SMALL STUFF 🔍" color={C.gold} size={120} top={760} delay={at(22.3, a)} /><Sequence from={at(21.2, a)}><Flash /></Sequence></>, sfx: "hit" },
  { a: 23.6, b: 29.4, el: (a) => <><Book openAt={at(25.5, a)} flipAt={at(26.4, a)} countAt={at(27.9, a)} /><Tag tier="SEEN IN-GAME" text="launch-day gameplay" /></>, sfx: "whoosh" },
  { a: 29.4, b: 36.2, el: (a) => <><CashFlow drainAt={at(31.2, a)} stashAt={at(33.6, a)} paidAt={at(35.0, a)} /><Tag tier="SEEN IN-GAME" text="launch-day gameplay" /></>, sfx: "whoosh" },
  { a: 36.2, b: 40.6, el: (a) => <><Gps delay={at(38.4, a)} /><Tag tier="SEEN IN-GAME" text="launch-day gameplay" /></>, sfx: "whoosh" },
  { a: 40.6, b: 47.2, el: (a) => <><Big text="FIRST PERSON?" size={140} top={300} delay={at(42.5, a)} />
      <Stamp text="NOT AT LAUNCH" top={520} delay={at(44.3, a)} />
      <div style={{ position: "absolute", left: 30, right: 30, top: 1150, textAlign: "center" }}><Chip text="ONLY WHEN AIMING 🎯" delay={at(46.0, a)} color={C.gold} /></div>
      <Tag tier="REPORTED" text="Insider Gaming · GTA Intel" /></>, sfx: "whoosh" },
  { a: 47.2, b: 51.3, el: (a) => <><Sequence from={at(49.5, a)}><FpsChip /></Sequence><Tag tier="REPORTED" text="critic reviews" /></>, sfx: "hit" },
  { a: 51.3, b: 55.7, el: (a) => <><ChatBubble text="BAD FPS BUT LOOKS GOOD THOUGH" delay={at(53.4, a)} /><Tag tier="LIVE CHAT" text="first GTA 6 streams · 18 Nov" /></> },
  { a: 55.7, b: 59.6, el: (a) => <><Clock flipAt={at(56.5, a)} /><Big text="WHICH ONE FIRST?" color={C.gold} size={110} top={1330} delay={at(57.4, a)} />
      <Icons delay={at(57.5, a)} /></>, sfx: "tick" },
];

export const SHORT034_FRAMES = fr(59.5);
export const Short034: React.FC = () => (
  <AbsoluteFill style={{ background: C.night }}>
    {BG.map((g, i) => <Sequence key={`b${i}`} from={fr(g.a)} durationInFrames={Math.max(fr(g.b) - fr(g.a), 1)}><BgClip g={g} /></Sequence>)}
    {OV.map((o, i) => <Sequence key={`o${i}`} from={fr(o.a)} durationInFrames={Math.max(fr(o.b) - fr(o.a), 1)}><AbsoluteFill>{o.el(o.a)}</AbsoluteFill></Sequence>)}
    <Captions />
    <Sequence from={fr(0)}><Audio src={staticFile("clips/034/vo.mp3")} /></Sequence>
    {OV.filter((o) => o.sfx).map((o, i) => <Sequence key={`s${i}`} from={fr(o.a)}><Audio src={staticFile(`clips/006/sfx/${o.sfx}.wav`)} volume={0.35} /></Sequence>)}
  </AbsoluteFill>
);
