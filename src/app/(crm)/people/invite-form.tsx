"use client";

import { useActionState } from "react";
import { inviteUser } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function InviteForm({ sampleMode }: { sampleMode: boolean }) {
  const [state, action, pending] = useActionState(inviteUser, null);
  if (sampleMode) {
    return (
      <p className="text-sm text-muted-foreground">
        Invites stay closed until the company email domain is configured. There is no public registration.
      </p>
    );
  }
  return (
    <form action={action} className="grid gap-3 md:grid-cols-4">
      <div className="space-y-1.5">
        <Label htmlFor="invite-name">Name</Label>
        <Input id="invite-name" name="fullName" required />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="invite-email">Company email</Label>
        <Input id="invite-email" name="email" type="email" required />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="invite-role">Role</Label>
        <select id="invite-role" name="role" className="h-8 w-full rounded-lg border border-input bg-transparent px-2 text-sm" defaultValue="sales">
          <option value="sales">Sales</option>
          <option value="manager">Manager</option>
          <option value="admin">Admin</option>
        </select>
      </div>
      <div className="flex items-end">
        <Button type="submit" disabled={pending}>
          {pending ? "Creating invite…" : "Create invite"}
        </Button>
      </div>
      {state?.error ? <p className="text-sm text-destructive md:col-span-4">{state.error}</p> : null}
      {state?.link ? (
        <p className="text-sm md:col-span-4">
          Send this one-time verification link. It expires in 48 hours:{" "}
          <a className="break-all underline" href={state.link}>
            {state.link}
          </a>
        </p>
      ) : null}
    </form>
  );
}
