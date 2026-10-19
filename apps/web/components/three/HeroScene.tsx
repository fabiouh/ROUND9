'use client';

import dynamic from 'next/dynamic';
import { SceneFallback } from './SceneFallback';

// The canvas is browser-only and heavy; the static fallback renders on the server and while loading.
const GolfBallScene = dynamic(() => import('./GolfBallScene'), {
  ssr: false,
  loading: () => null,
});

export function HeroScene({ label }: { label: string }) {
  return (
    <div className="absolute inset-0">
      <div className="absolute inset-0">
        <SceneFallback label={label} />
      </div>
      {/* Decorative; the fallback beneath carries the text alternative. */}
      <GolfBallScene />
    </div>
  );
}
