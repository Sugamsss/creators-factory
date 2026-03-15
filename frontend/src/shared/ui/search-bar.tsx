"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/shared/lib/utils";

interface SearchBarProps {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
  inputClassName?: string;
}

export function SearchBar({
  placeholder = "SEARCH...",
  value,
  onChange,
  className,
  inputClassName,
}: SearchBarProps) {
  const [isFocused, setIsFocused] = React.useState(false);

  return (
    <motion.div
      layout
      className={cn("relative flex-1 min-w-[160px]", className)}
      animate={{
        minWidth: isFocused ? "280px" : "160px",
      }}
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 30,
      }}
    >
      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#8da1bf] transition-colors duration-300 peer-focus:text-[#3c9f95]">
        search
      </span>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className={cn(
          "peer w-full rounded-2xl border border-[#d6dbd4] bg-white/80 py-2.5 pl-10 pr-4 text-[10px] font-bold uppercase tracking-widest text-[#1c2120] ring-[#3c9f95] transition-all duration-300 focus:bg-white focus:outline-none focus:ring-2 focus:shadow-[0_8px_30px_rgb(60,159,149,0.1)]",
          inputClassName
        )}
      />
    </motion.div>
  );
}
