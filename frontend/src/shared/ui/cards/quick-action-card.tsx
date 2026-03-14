"use client";

import * as React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { StaggerItem } from "../animations";

interface QuickActionCardProps {
  icon: string;
  label: string;
  href: string;
}

export function QuickActionCard({ icon, label, href }: QuickActionCardProps) {
  return (
    <StaggerItem>
      <Link href={href} className="block h-full">
        <motion.div
          whileHover={{ y: -8, scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="group relative overflow-hidden bg-white p-8 h-full flex flex-col items-center gap-4 text-center rounded-[24px] shadow-md transition-all duration-500 hover:shadow-2xl border border-transparent hover:border-brand/20"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white to-tint-brand opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          <span className="material-symbols-outlined text-4xl text-brand relative z-10 transition-transform duration-300 group-hover:scale-110">
            {icon}
          </span>
          <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-ink relative z-10">
            {label}
          </span>
        </motion.div>
      </Link>
    </StaggerItem>
  );
}
