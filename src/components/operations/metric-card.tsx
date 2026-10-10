import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { toPercent } from "@/lib/operations/summary";

interface MetricCardProps {
  label: string;
  icon: LucideIcon;
  completed: number;
  total: number;
  /** Short supporting line under the percentage. */
  supporting: string;
  className?: string;
}

export function MetricCard({
  label,
  icon: Icon,
  completed,
  total,
  supporting,
  className,
}: MetricCardProps) {
  const percent = toPercent(completed, total);
  const done = total > 0 && completed >= total;

  return (
    <Card className={className}>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm text-muted-foreground">{label}</p>
          <Icon aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
        </div>

        <p className="text-2xl font-semibold tabular-nums tracking-tight">
          {completed}
          <span className="font-normal text-muted-foreground"> / {total}</span>
        </p>

        <div className="space-y-0.5 text-xs">
          <p
            className={cn(
              "font-medium tabular-nums",
              done ? "text-vv-success" : "text-foreground"
            )}
          >
            {percent}% complete
          </p>
          <p className="text-muted-foreground">{supporting}</p>
        </div>
      </CardContent>
    </Card>
  );
}
