import Link from "next/link";
import { Flash, PageTitle } from "@/components/shell";
import { StageBadge } from "@/components/stage-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireUser } from "@/lib/auth";
import { dashboard } from "@/lib/crm";
import { formatDate, formatMoney } from "@/lib/format";
import { ROLE_COPY, stageLabel } from "@/lib/labels";

export default async function TodayPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const user = await requireUser();
  const query = await searchParams;
  const data = await dashboard(user.id);
  const counts = new Map(data.stages.map((row) => [row.stage, row.count]));
  return (
    <>
      <PageTitle
        title={`Good to see you, ${user.fullName.split(" ")[0]}`}
        detail={`${ROLE_COPY[user.role].summary} Dates on this desk are shown in Shanghai time.`}
      />
      <Flash error={query.error} />
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card size="sm">
          <CardHeader>
            <CardTitle>Open opportunities</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-heading text-3xl">{data.openOpportunities}</p>
            <p className="text-sm text-muted-foreground">{formatMoney(data.openAmount)} still in play</p>
          </CardContent>
        </Card>
        {["new", "qualified", "meeting", "proposal"].map((stage) => (
          <Card key={stage} size="sm">
            <CardHeader>
              <CardTitle>{stageLabel(stage)}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-heading text-3xl">{counts.get(stage) ?? 0}</p>
              <p className="text-sm text-muted-foreground">Visible leads</p>
            </CardContent>
          </Card>
        ))}
      </section>
      <section className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Needs attention</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.stale.length === 0 ? <p className="text-sm text-muted-foreground">Nothing is past the stale threshold.</p> : null}
            {data.stale.map((lead) => (
              <Link key={lead.id} href={`/leads/${lead.id}`} className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2">
                <span>
                  <span className="block font-medium">{lead.company}</span>
                  <span className="text-xs text-muted-foreground">{lead.fullName}</span>
                </span>
                <StageBadge stage={lead.stage} />
              </Link>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Open tasks</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.tasks.length === 0 ? <p className="text-sm text-muted-foreground">No open tasks in your view.</p> : null}
            {data.tasks.map((task) => (
              <div key={task.id} className="rounded-lg border border-border px-3 py-2">
                <p className="font-medium">{task.summary}</p>
                <p className="text-xs text-muted-foreground">
                  {task.company || "No company"} · due {formatDate(task.dueOn)}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </>
  );
}
