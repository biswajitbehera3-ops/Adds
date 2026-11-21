import React, {useMemo} from 'react';
import * as THREE from 'three';
import {useThree} from '@react-three/fiber';
import {RoundedBox} from '@react-three/drei';
import {ThreeCanvas} from '@remotion/three';
import {interpolate, useCurrentFrame, useVideoConfig, Easing} from 'remotion';

// Podcast studio set, built to match the user's reference room (navy velvet curtains, two pendant lamps,
// blue armchairs with yellow cushions, round wooden table with two mics, yellow LED stage edge).
// Units are metres. The stage centre is the origin; the camera looks towards -z.

const C = {
  curtain: '#22336e',
  panel: '#18254f',
  stage: '#1b2547',
  floor: '#0a0f20',
  chair: '#4a68b0',
  cushion: '#f2c230',
  wood: '#7a4a2a',
  brass: '#b8955a',
  black: '#141414',
  micBody: '#c9b48a',
  led: '#ffc21a',
  warm: '#ffc27a',
};

const Curtain: React.FC<{width: number; height: number; z: number; x?: number}> = ({width, height, z, x = 0}) => {
  const geom = useMemo(() => {
    const g = new THREE.PlaneGeometry(width, height, Math.round(width * 40), 1);
    const p = g.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < p.count; i++) {
      const px = p.getX(i);
      p.setZ(i, 0.11 * Math.sin(px * 6.2) + 0.035 * Math.sin(px * 17.3 + 1.1));
    }
    g.computeVertexNormals();
    return g;
  }, [width, height]);
  return (
    <mesh geometry={geom} position={[x, height / 2, z]} receiveShadow>
      <meshStandardMaterial color={C.curtain} roughness={0.92} metalness={0} side={THREE.DoubleSide} />
    </mesh>
  );
};

const BackPanel: React.FC = () => (
  <group position={[0, 0, -2.75]}>
    <mesh position={[0, 3, 0]} receiveShadow>
      <boxGeometry args={[2.3, 6, 0.08]} />
      <meshStandardMaterial color={C.panel} roughness={0.7} />
    </mesh>
    {/* raised mouldings and an arch outline */}
    {[-0.55, 0.55].map((x) => (
      <mesh key={x} position={[x, 1.2, 0.06]}>
        <boxGeometry args={[0.8, 1.6, 0.04]} />
        <meshStandardMaterial color="#13204a" roughness={0.6} />
      </mesh>
    ))}
    <mesh position={[0, 3.6, 0.06]}>
      <torusGeometry args={[0.75, 0.025, 8, 48, Math.PI]} />
      <meshStandardMaterial color="#1d2c5e" roughness={0.5} />
    </mesh>
    {[...Array(7)].map((_, i) => (
      <mesh key={i} position={[0, 2.45 + i * 0.16, 0.07]}>
        <boxGeometry args={[1.1, 0.04, 0.03]} />
        <meshStandardMaterial color="#1d2c5e" roughness={0.5} />
      </mesh>
    ))}
  </group>
);

const Stage: React.FC = () => (
  <group>
    <mesh position={[0, -0.01, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[30, 30]} />
      <meshStandardMaterial color={C.floor} roughness={0.9} />
    </mesh>
    <mesh position={[0, 0.07, -1.5]} receiveShadow castShadow>
      <cylinderGeometry args={[3.6, 3.6, 0.14, 96]} />
      <meshStandardMaterial color={C.stage} roughness={0.55} metalness={0.1} />
    </mesh>
    {/* yellow LED strip along the front edge of the stage */}
    <mesh position={[0, 0.145, -1.5]} rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[3.59, 0.024, 8, 160, Math.PI]} />
      <meshStandardMaterial color={C.led} emissive={C.led} emissiveIntensity={6} toneMapped={false} />
    </mesh>
    {[-3, -1.5, 0, 1.5, 3].map((x) => (
      <pointLight key={x} position={[x, 0.18, -1.5 + Math.sqrt(3.6 ** 2 - x * x) + 0.12]} color={C.led} intensity={4} distance={1.8} decay={1.5} />
    ))}
  </group>
);

