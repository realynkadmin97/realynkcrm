import Link from "next/link";
import { LogoMark } from "@/components/logo-mark";
import { LEADS, NAV, TASKS } from "@/components/mockups/mock-data";

export default function LedgerMockup() {
  return (
    <div className="min-h-screen bg-[#f3f6fb] text-[#000851]" style={{ fontFamily: "var(--font-lato), Lato, sans-serif" }}>
      <header className="border-b border-[#0543b8]/15 bg-white">
        <div className="flex flex-wrap items-center gap-3 px-3 py-2.5 md:px-4">
          <LogoMark className="h-7 w-7" />
          <p className="text-sm font-bold tracking-wide">Realynk</p>
          <span className="hidden h-4 w-px bg-[#0543b8]/20 sm:block" />
          <nav className="flex max-w-full flex-1 gap-0.5 overflow-x-auto">
            {NAV.map((item, index) => (
              <a
                key={item}
                href="#sheet"
                className={`whitespace-nowrap rounded-full px-2.5 py-1.5 text-xs font-bold ${
                  index === 1
                    ? "bg-[#0543b8]/10 text-[#0543b8]"
                    : "text-[#000851]/65 hover:bg-[#0543b8]/06 hover:text-[#0543b8]"
                }`}
              >
                {item}
              </a>
            ))}
          </nav>
          <Link href="/mockups" className="text-[11px] font-bold text-[#0543b8] underline-offset-2 hover:underline">
            All mockups
          </Link>
        </div>

        <div className="flex flex-wrap items-center gap-2 border-t border-[#0543b8]/10 bg-[#f7f9fc] px-3 py-2 md:px-4">
          <button type="button" className="rounded-full bg-[#0543b8] px-3 py-1.5 text-xs font-bold text-white">
            Add lead
          </button>
          <button
            type="button"
            className="rounded-full border border-[#0543b8]/25 bg-white px-3 py-1.5 text-xs font-bold text-[#0543b8]"
          >
            Import
          </button>
          <button
            type="button"
            className="rounded-full border border-[#0543b8]/25 bg-white px-3 py-1.5 text-xs font-bold text-[#0543b8]"
          >
            Filter
          </button>
          <button
            type="button"
            className="rounded-full border border-[#0543b8]/25 bg-white px-3 py-1.5 text-xs font-bold text-[#0543b8]"
          >
            Export
          </button>
          <div className="ml-auto flex items-center gap-2">
            <input
              readOnly
              value="Search company or person"
              className="w-44 rounded-full border border-[#0543b8]/20 bg-white px-3 py-1.5 text-xs text-[#000851]/45 md:w-56"
            />
            <span className="text-[11px] text-[#000851]/50">Joan · Admin</span>
          </div>
        </div>
      </header>

      <div className="grid lg:grid-cols-[1fr_240px]">
        <main id="sheet" className="min-w-0 px-3 py-4 md:px-4">
          <div className="mb-3 flex items-end justify-between gap-3">
            <div>
              <h1 className="text-xl font-bold">Leads</h1>
              <p className="text-xs text-[#000851]/55">Ledger mockup — the sheet is the product</p>
            </div>
            <p className="text-xs text-[#0543b8]">{LEADS.length} rows</p>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-[#0543b8]/15 bg-white shadow-[0_12px_40px_rgba(0,8,81,0.05)]">
            <table className="w-full min-w-[640px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-[#0543b8]/15 bg-[#eef3ff] text-[11px] tracking-wide text-[#0543b8] uppercase">
                  <th className="px-3 py-2.5 font-bold">
                    <input type="checkbox" aria-label="Select all" className="accent-[#0543b8]" />
                  </th>
                  <th className="px-3 py-2.5 font-bold">Company</th>
                  <th className="px-3 py-2.5 font-bold">Contact</th>
                  <th className="px-3 py-2.5 font-bold">Stage</th>
                  <th className="px-3 py-2.5 font-bold">Owner</th>
                  <th className="px-3 py-2.5 font-bold">Updated</th>
                  <th className="px-3 py-2.5 font-bold" />
                </tr>
              </thead>
              <tbody>
                {LEADS.map((lead, index) => (
                  <tr key={lead.company} className={`border-b border-[#0543b8]/08 ${index % 2 ? "bg-[#f7f9fc]/70" : ""}`}>
                    <td className="px-3 py-2.5">
                      <input type="checkbox" aria-label={`Select ${lead.company}`} className="accent-[#0543b8]" />
                    </td>
                    <td className="px-3 py-2.5 font-bold">{lead.company}</td>
                    <td className="px-3 py-2.5 text-[#000851]/75">{lead.person}</td>
                    <td className="px-3 py-2.5">
                      <span className="inline-block rounded-full border border-[#0543b8]/20 bg-[#0543b8]/05 px-2.5 py-0.5 text-[11px] font-bold text-[#0543b8]">
                        {lead.stage}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-[#000851]/65">{lead.owner}</td>
                    <td className="px-3 py-2.5 text-[#000851]/55">{lead.updated}</td>
                    <td className="px-3 py-2.5 text-right">
                      <button type="button" className="rounded-full px-2 py-1 text-xs font-bold text-[#0543b8] hover:bg-[#0543b8]/08">
                        Open
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>

        <aside className="border-t border-[#0543b8]/12 bg-white px-4 py-4 lg:border-t-0 lg:border-l">
          <h2 className="text-xs font-bold tracking-[0.14em] text-[#0543b8] uppercase">Due soon</h2>
          <ul className="mt-3 space-y-3">
            {TASKS.map((task) => (
              <li key={task.summary} className="rounded-2xl border border-[#0543b8]/12 bg-[#f7f9fc] px-3 py-2.5">
                <p className="text-xs font-bold leading-snug">{task.summary}</p>
                <p className="mt-1 text-[11px] text-[#000851]/55">{task.when}</p>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-[11px] leading-relaxed text-[#000851]/50">
            Ledger keeps the sheet as the product, with soft rounded toolbar chips and a rounded table frame.
          </p>
        </aside>
      </div>
    </div>
  );
}
