import { signInSample } from "@/app/actions";
import { LoginForm } from "@/app/login/login-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { readSession, sampleDirectory, safeNext, workspaceStatus } from "@/lib/auth";
import { ROLE_COPY, isRole } from "@/lib/labels";
import { redirect } from "next/navigation";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const user = await readSession();
  if (user) redirect("/");
  const query = await searchParams;
  const status = await workspaceStatus();
  const samples = status.sampleMode ? await sampleDirectory() : [];
  const next = safeNext(query.next);
  const domainRejected = status.configError?.includes("CRM:invalid_domain");

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col justify-center px-4 py-12">
      <p className="font-heading text-4xl tracking-tight">Realynk CRM</p>
      <p className="mt-2 max-w-xl text-sm text-muted-foreground">
        Company accounts only. Public registration is closed, and a new account has to verify its email before the first sign-in.
      </p>
      {domainRejected ? (
        <p className="mt-4 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          The company email domain in the server configuration is not valid, so the workspace is still using sample accounts.
        </p>
      ) : null}
      {query.error === "sample" ? (
        <p className="mt-4 text-sm text-destructive">That sample account could not be opened.</p>
      ) : null}
      {status.sampleMode ? (
        <section className="mt-8">
          <h1 className="text-lg font-medium">Sample sign-in</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            No company email domain is configured. These fictional accounts let you walk the CRM. They are not Realynk employees, and they disappear once the domain is set.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {samples.map((person) => {
              const role = isRole(person.role) ? ROLE_COPY[person.role] : null;
              return (
                <Card key={person.id} size="sm">
                  <CardHeader>
                    <CardTitle>{person.full_name}</CardTitle>
                    <CardDescription>{person.email}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex items-center justify-between gap-3">
                    <Badge variant="outline">{role?.label ?? person.role}</Badge>
                    <form action={signInSample}>
                      <input type="hidden" name="userId" value={person.id} />
                      <Button type="submit" size="sm">
                        Continue
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>
      ) : status.hasActiveAdmin ? (
        <Card className="mt-8 max-w-md">
          <CardHeader>
            <CardTitle>Sign in</CardTitle>
            <CardDescription>Use the company email an administrator already approved.</CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm next={next} />
          </CardContent>
        </Card>
      ) : (
        <Card className="mt-8 max-w-xl">
          <CardHeader>
            <CardTitle>Administrator required</CardTitle>
            <CardDescription>
              The company email domain is configured, but nobody can sign in until the first admin is provisioned from the server environment. There is still no public registration.
            </CardDescription>
          </CardHeader>
        </Card>
      )}
    </main>
  );
}
