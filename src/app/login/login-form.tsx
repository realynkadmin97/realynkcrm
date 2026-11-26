"use client";

import { useActionState } from "react";
import { signIn } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState(signIn, null);
  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="next" value={next} />
      <div className="space-y-2">
        <Label htmlFor="email" className="font-bold text-foreground">
          Company email
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          required
          className="h-12 rounded-xl border-primary/20 bg-[#f3f7ff] shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]"
        />
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <Label htmlFor="password" className="font-bold text-foreground">
            Password
          </Label>
          <span className="text-xs font-bold text-primary">Ask your admin</span>
        </div>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="h-12 rounded-xl border-primary/20 bg-[#f3f7ff] shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]"
        />
      </div>
      {state?.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
      <Button
        type="submit"
        disabled={pending}
        className="h-12 w-full rounded-full bg-primary text-sm font-bold text-primary-foreground shadow-[0_14px_28px_rgba(5,67,184,0.35)] hover:bg-brand-bright"
      >
        {pending ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
