"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { HoverCard } from "@/shared/ui/animations";
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
  className,
}: AvatarCardProps) {
  const getStatusColor = () => {
    switch (statusTone) {
      case "amber":
        return "text-[#a16207] bg-[#fefce8]";
      case "red":
        return "text-[#ef3a32] bg-[#fef2f2]";
      case "green":
        return "text-[#10b981] bg-[#ecfdf5]";
      case "blue":
      default:
        return "text-[#3c9f95] bg-[#f0fdfa]";
    }
  };

  const renderButton = (
    label?: string,
    icon?: string,
    onClick?: () => void,
    isPrimary = true,
    disabled = false
  ) => {
    if (!label || !onClick) return null;
    
    return (
      <motion.button
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        disabled={disabled}
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98 }}
        className={cn(
          "flex-1 flex items-center justify-center gap-2 rounded-xl py-3 text-[10px] font-bold uppercase tracking-[0.2em] shadow-md transition-all duration-300",
          isPrimary
            ? "bg-[#1c2120] text-white hover:bg-[#2c3332] hover:shadow-lg"
            : "bg-white border border-gray-200 text-[#1c2120] hover:border-[#3c9f95] hover:text-[#3c9f95]",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        {icon && <span className={cn("material-symbols-outlined !text-[16px]", isPrimary ? "text-[#3c9f95]" : "text-[#3c9f95]")}>{icon}</span>}
        {label}
      </motion.button>
    );
  };

  return (
    <HoverCard className={cn(
      "group w-[240px] min-w-[240px] overflow-hidden rounded-[24px] bg-white shadow-md transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl",
      className
    )}>
      {/* Image Container - Tall Portrait */}
      <div className="relative h-[320px] overflow-hidden">
        {image ? (
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full bg-slate-100 flex items-center justify-center">
            <span className="material-symbols-outlined text-6xl text-slate-300">face</span>
          </div>
        )}
        
        {/* Overlays */}
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/60 to-transparent" />

        {/* Training Overlay */}
        {isTraining && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/20 backdrop-blur-[2px] z-10">
            <motion.span
              animate={{ rotate: 360 }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              className="material-symbols-outlined !text-[32px] text-white"
            >
              autorenew
            </motion.span>
            <p className="mt-2 text-[11px] font-bold uppercase tracking-[0.2em] text-white">
              Identity Synthesis
            </p>
          </div>
        )}

        {/* Status Badge */}
        {status && (
          <div className={`absolute left-4 top-4 rounded-full px-3 py-1 text-[9px] font-bold uppercase tracking-[0.12em] shadow-sm z-20 ${getStatusColor()}`}>
            {status}
          </div>
        )}

        {/* Active Pulse Badge */}
        {isActive && (
          <div className="absolute right-4 top-4 flex items-center gap-1.5 rounded-full bg-[#3c9f95] px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.12em] text-white shadow-lg z-20">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-white"></span>
            </span>
            Active
          </div>
        )}

        {/* Role Overlay (for deployment) */}
        {type === "deployment" && !isTraining && (
          <div className="absolute inset-x-0 bottom-4 px-4 text-white">
            <p className="text-[10px] font-medium uppercase tracking-widest opacity-80">
              {role || "Primary Support"}
            </p>
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="px-5 pb-6 pt-5">
        <div className="flex flex-col gap-1">
          <h3 className="font-display text-[18px] font-bold leading-tight text-[#1c2120] line-clamp-1">
            {title}
          </h3>
          {modified && (
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined !text-[14px] text-[#8da1bf]">history</span>
              <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#8da1bf]">
                {modified}
              </p>
            </div>
          )}
        </div>

        <div className="mt-5 flex gap-2">
          {renderButton(
            actionLabel || (type === "draft" ? "Continue" : "View Details"),
            actionIcon || (type === "draft" ? "play_arrow" : "visibility"),
            onAction,
            true
          )}
          {renderButton(secondaryActionLabel, secondaryActionIcon, onSecondaryAction, false)}
          {renderButton(tertiaryActionLabel, tertiaryActionIcon, onTertiaryAction, false)}
        </div>
      </div>
    </HoverCard>
  );
}
