import React from 'react';
import {AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig, Easing} from 'remotion';

// Camera setups cut from the locked studio plate (podcast/assets/studio).
// The 4K plate is the 1344x768 master upscaled x4 by Real-ESRGAN, scaled to cover 3840x2160 and centre-cropped,
// so a point (x, y) of the master sits at (x * K, y * K - CROP_Y) on the 4K plate.
export const PLATE = {src: 'studio/studio_4k.jpg', w: 3840, h: 2160};
const K = 3840 / 1344;
const CROP_Y = (768 * K - 2160) / 2;

// Rectangles in master-plate pixels: [x, y, width, height].
type Rect = [number, number, number, number];
const toPlate = ([x, y, w, h]: Rect): Rect => [x * K, y * K - CROP_Y, w * K, h * K];

export type Move = 'push' | 'pull' | 'panRight' | 'panLeft' | 'still';
export type Setup = {rect: Rect; move: Move; label: string};

export const SETUPS = {
  // 16:9
  wide: {rect: [0, 6, 1344, 756], move: 'pull', label: '1 · Wide master'},
  twoShot: {rect: [200, 150, 1040, 585], move: 'push', label: '2 · Two-shot'},
  genius: {rect: [130, 250, 560, 315], move: 'push', label: '3 · Genius close-up'},
  questioner: {rect: [700, 250, 560, 315], move: 'push', label: '4 · Questioner close-up'},
  table: {rect: [470, 280, 400, 225], move: 'panRight', label: '5 · Table insert'},
  // 9:16
  geniusVertical: {rect: [200, 128, 360, 640], move: 'push', label: '3V · Genius vertical'},
  questionerVertical: {rect: [800, 128, 360, 640], move: 'push', label: '4V · Questioner vertical'},
} satisfies Record<string, Setup>;

const MOVE_AMOUNT = 0.07; // 7% zoom or pan over the shot

// One framed shot of the plate. The rectangle is fitted to the output frame (its aspect should match),
// then the move eases across the shot's duration.
export const PlateShot: React.FC<{setup: Setup; showLabel?: boolean}> = ({setup, showLabel}) => {
  const frame = useCurrentFrame();
  const {width, height, durationInFrames} = useVideoConfig();
  const t = interpolate(frame, [0, Math.max(durationInFrames - 1, 1)], [0, 1], {easing: Easing.inOut(Easing.sin)});
  let [x, y, w, h] = toPlate(setup.rect);
  const zoom = setup.move === 'push' ? 1 + MOVE_AMOUNT * t : setup.move === 'pull' ? 1 + MOVE_AMOUNT * (1 - t) : 1 + MOVE_AMOUNT;
  const cw = w / zoom, ch = h / zoom;
  let cx = x + (w - cw) / 2, cy = y + (h - ch) / 2;
  if (setup.move === 'panRight') cx = x + (w - cw) * t;
  if (setup.move === 'panLeft') cx = x + (w - cw) * (1 - t);
  const s = width / cw;
  return (
    <AbsoluteFill style={{background: '#000', overflow: 'hidden'}}>
      <Img
        src={staticFile(PLATE.src)}
        style={{position: 'absolute', width: PLATE.w * s, height: PLATE.h * s, left: -cx * s, top: -cy * s, maxWidth: 'none'}}
      />
      {showLabel && (
        <div style={{position: 'absolute', left: 32, top: 28, padding: '10px 18px', borderRadius: 10,
          background: 'rgba(0,0,0,.55)', color: '#ffd23f', font: `700 ${Math.round(height / 24)}px sans-serif`}}>
          {setup.label}
        </div>
      )}
    </AbsoluteFill>
  );
};

// Vertical stack for Reels/Shorts: Genius on top, Questioner below.
export const StackedVertical: React.FC = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const t = interpolate(frame, [0, durationInFrames - 1], [0, 1], {easing: Easing.inOut(Easing.sin)});
  const half = (rect: Rect) => {
    const [x, y, w, h] = toPlate(rect);
    const zoom = 1 + MOVE_AMOUNT * t;
    const cw = w / zoom, ch = h / zoom, cx = x + (w - cw) / 2, cy = y + (h - ch) / 2, s = 1080 / cw;
    return (
      <div style={{position: 'relative', width: 1080, height: 960, overflow: 'hidden'}}>
        <Img src={staticFile(PLATE.src)} style={{position: 'absolute', width: PLATE.w * s, height: PLATE.h * s,
          left: -cx * s, top: -cy * s, maxWidth: 'none'}} />
      </div>
    );
  };
  return (
    <AbsoluteFill style={{background: '#000'}}>
      {half([150, 230, 540, 480])}
      <div style={{height: 0, borderTop: '4px solid #ffc21a', position: 'relative', zIndex: 2, marginTop: -2}} />
      {half([720, 230, 540, 480])}
    </AbsoluteFill>
  );
};

// A 15-second reel of all five 16:9 setups, 3 s each, with labels: used to review the setups.
export const SetupsReel: React.FC = () => {
  const frame = useCurrentFrame();
  const order = ['wide', 'twoShot', 'genius', 'questioner', 'table'] as const;
  const i = Math.min(Math.floor(frame / 90), order.length - 1);
  return (
    <AbsoluteFill>
      <ShotWindow from={i * 90}>
        <PlateShot setup={SETUPS[order[i]]} showLabel />
      </ShotWindow>
    </AbsoluteFill>
  );
};

// Re-times its child so each shot's move runs over its own 90 frames.
import {Sequence} from 'remotion';
const ShotWindow: React.FC<{from: number; children: React.ReactNode}> = ({from, children}) => (
  <Sequence from={from} durationInFrames={90}>{children}</Sequence>
);
