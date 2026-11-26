import { VerifyForm } from "@/app/verify/verify-form";
import { BrandStage } from "@/components/brand-stage";
import { LogoMark } from "@/components/logo-mark";
import { ReaPanel } from "@/components/rea-panel";
import { hashToken } from "@/lib/crypto";
import { queryAuth } from "@/lib/db";
import { ROLE_COPY, isRole } from "@/lib/labels";

export default async function VerifyPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const token = (await searchParams).token ?? "";
  const preview = token
    ? await queryAuth<{ email: string; full_name: string; role: string }>(
        "select email, full_name, role from private.verification_preview($1)",
        [hashToken(token)],
      )
    : [];
  const account = preview[0];
  const role = account && isRole(account.role) ? ROLE_COPY[account.role].label : account?.role;

  return (
    <BrandStage>
      <div className="flex min-h-screen items-center justify-center px-4 py-10">
        <div className="grid w-full max-w-5xl overflow-hidden rounded-[1.75rem] border border-primary/15 bg-white/85 shadow-[0_30px_90px_rgba(0,8,81,0.14)] ring-1 ring-white/80 backdrop-blur-md lg:grid-cols-[1.05fr_0.95fr]">
          <ReaPanel />
          <section className="relative z-[1] flex flex-col justify-center bg-white px-7 py-10 sm:px-10">
            <div className="mb-6 flex items-center gap-3">
              <LogoMark className="h-11 w-11" priority />
              <div>
                <p className="text-xl font-bold tracking-wide">Realynk</p>
                <p className="text-xs text-muted-foreground">Verify · finish your invite</p>
              </div>
            </div>
            <h1 className="text-2xl font-bold">{account ? account.full_name : "Link unavailable"}</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {account
                ? `${account.email} · ${role}. Choose a password to finish verification.`
                : "This invite is missing, expired, or already used."}
            </p>
            {account ? (
              <div className="mt-6">
                <VerifyForm token={token} />
              </div>
            ) : null}
          </section>
        </div>
      </div>
    </BrandStage>
  );
}
