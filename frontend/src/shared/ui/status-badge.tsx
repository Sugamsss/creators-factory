import * as React from "react";
import { cn } from "@/shared/lib/utils";

type Status = "draft" | "training" | "ready" | "in_use" | "paused" | "failed" | "processing";

interface StatusBadgeProps {
  status: Status;
  showLabel?: boolean;
  className?: string;
}

const statusConfig: Record<Status, { label: string; variant: "default" | "primary" | "success" | "warning" | "error" }> = {
  draft: { label: "Draft", variant: "default" },
  training: { label: "Training", variant: "warning" },
  ready: { label: "Ready", variant: "success" },
  in_use: { label: "In Use", variant: "primary" },
  paused: { label: "Paused", variant: "warning" },
  failed: { label: "Failed", variant: "error" },
  processing: { label: "Processing", variant: "warning" },
};

export function StatusBadge({ status, showLabel = true, className }: StatusBadgeProps) {
  const config = statusConfig[status];
  
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
        config.variant === "default" && "bg-surface-100 text-surface-600 dark:bg-white/10 dark:text-surface-400",
        config.variant === "primary" && "bg-primary/10 text-primary",
        config.variant === "success" && "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
        config.variant === "warning" && "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
        config.variant === "error" && "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
        className
      )}
    >
      <span className={cn(
        "w-1.5 h-1.5 rounded-full",
        config.variant === "default" && "bg-surface-400",
        config.variant === "primary" && "bg-primary",
        config.variant === "success" && "bg-green-500",
        config.variant === "warning" && "bg-amber-500",
        config.variant === "error" && "bg-red-500",
      )} />
      {showLabel && config.label}
    </span>
  );
}
