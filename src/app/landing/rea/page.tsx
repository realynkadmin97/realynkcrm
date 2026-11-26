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
            "radial-gradient(ellipse 90% 70% at 50% 0%, #e8f0ff 0%, #f7f9fc 42%, #ffffff 100%)",
        }}
      />
      <RealynkWaves tone="light" />

      <p className="relative z-10 flex flex-wrap items-center justify-between gap-2 border-b border-[#000851]/8 bg-white/70 px-4 py-2.5 text-xs text-[#022f7f] backdrop-blur">
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
        <div className="grid w-full max-w-5xl overflow-hidden rounded-[1.75rem] border border-[#000851]/10 bg-white/80 shadow-[0_24px_80px_rgba(0,8,81,0.08)] backdrop-blur-sm lg:grid-cols-[1.05fr_0.95fr]">
          <section
            className="relative flex min-h-[22rem] items-center justify-center px-4 py-10 sm:min-h-[28rem] sm:px-6"
            style={{
              background:
                "linear-gradient(165deg, rgba(232,240,255,0.95) 0%, rgba(255,255,255,0.55) 55%, rgba(247,249,252,0.9) 100%)",
            }}
          >
            <div className="relative z-[1] flex w-full max-w-[22rem] flex-col items-center">
              <div className="relative w-full">
                <div className="absolute top-0 left-1/2 z-[2] w-[min(100%,13.75rem)] -translate-x-[58%] sm:top-1">
                  <div className="rounded-[1.4rem] border border-[#0543b8]/15 bg-white px-4 py-3 text-left shadow-[0_14px_36px_rgba(0,8,81,0.1)]">
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
                  className="relative z-[1] mx-auto mt-24 h-auto w-[min(100%,14.5rem)] drop-shadow-[0_20px_36px_rgba(0,8,81,0.18)] sm:w-[min(100%,15.5rem)]"
                />
              </div>
            </div>
          </section>

          <section className="relative z-[1] flex flex-col justify-center bg-white px-7 py-10 sm:px-10">
            <div className="mb-8 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0543b8] text-lg font-bold text-white">R</span>
              <div>
                <p className="text-xl font-bold tracking-wide text-[#000851]">Realynk</p>
                <p className="text-xs text-[#022f7f]/75">Sign in · Rea is ready when you are</p>
              </div>
            </div>

            <div className="space-y-5">
              <div className="space-y-2">
                <p className="text-sm font-bold text-[#000851]">Company email</p>
                <div className="flex h-12 w-full items-center rounded-xl border border-[#000851]/12 bg-[#f7f9fc] px-3 text-[#000851]">
                  you@company.com
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-bold text-[#000851]">Password</p>
                  <span className="text-xs font-bold text-[#0543b8]">Ask your admin</span>
                </div>
                <div className="flex h-12 w-full items-center rounded-xl border border-[#000851]/12 bg-[#f7f9fc] px-3 tracking-[0.35em] text-[#000851]">
                  ••••••••••
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-[#022f7f]">
                <span className="inline-block h-4 w-4 rounded border border-[#000851]/25" />
                Remember this device
              </div>
              <Link
                href="/login"
                className="flex h-12 w-full items-center justify-center rounded-full bg-[#0543b8] text-sm font-bold text-white transition hover:bg-[#0257b5]"
              >
                Sign in
              </Link>
            </div>

            <p className="mt-6 text-sm text-[#022f7f]">
              New on the company workspace?{" "}
              <span className="font-bold text-[#0543b8]">Ask an administrator for an invite</span>
            </p>
            <div className="mt-8 flex items-center gap-3 text-xs tracking-wide text-[#000851]/35 uppercase">
              <span className="h-px flex-1 bg-[#000851]/12" />
              Invite only
              <span className="h-px flex-1 bg-[#000851]/12" />
            </div>
            <p className="mt-4 text-xs leading-relaxed text-[#022f7f]/70">
              Public registration is closed. Rea greets the door. The real password check lives on the secure sign-in page.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
