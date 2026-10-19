'use client';

import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import { SphereGeometry, Vector3, type Mesh } from 'three';

const DIMPLES = 332;
const RADIUS = 1;

/** Sphere with ~330 spherical-cap dimples placed on a Fibonacci lattice, like a real ball. */
function buildBallGeometry() {
  const geo = new SphereGeometry(RADIUS, 220, 160);
  const centers: Vector3[] = [];
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < DIMPLES; i++) {
    const y = 1 - (i / (DIMPLES - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    centers.push(new Vector3(Math.cos(golden * i) * r, y, Math.sin(golden * i) * r));
  }

  const dimpleAngle = 0.105; // angular radius in radians
  const cosLimit = Math.cos(dimpleAngle);
  const depth = 0.012;
  const pos = geo.attributes.position!;
  const v = new Vector3();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i).normalize();
    let best = -1;
    for (const c of centers) best = Math.max(best, v.dot(c));
    let push = 0;
    if (best > cosLimit) {
      const t = Math.acos(Math.min(1, best)) / dimpleAngle; // 0 at center, 1 at rim
      push = depth * (1 - t * t);
    }
    v.multiplyScalar(RADIUS - push);
    pos.setXYZ(i, v.x, v.y, v.z);
  }
  geo.computeVertexNormals();
  return geo;
}

export function GolfBall({ animate }: { animate: boolean }) {
  const geometry = useMemo(buildBallGeometry, []);
  const ref = useRef<Mesh>(null);

  useEffect(() => () => geometry.dispose(), [geometry]);

  useFrame((state, delta) => {
    if (!animate || !ref.current) return;
    // Slow, natural idle: a gentle roll and a barely-there settle.
    ref.current.rotation.y += delta * 0.12;
    ref.current.position.y = RADIUS + Math.sin(state.clock.elapsedTime * 0.8) * 0.006;
  });

  return (
    <mesh ref={ref} geometry={geometry} position={[0, RADIUS, 0]} rotation={[0.3, 0, 0.15]} castShadow>
      <meshPhysicalMaterial color="#f7f6f1" roughness={0.42} clearcoat={0.7} clearcoatRoughness={0.22} sheen={0.2} sheenColor="#ffffff" />
    </mesh>
  );
}
