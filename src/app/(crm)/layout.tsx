import { Shell } from "@/components/shell";
import { permissionsFor, requireUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function CrmLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  let permissions: string[] = [];
  try {
    permissions = await permissionsFor(user);
  } catch {
    // Desk chrome still loads; module links stay limited until permissions recover.
    permissions = [];
  }
  return (
    <Shell user={user} permissions={permissions}>
      {children}
    </Shell>
  );
}
