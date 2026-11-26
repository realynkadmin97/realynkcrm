/** Soft intersecting ribbons in Realynk blues. Decorative only. */
export function RealynkWaves({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" fill="none">
        <defs>
          <linearGradient id="reaWaveA" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0257b5" stopOpacity="0" />
            <stop offset="35%" stopColor="#0543b8" stopOpacity="0.85" />
            <stop offset="70%" stopColor="#7eb6ff" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#022f7f" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="reaWaveB" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#09127e" stopOpacity="0" />
            <stop offset="40%" stopColor="#0257b5" stopOpacity="0.7" />
            <stop offset="75%" stopColor="#0543b8" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#000851" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="reaWaveC" x1="0%" y1="50%" x2="100%" y2="50%">
            <stop offset="0%" stopColor="#7eb6ff" stopOpacity="0" />
            <stop offset="50%" stopColor="#0257b5" stopOpacity="0.65" />
            <stop offset="100%" stopColor="#0543b8" stopOpacity="0" />
          </linearGradient>
          <filter id="reaWaveGlow" x="-20%" y="-40%" width="140%" height="180%">
            <feGaussianBlur stdDeviation="18" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <g filter="url(#reaWaveGlow)" className="origin-center animate-[rea-wave-drift_18s_ease-in-out_infinite]">
          <path
            d="M-80 520 C 180 380, 320 640, 560 520 S 900 340, 1180 480 S 1420 620, 1560 500"
            stroke="url(#reaWaveA)"
            strokeWidth="56"
            strokeLinecap="round"
            opacity="0.9"
          />
          <path
            d="M-40 610 C 220 470, 380 700, 620 580 S 980 400, 1240 560 S 1460 680, 1580 560"
            stroke="url(#reaWaveB)"
            strokeWidth="42"
            strokeLinecap="round"
            opacity="0.75"
          />
          <path
            d="M-60 450 C 160 560, 340 300, 580 430 S 920 620, 1160 420 S 1400 280, 1560 400"
            stroke="url(#reaWaveC)"
            strokeWidth="28"
            strokeLinecap="round"
            opacity="0.7"
          />
        </g>
      </svg>
      <style>{`
        @keyframes rea-wave-drift {
          0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
          50% { transform: translate3d(-1.5%, 1.2%, 0) scale(1.03); }
        }
      `}</style>
    </div>
  );
}
