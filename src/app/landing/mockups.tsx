import { BrandMark } from "@/components/brand-mark";
import Link from "next/link";

const font = { fontFamily: "var(--font-lato), Lato, sans-serif" } as const;

export function MockBanner({ name }: { name: string }) {
  return (
    <p className="flex flex-wrap items-center justify-between gap-2 bg-[#000851] px-4 py-2 text-xs text-white" style={font}>
      <span>Landing sample · {name}. This page does not sign anyone in.</span>
      <span className="flex gap-3">
        <Link href="/landing" className="underline">All samples</Link>
        <Link href="/login" className="underline">Real sign-in</Link>
      </span>
    </p>
  );
}

export function Threshold() {
  return (
    <div className="flex min-h-[calc(100dvh-2.25rem)] flex-col justify-between px-8 py-12 text-white" style={{ ...font, background: "linear-gradient(165deg, #000851 0%, #09127e 40%, #0543b8 100%)" }}>
      <BrandMark />
      <div className="max-w-xl">
        <p className="text-xs tracking-[0.24em] uppercase text-white/70">Realynk Assistants</p>
        <h1 className="mt-4 text-5xl leading-tight font-bold">A real link to the work that matters.</h1>
        <p className="mt-4 max-w-md text-lg text-white/85">Founders stay in their zone of genius. The company workspace keeps the leads, the pipeline, and the cleaning in one place.</p>
        <Link href="/login" className="mt-8 inline-block rounded-lg bg-white px-5 py-3 text-sm font-bold text-[#000851]">Sign in</Link>
      </div>
      <p className="text-sm text-white/70">Transparency · Solution-centered · Partnership</p>
    </div>
  );
}

export function Partnership() {
  return (
    <div className="min-h-[calc(100dvh-2.25rem)] bg-white text-[#000851]" style={font}>
      <header className="flex items-center justify-between px-6 py-5 sm:px-10">
        <p className="text-lg font-bold tracking-wide">REALYNK</p>
        <Link href="/login" className="rounded-lg bg-[#0543b8] px-4 py-2 text-sm font-bold text-white">Sign in</Link>
      </header>
      <div className="mx-auto grid max-w-5xl gap-10 px-6 py-8 lg:grid-cols-[1.2fr_0.8fr] lg:py-16">
        <div>
          <p className="text-sm font-bold tracking-[0.18em] text-[#0543b8] uppercase">Virtual assistance</p>
          <h1 className="mt-3 text-4xl leading-tight font-bold sm:text-5xl">Partners who stay honest, and stay on the solution.</h1>
          <p className="mt-4 max-w-xl text-lg text-[#022f7f]">Personalized support for founders, executives, and thought leaders. Affordable, high quality, and clear about what is happening.</p>
        </div>
        <ul className="space-y-4">
          {[
            ["Transparency", "Open without being asked."],
            ["Solution-centered", "Fewer excuses. A practical next step."],
            ["Partnership", "Trust with the team, the client, and the community."],
          ].map(([title, line]) => (
            <li key={title} className="rounded-2xl border border-[#0543b8]/25 px-5 py-4">
              <p className="font-bold">{title}</p>
              <p className="mt-1 text-sm text-[#022f7f]">{line}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function Desk() {
  return (
    <div className="grid min-h-[calc(100dvh-2.25rem)] lg:grid-cols-2" style={font}>
      <section className="flex flex-col justify-between bg-[#000851] px-8 py-10 text-white">
        <BrandMark />
        <div>
          <h1 className="text-4xl font-bold">Clean the list. Then take it to the pipeline.</h1>
          <p className="mt-4 max-w-md text-white/80">One company sheet for names, titles, and the next conversation. Sign in to open the workspace.</p>
          <Link href="/login" className="mt-8 inline-block rounded-lg bg-[#0543b8] px-5 py-3 text-sm font-bold text-white">Open the workspace</Link>
        </div>
        <p className="text-sm text-white/60">Company accounts only.</p>
      </section>
      <section className="bg-[#f4f7fb] p-6 sm:p-10">
        <div className="overflow-hidden rounded-xl border border-[#0543b8]/20 bg-white shadow-sm">
          <div className="flex gap-2 border-b border-[#0543b8]/15 px-4 py-3 text-xs text-[#022f7f]">
            <span className="rounded bg-[#0543b8] px-2 py-1 font-bold text-white">Outbound clinics</span>
            <span className="px-2 py-1">New client</span>
          </div>
          <table className="w-full text-left text-sm text-[#000851]">
            <thead className="bg-[#f4f7fb] text-xs text-[#022f7f]">
              <tr>
                <th className="px-3 py-2 font-bold">A</th>
                <th className="px-3 py-2 font-bold">B</th>
                <th className="px-3 py-2 font-bold">C</th>
              </tr>
              <tr>
                <th className="px-3 py-2">First name</th>
                <th className="px-3 py-2">Company</th>
                <th className="px-3 py-2">Title</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-[#0543b8]/10">
                <td className="px-3 py-3">Dana</td>
                <td className="px-3 py-3">Northwind Clinics</td>
                <td className="px-3 py-3">Vice President</td>
              </tr>
              <tr className="border-t border-[#0543b8]/10">
                <td className="px-3 py-3">Elena</td>
                <td className="px-3 py-3">Lumen Dental</td>
                <td className="px-3 py-3">Director of recruiting</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-[#022f7f]">A picture of the sheet. These rows are not loaded from the company database.</p>
      </section>
    </div>
  );
}
