"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { cn } from "@/shared/lib/utils";

export interface AvatarCardProps {
  id: string | number;
  title: string;
  image: string;
  status?: string;
  statusTone?: "amber" | "red" | "green" | "blue";
  modified?: string;
  role?: string;
  isTraining?: boolean;
  isActive?: boolean;
  type: "draft" | "deployment";
  actionLabel?: string;
  actionIcon?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  secondaryActionIcon?: string;
  onSecondaryAction?: () => void;
  tertiaryActionLabel?: string;
  tertiaryActionIcon?: string;
  onTertiaryAction?: () => void;
  quaternaryActionLabel?: string;
  quaternaryActionIcon?: string;
  onQuaternaryAction?: () => void;
  className?: string;
}

export function AvatarCard({
  title,
  image,
  status,
  statusTone = "blue",
  modified,
  role,
  isTraining,
  isActive,
  type,
  actionLabel,
  actionIcon,
  onAction,
  secondaryActionLabel,
  secondaryActionIcon,
  onSecondaryAction,
  tertiaryActionLabel,
  tertiaryActionIcon,
  onTertiaryAction,
  quaternaryActionLabel,
  quaternaryActionIcon,
  onQuaternaryAction,
  className,
}: AvatarCardProps) {
  const getStatusColor = () => {
    switch (statusTone) {
      case "amber":
        return "text-amber-700 bg-amber-50/80 border-amber-100/60";
      case "red":
        return "text-red-600 bg-red-50/80 border-red-100/60";
      case "green":
        return "text-emerald-600 bg-emerald-50/80 border-emerald-100/60";
      case "blue":
      default:
        return "text-teal-600 bg-teal-50/80 border-teal-100/60";
    }
  };

  const buttons = [
    { label: actionLabel, icon: actionIcon, onClick: onAction, primary: true },
    { label: secondaryActionLabel, icon: secondaryActionIcon, onClick: onSecondaryAction, primary: false },
    { label: tertiaryActionLabel, icon: tertiaryActionIcon, onClick: onTertiaryAction, primary: false },
    { label: quaternaryActionLabel, icon: quaternaryActionIcon, onClick: onQuaternaryAction, primary: false },
  ].filter(b => b.label && b.onClick);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={cn(
        "group relative w-[280px] min-w-[280px] rounded-2xl bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-shadow duration-300 hover:shadow-[0_12px_32px_rgba(60,159,149,0.12)]",
        className
      )}
    >
      {/* Image Container */}
      <div className="relative h-[320px] overflow-hidden rounded-t-2xl">
        {image ? (
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
            <span className="material-symbols-outlined text-6xl text-slate-200">face</span>
          </div>
        )}
        
        {/* Gradient Overlay */}
        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/50 via-black/20 to-transparent" />

        {/* Training Overlay */}
        {isTraining && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#1a3a2a]/50 backdrop-blur-[2px] z-10">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              className="rounded-full bg-white/20 p-2.5"
            >
              <motion.span className="material-symbols-outlined !text-[22px] text-white">
                autorenew
              </motion.span>
            </motion.div>
            <p className="mt-3 text-[9px] font-semibold uppercase tracking-[0.2em] text-white/90">
              Building Identity
            </p>
          </div>
        )}

        {/* Status Badge */}
        {status && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-[7px] font-semibold uppercase tracking-[0.15em] border shadow-sm z-20 ${getStatusColor()}`}
          >
            {status}
          </motion.div>
        )}

        {/* Active Pulse Badge */}
        {isActive && (
          <div className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full bg-[#1a3a2a]/80 backdrop-blur-md px-2.5 py-1 text-[7px] font-semibold uppercase tracking-[0.12em] text-white shadow-lg z-20">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#3c9f95] opacity-60"></span>
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-white"></span>
            </span>
            Active
          </div>
        )}

        {/* Role Overlay */}
        {type === "deployment" && !isTraining && (
          <div className="absolute inset-x-0 bottom-3 px-3 text-white">
            <p className="text-[9px] font-medium uppercase tracking-widest opacity-80 drop-shadow-md">
              {role || "Primary Support"}
            </p>
          </div>
        )}
      </div>

        {/* Content Area */}
      <div className="relative px-5 pb-5 pt-4 rounded-b-2xl bg-white">
        <div className="mb-3.5">
          <h3 className="font-display text-[17px] font-bold leading-tight text-[#1a3a2a] line-clamp-1 tracking-tight">
            {title}
          </h3>
          {modified && (
            <div className="mt-1.5 flex items-center gap-1.5">
              <span className="material-symbols-outlined !text-[12px] text-[#9ca3af]">schedule</span>
              <p className="text-[10px] font-medium text-[#9ca3af]">
                {modified}
              </p>
            </div>
          )}
        </div>

        {/* Unified Action Bar */}
        <div className="flex gap-2 p-1.5 -mx-1.5 -mb-1.5 rounded-xl bg-slate-50/80">
          {buttons.map((btn, idx) => (
            <motion.button
              key={idx}
              onClick={(e) => {
                e.stopPropagation();
                btn.onClick?.();
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.15 }}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2.5 text-[9px] font-semibold uppercase tracking-wider transition-all duration-150",
                btn.primary
                  ? "bg-[#1a3a2a] text-white hover:bg-[#3c9f95] shadow-sm"
                  : "bg-white text-[#1f2937] hover:bg-[#f3f4f6] border border-[#e5e7eb]"
              )}
            >
              {btn.icon && (
                <span className={cn("material-symbols-outlined !text-[14px]", btn.primary ? "text-[#90d5c8]" : "text-[#6b7280]")}>
                  {btn.icon}
                </span>
              )}
              <span>{btn.label}</span>
            </motion.button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
