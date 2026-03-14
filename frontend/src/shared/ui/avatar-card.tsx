import * as React from "react";
import Image from "next/image";
import { cn } from "@/shared/lib/utils";
import { Badge } from "./badge";
import { motion } from "framer-motion";
import { transitions } from "./animations";

export interface AvatarCardProps {
  name: string;
  age?: number;
  role?: string;
  description?: string;
  imageUrl?: string;
  badges?: Array<{ label: string; variant?: "primary" | "success" | "warning" | "default" }>;
  onConfigure?: () => void;
  onDeploy?: () => void;
  className?: string;
}

export function AvatarCard({
  name,
  age,
  role,
  description,
  imageUrl,
  badges = [],
  onConfigure,
  onDeploy,
  className,
}: AvatarCardProps) {
  return (
    <motion.div
      whileHover={{ y: -8 }}
      transition={transitions.gentle}
      className={cn(
        "glass-card rounded-3xl overflow-hidden group cursor-pointer",
        "min-h-[450px] flex flex-col shadow-[0_4px_20px_-10px_rgba(0,0,0,0.1)] hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.2)]",
        className
      )}
    >
      {/* Image container */}
      <div className="relative h-72 overflow-hidden">
        {imageUrl ? (
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={transitions.smooth}
            className="w-full h-full"
          >
            <Image
              src={imageUrl}
              alt={name}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover"
              priority
            />
          </motion.div>
        ) : (
          <div className="w-full h-full bg-surface-200 dark:bg-surface-800 flex items-center justify-center">
            <span className="material-symbols-outlined text-6xl text-surface-400">
              face
            </span>
          </div>
        )}
        
        {/* Gradient overlay - matches screenshot exactly */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300" />
        
        {/* Badges positioned at top left */}
        {badges.length > 0 && (
          <div className="absolute top-4 left-4 flex gap-2 z-10">
            {badges.map((badge, index) => (
              <Badge key={index} variant={badge.variant || "default"}>
                {badge.label}
              </Badge>
            ))}
          </div>
        )}
        
        {/* Avatar info in overlay */}
        <div className="absolute bottom-6 left-6 right-6 z-10">
          <motion.h3 
            layoutId={`avatar-name-${name}`}
            className="font-display text-3xl text-white leading-tight"
          >
            {name}
            {age && (
              <span className="opacity-60 text-xl font-sans font-light ml-2">
                {age}
              </span>
            )}
          </motion.h3>
          {role && (
            <p className="text-white/60 text-[10px] font-medium tracking-[0.2em] uppercase mt-1.5">
              {role}
            </p>
          )}
        </div>
      </div>

      {/* Description and Actions */}
      <div className="p-8 flex-1 flex flex-col">
        {description && (
          <p className="text-sm text-surface-600 dark:text-surface-400 leading-relaxed font-light flex-1">
            {description}
          </p>
        )}
        
        {/* Actions */}
        <div className="mt-6 flex gap-3">
          {onConfigure && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={(e) => {
                e.stopPropagation();
                onConfigure();
              }}
              className="flex-1 py-3 text-[10px] font-bold tracking-widest bg-primary/10 text-primary rounded-xl hover:bg-primary hover:text-white transition-all duration-200 uppercase"
            >
              Configure
            </motion.button>
          )}
          {onDeploy && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={(e) => {
                e.stopPropagation();
                onDeploy();
              }}
              className="flex-1 py-3 text-[10px] font-bold tracking-widest border border-surface-200 dark:border-white/10 rounded-xl hover:bg-white/20 dark:hover:bg-white/10 transition-all duration-200 uppercase"
            >
              Deploy
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
