import React from "react";
import { AbsoluteFill, Audio, Freeze, interpolate, Loop, OffthreadVideo, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import words from "./r010-words.json";
import { ANTON, C, clamp, outline } from "./theme";

// Reel 010 — "Real Miami… or GTA 6?" (1080×1920, 30 fps). Every cut is timed to the voiceover's word timestamps (Whisper),
// so the footage shows the thing being named at the moment it is said. See scripts/010-real-miami-or-gta6-reel.md.

const FPS = 30;
const VO = 2.0; // voice starts after a 2 s silent open
const f = (sec: number) => Math.round(sec * FPS);
export const REEL010_FRAMES = f(40);

type Focus = { x: number; y: number; s: number };
type Seg = {
  at: number; end: number; src: string; start?: number; rate?: number; freeze?: number;
  from?: Focus; to?: Focus; punch?: boolean; dim?: number;
};
const CENTER: Focus = { x: 540, y: 960, s: 1 };
const CL = "clips/010/clean.mp4";
const NM = "clips/010/named.mp4";

// named.mp4: Rockstar's Story (888 px wide) centred at x=96 → "onlyindade" ≈ (216,277), "rockstargames" ≈ (330,170)
const ONLY: Focus = { x: 330, y: 650, s: 1.8 };
const ROCK: Focus = { x: 420, y: 645, s: 1.8 };

const SEGS: Seg[] = [
  { at: 0, end: 2.0, src: CL, start: 5.0 },                                                   // silent open: lowrider
  { at: 2.0, end: 4.56, src: CL, start: 7.0, from: CENTER, to: { x: 540, y: 900, s: 1.15 } }, // "look closely"
  { at: 4.56, end: 5.21, src: CL, start: 0.0, punch: true },                                  // "a street in Miami" — pink car
  { at: 5.21, end: 5.86, src: CL, start: 9.0, punch: true },                                  // classic car
  { at: 5.86, end: 6.52, src: CL, start: 12.3, punch: true },                                 // palm trees
  { at: 6.52, end: 9.9, src: CL, freeze: 16.8, from: CENTER, to: { x: 540, y: 960, s: 1.06 } }, // "or are you?" + stamp
  { at: 9.9, end: 12.74, src: NM, start: 5.0, from: CENTER, to: ONLY },                       // "Only In Dade posted it"
  { at: 12.74, end: 15.38, src: NM, start: 7.84, from: ONLY, to: ROCK },                      // "Rockstar shared it… Instagram"
  { at: 15.38, end: 16.3, src: "clips/010/p_aerial.mp4", start: 0 },                          // "For years"
  { at: 16.3, end: 16.94, src: "clips/010/p_filmer.mp4", start: 0.1 },                        // "people filmed"
  { at: 16.94, end: 18.92, src: "clips/010/p_colony_day.mp4", start: 0 },                     // "real Miami and said"
  { at: 18.92, end: 20.4, src: "clips/010/p_colony_night.mp4", start: 0 },                    // "this looks like GTA"
  { at: 20.4, end: 23.52, src: CL, start: 12.3 },                                             // "rebuilt inside the game"
  { at: 23.52, end: 24.7, src: CL, start: 2.0, rate: 0.5, dim: 0.15 },                        // "Look at the details"
  { at: 24.7, end: 25.58, src: CL, start: 3.6, from: { x: 700, y: 1000, s: 1.15 }, to: { x: 700, y: 1000, s: 1.4 } },  // "the cars" — police car
  { at: 25.58, end: 26.74, src: CL, start: 5.0, from: { x: 650, y: 470, s: 1.6 }, to: { x: 650, y: 470, s: 1.85 } },   // "shop signs" — diner sign
  { at: 26.74, end: 28.24, src: CL, start: 7.2, from: { x: 280, y: 700, s: 1.6 }, to: { x: 280, y: 700, s: 1.85 } },   // "the people" — red cap
  { at: 28.24, end: 30.78, src: NM, start: 10.0, dim: 0.2, from: { x: 540, y: 1010, s: 1.12 }, to: { x: 540, y: 1010, s: 1.17 } },          // "live gameplay"
  { at: 30.78, end: 32.28, src: "clips/010/p_flip.mp4", start: 0 },                           // "the joke has flipped"
  { at: 32.28, end: 34.66, src: "clips/010/p_parkcentral.mp4", start: 0 },                    // "Miami used to look like GTA"
  { at: 34.66, end: 37.12, src: "clips/010/t1_beach.mp4", start: 0 },                         // "Now GTA looks like Miami"
  { at: 37.12, end: 40.0, src: CL, start: 2.12 },                                             // "did it fool you?" → ends at 5.0 = loop
];

const Shot: React.FC<{ s: Seg }> = ({ s }) => {
  const fr = useCurrentFrame();
  const dur = f(s.end) - f(s.at);
  const p = interpolate(fr, [0, Math.max(dur - 1, 1)], [0, 1], clamp);
  const a = s.from ?? CENTER, b = s.to ?? s.from ?? CENTER;
  const ease = (t: number) => t * t * (3 - 2 * t);
  let x = a.x + (b.x - a.x) * ease(p), y = a.y + (b.y - a.y) * ease(p), sc = a.s + (b.s - a.s) * ease(p);
  if (s.punch) sc *= interpolate(fr, [0, 5], [1.12, 1.0], clamp);
  const vid = <OffthreadVideo src={staticFile(s.src)} startFrom={f(s.start ?? 0)} playbackRate={s.rate ?? 1} muted style={{ width: 1080, height: 1920 }} />;
  return (
    <AbsoluteFill style={{ overflow: "hidden", background: C.night }}>
      <div style={{ position: "absolute", width: 1080, height: 1920, transformOrigin: "0 0", transform: `translate(540px,960px) scale(${sc}) translate(${-x}px,${-y}px)` }}>
        {s.freeze !== undefined
          ? <Freeze frame={0}><OffthreadVideo src={staticFile(s.src)} startFrom={f(s.freeze)} muted style={{ width: 1080, height: 1920 }} /></Freeze>
          : vid}
      </div>
      {s.dim ? <AbsoluteFill style={{ background: `rgba(7,7,12,${s.dim})` }} /> : null}
    </AbsoluteFill>
  );
};

const Title: React.FC<{ text: string; top: number; size?: number; color?: string }> = ({ text, top, size = 112, color = C.white }) => {
  const fr = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const k = spring({ frame: fr, fps, config: { damping: 12, stiffness: 200 } });
  const out = interpolate(fr, [durationInFrames - 5, durationInFrames], [1, 0], clamp);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top, textAlign: "center", opacity: out, transform: `scale(${0.85 + 0.15 * k})`,
      fontFamily: ANTON, fontSize: size, color, textShadow: outline(7), letterSpacing: 2 }}>{text}</div>
  );
};

