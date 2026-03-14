"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/shared/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { StaggerContainer, StaggerItem, transitions } from "./animations";

const navItems = [
  { href: "/dashboard", icon: "grid_view", label: "Dashboard" },
  { href: "/avatars", icon: "face", label: "Avatars" },
  { href: "/industries", icon: "business_center", label: "Industries" },
  { href: "/scripts", icon: "article", label: "Scripts" },
  { href: "/videos", icon: "play_circle", label: "Videos" },
  { href: "/automations", icon: "bolt", label: "Automations" },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isExpanded, setIsExpanded] = React.useState(false);

  return (
    <motion.aside 
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
      initial={false}
      animate={{ 
        width: isExpanded ? 256 : 96,
      }}
      transition={transitions.spring}
      className="relative flex h-full shrink-0 flex-col z-20"
    >
      <div className={cn(
        "ml-4 flex h-full flex-col rounded-[24px] border border-white/35 bg-[#95aa94]/90 backdrop-blur-md py-6 shadow-[0_12px_30px_-15px_rgba(0,0,0,0.4)] overflow-hidden transition-all duration-300",
        isExpanded ? "w-[240px]" : "w-[80px]"
      )}>
        <div className="mb-8 px-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#2f9d95] text-white shadow-[0_8px_16px_-8px_rgba(0,0,0,0.5)]">
              <span className="material-symbols-outlined !text-[20px]">auto_awesome</span>
            </div>
            <AnimatePresence>
              {isExpanded && (
                <motion.span 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="font-display text-xl font-semibold tracking-tight text-[#1c2120] whitespace-nowrap"
                >
                  Forge
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </div>

        <nav className="flex flex-1 flex-col gap-1.5 px-3">
          <StaggerContainer staggerChildren={0.05}>
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <StaggerItem key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "group relative flex h-11 items-center gap-3.5 rounded-xl px-4 text-[#e4ece2] transition-colors duration-200",
                      isActive 
                        ? "bg-[#1c2120] text-white shadow-lg" 
                        : "hover:bg-white/10 hover:text-white"
                    )}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="sidebar-active"
                        className="absolute inset-0 rounded-xl bg-[#1c2120] shadow-lg"
                        transition={transitions.gentle}
                        style={{ zIndex: -1 }}
                      />
                    )}
                    <span className={cn(
                      "material-symbols-outlined !text-[22px] shrink-0",
                      isActive ? "text-[#3c9f95]" : "text-inherit"
                    )}>{item.icon}</span>
                    
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.span 
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          className="text-[14px] font-medium tracking-wide whitespace-nowrap"
                        >
                          {item.label}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </Link>
                </StaggerItem>
              );
            })}
          </StaggerContainer>
        </nav>

        <div className="mt-auto px-4 pb-4">
          <div className="flex flex-col gap-4">
            <div className="h-px w-full bg-white/10" />
            
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#f2a26b] text-sm font-bold text-white shadow-md">
                  U
                </div>
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="flex flex-col whitespace-nowrap"
                    >
                      <span className="text-xs font-bold text-[#1c2120]">User Name</span>
                      <span className="text-[10px] font-medium text-white/60">Free Plan</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <AnimatePresence>
                {isExpanded && (
                  <motion.button 
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white/60 hover:bg-white/10 hover:text-white transition-colors"
                  >
                    <span className="material-symbols-outlined !text-[18px]">settings</span>
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </motion.aside>
  );
}
