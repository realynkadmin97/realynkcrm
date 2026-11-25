import { redirect } from "next/navigation";
import { assignLead } from "@/app/actions";
import { Flash, PageTitle } from "@/components/shell";
import { StageBadge } from "@/components/stage-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { can, permissionsFor, requireUser } from "@/lib/auth";
import { listLeads, listSalesReps, performance } from "@/lib/crm";

export default async function TeamPage({ searchParams }: { searchParams: Promise<{ notice?: string; error?: string }> }) {
  const user = await requireUser();
  const permissions = await permissionsFor(user);
  if (!can(permissions, "leads.assign") && !can(permissions, "performance.view")) redirect("/");
  const query = await searchParams;
  const [board, reps, leads] = await Promise.all([
    performance(user.id),
    can(permissions, "leads.assign") ? listSalesReps(user.id) : Promise.resolve([]),
    can(permissions, "leads.assign") ? listLeads(user.id) : Promise.resolve([]),
  ]);
  return (
    <>
      <PageTitle
        title="Team"
        detail="See how each sales rep is loaded, and move unowned or existing leads onto the right person."
      />
      <Flash notice={query.notice} error={query.error} />
      <Card className="mb-6" size="sm">
        <CardHeader>
          <CardTitle>{board.unassigned} unassigned</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">Leads with no sales owner, inside your view.</CardContent>
      </Card>
      <Card className="mb-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Sales rep</TableHead>
              <TableHead>Leads</TableHead>
              <TableHead>Open</TableHead>
              <TableHead>Open tasks</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {board.reps.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4}>No sales reps are visible.</TableCell>
              </TableRow>
            ) : null}
            {board.reps.map((rep) => (
              <TableRow key={rep.id}>
                <TableCell>{rep.fullName}</TableCell>
                <TableCell>{rep.leads}</TableCell>
                <TableCell>{rep.openLeads}</TableCell>
                <TableCell>{rep.openTasks}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
      {can(permissions, "leads.assign") ? (
        <Card>
          <CardHeader>
            <CardTitle>Assign leads</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {leads.map((lead) => (
              <form key={lead.id} action={assignLead} className="grid items-center gap-2 rounded-lg border border-border p-3 md:grid-cols-[1fr_auto_auto]">
                <input type="hidden" name="id" value={lead.id} />
                <div>
                  <p className="font-medium">{lead.company}</p>
                  <p className="text-xs text-muted-foreground">{lead.fullName}</p>
                </div>
                <StageBadge stage={lead.stage} />
                <div className="flex items-center gap-2">
                  <select name="ownerId" defaultValue={lead.ownerId ?? ""} className="h-8 rounded-lg border border-input bg-transparent px-2 text-sm">
                    <option value="">Unassigned</option>
                    {reps.map((rep) => (
                      <option key={rep.id} value={rep.id}>
                        {rep.fullName}
                      </option>
                    ))}
                  </select>
                  <Button type="submit" size="sm">
                    Assign
                  </Button>
                </div>
              </form>
            ))}
          </CardContent>
        </Card>
      ) : null}
    </>
  );
}
