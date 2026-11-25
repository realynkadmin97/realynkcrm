import { CleanerDesk } from "@/components/cleaner-desk";
import { can, permissionsFor, requireUser } from "@/lib/auth";
import { listCleanerLists } from "@/lib/cleaner-store";

export default async function CleanPage() {
  const user = await requireUser();
  const permissions = await permissionsFor(user);
  const lists = await listCleanerLists(user.id);
  return (
    <div className="-mx-4 -my-6 flex h-[calc(100dvh-2.75rem)] min-h-0 flex-col md:-mx-8 md:-my-8">
      <CleanerDesk initialLists={lists} canPromote={can(permissions, "leads.create")} />
    </div>
  );
}