// Karaoke subtitles from the Whisper words (display spelling fixed: "Only In Dade" → "OnlyInDade", "6." → "6.")
type W = { w: string; s: number; e: number };
const RAW = words as W[];
const fixWords = (): W[] => {
  const out: W[] = [];
  for (let i = 0; i < RAW.length; i++) {
    const w = RAW[i];
    if (/^only$/i.test(w.w) && RAW[i + 1] && /^in$/i.test(RAW[i + 1].w) && RAW[i + 2] && /^dade/i.test(RAW[i + 2].w)) {
      out.push({ w: "OnlyInDade", s: w.s, e: RAW[i + 2].e }); i += 2; continue;
    }
    if (/^gameplay\.?$/i.test(w.w) && out.length && /^gameplay/i.test(out[out.length - 1].w)) continue; // Whisper base doubled it
    out.push(w);
  }
  return out;
};
const WORDS = fixWords();
const chunks: W[][] = (() => {
  const res: W[][] = []; let cur: W[] = [];
  WORDS.forEach((w, i) => {
    cur.push(w);
    const next = WORDS[i + 1];
    const end = /[.,?!:]$/.test(w.w) || cur.length >= 3 || !next || next.s - w.e > 0.35;
    if (end) { res.push(cur); cur = []; }
  });
  return res;
})();

const Subs: React.FC = () => {
  const fr = useCurrentFrame();
  const t = fr / FPS - VO;
  const c = chunks.find((ch, i) => t >= ch[0].s - 0.05 && t < (chunks[i + 1] ? chunks[i + 1][0].s - 0.05 : ch[ch.length - 1].e + 0.6));
  if (!c) return null;
  return (
    <div style={{ position: "absolute", left: 60, right: 60, top: 1230, textAlign: "center", lineHeight: 1.05 }}>
      {c.map((w, i) => (
        <span key={i} style={{ fontFamily: ANTON, fontSize: 92, marginRight: 22, textTransform: "uppercase", display: "inline-block",
          color: t >= w.s - 0.02 ? C.pink : C.white, textShadow: outline(7), transform: t >= w.s - 0.02 && t < w.e ? "scale(1.08)" : "none" }}>
          {w.w.replace(/[.,:]$/, "")}
        </span>
      ))}
    </div>
  );
};

export const Reel010: React.FC = () => (
  <AbsoluteFill style={{ background: C.night }}>
    {SEGS.map((s, i) => (
      <Sequence key={i} from={f(s.at)} durationInFrames={f(s.end) - f(s.at)}><Shot s={s} /></Sequence>
    ))}
    <Sequence from={0} durationInFrames={f(4.56)}><Title text="REAL MIAMI?" top={300} /></Sequence>
    <Sequence from={f(38.3)} durationInFrames={f(40) - f(38.3)}><Title text="DID IT FOOL YOU?" top={420} size={120} color={C.gold} /></Sequence>
    <Subs />
    {/* audio */}
    <Loop durationInFrames={f(3)}><Audio src={staticFile("clips/010/amb.wav")} volume={(fr) => (fr < f(2) ? 0.35 : 0.12)} /></Loop>
    <Sequence from={f(VO)}><Audio src={staticFile("clips/010/vo.wav")} /></Sequence>
    {[4.56, 9.9, 15.38, 30.78, 34.66].map((t, i) => (
      <Sequence key={`w${i}`} from={f(t) - 3}><Audio src={staticFile("clips/006/sfx/whoosh.wav")} volume={0.35} /></Sequence>
    ))}
    {[24.7, 25.58, 26.74].map((t, i) => (
      <Sequence key={`t${i}`} from={f(t)}><Audio src={staticFile("clips/006/sfx/tick.wav")} volume={0.45} /></Sequence>
    ))}
  </AbsoluteFill>
);
