"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Badge } from "../badge";
import { StaggerItem } from "../animations";

interface ActivityRowProps {
  icon: string;
  title: string;
  subtitle: string;
  status: "ready" | "rendering" | "completed" | "draft";
}

const statusConfig = {
  ready: { label: "Ready", className: "bg-tint-green text-status-success" },
  rendering: { label: "Rendering", className: "bg-tint-amber text-status-warning" },
  completed: { label: "Completed", className: "bg-tint-green text-status-success" },
  draft: { label: "Draft", className: "bg-tint-brand text-brand" },
};

const iconMap: Record<string, string> = {
  video: "play_circle",
  script: "article",
  avatar: "face",
  automation: "bolt",
};

export function ActivityRow({ icon, title, subtitle, status }: ActivityRowProps) {
  const config = statusConfig[status];
  const mappedIcon = iconMap[icon] || icon;

  return (
    <StaggerItem>
      <motion.div
        whileHover={{ backgroundColor: "rgba(60,159,149,0.03)" }}
        className="group p-5 flex items-center justify-between transition-all cursor-pointer"
      >
        <div className="flex items-center gap-5">
          <div className="w-12 h-12 rounded-2xl bg-brand/5 flex items-center justify-center transition-colors group-hover:bg-brand/10">
            <span className="material-symbols-outlined text-brand text-[20px] transition-transform duration-300 group-hover:scale-110">
              {mappedIcon}
            </span>
          </div>
          <div>
            <p className="font-display text-[15px] font-bold text-ink">
              {title}
            </p>
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted mt-0.5">
              {subtitle}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Badge className={`rounded-full px-3 py-1 text-[9px] font-bold uppercase tracking-[0.12em] border-none ${config.className}`}>
            <div className="flex items-center gap-1.5">
              {status === "rendering" && (
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  className="material-symbols-outlined !text-[12px]"
                >
                  autorenew
                </motion.span>
              )}
              {config.label}
            </div>
          </Badge>
          <span className="material-symbols-outlined text-border opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-1">
            chevron_right
          </span>
        </div>
      </motion.div>
    </StaggerItem>
  );
}
