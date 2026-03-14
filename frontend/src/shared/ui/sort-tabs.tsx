"use client";

import * as React from "react";
import { cn } from "@/shared/lib/utils";

type SortOption = "featured" | "popular" | "newest";

interface SortTabsProps {
  selected: SortOption;
  onChange: (sort: SortOption) => void;
  className?: string;
}

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "featured", label: "Featured" },
  { value: "popular", label: "Popular" },
  { value: "newest", label: "Newest" },
];

export function SortTabs({ selected, onChange, className }: SortTabsProps) {
  return (
    <div
      className={cn(
        "flex rounded-full border border-[#d6dbd4] bg-white/50 p-1",
        className
      )}
    >
      {SORT_OPTIONS.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={cn(
            "rounded-full px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.1em] transition-all duration-300",
            selected === option.value
              ? "bg-[#1c2120] text-white"
              : "text-[#5c6d66] hover:text-[#3c9f95]"
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
