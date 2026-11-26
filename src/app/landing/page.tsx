import Link from "next/link";

const samples = [
  { href: "/mockups", name: "Dashboard mockups (new)", line: "Three desk directions: Atlas, Harbor, Ledger." },
  { href: "/login", name: "Rea door (live)", line: "Locked as the global Realynk CRM design. Secure sign-in with Rea." },
  { href: "/landing/threshold", name: "Threshold", line: "Earlier sample. Full-bleed navy." },
  { href: "/landing/partnership", name: "Partnership", line: "Earlier sample. White values page." },
  { href: "/landing/desk", name: "Desk", line: "Earlier sample. Sheet preview." },
];

export default function LandingIndex() {
  return (
    <main className="min-h-screen bg-white px-6 py-12 text-[#000851]" style={{ fontFamily: "var(--font-lato), Lato, sans-serif" }}>
      <div className="mx-auto max-w-3xl">
        <p className="text-xs tracking-[0.2em] text-[#0543b8] uppercase">Samples</p>
        <h1 className="mt-2 text-4xl font-bold">Landing page mockups</h1>
        <p className="mt-3 max-w-xl text-[#022f7f]">
          Three ways the front door could look. None of them collect a password. The real sign-in is the secure page.
        </p>
        <ul className="mt-8 space-y-3">
          {samples.map((sample) => (
            <li key={sample.href}>
              <Link href={sample.href} className="block rounded-2xl border border-[#0543b8]/25 px-5 py-4 hover:border-[#0543b8]">
                <p className="font-bold">{sample.name}</p>
                <p className="mt-1 text-sm text-[#022f7f]">{sample.line}</p>
              </Link>
            </li>
          ))}
        </ul>
        <Link href="/login" className="mt-8 inline-block text-sm font-bold text-[#0543b8] underline">Go to the real sign-in</Link>
      </div>
    </main>
  );
}
