import Link from "next/link";
import { logout } from "@/app/actions";
import { Badge } from "@/components/ui/badge";
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
  return (
    <div className="min-h-screen bg-background md:grid md:grid-cols-[250px_1fr]">
      <aside className="border-b border-sidebar-border bg-sidebar text-sidebar-foreground md:min-h-screen md:border-b-0 md:border-r">
        <div className="flex items-end justify-between gap-4 px-5 py-5 md:block">
          <div>
            <p className="font-heading text-2xl leading-none text-sidebar-primary">Realynk</p>
            <p className="mt-1 text-xs tracking-[0.16em] text-sidebar-foreground/70 uppercase">CRM</p>
          </div>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-3 md:block md:space-y-1 md:px-3">
          {LINKS.filter((link) => link.allow(permissions)).map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block rounded-lg px-3 py-2 text-sm whitespace-nowrap text-sidebar-foreground/90 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-sidebar-border px-5 py-4">
          <p className="font-medium">{user.fullName}</p>
          <p className="mt-0.5 text-xs break-all text-sidebar-foreground/75">{user.email}</p>
          <Badge variant="outline" className="mt-2 border-sidebar-border text-sidebar-foreground">
            {role.label}
          </Badge>
          <form action={logout} className="mt-3">
            <Button type="submit" variant="outline" size="sm" className="border-sidebar-border bg-transparent text-sidebar-foreground hover:bg-sidebar-accent">
              Log out
            </Button>
          </form>
        </div>
      </aside>
      <div className="min-w-0">
        {user.sampleMode ? (
          <p className="border-b border-border bg-accent px-4 py-2 text-sm text-accent-foreground md:px-8">
            Sample workspace. The company email domain is not configured, so these accounts are fictional and the email restriction is not active.
          </p>
        ) : null}
        <main className="px-4 py-6 md:px-8 md:py-8">{children}</main>
      </div>
    </div>
  );
}

export function PageTitle({ title, detail }: { title: string; detail: string }) {
  return (
    <header className="mb-6">
      <h1 className="font-heading text-3xl tracking-tight">{title}</h1>
      <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{detail}</p>
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
  };
  const text = (notice && notices[notice]) || (error && (errors[error] || (error.length < 180 ? error : "")));
  if (!text) return null;
  const bad = Boolean(error);
  return (
    <p className={`mb-4 rounded-lg px-3 py-2 text-sm ${bad ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"}`}>
      {text}
    </p>
  );
}
