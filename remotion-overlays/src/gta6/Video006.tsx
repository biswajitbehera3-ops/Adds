import React from "react";
import { AbsoluteFill, Audio, Freeze, interpolate, OffthreadVideo, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import timeline from "./v006.json";
import { IllGunAwareness, IllOwnerCall, IllSearchlight, IllStinger, IllStoreClear, IllTracker, IllVictimLunge } from "./Illustrations";
import { DetailCallout, IconPanel, NumberCard, ProgressBar, QuoteCard, SourceTag, SplitCompare, StarRow } from "./Kit";
import { ANTON, C, clamp, outline, Stage } from "./theme";

// Full edit of video 006, driven by v006.json (built by production/build_006_timeline.py from the voiceover).

type Visual = { kind: "clip" | "comp" | "title"; src?: string; startFrom?: number; rate?: number; play?: number; name?: string; props?: Record<string, unknown>; num?: number; title?: string; under?: string };
type Overlay = { type: string; [k: string]: unknown };
type Item = { from: number; dur: number; visual: Visual; overlays: Overlay[] };

const REG: Record<string, React.FC<any>> = {
  QuoteCard, StarRow, IconPanel, SplitCompare,
  IllGunAwareness, IllVictimLunge, IllOwnerCall, IllTracker, IllStinger, IllStoreClear,
};

/** A clip with a slow push-in; if it's shorter than its slot it's slowed (≥50%) and then held on its last frame. */
const Clip: React.FC<{ v: Visual; dur: number; dim?: boolean }> = ({ v, dur, dim }) => {
  const f = useCurrentFrame();
  const scale = 1.0 + 0.06 * (f / Math.max(dur, 1));
  const vid = <OffthreadVideo src={staticFile(v.src!)} startFrom={v.startFrom ?? 0} playbackRate={v.rate ?? 1} muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />;
  const play = Math.min(v.play ?? dur, dur);
  return (
    <AbsoluteFill style={{ transform: `scale(${scale})`, filter: dim ? "blur(10px) brightness(0.38) saturate(0.8)" : "contrast(1.06) saturate(1.08)" }}>
      <Sequence durationInFrames={play}>{vid}</Sequence>
      {play < dur ? <Sequence from={play}><Freeze frame={Math.max(play - 1, 0)}>{vid}</Freeze></Sequence> : null}
    </AbsoluteFill>
  );
};

const Caption: React.FC<{ text: string; hi?: string; top?: boolean }> = ({ text, hi, top }) => {
  const f = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const pop = spring({ frame: f, fps, config: { damping: 12, stiffness: 200 } });
  const out = interpolate(f, [durationInFrames - 6, durationInFrames], [1, 0], clamp);
  return (
    <Stage>
      <div style={{ position: "absolute", left: 0, right: 0, ...(top ? { top: 120 } : { bottom: 150 }), textAlign: "center", opacity: out, transform: `scale(${0.85 + pop * 0.15})` }}>
        {text.split(" ").map((w, i) => (
          <span key={i} style={{ fontFamily: ANTON, fontSize: 84, marginRight: 22, color: hi && w.toUpperCase() === hi.toUpperCase() ? C.gold : C.white, textShadow: outline(6) }}>{w}</span>
        ))}
      </div>
    </Stage>
  );
};

const Stamp: React.FC<{ text: string }> = ({ text }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: f - 4, fps, config: { damping: 9, stiffness: 260 } });
  return (
    <Stage>
      <div style={{ position: "absolute", left: 0, right: 0, top: 380, textAlign: "center", opacity: f >= 4 ? 1 : 0 }}>
        <span style={{ display: "inline-block", fontFamily: ANTON, fontSize: 170, color: C.red, border: `12px solid ${C.red}`, padding: "6px 50px", borderRadius: 14,
          transform: `rotate(-8deg) scale(${interpolate(s, [0, 1], [2.2, 1])})`, textShadow: outline(5), boxShadow: "0 0 50px rgba(255,59,59,0.55)", background: "rgba(7,7,12,0.35)" }}>{text}</span>
      </div>
    </Stage>
  );
};

const NightBg: React.FC = () => <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 40%, #16162a 0%, ${C.night} 70%)` }} />;

const Shot: React.FC<{ it: Item }> = ({ it }) => {
  const v = it.visual;
  const dimclip = it.overlays.find((o) => o.type === "dimclip");
  const dim = it.overlays.some((o) => o.type === "dim");
  return (
    <AbsoluteFill>
      {v.kind === "clip" ? <Clip v={v} dur={it.dur} /> : null}
      {v.kind === "title" ? <>
        <Clip v={{ kind: "clip", src: v.under, rate: 0.6, play: it.dur }} dur={it.dur} dim />
        <NumberCard num={v.num!} title={v.title!} />
      </> : null}
      {v.kind === "comp" ? <>
        {dimclip ? <Clip v={{ kind: "clip", src: dimclip.src as string, rate: 0.6, play: it.dur }} dur={it.dur} dim /> : null}
        {dim || (!dimclip && ["QuoteCard", "StarRow", "IconPanel"].includes(v.name!)) ? <NightBg /> : null}
        {React.createElement(REG[v.name!], v.props ?? {})}
      </> : null}
      {it.overlays.map((o, i) => {
        if (o.type === "caption") return <Sequence key={i} from={6} durationInFrames={Math.max(it.dur - 6, 1)}><Caption text={o.text as string} hi={o.hi as string} top={o.top as boolean} /></Sequence>;
        if (o.type === "source") return <Sequence key={i} from={8} durationInFrames={Math.min(130, Math.max(it.dur - 8, 1))}><SourceTag tier={o.tier as never} outlet={o.outlet as string} /></Sequence>;
        if (o.type === "callout") return <Sequence key={i} from={4} durationInFrames={Math.max(it.dur - 4, 1)}><DetailCallout x={o.x as number} y={o.y as number} r={o.r as number} label={o.label as string} side={(o.side as never) ?? "right"} /></Sequence>;
        if (o.type === "stamp") return <Sequence key={i} durationInFrames={it.dur}><Stamp text={o.text as string} /></Sequence>;
        if (o.type === "searchlight") return <Sequence key={i} durationInFrames={it.dur}><IllSearchlight /></Sequence>;
        return null;
      })}
    </AbsoluteFill>
  );
};

export const VIDEO006_FRAMES = timeline.durationInFrames;

export const Video006: React.FC = () => {
  const items = timeline.items as unknown as Item[];
  return (
    <AbsoluteFill style={{ background: C.night }}>
      {items.map((it, i) => (
        <Sequence key={i} from={it.from} durationInFrames={Math.max(it.dur, 1)}><Shot it={it} /></Sequence>
      ))}
      {timeline.sections.filter((s) => s.num).map((s, i) => (
        <Sequence key={`p${i}`} from={s.from} durationInFrames={s.to - s.from}><ProgressBar current={11 - (s.num as number)} /></Sequence>
      ))}
      {timeline.audio.map((a, i) => (
        <Sequence key={`a${i}`} from={a.from}><Audio src={staticFile(a.src)} volume={(a as { vol?: number }).vol ?? 1} /></Sequence>
      ))}
    </AbsoluteFill>
  );
};
