import * as React from "react";
import { cn } from "@/shared/lib/utils";
import { Button } from "./button";

export interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center py-20 px-4 text-center",
      className
    )}>
      {icon && (
        <div className="w-20 h-20 rounded-full bg-surface-100 dark:bg-white/5 flex items-center justify-center mb-6">
          <span className="material-symbols-outlined text-4xl text-surface-400">
            {icon}
          </span>
        </div>
      )}
      <h3 className="font-display text-xl mb-2 text-surface-900 dark:text-surface-50">
        {title}
      </h3>
      {description && (
        <p className="text-sm text-surface-500 dark:text-surface-400 max-w-md mb-6">
          {description}
        </p>
      )}
      {action && (
        <Button onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}
