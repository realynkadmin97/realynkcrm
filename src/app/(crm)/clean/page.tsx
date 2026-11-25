import { CleanerDesk } from "@/components/cleaner-desk";
import { PageTitle } from "@/components/shell";
import { can, permissionsFor, requireUser } from "@/lib/auth";
import { listCleanerLists } from "@/lib/cleaner-store";

export default async function CleanPage() {
  const user = await requireUser();
  const permissions = await permissionsFor(user);
  const lists = await listCleanerLists(user.id);
  return (
    <>
      <PageTitle
        title="Cleaner"
        detail="Import a lead list, map the columns, and clean company names and titles. The sheet is stored for the company, so it remains after you close the tab and is visible to other signed-in teammates."
      />
      <CleanerDesk initialLists={lists} canPromote={can(permissions, "leads.create")} />
    </>
  );
}
