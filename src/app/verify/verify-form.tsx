"use client";

import { useActionState } from "react";
import Link from "next/link";
import { acceptInvite } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function VerifyForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState(acceptInvite, null);
  if (state?.done) {
    return (
      <div className="space-y-3">
        <p className="text-sm">Email verified. Sign in with the password you just chose.</p>
        <Button render={<Link href="/login" />}>Go to sign in</Button>
      </div>
    );
  }
  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="token" value={token} />
      <div className="space-y-1.5">
        <Label htmlFor="password">Choose a password</Label>
        <Input id="password" name="password" type="password" autoComplete="new-password" minLength={10} required />
      </div>
      <p className="text-xs text-muted-foreground">At least 10 characters. This link works once.</p>
      {state?.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
      <Button type="submit" disabled={pending}>
        {pending ? "Verifying…" : "Verify email"}
      </Button>
    </form>
  );
}
