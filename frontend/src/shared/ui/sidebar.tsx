"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/shared/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { transitions } from "./animations";
import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  FileText, 
  Video, 
  Zap, 
  Settings,
  Search,
  Plus,
  ChevronRight,
  LogOut,
  CreditCard,
  Bell
} from "lucide-react";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard", section: "core" },
  { href: "/avatars", icon: Users, label: "Avatars", section: "create" },
  { href: "/industries", icon: Building2, label: "Industries", section: "create" },
  { href: "/scripts", icon: FileText, label: "Scripts", section: "create" },
  { href: "/videos", icon: Video, label: "Videos", section: "create" },
  { href: "/automations", icon: Zap, label: "Automations", section: "create" },
];

const sectionLabels: Record<string, string> = {
  core: "Overview",
  create: "Create",
};

function FloatingParticles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1.5 h-1.5 rounded-full bg-white/20"
          initial={{
            x: Math.random() * 100 + "%",
            y: Math.random() * 100 + "%",
          }}
          animate={{
            y: [null, "-20px", "20px", "-20px"],
            x: [null, "10px", "-10px", "10px"],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 8 + Math.random() * 4,
            repeat: Infinity,
            ease: "linear",
            delay: i * 1.5,
          }}
          style={{
            left: `${15 + i * 15}%`,
            top: `${20 + i * 10}%`,
          }}
        />
      ))}
    </div>
  );
}

