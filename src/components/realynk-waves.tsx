/** Soft ribbons. Light mode is present but not a navy flood. */
export function RealynkWaves({
  className = "",
  tone = "light",
}: {
  className?: string;
  tone?: "light" | "dark";
}) {
  const light = tone === "light";
  return (
    <div aria-hidden className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      <svg className="absolute left-1/2 top-[46%] h-[78%] w-[145%] -translate-x-1/2 -translate-y-1/2" viewBox="0 0 1440 560" preserveAspectRatio="xMidYMid slice" fill="none">
        <defs>
          <linearGradient id="reaWaveA" x1="0%" y1="50%" x2="100%" y2="50%">
            <stop offset="0%" stopColor="#0543b8" stopOpacity="0" />
            <stop offset="25%" stopColor="#0543b8" stopOpacity={light ? "0.45" : "0.95"} />
            <stop offset="55%" stopColor="#7eb6ff" stopOpacity={light ? "0.55" : "0.85"} />
            <stop offset="100%" stopColor="#022f7f" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="reaWaveB" x1="100%" y1="40%" x2="0%" y2="60%">
            <stop offset="0%" stopColor="#09127e" stopOpacity="0" />
            <stop offset="35%" stopColor="#0257b5" stopOpacity={light ? "0.4" : "0.9"} />
            <stop offset="70%" stopColor="#0543b8" stopOpacity={light ? "0.5" : "1"} />
            <stop offset="100%" stopColor="#000851" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="reaWaveC" x1="0%" y1="50%" x2="100%" y2="50%">
            <stop offset="0%" stopColor="#7eb6ff" stopOpacity="0" />
            <stop offset="50%" stopColor="#0257b5" stopOpacity={light ? "0.35" : "0.7"} />
            <stop offset="100%" stopColor="#0543b8" stopOpacity="0" />
          </linearGradient>
          <filter id="reaWaveGlow" x="-10%" y="-50%" width="120%" height="200%">
            <feGaussianBlur stdDeviation={light ? "14" : "10"} result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <g filter="url(#reaWaveGlow)" className="origin-center animate-[rea-wave-drift_16s_ease-in-out_infinite]">
          <path
            d="M-100 300 C 160 140, 340 440, 580 280 S 940 100, 1180 270 S 1400 400, 1580 260"
            stroke="url(#reaWaveA)"
            strokeWidth={light ? "68" : "64"}
            strokeLinecap="round"
          />
          <path
            d="M-80 360 C 200 220, 380 480, 640 340 S 1000 160, 1260 350 S 1480 450, 1600 320"
            stroke="url(#reaWaveB)"
            strokeWidth={light ? "48" : "48"}
            strokeLinecap="round"
            opacity="0.9"
          />
          <path
            d="M-60 240 C 180 360, 360 100, 620 240 S 980 420, 1220 220 S 1460 80, 1600 200"
            stroke="url(#reaWaveC)"
            strokeWidth="30"
            strokeLinecap="round"
            opacity={light ? "0.75" : "0.85"}
          />
        </g>
      </svg>
      <style>{`
        @keyframes rea-wave-drift {
          0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
          50% { transform: translate3d(-1.2%, 1.4%, 0) scale(1.04); }
        }
      `}</style>
    </div>
  );
}
