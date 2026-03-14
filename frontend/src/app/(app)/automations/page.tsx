"use client";

import { Card, CardContent } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { motion } from "framer-motion";
import { StaggerContainer, StaggerItem, FadeIn } from "@/shared/ui/animations";

const automations = [
  {
    id: 1,
    name: "Daily Education Content",
    schedule: "Every day at 8:00 AM",
    avatar: "Amy",
    status: "active",
    videosGenerated: 28,
    lastRun: "2 hours ago",
  },
  {
    id: 2,
    name: "Weekly Finance Update",
    schedule: "Every Monday at 9:00 AM",
    avatar: "Marcus",
    status: "active",
    videosGenerated: 12,
    lastRun: "1 day ago",
  },
  {
    id: 3,
    name: "Health Tips Series",
    schedule: "Mon, Wed, Fri at 7:00 AM",
    avatar: "Elena",
    status: "paused",
    videosGenerated: 18,
    lastRun: "3 days ago",
  },
  {
    id: 4,
    name: "Tech News Digest",
    schedule: "Every weekday at 6:00 PM",
    avatar: "Leo",
    status: "draft",
    videosGenerated: 0,
    lastRun: "Never",
  },
];

export default function AutomationsPage() {
  return (
    <div className="h-full overflow-hidden">
      <div className="h-full overflow-y-auto px-6 pb-8 pt-6 lg:px-8 scrollbar-thin">
        <FadeIn direction="down" distance={10}>
          <header className="mb-12 flex items-end justify-between border-b border-[#d6dbd4] pb-10">
            <div className="flex flex-col gap-3">
              <h1 className="font-display text-7xl font-bold leading-none tracking-tighter text-[#1f3027]">Automations</h1>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#8ca1c5]">
                AUTONOMOUS WORKFLOWS & EXECUTION ENGINE
              </p>
            </div>
            
            <motion.button 
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="group relative flex items-center gap-3 overflow-hidden rounded-full bg-[#1c2120] px-8 py-4 text-[11px] font-bold uppercase tracking-[0.2em] text-white shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all duration-300 hover:shadow-[0_20px_40px_rgba(60,159,149,0.25)]"
              onClick={() => console.log("Create automation")}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#3c9f95] to-[#90d5c8] opacity-0 transition-opacity duration-300 group-hover:opacity-20" />
              <span className="material-symbols-outlined !text-[20px] text-[#3c9f95] transition-transform duration-300 group-hover:scale-110">add_circle</span>
              Create Automation
            </motion.button>
          </header>
        </FadeIn>

        <FadeIn direction="up" distance={10} delay={0.1}>
          <div className="mb-12 flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-[300px]">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#8da1bf] transition-colors duration-300 peer-focus:text-[#3c9f95]">search</span>
              <input 
                type="text" 
                placeholder="DISCOVER WORKFLOWS..." 
                className="peer w-full rounded-2xl border border-[#d6dbd4] bg-white/50 py-4 pl-12 pr-4 text-[11px] font-bold uppercase tracking-[0.1em] text-[#1c2120] ring-[#3c9f95] transition-all duration-300 focus:bg-white focus:outline-none focus:ring-2 focus:shadow-[0_8px_30px_rgb(60,159,149,0.1)]"
              />
            </div>
            
            <div className="flex gap-2">
              {["All", "Active", "Paused", "Drafts"].map((filter) => (
                <button 
                  key={filter}
                  className={`rounded-full px-5 py-2.5 text-[10px] font-bold uppercase tracking-[0.15em] transition-all duration-300 ${
                    filter === "All" 
                      ? "bg-[#1c2120] text-white shadow-[0_4px_12px_rgba(0,0,0,0.1)] hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(0,0,0,0.15)]" 
                      : "bg-white text-[#5c6d66] border border-[#d6dbd4] hover:border-[#3c9f95] hover:text-[#3c9f95] hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(60,159,149,0.1)]"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>
        </FadeIn>

        <div className="space-y-16">
          {/* Automations List */}
          <section>
            <FadeIn direction="up" distance={10}>
              <div className="mb-8 flex gap-2.5">
                <span className="inline-block w-1 shrink-0 rounded-full bg-[#3c9f95]" />
                <div className="flex flex-col justify-center">
                  <h2 className="font-display text-2xl leading-tight text-[#233529]">Your Automations</h2>
                  <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8ca1c5]">
                    Managed mission-critical workflows
                  </p>
                </div>
              </div>
            </FadeIn>

          <StaggerContainer className="space-y-6">
            {automations.map((automation) => (
              <StaggerItem key={automation.id}>
                <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden rounded-[24px] bg-white group transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)]">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-6 flex-1">
                        <div className="relative">
                          <motion.div 
                            whileHover={{ scale: 1.1, rotate: 10 }}
                            className="w-16 h-16 rounded-2xl bg-[#3c9f95]/5 flex items-center justify-center transition-all duration-300 group-hover:bg-[#3c9f95]/10"
                          >
                            <span className="material-symbols-outlined !text-[28px] text-[#3c9f95]">
                              {automation.status === "active" ? "bolt" : automation.status === "paused" ? "pause" : "edit_note"}
                            </span>
                          </motion.div>
                          
                          {/* Active Engine Pulse */}
                          {automation.status === "active" && (
                            <div className="absolute -right-1 -top-1 flex h-4 w-4">
                              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#3c9f95] opacity-40"></span>
                              <span className="relative inline-flex h-4 w-4 rounded-full bg-[#3c9f95] border-2 border-white shadow-sm"></span>
                            </div>
                          )}

                          {/* Avatar Token Integration */}
                          <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full border-2 border-white bg-[#1c2120] flex items-center justify-center overflow-hidden shadow-md transform group-hover:scale-110 transition-transform duration-500">
                            <span className="material-symbols-outlined !text-[16px] text-white">face</span>
                          </div>
                        </div>

                        <div>
                          <h3 className="font-display text-[18px] font-bold text-[#1c2120] mb-1 group-hover:text-[#3c9f95] transition-colors duration-300">
                            {automation.name}
                          </h3>
                          <div className="flex items-center gap-3">
                            <p className="text-[11px] font-bold uppercase tracking-widest text-[#8ca1c5]">{automation.schedule}</p>
                            <span className="text-[#d6dbd4]">·</span>
                            <p className="text-[11px] font-bold uppercase tracking-widest text-[#3c9f95]">{automation.avatar}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-10">
                        <div className="text-center">
                          <p className="text-3xl font-display font-bold text-[#1c2120]">
                            {automation.videosGenerated}
                          </p>
                          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#8ca1c5]">videos</p>
                        </div>
                        
                        <div className="flex flex-col items-end gap-1.5">
                          <Badge
                            className={`rounded-full px-3 py-1 text-[9px] font-bold uppercase tracking-[0.12em] border-none ${
                              automation.status === "active"
                                ? "bg-[#ecfdf5] text-[#10b981]"
                                : automation.status === "paused"
                                ? "bg-[#fefce8] text-[#a16207]"
                                : "bg-[#f0fdfa] text-[#3c9f95]"
                            }`}
                          >
                            <div className="flex items-center gap-1.5">
                              {automation.status === "active" && (
                                <span className="relative flex h-1.5 w-1.5">
                                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#10b981] opacity-75"></span>
                                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#10b981]"></span>
                                </span>
                              )}
                              {automation.status}
                            </div>
                          </Badge>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-[#8ca1c5]">{automation.lastRun}</p>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {automation.status === "active" ? (
                            <motion.button 
                              whileHover={{ scale: 1.1, backgroundColor: "rgba(0,0,0,0.05)" }}
                              whileTap={{ scale: 0.9 }}
                              className="p-2.5 rounded-xl transition-colors text-[#8ca1c5] hover:text-[#a16207]"
                            >
                              <span className="material-symbols-outlined !text-[20px]">pause</span>
                            </motion.button>
                          ) : automation.status === "paused" ? (
                            <motion.button 
                              whileHover={{ scale: 1.1, backgroundColor: "rgba(0,0,0,0.05)" }}
                              whileTap={{ scale: 0.9 }}
                              className="p-2.5 rounded-xl transition-colors text-[#8ca1c5] hover:text-[#10b981]"
                            >
                              <span className="material-symbols-outlined !text-[20px]">play_arrow</span>
                            </motion.button>
                          ) : null}
                          
                          <motion.button 
                            whileHover={{ scale: 1.1, rotate: 90, backgroundColor: "rgba(0,0,0,0.05)" }}
                            whileTap={{ scale: 0.9 }}
                            className="p-2.5 rounded-xl transition-colors text-[#8ca1c5] hover:text-[#1c2120]"
                          >
                            <span className="material-symbols-outlined !text-[20px]">settings</span>
                          </motion.button>
                          
                          <span className="material-symbols-outlined text-[#d6dbd4] opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-1 group-hover:text-[#3c9f95] ml-2">chevron_right</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </section>

            <div className="mt-12 border-t border-[#d6dbd4] pt-12 pb-12">
              <FadeIn direction="up" distance={10}>
                <div className="mb-8 flex gap-2.5">
                  <span className="inline-block w-1 shrink-0 rounded-full bg-[#3c9f95]" />
                  <div className="flex flex-col justify-center">
                    <h2 className="font-display text-2xl leading-tight text-[#233529]">Engine Performance</h2>
                    <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8ca1c5]">
                      System-wide efficiency metrics
                    </p>
                  </div>
                </div>
              </FadeIn>

              <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { icon: "smart_display", value: "58", label: "Total Videos Generated", animate: "scale" },
                  { icon: "schedule", value: "12h", label: "Time Saved This Week", animate: "rotate" },
                  { icon: "trending_up", value: "+15%", label: "Engagement Growth", animate: "y" },
                ].map((stat, idx) => (
                  <StaggerItem key={idx}>
                    <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[24px] bg-white p-8 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)]">
                      <CardContent className="p-0 flex flex-col items-center">
                        <motion.div
                          animate={stat.animate === "scale" ? { scale: [1, 1.1, 1] } : stat.animate === "y" ? { y: [0, -5, 0] } : {}}
                          whileHover={stat.animate === "rotate" ? { rotate: 180 } : {}}
                          transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                          className="w-14 h-14 rounded-2xl bg-[#3c9f95]/5 flex items-center justify-center mb-4"
                        >
                          <span className="material-symbols-outlined text-[#3c9f95] !text-[28px]">{stat.icon}</span>
                        </motion.div>
                        <p className="text-4xl font-display font-bold text-[#1c2120] mb-1">{stat.value}</p>
                        <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#8ca1c5]">{stat.label}</p>
                      </CardContent>
                    </Card>
                  </StaggerItem>
                ))}
              </StaggerContainer>
            </div>

        </div>
      </div>
    </div>
  );
}
