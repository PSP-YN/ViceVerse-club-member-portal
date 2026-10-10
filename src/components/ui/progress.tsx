import * as React from "react"
import { cn } from "@/lib/utils"

type ProgressProps = Omit<React.ComponentProps<"div">, "children"> & {
  value: number
  max?: number
  /** Extra classes for the filled bar, e.g. to change its colour. */
  indicatorClassName?: string
}

/**
 * Accessible progress bar. Pass an `aria-label` (or `aria-labelledby`) so
 * screen readers know what is being measured.
 */
function Progress({
  value,
  max = 100,
  className,
  indicatorClassName,
  ...props
}: ProgressProps) {
  const ratio = max > 0 ? Math.min(1, Math.max(0, value / max)) : 0

  return (
    <div
      data-slot="progress"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
      className={cn("h-2 w-full overflow-hidden rounded-full bg-muted", className)}
      {...props}
    >
      <div
        data-slot="progress-indicator"
        className={cn(
          "h-full rounded-full bg-primary transition-[width] duration-500 motion-reduce:transition-none",
          indicatorClassName
        )}
        style={{ width: `${ratio * 100}%` }}
      />
    </div>
  )
}

export { Progress }
