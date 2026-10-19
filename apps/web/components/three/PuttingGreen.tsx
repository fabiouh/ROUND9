'use client';

import { useEffect, useMemo } from 'react';
import { CanvasTexture, RepeatWrapping, SRGBColorSpace } from 'three';

/** Procedural turf: fine noise baked once into a small canvas texture, no network assets. */
function turfTexture() {
  const size = 256;
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = '#2f5b3d';
  ctx.fillRect(0, 0, size, size);
  const img = ctx.getImageData(0, 0, size, size);
  for (let i = 0; i < img.data.length; i += 4) {
    const n = (Math.random() - 0.5) * 26;
    img.data[i] = img.data[i]! + n * 0.6;
    img.data[i + 1] = img.data[i + 1]! + n;
    img.data[i + 2] = img.data[i + 2]! + n * 0.5;
  }
  ctx.putImageData(img, 0, 0);
  const tex = new CanvasTexture(c);
  tex.wrapS = tex.wrapT = RepeatWrapping;
  tex.repeat.set(14, 14);
  tex.colorSpace = SRGBColorSpace;
  return tex;
}

export function PuttingGreen() {
  const texture = useMemo(turfTexture, []);
  useEffect(() => () => texture.dispose(), [texture]);

  return (
    <group>
      <mesh rotation-x={-Math.PI / 2} receiveShadow>
        <circleGeometry args={[30, 96]} />
        <meshStandardMaterial map={texture} roughness={0.95} />
      </mesh>
      {/* The cup, a few feet past the ball, with a lime flag. */}
      <group position={[2.6, 0, -4.2]}>
        <mesh rotation-x={-Math.PI / 2} position-y={0.002}>
          <circleGeometry args={[0.36, 48]} />
          <meshStandardMaterial color="#0b1a14" roughness={1} />
        </mesh>
        <mesh position-y={2.4} castShadow>
          <cylinderGeometry args={[0.025, 0.025, 4.8, 12]} />
          <meshStandardMaterial color="#f5f3eb" roughness={0.4} />
        </mesh>
        <mesh position={[0.45, 4.45, 0]} castShadow>
          <boxGeometry args={[0.9, 0.55, 0.01]} />
          <meshStandardMaterial color="#c7f279" roughness={0.7} />
        </mesh>
      </group>
    </group>
  );
}
