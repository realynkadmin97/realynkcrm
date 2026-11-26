import Link from "next/link";
import { LogoMark } from "@/components/logo-mark";
import { LEADS, NAV, STALE, TASKS } from "@/components/mockups/mock-data";

export default function AtlasMockup() {
  return (
    <div className="min-h-screen bg-[#f7f9fc] text-[#000851]" style={{ fontFamily: "var(--font-lato), Lato, sans-serif" }}>
      <div className="border-b border-[#0543b8]/15 bg-white/90 px-4 py-3 md:px-6">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <LogoMark className="h-8 w-8" />
            <div>
              <p className="text-sm font-bold tracking-wide">Realynk</p>
              <p className="text-[11px] text-[#0543b8]">Atlas · mockup</p>
            </div>
          </div>
          <Link href="/mockups" className="text-xs font-bold text-[#0543b8] underline-offset-4 hover:underline">
            All mockups
          </Link>
        </div>
      </div>

      <div className="mx-auto grid max-w-6xl md:grid-cols-[180px_1fr]">
        <aside className="border-b border-[#0543b8]/12 px-4 py-6 md:min-h-[calc(100vh-57px)] md:border-r md:border-b-0">
          <nav className="flex gap-1 overflow-x-auto md:block md:space-y-0.5">
            {NAV.map((item, index) => (
              <a
                key={item}
                href="#desk"
                className={`block whitespace-nowrap px-2 py-2 text-sm ${
                  index === 0
                    ? "border-l-2 border-[#0543b8] font-bold text-[#0543b8] md:pl-3"
                    : "text-[#000851]/70 hover:text-[#0543b8] md:border-l-2 md:border-transparent md:pl-3"
                }`}
              >
                {item}
              </a>
            ))}
          </nav>
          <div className="mt-8 hidden border-t border-[#0543b8]/12 pt-4 md:block">
            <p className="text-sm font-bold">Joan Hilary</p>
            <p className="mt-0.5 text-xs text-[#000851]/55">Admin</p>
            <button type="button" className="mt-3 text-xs font-bold text-[#0543b8] underline-offset-2 hover:underline">
              Log out
            </button>
          </div>
        </aside>

        <main id="desk" className="px-4 py-8 md:px-10">
          <header className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Good to see you, Joan</h1>
              <p className="mt-1 text-sm text-[#000851]/60">Command desk · Shanghai time</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                className="border border-[#0543b8]/30 bg-white px-4 py-2 text-sm font-bold text-[#0543b8] hover:border-[#0543b8]"
              >
                Import leads
              </button>
              <button type="button" className="bg-[#0543b8] px-4 py-2 text-sm font-bold text-white hover:bg-[#0257b5]">
                Add lead
              </button>
            </div>
          </header>

          <section className="mt-8 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <div className="flex items-baseline justify-between gap-3">
                <h2 className="text-sm font-bold tracking-[0.14em] text-[#0543b8] uppercase">Needs attention</h2>
                <span className="text-xs text-[#000851]/50">{STALE.length} open</span>
              </div>
              <ul className="mt-3 divide-y divide-[#0543b8]/12 border-y border-[#0543b8]/12">
                {STALE.map((row) => (
                  <li key={row.company} className="flex items-center justify-between gap-3 py-3">
                    <div>
                      <p className="font-bold">{row.company}</p>
                      <p className="text-xs text-[#000851]/55">{row.person}</p>
                    </div>
                    <span className="text-xs font-bold tracking-wide text-[#0543b8]">{row.stage}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-8 flex items-baseline justify-between gap-3">
                <h2 className="text-sm font-bold tracking-[0.14em] text-[#0543b8] uppercase">Pipeline glance</h2>
                <a href="#desk" className="text-xs font-bold text-[#0543b8] hover:underline">
                  Open leads →
                </a>
              </div>
              <ul className="mt-3 space-y-2">
                {LEADS.slice(0, 4).map((lead) => (
                  <li key={lead.company} className="flex items-center justify-between gap-3 bg-white px-3 py-2.5">
                    <div>
                      <p className="text-sm font-bold">{lead.company}</p>
                      <p className="text-xs text-[#000851]/55">
                        {lead.person} · {lead.updated}
                      </p>
                    </div>
                    <span className="text-xs text-[#000851]/70">{lead.stage}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="text-sm font-bold tracking-[0.14em] text-[#0543b8] uppercase">Open tasks</h2>
              <ul className="mt-3 space-y-3">
                {TASKS.map((task) => (
                  <li key={task.summary} className="border-l-2 border-[#7eb6ff] bg-white py-3 pl-4">
                    <p className="text-sm font-bold">{task.summary}</p>
                    <p className="mt-1 text-xs text-[#000851]/55">{task.when}</p>
                  </li>
                ))}
              </ul>
              <p className="mt-6 text-xs leading-relaxed text-[#000851]/50">
                Atlas uses square actions and underline links — no rounded pills. Nav is a quiet left margin, not a heavy rail.
              </p>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
