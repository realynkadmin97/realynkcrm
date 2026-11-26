import { NextResponse } from "next/server";
import { readSession } from "@/lib/auth";
import { configError, queryAuth, withUser } from "@/lib/db";

export const dynamic = "force-dynamic";

/** Signed-in diagnostic — returns safe CRM codes, never secrets. */
export async function GET() {
  const out: Record<string, string | boolean | number | null> = {
    ok: false,
    configError: configError(),
  };

  try {
    const user = await readSession();
    out.hasSession = Boolean(user);
    out.role = user?.role ?? null;
    if (!user) {
      return NextResponse.json(out, { status: 401 });
    }

    const who = await queryAuth<{ user_name: string; current_user: string }>(
      "select session_user::text as user_name, current_user::text as current_user",
    );
    out.sessionUser = who[0]?.user_name ?? null;
    out.currentUser = who[0]?.current_user ?? null;

    const leads = await withUser(user.id, async (query) => {
      const rows = await query("select count(*)::int as count from leads");
      return Number(rows[0]?.count ?? 0);
    });
    out.leadCount = leads;
    out.ok = true;
  } catch (error) {
    out.error = error instanceof Error ? error.message.slice(0, 200) : "CRM:desk_check";
  }

  return NextResponse.json(out);
}
