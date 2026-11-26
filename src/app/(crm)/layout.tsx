import { unstable_rethrow } from "next/navigation";
import { Shell } from "@/components/shell";
import { permissionsFor, requireUser, type SessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

function DeskBootError({ message }: { message: string }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f7f9fc] px-4 text-[#000851]">
      <div className="w-full max-w-lg rounded-[1.75rem] border border-[#0543b8]/15 bg-white p-8 shadow-[0_20px_50px_rgba(0,8,81,0.08)]">
        <p className="text-xs font-bold tracking-[0.16em] text-[#0543b8] uppercase">Rea&apos;s Command Center</p>
        <h1 className="mt-2 text-2xl font-bold">Harbor couldn&apos;t open</h1>
        <p className="mt-2 text-sm text-[#000851]/65">Copy the detail below and send it to your builder.</p>
        <p className="mt-4 rounded-2xl bg-[#0543b8]/5 px-3 py-2 text-xs break-all text-[#0543b8]">{message}</p>
      </div>
    </main>
  );
}

export default async function CrmLayout({ children }: { children: React.ReactNode }) {
  let user: SessionUser;
  try {
    user = await requireUser();
  } catch (error) {
    unstable_rethrow(error);
    return <DeskBootError message={error instanceof Error ? error.message : "CRM:session"} />;
  }

  let permissions: string[] = [];
  try {
    permissions = await permissionsFor(user);
  } catch (error) {
    permissions = [];
    console.error("CRM permissions", error);
  }

  try {
    return (
      <Shell user={user} permissions={permissions}>
        {children}
      </Shell>
    );
  } catch (error) {
    unstable_rethrow(error);
    return <DeskBootError message={error instanceof Error ? error.message : "CRM:shell"} />;
  }
}
