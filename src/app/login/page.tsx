import { LoginForm } from "@/app/login/login-form";
import { BrandStage } from "@/components/brand-stage";
import { LogoMark } from "@/components/logo-mark";
import { ReaPanel } from "@/components/rea-panel";
import { readSession, safeNext, workspaceStatus } from "@/lib/auth";
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
  const next = safeNext(query.next);
  const domainRejected = status.configError?.includes("CRM:invalid_domain");
  const canPasswordSignIn = status.sampleMode || status.hasActiveAdmin;

  return (
    <BrandStage>
      <div className="flex min-h-screen items-center justify-center px-4 py-10">
        <div className="grid w-full max-w-5xl overflow-hidden rounded-[1.75rem] border border-primary/15 bg-white/85 shadow-[0_30px_90px_rgba(0,8,81,0.14)] ring-1 ring-white/80 backdrop-blur-md lg:grid-cols-[1.05fr_0.95fr]">
          <ReaPanel />

          <section className="relative z-[1] flex flex-col justify-center bg-white px-7 py-10 sm:px-10">
            <div
              aria-hidden
              className="pointer-events-none absolute -top-10 right-0 h-40 w-40 rounded-full opacity-30 blur-3xl"
              style={{ background: "#7eb6ff" }}
            />
            <div className="relative mb-8 flex items-center gap-3">
              <LogoMark className="h-11 w-11 shadow-[0_10px_24px_rgba(5,67,184,0.35)]" priority />
              <div>
                <p className="text-xl font-bold tracking-wide text-foreground">Realynk</p>
                <p className="text-xs text-muted-foreground">Sign in · Rea is ready when you are</p>
              </div>
            </div>

            {domainRejected ? (
              <p className="relative mb-4 rounded-xl bg-accent px-3 py-2 text-sm text-foreground">
                The company email domain in the server configuration is not valid yet.
              </p>
            ) : null}

            {status.configError?.includes("CRM:missing_database_url") ? (
              <p className="relative mb-4 rounded-xl bg-accent px-3 py-2 text-sm text-foreground">
                DATABASE_URL is missing on this host. Add the Supabase Postgres URI in Vercel Environment Variables, then redeploy.
              </p>
            ) : null}

            {status.configError?.startsWith("CRM:migrate:") ? (
              <p className="relative mb-4 rounded-xl bg-accent px-3 py-2 text-sm text-foreground">
                Database setup could not finish
                {status.configError.slice("CRM:migrate:".length)
                  ? `: ${status.configError.slice("CRM:migrate:".length)}`
                  : ". Use the Supabase direct URI (port 5432), not the pooler."}
              </p>
            ) : null}

            {canPasswordSignIn ? (
              <div className="relative">
                <h1 className="sr-only">Sign in</h1>
                <LoginForm next={next} />
                {status.sampleMode ? (
                  <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
                    Company email domain is not set yet. Use a verified company account once an administrator configures it.
                  </p>
                ) : null}
              </div>
            ) : (
              <div className="relative">
                <h1 className="text-2xl font-bold">Administrator required</h1>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  The company email domain is configured, but nobody can sign in until the first admin is provisioned from the server environment. There is still no public registration.
                </p>
              </div>
            )}

            <p className="relative mt-6 text-sm text-muted-foreground">
              New on the company workspace?{" "}
              <span className="font-bold text-primary">Ask an administrator for an invite</span>
            </p>
            <div className="relative mt-8 flex items-center gap-3 text-xs tracking-wide text-foreground/35 uppercase">
              <span className="h-px flex-1 bg-primary/20" />
              Invite only
              <span className="h-px flex-1 bg-primary/20" />
            </div>
            <p className="relative mt-4 text-xs leading-relaxed text-muted-foreground/80">
              Public registration is closed. Rea greets the door. Sessions stay on the server.
            </p>
          </section>
        </div>
      </div>
    </BrandStage>
  );
}