const Armchair: React.FC<{position: [number, number, number]; rotY: number}> = ({position, rotY}) => {
  const fabric = <meshStandardMaterial color={C.chair} roughness={0.85} />;
  return (
    <group position={position} rotation={[0, rotY, 0]}>
      <RoundedBox args={[0.86, 0.24, 0.78]} radius={0.09} smoothness={4} position={[0, 0.44, 0]} castShadow receiveShadow>
        {fabric}
      </RoundedBox>
      <RoundedBox args={[0.9, 0.66, 0.2]} radius={0.09} smoothness={4} position={[0, 0.82, -0.33]} rotation={[-0.12, 0, 0]} castShadow receiveShadow>
        {fabric}
      </RoundedBox>
      {[-0.42, 0.42].map((x) => (
        <RoundedBox key={x} args={[0.15, 0.36, 0.74]} radius={0.07} smoothness={4} position={[x, 0.62, -0.01]} castShadow receiveShadow>
          {fabric}
        </RoundedBox>
      ))}
      <RoundedBox args={[0.5, 0.38, 0.13]} radius={0.06} smoothness={4} position={[0.08, 0.76, -0.17]} rotation={[-0.25, 0, 0.12]} castShadow>
        <meshStandardMaterial color={C.cushion} roughness={0.8} />
      </RoundedBox>
      {[[-0.34, 0.27], [0.34, 0.27], [-0.34, -0.3], [0.34, -0.3]].map(([x, z]) => (
        <mesh key={`${x}${z}`} position={[x, 0.16, z]} rotation={[z > 0 ? 0.12 : -0.12, 0, x > 0 ? -0.08 : 0.08]} castShadow>
          <cylinderGeometry args={[0.018, 0.012, 0.34, 10]} />
          <meshStandardMaterial color={C.brass} roughness={0.35} metalness={0.8} />
        </mesh>
      ))}
    </group>
  );
};

const DeskMic: React.FC<{position: [number, number, number]; rotY: number}> = ({position, rotY}) => (
  <group position={position} rotation={[0, rotY, 0]}>
    <mesh position={[0, 0.012, 0]} castShadow>
      <cylinderGeometry args={[0.07, 0.08, 0.025, 24]} />
      <meshStandardMaterial color={C.black} roughness={0.4} metalness={0.6} />
    </mesh>
    <mesh position={[0, 0.17, 0]} castShadow>
      <cylinderGeometry args={[0.008, 0.008, 0.32, 8]} />
      <meshStandardMaterial color={C.black} roughness={0.4} metalness={0.7} />
    </mesh>
    <mesh position={[-0.11, 0.36, 0]} rotation={[0, 0, 1.1]} castShadow>
      <cylinderGeometry args={[0.007, 0.007, 0.26, 8]} />
      <meshStandardMaterial color={C.black} roughness={0.4} metalness={0.7} />
    </mesh>
    <group position={[-0.24, 0.42, 0]} rotation={[0, 0, 0.5]}>
      <mesh castShadow>
        <cylinderGeometry args={[0.042, 0.038, 0.2, 24]} />
        <meshStandardMaterial color={C.micBody} roughness={0.3} metalness={0.85} />
      </mesh>
      <mesh position={[0, 0.115, 0]}>
        <sphereGeometry args={[0.043, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#3a3a3a" roughness={0.6} metalness={0.5} />
      </mesh>
    </group>
  </group>
);

const Table: React.FC = () => (
  <group position={[0, 0.14, 0.1]}>
    <mesh position={[0, 0.6, 0]} castShadow receiveShadow>
      <cylinderGeometry args={[0.62, 0.62, 0.05, 64]} />
      <meshStandardMaterial color={C.wood} roughness={0.45} />
    </mesh>
    {[0, 1, 2].map((i) => {
      const a = (i / 3) * Math.PI * 2;
      return (
        <mesh key={i} position={[Math.cos(a) * 0.3, 0.29, Math.sin(a) * 0.3]} rotation={[Math.sin(a) * 0.12, 0, -Math.cos(a) * 0.12]} castShadow>
          <cylinderGeometry args={[0.015, 0.012, 0.6, 8]} />
          <meshStandardMaterial color={C.black} roughness={0.4} metalness={0.6} />
        </mesh>
      );
    })}
    <DeskMic position={[-0.28, 0.625, -0.05]} rotY={0.15} />
    <DeskMic position={[0.28, 0.625, -0.05]} rotY={Math.PI - 0.15} />
    {/* headphones lying flat */}
    <group position={[0, 0.66, 0.12]} rotation={[-Math.PI / 2, 0, 0]}>
      <mesh castShadow>
        <torusGeometry args={[0.09, 0.012, 8, 32, Math.PI]} />
        <meshStandardMaterial color={C.black} roughness={0.5} />
      </mesh>
      {[-0.09, 0.09].map((x) => (
        <mesh key={x} position={[x, 0, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.045, 0.045, 0.035, 20]} />
          <meshStandardMaterial color="#222" roughness={0.6} />
        </mesh>
      ))}
    </group>
    <mesh position={[0.3, 0.68, 0.2]} castShadow>
      <cylinderGeometry args={[0.045, 0.04, 0.11, 24]} />
      <meshStandardMaterial color="#25407a" roughness={0.4} />
    </mesh>
  </group>
);

const PendantLamp: React.FC<{side: 1 | -1}> = ({side}) => {
  const x = side * 1.55;
  const target = useMemo(() => {
    const o = new THREE.Object3D();
    o.position.set(side * 1.15, 0.5, 0.2);
    return o;
  }, [side]);
  return (
    <group>
      {/* boom arm from the side, and the cable */}
      <mesh position={[side * 2.6, 3.55, 0.25]} rotation={[0, 0, side * 1.35]}>
        <cylinderGeometry args={[0.015, 0.015, 2.2, 8]} />
        <meshStandardMaterial color={C.black} roughness={0.4} metalness={0.6} />
      </mesh>
      <mesh position={[x, 3.55, 0.25]}>
        <cylinderGeometry args={[0.006, 0.006, 0.3, 6]} />
        <meshStandardMaterial color={C.black} />
      </mesh>
      <group position={[x, 3.25, 0.25]}>
        <mesh castShadow>
          <coneGeometry args={[0.34, 0.32, 40, 1, true]} />
          <meshStandardMaterial color={C.black} roughness={0.35} metalness={0.5} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0, -0.15, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.3, 40]} />
          <meshStandardMaterial color={C.warm} emissive={C.warm} emissiveIntensity={4} toneMapped={false} />
        </mesh>
        <primitive object={target} />
        <spotLight
          position={[0, -0.12, 0]}
          target={target}
          color={C.warm}
          intensity={260}
          angle={0.62}
          penumbra={0.65}
          distance={9}
          decay={1.2}
          castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-bias={-0.0004}
        />
      </group>
    </group>
  );
};

