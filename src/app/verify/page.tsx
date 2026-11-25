import { VerifyForm } from "@/app/verify/verify-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-4 py-12">
      <p className="font-heading text-3xl">Verify your email</p>
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>{account ? account.full_name : "Link unavailable"}</CardTitle>
          <CardDescription>
            {account
              ? `${account.email} · ${role}. Choose a password to finish verification.`
              : "This invite is missing, expired, or already used."}
          </CardDescription>
        </CardHeader>
        {account ? (
          <CardContent>
            <VerifyForm token={token} />
          </CardContent>
        ) : null}
      </Card>
    </main>
  );
}
