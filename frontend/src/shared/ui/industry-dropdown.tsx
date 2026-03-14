"use client";

import * as React from "react";
import { cn } from "@/shared/lib/utils";

interface Industry {
  id: number;
  name: string;
  description?: string;
}

interface IndustryDropdownProps {
  industries: Industry[];
  selectedIndustryId?: number;
  onSelect: (industryId: number | undefined) => void;
  className?: string;
}

export function IndustryDropdown({
  industries,
  selectedIndustryId,
  onSelect,
  className,
}: IndustryDropdownProps) {
  return (
    <select
      value={selectedIndustryId || ""}
      onChange={(e) => onSelect(e.target.value ? Number(e.target.value) : undefined)}
      className={cn(
        "rounded-2xl border border-[#d6dbd4] bg-white/50 px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.1em] text-[#1c2120] transition-all duration-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3c9f95]/20",
        className
      )}
    >
      <option value="">All Industries</option>
      {industries.map((industry) => (
        <option key={industry.id} value={industry.id}>
          {industry.name}
        </option>
      ))}
    </select>
  );
}
