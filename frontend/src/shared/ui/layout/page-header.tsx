"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { FadeIn } from "../animations";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: {
    icon: string;
    label: string;
    onClick: () => void;
  };
  meta?: {
    label: string;
    value: string;
  };
}

export function PageHeader({ title, subtitle, action, meta }: PageHeaderProps) {
  return (
    <FadeIn direction="down" distance={10}>
      <header className="mb-12 flex items-end justify-between border-b border-border pb-10">
        <div className="flex flex-col gap-3">
          <h1 className="font-display text-7xl font-bold leading-none tracking-tight text-ink-heavy">
            {title}
          </h1>
          {subtitle && (
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted">
              {subtitle}
            </p>
          )}
        </div>

        <div className="flex items-center gap-4">
          {meta && (
            <div className="text-right mr-4 hidden md:block">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted">
                {meta.label}
              </p>
              <p className="text-sm font-semibold text-brand">
                {meta.value}
              </p>
            </div>
          )}
          {action && (
            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={action.onClick}
              className="group relative flex items-center gap-3 overflow-hidden rounded-full bg-ink px-8 py-4 text-[11px] font-bold uppercase tracking-[0.2em] text-white shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all duration-300 hover:shadow-[0_20px_40px_rgba(60,159,149,0.25)]"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-brand to-brand-light opacity-0 transition-opacity duration-300 group-hover:opacity-20" />
              <span className="material-symbols-outlined !text-[20px] text-brand transition-transform duration-300 group-hover:scale-110">
                {action.icon}
              </span>
              {action.label}
            </motion.button>
          )}
        </div>
      </header>
    </FadeIn>
  );
}
