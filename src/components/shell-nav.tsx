"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function ModuleNav({
  links,
}: {
  links: { href: string; label: string }[];
}) {
  const pathname = usePathname();
  return (
    <nav className="flex max-w-full gap-1 overflow-x-auto">
      {links.map((link) => {
        const active = link.href === "/" ? pathname === "/" : pathname === link.href || pathname.startsWith(`${link.href}/`);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`whitespace-nowrap rounded-full px-3 py-1.5 text-sm transition ${
              active
                ? "bg-primary/10 font-bold text-primary"
                : "text-foreground/65 hover:bg-white/70 hover:text-primary"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function DepartmentRail({
  departments,
}: {
  departments: { id: string; label: string; href: string; ready: boolean }[];
}) {
  const pathname = usePathname();
  return (
    <nav className="flex gap-1 overflow-x-auto px-3 pb-3 md:block md:space-y-1 md:overflow-visible md:px-3 md:pb-0">
      {departments.map((dept) => {
        const active =
          dept.id === "gtm" ? !pathname.startsWith("/command/") : pathname === dept.href || pathname.startsWith(`${dept.href}/`);
        if (!dept.ready) {
          return (
            <div
              key={dept.id}
              className="flex items-center justify-between gap-2 whitespace-nowrap rounded-2xl px-3 py-2.5 text-sm text-foreground/40"
              title="Coming soon"
            >
              <span>{dept.label}</span>
              <span className="rounded-full bg-primary/5 px-2 py-0.5 text-[10px] font-bold tracking-wide text-primary/50 uppercase">
                Soon
              </span>
            </div>
          );
        }
        return (
          <Link
            key={dept.id}
            href={dept.href}
            className={`block whitespace-nowrap rounded-2xl px-3 py-2.5 text-sm transition ${
              active
                ? "bg-primary/10 font-bold text-primary shadow-[0_8px_24px_rgba(5,67,184,0.08)]"
                : "text-foreground/70 hover:bg-white/70 hover:text-primary"
            }`}
          >
            {dept.label}
          </Link>
        );
      })}
    </nav>
  );
}
