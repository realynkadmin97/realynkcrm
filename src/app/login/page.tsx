import { signInSample } from "@/app/actions";
import { LoginForm } from "@/app/login/login-form";
import { BrandMark } from "@/components/brand-mark";
import { readSession, sampleDirectory, safeNext, workspaceStatus } from "@/lib/auth";
import { ROLE_COPY, isRole } from "@/lib/labels";
import Link from "next/link";
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
    <main className="grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]" style={{ fontFamily: "var(--font-lato), Lato, sans-serif" }}>
      <section
        className="flex flex-col justify-between px-8 py-10 text-white sm:px-12"
        style={{ background: "linear-gradient(165deg, #000851 0%, #09127e 46%, #0257b5 100%)" }}
      >
        <BrandMark />
        <div className="max-w-md py-12">
          <p className="text-xs tracking-[0.22em] text-white/70 uppercase">Company workspace</p>
          <h1 className="mt-3 text-4xl leading-tight font-bold">Sign in to Realynk</h1>
          <p className="mt-4 text-base leading-relaxed text-white/85">
            A real link between the people who sell and the leads they are cleaning. Public registration is closed.
          </p>
        </div>
        <p className="text-sm text-white/70">An approved company email has to be verified before the first sign-in.</p>
      </section>
      <section className="flex flex-col justify-center bg-white px-6 py-12 text-[#000851] sm:px-12">
        <div className="mx-auto w-full max-w-md">
          <p className="text-sm text-[#022f7f]">
            <Link href="/landing" className="underline decoration-[#0543b8] underline-offset-4">
              Landing samples
            </Link>
          </p>
          {domainRejected ? (
            <p className="mt-4 rounded-lg bg-[#000851]/5 px-3 py-2 text-sm text-[#000851]">
              The company email domain in the server configuration is not valid, so the workspace is still using sample accounts.
            </p>
          ) : null}
          {query.error === "sample" ? (
            <p className="mt-4 text-sm text-red-700">That sample account could not be opened.</p>
          ) : null}
          {status.sampleMode ? (
            <div className="mt-6">
              <h2 className="text-2xl font-bold">Sample sign-in</h2>
              <p className="mt-2 text-sm leading-relaxed text-[#022f7f]">
                No company email domain is configured. These fictional accounts let you walk the CRM. They are not Realynk employees, and they disappear once the domain is set.
              </p>
              <ul className="mt-6 space-y-3">
                {samples.map((person) => {
                  const role = isRole(person.role) ? ROLE_COPY[person.role] : null;
                  return (
                    <li key={person.id} className="flex items-center justify-between gap-3 rounded-xl border border-[#0543b8]/20 px-4 py-3">
                      <div>
                        <p className="font-bold">{person.full_name}</p>
                        <p className="text-xs text-[#022f7f]">{person.email}</p>
                        <p className="mt-1 text-xs tracking-wide text-[#0543b8] uppercase">{role?.label ?? person.role}</p>
                      </div>
                      {person.role === "admin" ? (
                        <p className="max-w-36 text-right text-xs text-[#022f7f]">Company account required. No public sign-in.</p>
                      ) : (
                        <form action={signInSample}>
                          <input type="hidden" name="userId" value={person.id} />
                          <button type="submit" className="rounded-lg bg-[#0543b8] px-3 py-2 text-sm font-bold text-white hover:bg-[#0257b5]">
                            Continue
                          </button>
                        </form>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : status.hasActiveAdmin ? (
            <div className="mt-6">
              <h2 className="text-2xl font-bold">Sign in</h2>
              <p className="mt-2 text-sm text-[#022f7f]">Use the company email an administrator already approved.</p>
              <div className="mt-6">
                <LoginForm next={next} />
              </div>
            </div>
          ) : (
            <div className="mt-6">
              <h2 className="text-2xl font-bold">Administrator required</h2>
              <p className="mt-2 text-sm leading-relaxed text-[#022f7f]">
                The company email domain is configured, but nobody can sign in until the first admin is provisioned from the server environment. There is still no public registration.
              </p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
