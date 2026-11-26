import Image from "next/image";

/** Rea greets the door. Copy is locked in brand/BRAND.md. */
export function ReaPanel() {
  return (
    <section className="relative flex min-h-[22rem] items-center justify-center overflow-hidden px-4 py-10 sm:min-h-[28rem] sm:px-6">
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(165deg, #dce8ff 0%, #f0f5ff 40%, #ffffff 78%), radial-gradient(circle at 70% 80%, rgba(5,67,184,0.2), transparent 45%)",
        }}
      />
      <div
        aria-hidden
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "linear-gradient(rgba(5,67,184,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(5,67,184,0.1) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />
      <div aria-hidden className="absolute top-8 right-8 h-24 w-24 rounded-3xl opacity-50 blur-xl" style={{ background: "#0543b8" }} />
      <div aria-hidden className="absolute bottom-10 left-6 h-20 w-20 rounded-full opacity-40 blur-xl" style={{ background: "#0257b5" }} />

      <div className="relative z-[1] flex w-full max-w-[22rem] flex-col items-center">
        <div className="relative w-full">
          <div className="absolute top-0 left-1/2 z-[2] w-[min(100%,13.75rem)] -translate-x-[58%] animate-[rea-float_5s_ease-in-out_infinite] sm:top-1">
            <div className="rounded-[1.4rem] border border-primary/20 bg-white/95 px-4 py-3 text-left shadow-[0_18px_40px_rgba(5,67,184,0.18)] backdrop-blur">
              <p className="text-sm font-bold leading-snug text-foreground">I&apos;m Rea, Realynk&apos;s command center manager.</p>
              <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                Ask your admin for an invite if you&apos;re new here.
              </p>
            </div>
            <span className="ml-[4.5rem] block h-0 w-0 border-x-[10px] border-t-[14px] border-x-transparent border-t-white" aria-hidden />
          </div>
          <Image
            src="/brand/rea-mascot.png"
            alt="Rea, the Realynk assistant"
            width={543}
            height={773}
            unoptimized
            priority
            className="relative z-[1] mx-auto mt-24 h-auto w-[min(100%,14.5rem)] animate-[rea-float_6.5s_ease-in-out_infinite] drop-shadow-[0_24px_40px_rgba(0,8,81,0.22)] sm:w-[min(100%,15.5rem)]"
          />
        </div>
      </div>
    </section>
  );
}
