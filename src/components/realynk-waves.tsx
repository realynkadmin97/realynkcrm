/** Soft ribbons. Light mode keeps Realynk blue as a whisper, not a flood. */
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
      <svg className="absolute left-1/2 top-[48%] h-[65%] w-[130%] -translate-x-1/2 -translate-y-1/2" viewBox="0 0 1440 520" preserveAspectRatio="xMidYMid slice" fill="none">
        <defs>
          <linearGradient id="reaWaveA" x1="0%" y1="50%" x2="100%" y2="50%">
            <stop offset="0%" stopColor="#0543b8" stopOpacity="0" />
            <stop offset="30%" stopColor="#0543b8" stopOpacity={light ? "0.22" : "0.9"} />
            <stop offset="60%" stopColor="#0257b5" stopOpacity={light ? "0.18" : "0.8"} />
            <stop offset="100%" stopColor="#022f7f" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="reaWaveB" x1="100%" y1="40%" x2="0%" y2="60%">
            <stop offset="0%" stopColor="#09127e" stopOpacity="0" />
            <stop offset="40%" stopColor="#0257b5" stopOpacity={light ? "0.16" : "0.85"} />
            <stop offset="100%" stopColor="#000851" stopOpacity="0" />
          </linearGradient>
          <filter id="reaWaveGlow" x="-10%" y="-50%" width="120%" height="200%">
            <feGaussianBlur stdDeviation={light ? "22" : "10"} result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <g filter="url(#reaWaveGlow)" className="origin-center animate-[rea-wave-drift_18s_ease-in-out_infinite]">
          <path
            d="M-100 280 C 160 120, 340 420, 580 260 S 940 80, 1180 250 S 1400 380, 1580 240"
            stroke="url(#reaWaveA)"
            strokeWidth={light ? "72" : "64"}
            strokeLinecap="round"
          />
          <path
            d="M-80 340 C 200 200, 380 460, 640 320 S 1000 140, 1260 330 S 1480 430, 1600 300"
            stroke="url(#reaWaveB)"
            strokeWidth={light ? "52" : "48"}
            strokeLinecap="round"
            opacity={light ? "0.7" : "0.9"}
          />
        </g>
      </svg>
      <style>{`
        @keyframes rea-wave-drift {
          0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
          50% { transform: translate3d(-1%, 1.2%, 0) scale(1.03); }
        }
      `}</style>
    </div>
  );
}
