/**
 * Static hero visual for reduced motion, low-power devices and missing WebGL.
 * Same composition as the 3D scene: ball in the foreground, flag behind.
 */
export function SceneFallback({ label }: { label: string }) {
  return (
    <svg viewBox="0 0 800 600" role="img" aria-label={label} className="h-full w-full" preserveAspectRatio="xMidYMid slice">
      <defs>
        <radialGradient id="r9-green" cx="45%" cy="85%" r="80%">
          <stop offset="0" stopColor="#3b6b49" />
          <stop offset="0.6" stopColor="#24493a" />
          <stop offset="1" stopColor="#112b22" />
        </radialGradient>
        <radialGradient id="r9-ball" cx="38%" cy="32%" r="70%">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.65" stopColor="#ecebe4" />
          <stop offset="1" stopColor="#b9bdb2" />
        </radialGradient>
        <pattern id="r9-dimples" width="14" height="12" patternUnits="userSpaceOnUse">
          <circle cx="7" cy="6" r="3.2" fill="#000" opacity="0.07" />
        </pattern>
        <clipPath id="r9-ball-clip">
          <circle cx="330" cy="430" r="92" />
        </clipPath>
      </defs>
      <rect width="800" height="600" fill="url(#r9-green)" />
      <ellipse cx="560" cy="360" rx="26" ry="7" fill="#08140f" />
      <rect x="557" y="140" width="5" height="222" fill="#f5f3eb" />
      <path d="M562 142 h64 v38 h-64z" fill="#c7f279" />
      <ellipse cx="340" cy="520" rx="110" ry="18" fill="#08140f" opacity="0.45" />
      <circle cx="330" cy="430" r="92" fill="url(#r9-ball)" />
      <rect x="230" y="330" width="200" height="200" fill="url(#r9-dimples)" clipPath="url(#r9-ball-clip)" />
    </svg>
  );
}
