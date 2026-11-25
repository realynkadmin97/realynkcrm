import Link from "next/link";
import { completeActivity } from "@/app/actions";
import { Flash, PageTitle } from "@/components/shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { can, permissionsFor, requireUser } from "@/lib/auth";
import { listActivities } from "@/lib/crm";
import { formatDate } from "@/lib/format";

export default async function ActivitiesPage({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string; error?: string }>;
}) {
  const user = await requireUser();
  const query = await searchParams;
  const permissions = await permissionsFor(user);
  const activities = await listActivities(user.id);
  const canComplete = can(permissions, "activities.manage") || can(permissions, "activities.manage_own");
  return (
    <>
      <PageTitle
        title="Activities"
        detail={
          can(permissions, "activities.view_all")
            ? "Calls, notes, meetings, and tasks across the sales team."
            : "Tasks and notes on your leads, plus activity you logged."
        }
      />
      <Flash notice={query.notice} error={query.error} />
      <div className="space-y-3">
        {activities.length === 0 ? <p className="text-sm text-muted-foreground">No activity is visible to you yet.</p> : null}
        {activities.map((activity) => (
          <Card key={activity.id} size="sm">
            <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs tracking-wide text-muted-foreground uppercase">{activity.kind}</p>
                <p className="font-medium">{activity.summary}</p>
                <p className="text-xs text-muted-foreground">
                  {activity.ownerName}
                  {activity.company ? ` · ${activity.company}` : ""}
                  {activity.dueOn ? ` · due ${formatDate(activity.dueOn)}` : ""}
                  {activity.completedAt ? " · complete" : ""}
                </p>
                {activity.leadId ? (
                  <Link href={`/leads/${activity.leadId}`} className="text-xs underline-offset-4 hover:underline">
                    Open lead
                  </Link>
                ) : null}
              </div>
              {canComplete && !activity.completedAt ? (
                <form action={completeActivity}>
                  <input type="hidden" name="id" value={activity.id} />
                  <Button type="submit" size="sm" variant="outline">
                    Mark complete
                  </Button>
                </form>
              ) : null}
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
