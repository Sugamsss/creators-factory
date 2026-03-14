import * as React from "react";
import { cn } from "@/shared/lib/utils";

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
  max?: number;
}

export function Progress({ 
  value = 0, 
  max = 100, 
  className,
  ...props 
}: ProgressProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  
  return (
    <div
      className={cn(
        "h-2 bg-surface-200 dark:bg-surface-700 rounded-full overflow-hidden",
        className
      )}
      {...props}
    >
      <div
        className="h-full bg-primary rounded-full transition-all duration-500"
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}
