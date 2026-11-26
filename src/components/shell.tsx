import { logout } from "@/app/actions";
import { LogoMark } from "@/components/logo-mark";
import { DepartmentRail, ModuleNav } from "@/components/shell-nav";
import { Button } from "@/components/ui/button";
import { can, type SessionUser } from "@/lib/auth";
import { ROLE_COPY } from "@/lib/labels";

const LINKS = [
  { href: "/", label: "Today", allow: () => true },
  {
    href: "/leads",
    label: "Leads",
    allow: (permissions: string[]) => can(permissions, "leads.view_all") || can(permissions, "leads.view_assigned"),
  },
  { href: "/clean", label: "Cleaner", allow: () => true },
  {
    href: "/opportunities",
    label: "Opportunities",
    allow: (permissions: string[]) =>
      can(permissions, "opportunities.view_all") || can(permissions, "opportunities.view_assigned"),
  },
  { href: "/activities", label: "Activities", allow: () => true },
  {
    href: "/team",
    label: "Team",
    allow: (permissions: string[]) => can(permissions, "leads.assign") || can(permissions, "performance.view"),
  },
  { href: "/people", label: "People", allow: (permissions: string[]) => can(permissions, "users.manage") },
  { href: "/settings", label: "Settings", allow: (permissions: string[]) => can(permissions, "settings.manage") },
];

const DEPARTMENTS = [
  { id: "gtm", label: "Go-to-Market", href: "/", ready: true },
  { id: "finance", label: "Finance", href: "/command/finance", ready: true },
  { id: "operations", label: "Operations", href: "/command/operations", ready: true },
  { id: "hr", label: "HR", href: "/command/hr", ready: true },
] as const;

export function Shell({
  user,
  permissions,
  children,
}: {
  user: SessionUser;
  permissions: string[];
  children: React.ReactNode;
}) {
  const role = ROLE_COPY[user.role];
  const modules = LINKS.filter((link) => link.allow(permissions));
  const departments = DEPARTMENTS.map((dept) => ({ ...dept }));

  return (
    <div
      className="relative min-h-screen overflow-hidden text-foreground"
      style={{
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
          maskImage: "radial-gradient(ellipse 75% 65% at 50% 40%, #000 20%, transparent 75%)",
        }}
      />

      <div className="relative z-[1] md:grid md:grid-cols-[220px_1fr]">
        <aside className="border-b border-white/60 bg-white/55 backdrop-blur-md md:min-h-screen md:border-r md:border-b-0">
          <div className="flex items-center gap-3 px-5 py-5">
            <LogoMark className="h-9 w-9 shadow-[0_10px_24px_rgba(5,67,184,0.25)]" />
            <div>
              <p className="text-lg font-bold leading-none tracking-wide">Realynk</p>
              <p className="mt-1 text-xs text-primary">Command center · Rea</p>
            </div>
          </div>

          <p className="px-5 pb-2 text-[10px] font-bold tracking-[0.16em] text-primary/70 uppercase">Departments</p>
          <DepartmentRail departments={departments} />

          <div className="mt-6 border-t border-primary/10 px-5 py-4">
            <p className="font-bold">{user.fullName}</p>
            <p className="mt-0.5 text-xs break-all text-muted-foreground">{user.email}</p>
            <p className="mt-2 text-xs font-bold text-primary">{role.label}</p>
            <form action={logout} className="mt-3">
              <Button
                type="submit"
                variant="outline"
                size="sm"
                className="rounded-full border-primary/25 bg-white/70 text-foreground hover:bg-white"
              >
                Log out
              </Button>
            </form>
          </div>
        </aside>

        <div className="min-w-0">
          <header className="border-b border-white/60 bg-white/55 px-4 py-3 backdrop-blur-md md:px-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold tracking-[0.16em] text-primary uppercase">Go-to-Market</p>
                <p className="text-sm text-muted-foreground">Harbor desk · Rea&apos;s canvas</p>
              </div>
              <ModuleNav links={modules} />
            </div>
          </header>

          {user.sampleMode ? (
            <p className="border-b border-border bg-accent/80 px-4 py-2 text-sm text-accent-foreground md:px-8">
              Sample workspace. The company email domain is not configured, so these accounts are fictional and the email
              restriction is not active.
            </p>
          ) : null}

          <main className="px-4 py-6 md:px-8 md:py-8">{children}</main>
        </div>
      </div>
    </div>
  );
}

export function PageTitle({ title, detail, eyebrow = "Workspace" }: { title: string; detail: string; eyebrow?: string }) {
  return (
    <header className="mb-6">
      <p className="text-xs font-bold tracking-[0.18em] text-primary uppercase">{eyebrow}</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground md:text-4xl">{title}</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{detail}</p>
    </header>
  );
}

export function Flash({ notice, error }: { notice?: string; error?: string }) {
  const notices: Record<string, string> = {
    saved: "Saved.",
    created: "Lead added.",
    assigned: "Assignment updated.",
    opportunity: "Opportunity opened.",
    activity: "Activity recorded.",
    completed: "Activity marked complete.",
  };
  const errors: Record<string, string> = {
    forbidden: "You do not have permission to do that.",
    invalid: "Check the form and try again.",
    last_admin: "The workspace needs at least one active admin.",
  };
  const text = (notice && notices[notice]) || (error && errors[error]) || "";
  if (!text) return null;
  const bad = Boolean(error);
  return (
    <p className={`mb-4 rounded-2xl px-3 py-2 text-sm ${bad ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"}`}>
      {text}
    </p>
  );
}