function NavItem({ 
  item, 
  isActive, 
  isExpanded, 
  pathname 
}: { 
  item: typeof navItems[0]; 
  isActive: boolean; 
  isExpanded: boolean;
  pathname: string;
}) {
  const [isHovered, setIsHovered] = React.useState(false);
  const [mousePosition, setMousePosition] = React.useState({ x: 0, y: 0 });
  const ref = React.useRef<HTMLAnchorElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    setMousePosition({
      x: (e.clientX - rect.left) / rect.width - 0.5,
      y: (e.clientY - rect.top) / rect.height - 0.5,
    });
  };

  return (
    <motion.div
      className="relative"
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <Link
        ref={ref}
        href={item.href}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
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
            className="absolute inset-0 rounded-xl bg-[#1c2120]"
            transition={transitions.gentle}
            style={{ 
              zIndex: -1, 
              boxShadow: "0 0 24px rgba(60, 159, 149, 0.4), 0 0 48px rgba(60, 159, 149, 0.15)" 
            }}
          />
        )}
        {!isActive && isHovered && (
          <motion.div
            className="absolute inset-0 rounded-xl bg-white/5"
            transition={{ duration: 0.2 }}
          />
        )}
        <div 
          className="w-5 flex justify-center"
          style={{
            transform: isHovered ? `translate(${mousePosition.x * 3}px, ${mousePosition.y * 3}px)` : "none",
            transition: "transform 0.1s ease-out",
          }}
        >
          <item.icon className={cn(
            "h-5 w-5 shrink-0",
            isActive ? "text-[#3c9f95]" : "text-inherit"
          )} />
        </div>
        
        <AnimatePresence>
          {isExpanded ? (
            <motion.span 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="text-[14px] font-medium tracking-wide whitespace-nowrap"
            >
              {item.label}
            </motion.span>
          ) : (
            <motion.div
              initial={{ opacity: 0, x: -10, scale: 0.8 }}
              animate={{ 
                opacity: isHovered ? 1 : 0, 
                x: isHovered ? 0 : -10,
                scale: isHovered ? 1 : 0.8,
              }}
              transition={{ duration: 0.2 }}
              className="absolute left-full ml-3 px-3 py-2 rounded-lg bg-[#1c2120] text-white text-sm font-medium whitespace-nowrap shadow-xl pointer-events-none"
              style={{ zIndex: 100 }}
            >
              {item.label}
              <div className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 w-2 h-2 bg-[#1c2120] rotate-45" />
            </motion.div>
          )}
        </AnimatePresence>
      </Link>
    </motion.div>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [showUserMenu, setShowUserMenu] = React.useState(false);
  
  const currentSection = React.useMemo(() => {
    const currentItem = navItems.find(item => pathname.startsWith(item.href));
    return currentItem?.section || "core";
  }, [pathname]);

  const filteredItems = searchQuery 
    ? navItems.filter(item => item.label.toLowerCase().includes(searchQuery.toLowerCase()))
    : null;

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
        <FloatingParticles />
        
        <div className="mb-6 px-4 flex items-center relative z-10">
          <AnimatePresence mode="sync">
            {isExpanded ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col overflow-hidden w-full"
              >
                <motion.div
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -20, opacity: 0 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                >
                  <span className="font-display text-[26px] leading-[1.1] font-bold tracking-tight text-[#1c2120]">Creators</span>
                </motion.div>
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 20, opacity: 0 }}
                  transition={{ duration: 0.3, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
                >
                  <span className="font-display text-[26px] leading-[1.1] font-bold tracking-tight text-[#1c2120]">Factory</span>
                </motion.div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ 
                  duration: 0.4, 
                  ease: [0.34, 1.56, 0.64, 1] 
                }}
                className="flex items-center justify-center w-full"
              >
                <span className="font-display text-4xl font-bold tracking-tight text-[#1c2120]">CF</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {isExpanded && (
          <div className="mb-4 px-3 relative z-10">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-9 pl-9 pr-3 rounded-lg bg-white/10 border border-white/10 text-white text-sm placeholder:text-white/40 focus:outline-none focus:bg-white/15 transition-colors"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center rounded-full hover:bg-white/10 text-white/50 hover:text-white"
                >
                  ×
                </button>
              )}
            </div>
          </div>
        )}

        <nav className="flex flex-1 flex-col gap-1 px-3 relative z-10">
          {filteredItems ? (
            <div className="flex flex-col gap-1">
              {filteredItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <NavItem 
                    key={item.href} 
                    item={item} 
                    isActive={isActive} 
                    isExpanded={isExpanded}
                    pathname={pathname}
                  />
                );
              })}
              {filteredItems.length === 0 && isExpanded && (
                <div className="text-white/40 text-sm text-center py-4">No results found</div>
              )}
            </div>
          ) : (
            <>
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mb-2 px-2"
                >
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-white/40">
                    {sectionLabels[currentSection]}
                  </span>
                </motion.div>
              )}
              {navItems
                .filter(item => !isExpanded || item.section === currentSection || item.section === "core")
                .map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                  return (
                    <NavItem 
                      key={item.href} 
                      item={item} 
                      isActive={isActive} 
                      isExpanded={isExpanded}
                      pathname={pathname}
                    />
                  );
                })}
            </>
          )}
        </nav>

        <div className="mt-auto px-4 pb-4 relative z-10">
          <div className="flex flex-col gap-3">
            <div className="h-px w-full bg-white/10" />
            
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-3 relative">
                <div 
                  className="relative cursor-pointer"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#f2a26b] to-[#e88a4c] text-sm font-bold text-white shadow-md">
                    <AnimatePresence mode="wait">
                      {isExpanded ? (
                        <motion.span
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.15 }}
                        >
                          UN
                        </motion.span>
                      ) : (
                        <motion.span
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.15 }}
                        >
                          U
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-500 border-2 border-[#95aa94]" />
                </div>
                
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className="flex flex-col whitespace-nowrap"
                    >
                      <span className="text-xs font-bold text-[#1c2120]">User Name</span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-medium text-white/60">Free Plan</span>
                        <span className="text-[8px] px-1.5 py-0.5 rounded bg-[#3c9f95]/20 text-[#3c9f95] font-medium">Upgrade</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <AnimatePresence>
                  {showUserMenu && isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute left-0 bottom-full mb-2 w-48 py-2 rounded-xl bg-[#1c2120] shadow-2xl border border-white/10"
                    >
                      <button className="w-full px-4 py-2.5 text-left text-sm text-white/80 hover:bg-white/5 flex items-center gap-3">
                        <Bell className="w-4 h-4" />
                        Notifications
                      </button>
                      <button className="w-full px-4 py-2.5 text-left text-sm text-white/80 hover:bg-white/5 flex items-center gap-3">
                        <CreditCard className="w-4 h-4" />
                        Billing
                      </button>
                      <div className="h-px bg-white/10 my-1" />
                      <button className="w-full px-4 py-2.5 text-left text-sm text-red-400 hover:bg-white/5 flex items-center gap-3">
                        <LogOut className="w-4 h-4" />
                        Sign out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              <AnimatePresence>
                {isExpanded && (
                  <motion.div className="flex items-center gap-1">
                    <motion.button 
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white/60 hover:bg-white/10 hover:text-white transition-colors"
                    >
                      <Settings className="h-[18px] w-[18px]" />
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </motion.aside>
  );
}
