"use client";

import * as React from "react";
import { cn } from "@/shared/lib/utils";

interface FilterBarProps {
  filters: string[];
  selectedFilter?: string;
  onSelect?: (filter: string) => void;
  className?: string;
}

export function FilterBar({
  filters,
  selectedFilter = filters[0],
  onSelect,
  className,
}: FilterBarProps) {
  return (
    <div className={cn("flex gap-2", className)}>
      {filters.map((filter) => (
        <button
          key={filter}
          onClick={() => onSelect?.(filter)}
          className={cn(
            "rounded-full px-5 py-2.5 text-[10px] font-bold uppercase tracking-[0.15em] transition-all duration-300",
            filter === selectedFilter
              ? "bg-[#1c2120] text-white shadow-[0_4px_12px_rgba(0,0,0,0.1)] hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(0,0,0,0.15)]"
              : "bg-white text-[#5c6d66] border border-[#d6dbd4] hover:border-[#3c9f95] hover:text-[#3c9f95] hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(60,159,149,0.1)]"
          )}
        >
          {filter}
        </button>
      ))}
    </div>
  );
}
