// PodCaptions — word-by-word Hinglish captions as a transparent layer (render to alpha WebM / ProRes 4444,
// then composite onto the episode with `pod.py overlay`, or nest inside another composition).
// Data: public/captions/<name>.json  (made by `pod.py captions`):
//   { "format": "long"|"short", "lines": [ { "who": "genius"|"questioner", "start": s, "end": s,
//       "words": [ { "w": "Seedha", "s": 0.00, "e": 0.32 }, ... ] } ] }
// Active word = the speaker's colour (brand kit), others white; thick ink outline; pop-in per line.
import React from 'react';
import {AbsoluteFill, CalculateMetadataFunction, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';

type Word = {w: string; s: number; e: number};
type Line = {who: 'genius' | 'questioner'; start: number; end: number; words: Word[]};
export type PodCaptionsProps = {file: string; lines?: Line[]; fmt?: 'long' | 'short'};

const FPS = 30;
const INK = '#111418';
const COLOR = {genius: '#FFC83D', questioner: '#2EC4B6'};
const FONT = '"Inter Display Black", Inter, "Arial Black", sans-serif';

export const calculatePodCaptionsMetadata: CalculateMetadataFunction<PodCaptionsProps> = async ({props}) => {
  const d = await (await fetch(staticFile(`captions/${props.file}.json`))).json();
  const short = d.format === 'short';
  const end = Math.max(...d.lines.map((l: Line) => l.end)) + 0.5;
  return {fps: FPS, width: short ? 1080 : 1920, height: short ? 1920 : 1080, durationInFrames: Math.ceil(end * FPS),
    props: {...props, lines: d.lines, fmt: d.format}};
};

const outline = (px: number) =>
  Array.from({length: 16}, (_, i) => {
    const a = (i / 16) * Math.PI * 2;
    return `${(Math.cos(a) * px).toFixed(1)}px ${(Math.sin(a) * px).toFixed(1)}px 0 ${INK}`;
  }).join(', ') + `, 0 ${px}px ${px * 1.5}px rgba(0,0,0,.45)`;

const CaptionLine: React.FC<{l: Line; short: boolean}> = ({l, short}) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const t = l.start + frame / fps;
  const pop = spring({frame, fps, config: {damping: 14, stiffness: 180}});
  const out = interpolate(frame, [durationInFrames - 4, durationInFrames], [1, 0], {extrapolateLeft: 'clamp'});
  const size = short ? 84 : 64;
  return (
    <AbsoluteFill style={{justifyContent: 'flex-end', alignItems: 'center', paddingBottom: short ? 520 : 90}}>
      <div style={{opacity: out, transform: `scale(${0.85 + 0.15 * pop})`, maxWidth: short ? '86%' : '70%', textAlign: 'center',
        fontFamily: FONT, fontSize: size, lineHeight: 1.15, textTransform: 'uppercase', letterSpacing: 1}}>
        {l.words.map((w, i) => {
          const on = t >= w.s && t < w.e + 0.05;
          return (
            <span key={i} style={{display: 'inline-block', margin: '0 0.3em', color: on ? COLOR[l.who] : '#FFFFFF',
              textShadow: outline(short ? 9 : 7), transform: on ? 'scale(1.12) translateY(-4px)' : 'none'}}>{w.w}</span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

export const PodCaptions: React.FC<PodCaptionsProps> = ({lines = [], fmt}) => (
  <AbsoluteFill style={{backgroundColor: 'transparent'}}>
    {lines.map((l, i) => (
      <Sequence key={i} from={Math.round(l.start * FPS)} durationInFrames={Math.max(1, Math.round((l.end - l.start) * FPS))}>
        <CaptionLine l={l} short={fmt === 'short'} />
      </Sequence>
    ))}
  </AbsoluteFill>
);
