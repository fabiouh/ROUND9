'use client';

import { useFrame } from '@react-three/fiber';
import { Vector3 } from 'three';

const BASE = new Vector3(-0.6, 1.25, 4.4);
const LOOK = new Vector3(0.6, 0.7, -1);
const target = new Vector3();

/** Restrained mouse parallax; the camera eases toward the pointer, never follows it. */
export function CameraRig({ animate }: { animate: boolean }) {
  useFrame(({ camera, pointer }, delta) => {
    target.set(BASE.x + (animate ? pointer.x * 0.35 : 0), BASE.y + (animate ? pointer.y * 0.18 : 0), BASE.z);
    camera.position.lerp(target, Math.min(1, delta * 2));
    camera.lookAt(LOOK);
  });
  return null;
}
