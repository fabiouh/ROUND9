'use client';

import { Canvas } from '@react-three/fiber';
import { useEffect, useRef, useState } from 'react';
import { CameraRig } from './CameraRig';
import { GolfBall } from './GolfBall';
import { PuttingGreen } from './PuttingGreen';
import { SceneLighting } from './SceneLighting';

function canRender3D() {
  if (typeof window === 'undefined') return false;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
  const nav = navigator as Navigator & { connection?: { saveData?: boolean }; deviceMemory?: number };
  if (nav.connection?.saveData || (nav.deviceMemory ?? 8) < 4 || (nav.hardwareConcurrency ?? 8) < 4) return false;
  try {
    return !!document.createElement('canvas').getContext('webgl2');
  } catch {
    return false;
  }
}

/** Hero scene. Renders nothing when 3D is unsuitable (HeroScene keeps the static fallback beneath); pauses offscreen. */
export default function GolfBallScene() {
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const [visible, setVisible] = useState(true);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => setEnabled(canRender3D()), []);

  useEffect(() => {
    if (!ref.current) return;
    const io = new IntersectionObserver(([e]) => setVisible(!!e?.isIntersecting), { threshold: 0.01 });
    io.observe(ref.current);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className="absolute inset-0">
      {enabled ? (
        <div aria-hidden className="h-full w-full">
          <Canvas
            dpr={[1, 1.75]}
            frameloop={visible ? 'always' : 'never'}
            camera={{ position: [-0.6, 1.25, 4.4], fov: 32, near: 0.1, far: 80 }}
            gl={{ antialias: true, powerPreference: 'low-power' }}
          >
            <color attach="background" args={['#112b22']} />
            <fog attach="fog" args={['#112b22', 9, 26]} />
            <SceneLighting />
            <PuttingGreen />
            <GolfBall animate />
            <CameraRig animate />
          </Canvas>
        </div>
      ) : null}
    </div>
  );
}
