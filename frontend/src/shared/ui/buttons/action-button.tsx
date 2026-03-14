"use client";

import * as React from "react";
import { motion } from "framer-motion";

interface ActionButtonProps {
  icon: string;
  label: string;
  onClick: () => void;
}

export function ActionButton({ icon, label, onClick }: ActionButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="group relative flex items-center gap-3 overflow-hidden rounded-full bg-ink px-8 py-4 text-[11px] font-bold uppercase tracking-[0.2em] text-white shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all duration-300 hover:shadow-[0_20px_40px_rgba(60,159,149,0.25)]"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-brand to-brand-light opacity-0 transition-opacity duration-300 group-hover:opacity-20" />
      <span className="material-symbols-outlined !text-[20px] text-brand transition-transform duration-300 group-hover:scale-110">
        {icon}
      </span>
      {label}
    </motion.button>
  );
}
