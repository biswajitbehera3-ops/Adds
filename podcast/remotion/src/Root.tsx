import React from 'react';
import {Composition, Still, AbsoluteFill, interpolate, useCurrentFrame, spring, useVideoConfig} from 'remotion';
import {StudioScene} from './studio/Studio';

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

const shot = (name: 'wide' | 'left' | 'right' | 'high') => () => <StudioScene shot={name} />;

export const Root: React.FC = () => (
  <>
    <Composition id="TitleCard" component={TitleCard} durationInFrames={60} fps={30} width={1080} height={1920}
      defaultProps={{title: 'Remotion works ✓'}} />
    <Still id="StudioWide" component={shot('wide')} width={1920} height={1080} />
    <Still id="StudioLeft" component={shot('left')} width={1920} height={1080} />
    <Still id="StudioRight" component={shot('right')} width={1920} height={1080} />
    <Still id="StudioHigh" component={shot('high')} width={1920} height={1080} />
    <Composition id="StudioPushIn" component={() => <StudioScene shot="high" toShot="wide" />}
      durationInFrames={120} fps={30} width={1920} height={1080} />
  </>
);
