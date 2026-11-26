import { RealynkWaves } from "@/components/realynk-waves";

/** Shared Realynk canvas: light stage, quiet waves, soft orbs. */
export function BrandStage({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`relative min-h-screen overflow-hidden text-foreground ${className}`}>
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 55% at 15% 20%, rgba(5,67,184,0.18) 0%, transparent 55%), radial-gradient(ellipse 60% 50% at 88% 78%, rgba(2,87,181,0.16) 0%, transparent 50%), linear-gradient(165deg, #eef3ff 0%, #f7f9fc 40%, #ffffff 100%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(5,67,184,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(5,67,184,0.08) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage: "radial-gradient(ellipse 75% 65% at 50% 40%, #000 20%, transparent 75%)",
        }}
      />
      <RealynkWaves tone="light" />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-16 -left-10 h-64 w-64 rounded-[40%] opacity-40 blur-2xl animate-[rea-orb_12s_ease-in-out_infinite]"
        style={{ background: "linear-gradient(135deg, #0543b8, #7eb6ff)" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-8 bottom-10 h-72 w-72 rounded-[45%] opacity-35 blur-2xl animate-[rea-orb_14s_ease-in-out_infinite_reverse]"
        style={{ background: "linear-gradient(160deg, #0257b5, #09127e)" }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
