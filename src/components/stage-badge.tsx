import { Badge } from "@/components/ui/badge";
import { stageLabel } from "@/lib/labels";

export function StageBadge({ stage }: { stage: string }) {
  const variant = stage === "lost" ? "destructive" : stage === "won" || stage === "proposal" ? "default" : "outline";
  return <Badge variant={variant}>{stageLabel(stage)}</Badge>;
}
