"use client";

import * as React from "react";
import { cn } from "@/shared/lib/utils";

interface SearchBarProps {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
}

export function SearchBar({
  placeholder = "SEARCH...",
  value,
  onChange,
  className,
}: SearchBarProps) {
  return (
    <div className={cn("relative flex-1 min-w-[300px]", className)}>
      <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#8da1bf] transition-colors duration-300 peer-focus:text-[#3c9f95]">
        search
      </span>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className="peer w-full rounded-2xl border border-[#d6dbd4] bg-white/50 py-4 pl-12 pr-4 text-[11px] font-bold uppercase tracking-[0.1em] text-[#1c2120] ring-[#3c9f95] transition-all duration-300 focus:bg-white focus:outline-none focus:ring-2 focus:shadow-[0_8px_30px_rgb(60,159,149,0.1)]"
      />
    </div>
  );
}
