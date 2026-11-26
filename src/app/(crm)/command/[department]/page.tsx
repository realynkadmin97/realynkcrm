import { PageTitle } from "@/components/shell";
import { requireUser } from "@/lib/auth";

const COPY: Record<string, { title: string; detail: string }> = {
  finance: {
    title: "Finance",
    detail: "Budgets, billing, and commercial controls will land here. Rea is holding this wing for now.",
  },
  operations: {
    title: "Operations",
    detail: "Delivery, capacity, and runbooks will land here. Rea is holding this wing for now.",
  },
  hr: {
    title: "HR",
    detail: "People ops and workplace rhythm will land here. Rea is holding this wing for now.",
  },
};

export default async function CommandDepartmentPage({
  params,
}: {
  params: Promise<{ department: string }>;
}) {
  await requireUser();
  const { department } = await params;
  const copy = COPY[department] ?? {
    title: "Department",
    detail: "This command wing is not open yet.",
  };

  return (
    <div className="rounded-[1.75rem] border border-white/80 bg-white/70 p-8 shadow-[0_20px_50px_rgba(0,8,81,0.06)] backdrop-blur">
      <PageTitle eyebrow="Coming soon" title={copy.title} detail={copy.detail} />
      <p className="text-sm text-muted-foreground">
        Go-to-Market is live today. Flip this department on when you are ready — the side rail is already wired for it.
      </p>
    </div>
  );
}
