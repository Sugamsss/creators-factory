"use client";

import * as React from "react";
import { cn } from "@/shared/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "primary" | "success" | "warning" | "error";
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = "default", ...props }, ref) => {
    const variants = {
      default: "bg-surface-100 text-surface-700 dark:bg-white/10 dark:text-surface-300",
      primary: "badge-primary",
      success: "badge-success",
      warning: "badge-warning",
      error: "badge-error",
    };

    return (
      <span
        ref={ref}
        className={cn("px-2 py-0.5 text-[10px] font-medium rounded-full", variants[variant], className)}
        {...props}
      />
    );
  }
);
Badge.displayName = "Badge";

export { Badge };
