import { redirect } from "next/navigation";
import { updateMember } from "@/app/actions";
import { InviteForm } from "@/app/(crm)/people/invite-form";
import { Flash, PageTitle } from "@/components/shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { can, permissionsFor, requireUser } from "@/lib/auth";
import { listDirectory } from "@/lib/crm";
import { ROLE_COPY, ROLES, isRole } from "@/lib/labels";

export default async function PeoplePage({ searchParams }: { searchParams: Promise<{ notice?: string; error?: string }> }) {
  const user = await requireUser();
  const permissions = await permissionsFor(user);
  if (!can(permissions, "users.manage")) redirect("/");
  const query = await searchParams;
  const people = await listDirectory(user.id);
  return (
    <>
      <PageTitle
        title="People"
        detail="Admins invite company accounts, choose a role, and can disable access. New people verify their email before they can sign in."
      />
      <Flash notice={query.notice} error={query.error} />
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Invite</CardTitle>
        </CardHeader>
        <CardContent>
          <InviteForm sampleMode={user.sampleMode} />
        </CardContent>
      </Card>
      <div className="mb-6 grid gap-3 md:grid-cols-3">
        {ROLES.map((role) => (
          <Card key={role} size="sm">
            <CardHeader>
              <CardTitle>{ROLE_COPY[role].label}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">{ROLE_COPY[role].summary}</CardContent>
          </Card>
        ))}
      </div>
      <div className="space-y-3">
        {people.map((person) => (
          <Card key={person.id} size="sm">
            <CardContent className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="font-medium">{person.fullName}</p>
                <p className="text-sm text-muted-foreground">{person.email}</p>
                <div className="mt-2 flex gap-2">
                  <Badge variant="outline">{isRole(person.role) ? ROLE_COPY[person.role].label : person.role}</Badge>
                  <Badge variant={person.verified ? "secondary" : "outline"}>{person.verified ? "Verified" : "Unverified"}</Badge>
                  <Badge variant={person.status === "active" ? "default" : "outline"}>{person.status}</Badge>
                </div>
              </div>
              <form action={updateMember} className="flex flex-wrap items-center gap-2">
                <input type="hidden" name="id" value={person.id} />
                <select name="role" defaultValue={person.role} className="h-8 rounded-lg border border-input bg-transparent px-2 text-sm">
                  {ROLES.map((role) => (
                    <option key={role} value={role}>
                      {ROLE_COPY[role].label}
                    </option>
                  ))}
                </select>
                <select name="status" defaultValue={person.status} className="h-8 rounded-lg border border-input bg-transparent px-2 text-sm">
                  {person.status === "invited" ? <option value="invited">Invited</option> : null}
                  <option value="active" disabled={!person.verified && person.status !== "active"}>
                    Active
                  </option>
                  <option value="disabled">Disabled</option>
                </select>
                <Button type="submit" size="sm" variant="outline">
                  Save
                </Button>
              </form>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
