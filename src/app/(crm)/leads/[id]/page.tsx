import Link from "next/link";
import { notFound } from "next/navigation";
import { createActivity, createOpportunity, updateLead } from "@/app/actions";
import { Flash, PageTitle } from "@/components/shell";
import { StageBadge } from "@/components/stage-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { can, permissionsFor, requireUser } from "@/lib/auth";
import { getLead, listActivities } from "@/lib/crm";
import { formatDate } from "@/lib/format";
import { STAGES } from "@/lib/labels";

export default async function LeadPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ notice?: string; error?: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;
  const query = await searchParams;
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) notFound();
  const permissions = await permissionsFor(user);
  const lead = await getLead(user.id, id);
  if (!lead) notFound();
  const activities = await listActivities(user.id, lead.id);
  const canEdit = can(permissions, "leads.manage_assigned") || can(permissions, "leads.manage_all");
  const canLog = can(permissions, "activities.create");
  const canOpen = can(permissions, "opportunities.create") || can(permissions, "opportunities.manage_all");
  return (
    <>
      <p className="mb-3 text-sm">
        <Link href="/leads" className="text-muted-foreground underline-offset-4 hover:underline">
          Leads
        </Link>
      </p>
      <PageTitle title={lead.company} detail={`${lead.fullName} · ${lead.email} · ${lead.source}`} />
      <Flash notice={query.notice} error={query.error} />
      <div className="mb-4 flex flex-wrap items-center gap-2 text-sm">
        <StageBadge stage={lead.stage} />
        <span className="text-muted-foreground">Owner: {lead.ownerName ?? "Unassigned"}</span>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Pipeline</CardTitle>
          </CardHeader>
          <CardContent>
            {canEdit ? (
              <form action={updateLead} className="space-y-3">
                <input type="hidden" name="id" value={lead.id} />
                <div className="space-y-1.5">
                  <Label htmlFor="stage">Stage</Label>
                  <select id="stage" name="stage" defaultValue={lead.stage} className="h-8 w-full rounded-lg border border-input bg-transparent px-2 text-sm">
                    {STAGES.map((stage) => (
                      <option key={stage.id} value={stage.id}>
                        {stage.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea id="notes" name="notes" defaultValue={lead.notes} rows={4} />
                </div>
                <Button type="submit">Save lead</Button>
              </form>
            ) : (
              <p className="text-sm whitespace-pre-wrap">{lead.notes || "No notes yet."}</p>
            )}
          </CardContent>
        </Card>
        <div className="space-y-4">
          {canOpen ? (
            <Card>
              <CardHeader>
                <CardTitle>Open an opportunity</CardTitle>
              </CardHeader>
              <CardContent>
                <form action={createOpportunity} className="space-y-3">
                  <input type="hidden" name="leadId" value={lead.id} />
                  <div className="space-y-1.5">
                    <Label htmlFor="title">Title</Label>
                    <Input id="title" name="title" required />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="amount">Amount (USD)</Label>
                    <Input id="amount" name="amount" type="number" min="0" step="1" defaultValue="0" />
                  </div>
                  <Button type="submit">Create opportunity</Button>
                </form>
              </CardContent>
            </Card>
          ) : null}
          {canLog ? (
            <Card>
              <CardHeader>
                <CardTitle>Log activity</CardTitle>
              </CardHeader>
              <CardContent>
                <form action={createActivity} className="space-y-3">
                  <input type="hidden" name="leadId" value={lead.id} />
                  <div className="space-y-1.5">
                    <Label htmlFor="kind">Kind</Label>
                    <select id="kind" name="kind" className="h-8 w-full rounded-lg border border-input bg-transparent px-2 text-sm" defaultValue="task">
                      <option value="task">Task</option>
                      <option value="call">Call</option>
                      <option value="meeting">Meeting</option>
                      <option value="note">Note</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="summary">Summary</Label>
                    <Input id="summary" name="summary" required />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="dueOn">Due</Label>
                    <Input id="dueOn" name="dueOn" type="date" />
                  </div>
                  <Button type="submit">Add activity</Button>
                </form>
              </CardContent>
            </Card>
          ) : null}
        </div>
      </div>
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Activity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {activities.length === 0 ? <p className="text-sm text-muted-foreground">No activity yet.</p> : null}
          {activities.map((activity) => (
            <div key={activity.id} className="rounded-lg border border-border px-3 py-2">
              <p className="text-sm font-medium">
                {activity.kind} · {activity.summary}
              </p>
              <p className="text-xs text-muted-foreground">
                {activity.ownerName}
                {activity.dueOn ? ` · due ${formatDate(activity.dueOn)}` : ""}
                {activity.completedAt ? " · complete" : ""}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>
    </>
  );
}
