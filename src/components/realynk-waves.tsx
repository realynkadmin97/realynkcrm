/** Quiet accent ribbons — present, not the main event. */
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
      <svg
        className="absolute right-[-8%] bottom-[8%] h-[38%] w-[55%] opacity-70 sm:bottom-[12%] sm:h-[34%] sm:w-[42%]"
        viewBox="0 0 720 320"
        preserveAspectRatio="xMidYMid meet"
        fill="none"
      >
        <defs>
          <linearGradient id="reaWaveA" x1="0%" y1="50%" x2="100%" y2="50%">
            <stop offset="0%" stopColor="#0543b8" stopOpacity="0" />
            <stop offset="40%" stopColor="#0543b8" stopOpacity={light ? "0.28" : "0.7"} />
            <stop offset="100%" stopColor="#0257b5" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="reaWaveB" x1="0%" y1="50%" x2="100%" y2="50%">
            <stop offset="0%" stopColor="#0257b5" stopOpacity="0" />
            <stop offset="50%" stopColor="#7eb6ff" stopOpacity={light ? "0.32" : "0.65"} />
            <stop offset="100%" stopColor="#0543b8" stopOpacity="0" />
          </linearGradient>
          <filter id="reaWaveGlow" x="-15%" y="-40%" width="130%" height="180%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <g filter="url(#reaWaveGlow)" className="origin-center animate-[rea-wave-drift_20s_ease-in-out_infinite]">
          <path
            d="M20 180 C 140 120, 220 240, 360 170 S 560 90, 700 160"
            stroke="url(#reaWaveA)"
            strokeWidth="22"
            strokeLinecap="round"
          />
          <path
            d="M40 220 C 160 160, 260 270, 400 200 S 580 130, 700 200"
            stroke="url(#reaWaveB)"
            strokeWidth="14"
            strokeLinecap="round"
            opacity="0.85"
          />
        </g>
      </svg>
      <svg
        className="absolute top-[12%] left-[-6%] h-[28%] w-[40%] opacity-55"
        viewBox="0 0 640 280"
        preserveAspectRatio="xMidYMid meet"
        fill="none"
      >
        <defs>
          <linearGradient id="reaWaveC" x1="0%" y1="50%" x2="100%" y2="50%">
            <stop offset="0%" stopColor="#7eb6ff" stopOpacity="0" />
            <stop offset="45%" stopColor="#0543b8" stopOpacity={light ? "0.22" : "0.55"} />
            <stop offset="100%" stopColor="#022f7f" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d="M0 160 C 120 100, 220 220, 340 150 S 520 80, 640 140"
          stroke="url(#reaWaveC)"
          strokeWidth="16"
          strokeLinecap="round"
          className="animate-[rea-wave-drift_22s_ease-in-out_infinite_reverse]"
        />
      </svg>
      <style>{`
        @keyframes rea-wave-drift {
          0%, 100% { transform: translate3d(0, 0, 0); }
          50% { transform: translate3d(-1%, 1%, 0); }
        }
      `}</style>
    </div>
  );
}
