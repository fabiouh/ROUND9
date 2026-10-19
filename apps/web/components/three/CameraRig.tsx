'use client';

import { useFrame } from '@react-three/fiber';
import { Vector3 } from 'three';

const target = new Vector3();
const look = new Vector3();

/**
 * Restrained mouse parallax; the camera eases toward the pointer, never follows it.
 * Wide screens push the ball right of the headline; narrow screens pull the camera back.
 */
export function CameraRig({ animate }: { animate: boolean }) {
  useFrame(({ camera, pointer, size }, delta) => {
    const aspect = size.width / size.height;
    const wide = aspect > 1.1;
    const z = wide ? 8 : 8 * Math.min(2.2, 1.2 / aspect);
    target.set(-0.4 + (animate ? pointer.x * 0.35 : 0), 1.6 + (wide ? 0 : 1.2) + (animate ? pointer.y * 0.18 : 0), z);
    look.set(wide ? -2.2 : 0.6, wide ? 0.9 : -0.6, -1);
    camera.position.lerp(target, Math.min(1, delta * 2));
    camera.lookAt(look);
  });
  return null;
}
