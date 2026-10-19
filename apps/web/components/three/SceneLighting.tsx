'use client';

import { Environment, Lightformer } from '@react-three/drei';

/** Late-afternoon key light with a soft shadow map, plus procedural reflections; no HDR downloads. */
export function SceneLighting() {
  return (
    <>
      <hemisphereLight args={['#fff8e8', '#183b2d', 0.55]} />
      <directionalLight
        position={[-5, 6, 4]}
        intensity={2.2}
        color="#fff1d6"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0004}
        shadow-radius={6}
        shadow-camera-left={-4}
        shadow-camera-right={4}
        shadow-camera-top={4}
        shadow-camera-bottom={-4}
        shadow-camera-near={1}
        shadow-camera-far={20}
      />
      <Environment resolution={128}>
        <Lightformer form="rect" intensity={2.5} position={[-4, 5, 3]} scale={[6, 3, 1]} color="#fff4e0" />
        <Lightformer form="rect" intensity={0.8} position={[5, 2, -2]} scale={[4, 4, 1]} color="#c7f279" />
        <Lightformer form="circle" intensity={1.2} position={[0, 6, -6]} scale={4} />
      </Environment>
    </>
  );
}
