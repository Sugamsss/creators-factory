"use client";

import { Card, CardContent } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import Link from "next/link";
import { motion } from "framer-motion";
import { StaggerContainer, StaggerItem, FadeIn } from "@/shared/ui/animations";

const stats = [
  { label: "Total Avatars", value: "12", change: "+2 this week", icon: "face" },
  { label: "Active Videos", value: "8", change: "3 rendering", icon: "play_circle" },
  { label: "Scripts Generated", value: "47", change: "+12 this month", icon: "article" },
  { label: "Automations", value: "5", change: "2 running", icon: "bolt" },
];

const recentActivity = [
  { type: "video", name: "Phonics Lesson 15", avatar: "Amy", status: "rendering", time: "2m ago" },
  { type: "script", name: "Morning Routine Script", avatar: "Marcus", status: "ready", time: "15m ago" },
  { type: "avatar", name: "New Avatar Created", avatar: "Sarah", status: "ready", time: "1h ago" },
  { type: "automation", name: "Daily Batch", avatar: "Multiple", status: "completed", time: "3h ago" },
];

const quickActions = [
  { label: "Create Avatar", icon: "add_circle", href: "/avatars/create/new-avatar" },
  { label: "Generate Script", icon: "edit_note", href: "/scripts" },
  { label: "View Videos", icon: "smart_display", href: "/videos" },
  { label: "Manage Automations", icon: "settings", href: "/automations" },
];

