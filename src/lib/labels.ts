export const ROLES = ["admin", "sales", "manager"] as const;
export type Role = (typeof ROLES)[number];

export const ROLE_COPY: Record<Role, { label: string; summary: string }> = {
  admin: {
    label: "Admin",
    summary: "Full CRM access, user and permission management, every lead and opportunity, and settings.",
  },
  sales: {
    label: "Sales",
    summary: "Assigned leads and opportunities, pipeline updates, and tasks or activities.",
  },
  manager: {
    label: "Manager",
    summary: "Every lead and opportunity, sales activity and performance, and lead assignment.",
  },
};

export const STAGES = [
  { id: "new", label: "New" },
  { id: "qualified", label: "Qualified" },
  { id: "meeting", label: "Meeting" },
  { id: "proposal", label: "Proposal" },
  { id: "won", label: "Won" },
  { id: "lost", label: "Lost" },
] as const;

export function isRole(value: string): value is Role {
  return (ROLES as readonly string[]).includes(value);
}

export function stageLabel(stage: string) {
  return STAGES.find((item) => item.id === stage)?.label ?? stage;
}

export function isStage(value: string) {
  return STAGES.some((item) => item.id === value);
}
