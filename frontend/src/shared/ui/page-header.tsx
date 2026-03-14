"use client";

import * as React from "react";
import { cn } from "@/shared/lib/utils";
import { Button } from "./button";

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
  };
  children?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  subtitle,
  action,
  children,
  className,
}: PageHeaderProps) {
  return (
    <header className={cn("px-8 pt-8 pb-6 flex justify-between items-end border-b border-surface-200 dark:border-white/10", className)}>
      <div>
        <h1 className="font-display text-4xl font-normal tracking-tight mb-2 text-surface-900 dark:text-surface-50">
          {title}
        </h1>
        {subtitle && (
          <p className="text-surface-500 dark:text-surface-400 font-medium tracking-[0.2em] text-[9px] uppercase">
            {subtitle}
          </p>
        )}
        {children && <div className="mt-3">{children}</div>}
      </div>
      {action && (
        <Button onClick={action.onClick} size="sm">
          {action.icon && <span className="material-symbols-outlined">{action.icon}</span>}
          {action.label}
        </Button>
      )}
    </header>
  );
}
