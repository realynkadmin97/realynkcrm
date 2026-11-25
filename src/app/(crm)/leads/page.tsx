import Link from "next/link";
import { createLead } from "@/app/actions";
import { Flash, PageTitle } from "@/components/shell";
import { StageBadge } from "@/components/stage-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { can, permissionsFor, requireUser } from "@/lib/auth";
import { listLeads, listSalesReps } from "@/lib/crm";
import { formatWhen } from "@/lib/format";

export default async function LeadsPage({ searchParams }: { searchParams: Promise<{ notice?: string; error?: string }> }) {
  const user = await requireUser();
  const query = await searchParams;
  const permissions = await permissionsFor(user);
  const [leads, reps] = await Promise.all([listLeads(user.id), can(permissions, "leads.create") ? listSalesReps(user.id) : Promise.resolve([])]);
  return (
    <>
      <PageTitle
        title="Leads"
        detail={
          can(permissions, "leads.view_all")
            ? "Every lead in the workspace, including ones still waiting for an owner."
            : "Leads assigned to you. Unassigned and other reps' leads stay out of this list."
        }
      />
      <Flash notice={query.notice} error={query.error} />
      {leads.length === 0 ? (
        <p className="mb-6 text-sm text-muted-foreground">No leads are visible to you yet.</p>
      ) : (
        <Card className="mb-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Stage</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leads.map((lead) => (
                <TableRow key={lead.id}>
                  <TableCell>
                    <Link href={`/leads/${lead.id}`} className="font-medium underline-offset-4 hover:underline">
                      {lead.company}
                    </Link>
                    <span className="block text-xs text-muted-foreground">{lead.source}</span>
                  </TableCell>
                  <TableCell>
                    {lead.fullName}
                    <span className="block text-xs text-muted-foreground">{lead.email}</span>
                  </TableCell>
                  <TableCell>
                    <StageBadge stage={lead.stage} />
                  </TableCell>
                  <TableCell>{lead.ownerName ?? "Unassigned"}</TableCell>
                  <TableCell>{formatWhen(lead.updatedAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
      {can(permissions, "leads.create") ? (
        <Card>
          <CardHeader>
            <CardTitle>Add a lead</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={createLead} className="grid gap-3 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="fullName">Contact</Label>
                <Input id="fullName" name="fullName" required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="company">Company</Label>
                <Input id="company" name="company" required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="source">Source</Label>
                <Input id="source" name="source" defaultValue="Inbound" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ownerId">Sales owner</Label>
                <select id="ownerId" name="ownerId" className="h-8 w-full rounded-lg border border-input bg-transparent px-2 text-sm">
                  <option value="">Unassigned</option>
                  {reps.map((rep) => (
                    <option key={rep.id} value={rep.id}>
                      {rep.fullName}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <Button type="submit">Add lead</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : null}
    </>
  );
}