export type Shot = {pos: [number, number, number]; look: [number, number, number]; fov: number};

export const SHOTS: Record<string, Shot> = {
  wide: {pos: [0, 1.75, 6.4], look: [0, 1.5, -0.4], fov: 40},
  left: {pos: [0.95, 1.15, 1.55], look: [-1.15, 0.95, 0.1], fov: 34},
  right: {pos: [-0.95, 1.15, 1.55], look: [1.15, 0.95, 0.1], fov: 34},
  high: {pos: [3.6, 3.4, 4.6], look: [0, 0.7, 0], fov: 36},
};

const CameraRig: React.FC<{from: Shot; to?: Shot}> = ({from, to}) => {
  const {camera} = useThree();
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const t = to ? interpolate(frame, [0, durationInFrames - 1], [0, 1], {easing: Easing.inOut(Easing.cubic)}) : 0;
  const lerp = (a: number[], b: number[]) => a.map((v, i) => v + (b[i] - v) * t) as [number, number, number];
  const pos = to ? lerp(from.pos, to.pos) : from.pos;
  const look = to ? lerp(from.look, to.look) : from.look;
  const fov = to ? from.fov + (to.fov - from.fov) * t : from.fov;
  camera.position.set(...pos);
  (camera as THREE.PerspectiveCamera).fov = fov;
  camera.lookAt(...look);
  camera.updateProjectionMatrix();
  return null;
};

export const StudioScene: React.FC<{shot: keyof typeof SHOTS; toShot?: keyof typeof SHOTS}> = ({shot, toShot}) => {
  const {width, height} = useVideoConfig();
  return (
    <ThreeCanvas
      width={width}
      height={height}
      shadows
      gl={{antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.15}}
      style={{background: '#05070f'}}
    >
      <CameraRig from={SHOTS[shot]} to={toShot ? SHOTS[toShot] : undefined} />
      <color attach="background" args={['#05070f']} />
      <fog attach="fog" args={['#05070f', 9, 22]} />
      <ambientLight intensity={0.35} color="#9aa6c8" />
      <hemisphereLight args={['#c9d2f0', '#14100c', 0.45]} />
      {/* cool rim lights behind, so the curtains read as velvet folds */}
      <spotLight position={[-4, 5, -0.5]} target-position={[0, 2, -3]} color="#6f86e8" intensity={70} angle={0.7} penumbra={0.9} distance={12} />
      <spotLight position={[4, 5, -0.5]} target-position={[0, 2, -3]} color="#6f86e8" intensity={70} angle={0.7} penumbra={0.9} distance={12} />
      <directionalLight position={[2, 6, 6]} intensity={0.7} color="#ffe6c8" />
      {/* soft uplights washing the curtains, as in the reference */}
      {[-3.2, -1.6, 1.6, 3.2].map((x) => (
        <pointLight key={x} position={[x, 0.4, -2.3]} color="#5a74e0" intensity={5} distance={5} decay={1.2} />
      ))}
      <Curtain width={12} height={7} z={-2.95} />
      <Curtain width={3.2} height={7} z={-2.2} x={-3.9} />
      <Curtain width={3.2} height={7} z={-2.2} x={3.9} />
      <BackPanel />
      <Stage />
      <Armchair position={[-1.2, 0.14, 0.25]} rotY={1.05} />
      <Armchair position={[1.2, 0.14, 0.25]} rotY={-1.05} />
      <Table />
      <PendantLamp side={-1} />
      <PendantLamp side={1} />
    </ThreeCanvas>
  );
};
