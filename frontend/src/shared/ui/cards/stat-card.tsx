"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "../card";
import { StaggerItem } from "../animations";

interface StatCardProps {
  icon: string;
  label: string;
  value: string;
  change: string;
}

export function StatCard({ icon, label, value, change }: StatCardProps) {
  return (
    <StaggerItem>
      <Card className="p-6 group cursor-default h-full shadow-md transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl border-none bg-white">
        <CardContent className="p-0">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted mb-2">
                {label}
              </p>
              <p className="text-4xl font-display text-ink-heavy font-bold leading-tight">
                {value}
              </p>
              <p className="text-[10px] font-bold uppercase tracking-wider text-brand mt-2.5">
                {change}
              </p>
            </div>
            <motion.div
              whileHover={{ rotate: 15, scale: 1.1 }}
              className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center group-hover:bg-brand/20 transition-colors"
            >
              <span className="material-symbols-outlined text-brand">
                {icon}
              </span>
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </StaggerItem>
  );
}
