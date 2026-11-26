import Link from "next/link";

const options = [
  {
    href: "/mockups/atlas",
    name: "Atlas",
    line: "Quiet command desk. Slim left nav, list-first Today, soft rounded panels.",
  },
  {
    href: "/mockups/harbor",
    name: "Harbor",
    line: "Airy top bar like the Rea door canvas. Softest round corners and pill actions.",
  },
  {
    href: "/mockups/ledger",
    name: "Ledger",
    line: "Ops floor. Toolbar + sheet table, with rounded chips and a soft table frame.",
  },
];

export default function MockupsIndex() {
  return (
    <main className="min-h-screen bg-[#f7f9fc] px-6 py-12 text-[#000851]" style={{ fontFamily: "var(--font-lato), Lato, sans-serif" }}>
      <div className="mx-auto max-w-3xl">
        <p className="text-xs tracking-[0.2em] text-[#0543b8] uppercase">Dashboard mockups</p>
        <h1 className="mt-2 text-4xl font-bold">Three directions for Rea&apos;s desk</h1>
        <p className="mt-3 max-w-xl text-[#022f7f]">
          Harbor is locked as the live command-center desk. These samples stay for reference.
        </p>
        <ul className="mt-8 space-y-3">
          {options.map((option) => (
            <li key={option.href}>
              <Link
                href={option.href}
                className="block rounded-2xl border border-[#0543b8]/25 bg-white px-5 py-4 transition hover:border-[#0543b8]"
              >
                <p className="font-bold">{option.name}</p>
                <p className="mt-1 text-sm text-[#022f7f]">{option.line}</p>
              </Link>
            </li>
          ))}
        </ul>
        <Link href="/login" className="mt-8 inline-block text-sm font-bold text-[#0543b8] underline">
          Back to live sign-in
        </Link>
      </div>
    </main>
  );
}