export default function DashboardPage() {
  return (
    <div className="h-full overflow-hidden">
      <div className="h-full overflow-y-auto px-6 pb-8 pt-6 lg:px-8 scrollbar-thin">
        <FadeIn direction="down" distance={10}>
          <header className="mb-12 flex items-end justify-between border-b border-[#d6dbd4] pb-10">
            <div className="flex flex-col gap-3">
              <h1 className="font-display text-7xl font-bold leading-none tracking-tight text-[#1f3027]">Dashboard</h1>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#8ca1c5]">
                CORE PERFORMANCE & RESOURCE METRICS
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="text-right mr-4 hidden md:block">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#8ca1c5]">Current Status</p>
                <p className="text-sm font-semibold text-[#3c9f95]">3 videos rendering</p>
              </div>
              <motion.button 
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="group relative flex items-center gap-3 overflow-hidden rounded-full bg-[#1c2120] px-8 py-4 text-[11px] font-bold uppercase tracking-[0.2em] text-white shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all duration-300 hover:shadow-[0_20px_40px_rgba(60,159,149,0.25)]"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[#3c9f95] to-[#90d5c8] opacity-0 transition-opacity duration-300 group-hover:opacity-20" />
                <span className="material-symbols-outlined !text-[20px] text-[#3c9f95] transition-transform duration-300 group-hover:scale-110">bolt</span>
                Quick Pulse
              </motion.button>
            </div>
          </header>
        </FadeIn>

        <div className="space-y-16">
          {/* Stats Grid */}
          <section>
            <FadeIn direction="up" distance={10}>
              <div className="mb-8 flex gap-2.5">
                <span className="inline-block w-1 shrink-0 rounded-full bg-[#3c9f95]" />
                <div className="flex flex-col justify-center">
                  <h2 className="font-display text-2xl leading-tight text-[#233529]">Platform Overview</h2>
                  <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8ca1c5]">
                    Real-time growth and engagement data
                  </p>
                </div>
              </div>
            </FadeIn>
            <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat) => (
                <StaggerItem key={stat.label}>
                  <Card className="p-6 group cursor-default h-full shadow-md transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl border-none bg-white">
                    <CardContent className="p-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-[#8ca1c5] mb-2">{stat.label}</p>
                          <p className="text-4xl font-display text-[#1f3027] font-bold leading-tight">
                            {stat.value}
                          </p>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-[#3c9f95] mt-2.5">{stat.change}</p>
                        </div>
                        <motion.div 
                          whileHover={{ rotate: 15, scale: 1.1 }}
                          className="w-10 h-10 rounded-xl bg-[#3c9f95]/10 flex items-center justify-center group-hover:bg-[#3c9f95]/20 transition-colors"
                        >
                          <span className="material-symbols-outlined text-[#3c9f95]">
                            {stat.icon}
                          </span>
                        </motion.div>
                      </div>
                    </CardContent>
                  </Card>
                </StaggerItem>
              ))}
            </StaggerContainer>
        </section>

          {/* Quick Actions */}
          <section>
            <FadeIn direction="up" distance={10}>
              <div className="mb-8 flex gap-2.5">
                <span className="inline-block w-1 shrink-0 rounded-full bg-[#3c9f95]" />
                <div className="flex flex-col justify-center">
                  <h2 className="font-display text-2xl leading-tight text-[#233529]">Quick Actions</h2>
                  <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8ca1c5]">
                    Accelerated creation workflows
                  </p>
                </div>
              </div>
            </FadeIn>
            <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickActions.map((action) => (
              <StaggerItem key={action.label}>
                <Link
                  href={action.href}
                  className="block h-full"
                >
                  <motion.div
                    whileHover={{ 
                      y: -8, 
                      scale: 1.02,
                    }}
                    whileTap={{ scale: 0.98 }}
                    className="group relative overflow-hidden bg-white p-8 h-full flex flex-col items-center gap-4 text-center rounded-[24px] shadow-md transition-all duration-500 hover:shadow-2xl border border-transparent hover:border-[#3c9f95]/20"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-white to-[#f0fdfa] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    <span className="material-symbols-outlined text-4xl text-[#3c9f95] relative z-10 transition-transform duration-300 group-hover:scale-110">
                      {action.icon}
                    </span>
                    <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#1c2120] relative z-10">
                      {action.label}
                    </span>
                  </motion.div>
                </Link>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </section>

          {/* Recent Activity */}
          <section>
            <FadeIn direction="up" distance={10}>
              <div className="mb-8 flex gap-2.5">
                <span className="inline-block w-1 shrink-0 rounded-full bg-[#3c9f95]" />
                <div className="flex flex-col justify-center">
                  <h2 className="font-display text-2xl leading-tight text-[#233529]">Recent Activity</h2>
                  <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8ca1c5]">
                    audit trail of latest operations
                  </p>
                </div>
              </div>
            </FadeIn>
            <Card className="border-none shadow-md overflow-hidden rounded-[24px] bg-white">
              <CardContent className="p-0">
              <StaggerContainer className="divide-y divide-[#d6dbd4]/30">
                {recentActivity.map((item, index) => (
                  <StaggerItem key={index}>
                    <motion.div
                      whileHover={{ backgroundColor: "rgba(60,159,149,0.03)" }}
                      className="group p-5 flex items-center justify-between transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-5">
                        <div className="w-12 h-12 rounded-2xl bg-[#3c9f95]/5 flex items-center justify-center transition-colors group-hover:bg-[#3c9f95]/10">
                          <span className="material-symbols-outlined text-[#3c9f95] text-[20px] transition-transform duration-300 group-hover:scale-110">
                            {item.type === "video" && "play_circle"}
                            {item.type === "script" && "article"}
                            {item.type === "avatar" && "face"}
                            {item.type === "automation" && "bolt"}
                          </span>
                        </div>
                        <div>
                          <p className="font-display text-[15px] font-bold text-[#1c2120]">
                            {item.name}
                          </p>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-[#8ca1c5] mt-0.5">
                            {item.avatar} · {item.time}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <Badge
                          className={`rounded-full px-3 py-1 text-[9px] font-bold uppercase tracking-[0.12em] border-none ${
                            item.status === "ready" || item.status === "completed"
                              ? "bg-[#ecfdf5] text-[#10b981]"
                              : item.status === "rendering"
                              ? "bg-[#fefce8] text-[#a16207]"
                              : "bg-[#f0fdfa] text-[#3c9f95]"
                          }`}
                        >
                          <div className="flex items-center gap-1.5">
                            {item.status === "rendering" && (
                              <motion.span 
                                animate={{ rotate: 360 }}
                                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                                className="material-symbols-outlined !text-[12px]"
                              >
                                autorenew
                              </motion.span>
                            )}
                            {item.status}
                          </div>
                        </Badge>
                        <span className="material-symbols-outlined text-[#d6dbd4] opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-1">chevron_right</span>
                      </div>
                    </motion.div>
                  </StaggerItem>
                ))}
              </StaggerContainer>
            </CardContent>
          </Card>
          </section>
        </div>
      </div>
    </div>
  );
}
