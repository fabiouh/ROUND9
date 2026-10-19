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
      {/* Narrow screens keep the still in the upper half, clear of the copy. */}
      <div className="absolute inset-x-0 top-0 h-1/2 [mask-image:linear-gradient(to_bottom,black_65%,transparent)] sm:h-full sm:[mask-image:none]">
        <SceneFallback label={label} />
      </div>
      {/* Decorative; the fallback beneath carries the text alternative. */}
      <GolfBallScene />
    </div>
  );
}
