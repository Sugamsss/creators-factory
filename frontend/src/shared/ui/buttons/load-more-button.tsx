"use client";

import * as React from "react";
import { cn } from "@/shared/lib/utils";

interface LoadMoreButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

export function LoadMoreButton({ children, onClick, disabled, className }: LoadMoreButtonProps) {
  return (
    <div className={cn("mt-12 flex justify-center pb-12", className)}>
      <button
        onClick={onClick}
        disabled={disabled}
        className="group flex items-center gap-2 rounded-full bg-white px-8 py-4 text-[11px] font-bold uppercase tracking-[0.2em] text-ink shadow-[0_4px_14px_rgba(0,0,0,0.05)] border border-border transition-all duration-300 hover:border-brand hover:text-brand hover:shadow-[0_8px_30px_rgba(60,159,149,0.15)] hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:border-border disabled:hover:text-ink disabled:hover:shadow-[0_4px_14px_rgba(0,0,0,0.05)]"
      >
        {children}
        <span className="material-symbols-outlined !text-[18px] transition-transform duration-300 group-hover:translate-y-0.5">
          expand_more
        </span>
      </button>
    </div>
  );
}
