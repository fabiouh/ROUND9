'use client';

import { ContactShadows, Environment, Lightformer } from '@react-three/drei';

/** Late-afternoon key light plus procedural studio reflections; no HDR downloads. */
export function SceneLighting() {
  return (
    <>
      <hemisphereLight args={['#fff8e8', '#183b2d', 0.55]} />
      <directionalLight position={[-5, 6, 4]} intensity={2.2} color="#fff1d6" />
      <Environment resolution={128}>
        <Lightformer form="rect" intensity={2.5} position={[-4, 5, 3]} scale={[6, 3, 1]} color="#fff4e0" />
        <Lightformer form="rect" intensity={0.8} position={[5, 2, -2]} scale={[4, 4, 1]} color="#c7f279" />
        <Lightformer form="circle" intensity={1.2} position={[0, 6, -6]} scale={4} />
      </Environment>
      <ContactShadows position={[0, 0.003, 0]} opacity={0.55} scale={6} blur={2.4} far={2} resolution={512} color="#08140f" />
    </>
  );
}
