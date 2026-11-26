import type { Role } from "@/lib/labels";

/** Static role grants — same set as migrations/001_crm.sql. Avoids a DB round-trip in the Harbor layout. */
export const ROLE_PERMISSIONS: Record<Role, readonly string[]> = {
  admin: [
    "crm.full",
    "users.manage",
    "leads.view_all",
    "leads.manage_all",
    "leads.create",
    "leads.assign",
    "opportunities.view_all",
    "opportunities.manage_all",
    "opportunities.create",
    "pipeline.update_assigned",
    "activities.view_all",
    "activities.create",
    "activities.manage",
    "settings.manage",
    "performance.view",
  ],
  sales: [
    "leads.view_assigned",
    "leads.manage_assigned",
    "pipeline.update_assigned",
    "opportunities.view_assigned",
    "opportunities.create",
    "activities.create",
    "activities.manage_own",
  ],
  manager: [
    "leads.view_all",
    "leads.create",
    "leads.assign",
    "opportunities.view_all",
    "activities.view_all",
    "performance.view",
  ],
};

export function permissionsForRole(role: Role): string[] {
  return [...ROLE_PERMISSIONS[role]];
}
