import { RealynkWaves } from "@/components/realynk-waves";
import Image from "next/image";
import Link from "next/link";

const font = { fontFamily: "var(--font-lato), Lato, sans-serif" } as const;

export default function ReaLoginMockup() {
  return (
    <main className="relative min-h-screen overflow-hidden text-[#000851]" style={font}>
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 55% at 15% 20%, rgba(5,67,184,0.18) 0%, transparent 55%), radial-gradient(ellipse 60% 50% at 88% 78%, rgba(2,87,181,0.16) 0%, transparent 50%), linear-gradient(165deg, #eef3ff 0%, #f7f9fc 40%, #ffffff 100%)",
        }}
      />
      {/* Fantom-style mesh */}
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
      {/* Dual-tone brand shapes */}
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

      <p className="relative z-10 flex flex-wrap items-center justify-between gap-2 border-b border-[#000851]/8 bg-white/75 px-4 py-2.5 text-xs text-[#022f7f] backdrop-blur">
        <span>Landing sample · Rea. This page does not sign anyone in.</span>
        <span className="flex gap-3">
          <Link href="/landing" className="underline">
            All samples
          </Link>
          <Link href="/login" className="font-bold text-[#0543b8] underline">
            Real sign-in
          </Link>
        </span>
      </p>

      <div className="relative z-10 flex min-h-[calc(100dvh-2.75rem)] items-center justify-center px-4 py-10">
        <div className="grid w-full max-w-5xl overflow-hidden rounded-[1.75rem] border border-[#0543b8]/15 bg-white/85 shadow-[0_30px_90px_rgba(0,8,81,0.14)] ring-1 ring-white/80 backdrop-blur-md lg:grid-cols-[1.05fr_0.95fr]">
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
            <div
              aria-hidden
              className="absolute top-8 right-8 h-24 w-24 rounded-3xl opacity-50 blur-xl"
              style={{ background: "#0543b8" }}
            />
            <div
              aria-hidden
              className="absolute bottom-10 left-6 h-20 w-20 rounded-full opacity-40 blur-xl"
              style={{ background: "#0257b5" }}
            />

            <div className="relative z-[1] flex w-full max-w-[22rem] flex-col items-center">
              <div className="relative w-full">
                <div className="absolute top-0 left-1/2 z-[2] w-[min(100%,13.75rem)] -translate-x-[58%] animate-[rea-float_5s_ease-in-out_infinite] sm:top-1">
                  <div className="rounded-[1.4rem] border border-[#0543b8]/20 bg-white/95 px-4 py-3 text-left shadow-[0_18px_40px_rgba(5,67,184,0.18)] backdrop-blur">
                    <p className="text-sm font-bold leading-snug text-[#000851]">
                      I&apos;m Rea, Realynk&apos;s command center manager.
                    </p>
                    <p className="mt-1.5 text-xs leading-relaxed text-[#022f7f]">
                      Ask your admin for an invite if you&apos;re new here.
                    </p>
                  </div>
                  <span
                    className="ml-[4.5rem] block h-0 w-0 border-x-[10px] border-t-[14px] border-x-transparent border-t-white"
                    aria-hidden
                  />
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

          <section className="relative z-[1] flex flex-col justify-center bg-white px-7 py-10 sm:px-10">
            <div
              aria-hidden
              className="pointer-events-none absolute -top-10 right-0 h-40 w-40 rounded-full opacity-30 blur-3xl"
              style={{ background: "#7eb6ff" }}
            />
            <div className="relative mb-8 flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#0543b8] text-lg font-bold text-white shadow-[0_10px_24px_rgba(5,67,184,0.35)]">
                R
              </span>
              <div>
                <p className="text-xl font-bold tracking-wide text-[#000851]">Realynk</p>
                <p className="text-xs text-[#022f7f]/75">Sign in · Rea is ready when you are</p>
              </div>
            </div>

            <div className="relative space-y-5">
              <div className="space-y-2">
                <p className="text-sm font-bold text-[#000851]">Company email</p>
                <div className="flex h-12 w-full items-center rounded-xl border border-[#0543b8]/18 bg-[#f3f7ff] px-3 text-[#000851] shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
                  you@company.com
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-bold text-[#000851]">Password</p>
                  <span className="text-xs font-bold text-[#0543b8]">Ask your admin</span>
                </div>
                <div className="flex h-12 w-full items-center rounded-xl border border-[#0543b8]/18 bg-[#f3f7ff] px-3 tracking-[0.35em] text-[#000851] shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
                  ••••••••••
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-[#022f7f]">
                <span className="inline-block h-4 w-4 rounded border border-[#0543b8]/35" />
                Remember this device
              </div>
              <Link
                href="/login"
                className="flex h-12 w-full items-center justify-center rounded-full bg-[#0543b8] text-sm font-bold text-white shadow-[0_14px_28px_rgba(5,67,184,0.35)] transition hover:bg-[#0257b5]"
              >
                Sign in
              </Link>
            </div>

            <p className="relative mt-6 text-sm text-[#022f7f]">
              New on the company workspace?{" "}
              <span className="font-bold text-[#0543b8]">Ask an administrator for an invite</span>
            </p>
            <div className="relative mt-8 flex items-center gap-3 text-xs tracking-wide text-[#000851]/35 uppercase">
              <span className="h-px flex-1 bg-[#0543b8]/20" />
              Invite only
              <span className="h-px flex-1 bg-[#0543b8]/20" />
            </div>
            <p className="relative mt-4 text-xs leading-relaxed text-[#022f7f]/70">
              Public registration is closed. Rea greets the door. The real password check lives on the secure sign-in page.
            </p>
          </section>
        </div>
      </div>

      <style>{`
        @keyframes rea-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        @keyframes rea-orb {
          0%, 100% { transform: translate3d(0,0,0) scale(1); }
          50% { transform: translate3d(12px, -18px, 0) scale(1.08); }
        }
      `}</style>
    </main>
  );
}
