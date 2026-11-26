import Link from "next/link";
import { Flash, PageTitle } from "@/components/shell";
import { StageBadge } from "@/components/stage-badge";
import { requireUser } from "@/lib/auth";
import { dashboard } from "@/lib/crm";
import { formatDate, formatMoney } from "@/lib/format";
import { ROLE_COPY, stageLabel } from "@/lib/labels";

export default async function TodayPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const user = await requireUser();
  const query = await searchParams;
  const data = await dashboard(user.id);
  const counts = new Map(data.stages.map((row) => [row.stage, row.count]));
  const stages = ["new", "qualified", "meeting", "proposal"] as const;

  return (
    <>
      <PageTitle
        eyebrow="Today"
        title={`Good to see you, ${user.fullName.split(" ")[0]}`}
        detail={`${ROLE_COPY[user.role].summary} Dates on this desk are shown in Shanghai time.`}
      />
      <Flash error={query.error} />

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <div className="rounded-[1.5rem] border border-white/80 bg-white/70 p-4 shadow-[0_16px_40px_rgba(0,8,81,0.06)] backdrop-blur sm:col-span-2 lg:col-span-1">
          <p className="text-xs font-bold text-primary">Open opportunities</p>
          <p className="mt-2 text-3xl font-bold tracking-tight">{data.openOpportunities}</p>
          <p className="mt-1 text-sm text-muted-foreground">{formatMoney(data.openAmount)} still in play</p>
        </div>
        {stages.map((stage) => (
          <div
            key={stage}
            className="rounded-[1.5rem] border border-white/80 bg-white/70 p-4 shadow-[0_16px_40px_rgba(0,8,81,0.06)] backdrop-blur"
          >
            <p className="text-xs font-bold text-primary">{stageLabel(stage)}</p>
            <p className="mt-2 text-3xl font-bold tracking-tight">{counts.get(stage) ?? 0}</p>
            <p className="mt-1 text-sm text-muted-foreground">Visible leads</p>
          </div>
        ))}
      </section>

      <section className="mt-5 grid gap-5 lg:grid-cols-3">
        <div className="rounded-[1.75rem] border border-white/80 bg-white/70 p-5 shadow-[0_20px_50px_rgba(0,8,81,0.06)] backdrop-blur lg:col-span-2">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-bold">Needs attention</h2>
            <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary">{data.stale.length}</span>
          </div>
          <div className="mt-4 space-y-3">
            {data.stale.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nothing is past the stale threshold.</p>
            ) : null}
            {data.stale.map((lead) => (
              <Link
                key={lead.id}
                href={`/leads/${lead.id}`}
                className="flex items-center justify-between gap-3 rounded-2xl border border-primary/10 bg-white/80 px-3 py-3 transition hover:border-primary/30"
              >
                <span>
                  <span className="block font-bold">{lead.company}</span>
                  <span className="text-xs text-muted-foreground">{lead.fullName}</span>
                </span>
                <StageBadge stage={lead.stage} />
              </Link>
            ))}
          </div>
        </div>

        <div className="rounded-[1.75rem] border border-white/80 bg-white/70 p-5 shadow-[0_20px_50px_rgba(0,8,81,0.06)] backdrop-blur">
          <h2 className="text-sm font-bold">Open tasks</h2>
          <div className="mt-4 space-y-4">
            {data.tasks.length === 0 ? <p className="text-sm text-muted-foreground">No open tasks in your view.</p> : null}
            {data.tasks.map((task) => (
              <div key={task.id} className="rounded-2xl border border-primary/10 bg-white/80 px-3 py-3">
                <p className="text-sm font-bold leading-snug">{task.summary}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {task.company || "No company"} · due {formatDate(task.dueOn)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
