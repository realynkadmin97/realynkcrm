import Link from "next/link";
import { updateOpportunityStage } from "@/app/actions";
import { Flash, PageTitle } from "@/components/shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { can, permissionsFor, requireUser } from "@/lib/auth";
import { listOpportunities } from "@/lib/crm";
import { formatMoney } from "@/lib/format";
import { STAGES } from "@/lib/labels";

export default async function OpportunitiesPage({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string; error?: string }>;
}) {
  const user = await requireUser();
  const query = await searchParams;
  const permissions = await permissionsFor(user);
  const opportunities = await listOpportunities(user.id);
  const canUpdate = can(permissions, "pipeline.update_assigned") || can(permissions, "opportunities.manage_all");
  return (
    <>
      <PageTitle
        title="Opportunities"
        detail={
          can(permissions, "opportunities.view_all")
            ? "Every open and closed opportunity you are allowed to see."
            : "Opportunities assigned to you. You can move their stage."
        }
      />
      <Flash notice={query.notice} error={query.error} />
      {opportunities.length === 0 ? (
        <p className="text-sm text-muted-foreground">No opportunities are visible to you yet.</p>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Opportunity</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Stage</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {opportunities.map((opportunity) => (
                <TableRow key={opportunity.id}>
                  <TableCell>
                    <span className="font-medium">{opportunity.title}</span>
                    {opportunity.leadId ? (
                      <Link href={`/leads/${opportunity.leadId}`} className="block text-xs text-muted-foreground underline-offset-4 hover:underline">
                        {opportunity.leadCompany}
                      </Link>
                    ) : null}
                  </TableCell>
                  <TableCell>{formatMoney(opportunity.amount)}</TableCell>
                  <TableCell>{opportunity.ownerName ?? "Unassigned"}</TableCell>
                  <TableCell>
                    {canUpdate ? (
                      <form action={updateOpportunityStage} className="flex items-center gap-2">
                        <input type="hidden" name="id" value={opportunity.id} />
                        <select name="stage" defaultValue={opportunity.stage} className="h-8 rounded-lg border border-input bg-transparent px-2 text-sm">
                          {STAGES.map((stage) => (
                            <option key={stage.id} value={stage.id}>
                              {stage.label}
                            </option>
                          ))}
                        </select>
                        <Button type="submit" size="sm" variant="outline">
                          Update
                        </Button>
                      </form>
                    ) : (
                      opportunity.stage
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </>
  );
}
