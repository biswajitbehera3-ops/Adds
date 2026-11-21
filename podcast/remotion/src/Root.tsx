import React from 'react';
import {Composition, AbsoluteFill, interpolate, useCurrentFrame, spring, useVideoConfig} from 'remotion';

const TitleCard: React.FC<{title: string}> = ({title}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame: f, fps, config: {damping: 12}});
  return (
    <AbsoluteFill style={{background: '#0b0f1a', justifyContent: 'center', alignItems: 'center'}}>
      <div style={{color: '#ffd23f', fontSize: 110, fontWeight: 900, fontFamily: 'sans-serif',
        transform: `scale(${s})`, opacity: interpolate(f, [0, 10], [0, 1]), textAlign: 'center', padding: 60}}>
        {title}
      </div>
    </AbsoluteFill>
  );
};

export const Root: React.FC = () => (
  <Composition id="TitleCard" component={TitleCard} durationInFrames={60} fps={30} width={1080} height={1920}
    defaultProps={{title: 'Remotion works ✓'}} />
);
