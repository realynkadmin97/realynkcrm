import { Shell } from "@/components/shell";
import { permissionsFor, requireUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function CrmLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const permissions = await permissionsFor(user);
  return (
    <Shell user={user} permissions={permissions}>
      {children}
    </Shell>
  );
}
