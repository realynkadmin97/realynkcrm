import Link from "next/link";
import { LogoMark } from "@/components/logo-mark";
import { LEADS, NAV, STALE, TASKS } from "@/components/mockups/mock-data";

export default function HarborMockup() {
  return (
    <div
      className="relative min-h-screen overflow-hidden text-[#000851]"
      style={{
        fontFamily: "var(--font-lato), Lato, sans-serif",
        background:
          "radial-gradient(ellipse 80% 50% at 10% -10%, rgba(126,182,255,0.35), transparent 55%), radial-gradient(ellipse 60% 40% at 100% 0%, rgba(5,67,184,0.12), transparent 50%), linear-gradient(180deg, #eef3ff 0%, #f7f9fc 40%, #ffffff 100%)",
      }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.28]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(5,67,184,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(5,67,184,0.08) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <header className="relative z-[1] border-b border-white/60 bg-white/55 px-4 py-4 backdrop-blur-md md:px-8">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <LogoMark className="h-9 w-9 shadow-[0_10px_24px_rgba(5,67,184,0.25)]" />
            <div>
              <p className="text-lg font-bold tracking-wide">Realynk</p>
              <p className="text-xs text-[#0543b8]">Harbor · mockup · Rea&apos;s canvas</p>
            </div>
          </div>
          <nav className="flex max-w-full gap-1 overflow-x-auto">
            {NAV.map((item, index) => (
              <a
                key={item}
                href="#work"
                className={`whitespace-nowrap rounded-full px-3 py-1.5 text-sm ${
                  index === 0
                    ? "bg-[#0543b8]/10 font-bold text-[#0543b8]"
                    : "text-[#000851]/65 hover:bg-white/70 hover:text-[#0543b8]"
                }`}
              >
                {item}
              </a>
            ))}
          </nav>
          <Link href="/mockups" className="text-xs font-bold text-[#0543b8] underline-offset-4 hover:underline">
            All mockups
          </Link>
        </div>
      </header>

      <main id="work" className="relative z-[1] mx-auto max-w-6xl px-4 py-10 md:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold tracking-[0.18em] text-[#0543b8] uppercase">Today</p>
            <h1 className="mt-2 text-4xl font-bold tracking-tight">Your queue is calm</h1>
            <p className="mt-2 max-w-lg text-sm text-[#000851]/65">
              Same brand canvas as the login door — soft panels, rounded actions, no side drawer.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="rounded-full border border-[#0543b8]/35 bg-white/80 px-5 py-2.5 text-sm font-bold text-[#0543b8] backdrop-blur hover:bg-white"
            >
              Ask Rea
            </button>
            <button
              type="button"
              className="rounded-full bg-[#0543b8] px-5 py-2.5 text-sm font-bold text-white shadow-[0_12px_28px_rgba(5,67,184,0.28)]"
            >
              New lead
            </button>
          </div>
        </div>

        <section className="mt-10 grid gap-5 lg:grid-cols-3">
          <div className="rounded-[1.75rem] border border-white/80 bg-white/70 p-5 shadow-[0_20px_50px_rgba(0,8,81,0.06)] backdrop-blur lg:col-span-2">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold">Needs attention</h2>
              <span className="rounded-full bg-[#0543b8]/10 px-2.5 py-0.5 text-xs font-bold text-[#0543b8]">
                {STALE.length}
              </span>
            </div>
            <ul className="mt-4 space-y-3">
              {STALE.map((row) => (
                <li
                  key={row.company}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-[#0543b8]/10 bg-white/80 px-3 py-3"
                >
                  <div>
                    <p className="font-bold">{row.company}</p>
                    <p className="text-xs text-[#000851]/55">{row.person}</p>
                  </div>
                  <button
                    type="button"
                    className="rounded-full border border-[#0543b8]/25 px-3 py-1 text-xs font-bold text-[#0543b8]"
                  >
                    {row.stage}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-[1.75rem] border border-white/80 bg-white/70 p-5 shadow-[0_20px_50px_rgba(0,8,81,0.06)] backdrop-blur">
            <h2 className="text-sm font-bold">Open tasks</h2>
            <ul className="mt-4 space-y-4">
              {TASKS.map((task) => (
                <li key={task.summary}>
                  <p className="text-sm font-bold leading-snug">{task.summary}</p>
                  <p className="mt-1 text-xs text-[#000851]/55">{task.when}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="mt-5 rounded-[1.75rem] border border-white/80 bg-white/70 p-5 shadow-[0_20px_50px_rgba(0,8,81,0.06)] backdrop-blur">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-bold">Recent leads</h2>
            <a href="#work" className="text-xs font-bold text-[#0543b8] hover:underline">
              View all
            </a>
          </div>
          <div className="mt-4 overflow-x-auto rounded-2xl border border-[#0543b8]/10 bg-white/80">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead>
                <tr className="border-b border-[#0543b8]/15 text-xs tracking-wide text-[#0543b8] uppercase">
                  <th className="px-3 pb-2 pt-3 font-bold">Company</th>
                  <th className="px-3 pb-2 pt-3 font-bold">Person</th>
                  <th className="px-3 pb-2 pt-3 font-bold">Stage</th>
                  <th className="px-3 pb-2 pt-3 font-bold">Updated</th>
                </tr>
              </thead>
              <tbody>
                {LEADS.map((lead) => (
                  <tr key={lead.company} className="border-b border-[#0543b8]/08 last:border-0">
                    <td className="px-3 py-2.5 font-bold">{lead.company}</td>
                    <td className="px-3 py-2.5 text-[#000851]/70">{lead.person}</td>
                    <td className="px-3 py-2.5 text-[#0543b8]">{lead.stage}</td>
                    <td className="px-3 py-2.5 text-[#000851]/55">{lead.updated}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
