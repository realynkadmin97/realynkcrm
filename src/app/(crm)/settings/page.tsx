import { redirect } from "next/navigation";
import { updateSettings } from "@/app/actions";
import { Flash, PageTitle } from "@/components/shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { can, permissionsFor, requireUser } from "@/lib/auth";
import { readSettings } from "@/lib/crm";

export default async function SettingsPage({ searchParams }: { searchParams: Promise<{ notice?: string; error?: string }> }) {
  const user = await requireUser();
  const permissions = await permissionsFor(user);
  if (!can(permissions, "settings.manage")) redirect("/");
  const query = await searchParams;
  const settings = await readSettings(user.id);
  return (
    <>
      <PageTitle title="Settings" detail="Workspace timing and the company email rule. The domain is not edited on this screen." />
      <Flash notice={query.notice} error={query.error} />
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Company email</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              {settings.emailDomain
                ? `Sign-in is limited to verified, approved addresses at ${settings.emailDomain}.`
                : "No company email domain is configured. Sample accounts are the only way in."}
            </p>
            <p className="text-muted-foreground">
              Set REALYNK_EMAIL_DOMAIN on the server. The app will not guess it, and a visitor cannot change it from the CRM.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Stale leads</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={updateSettings} className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="staleAfterDays">Days before a lead needs attention</Label>
                <Input id="staleAfterDays" name="staleAfterDays" type="number" min={1} max={90} defaultValue={settings.staleAfterDays} />
              </div>
              <Button type="submit">Save settings</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
