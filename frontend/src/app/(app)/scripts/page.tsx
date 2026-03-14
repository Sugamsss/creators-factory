"use client";

import { Card, CardContent } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { motion } from "framer-motion";
import { StaggerContainer, StaggerItem, FadeIn } from "@/shared/ui/animations";

const scripts = [
  {
    id: 1,
    title: "Morning Routine for Kids",
    avatar: "Amy",
    industry: "Education",
    duration: "3:45",
    status: "ready",
    createdAt: "2 hours ago",
  },
  {
    id: 2,
    title: "Introduction to Fractions",
    avatar: "Sarah",
    industry: "Education",
    duration: "5:20",
    status: "ready",
    createdAt: "5 hours ago",
  },
  {
    id: 3,
    title: "Market Analysis Weekly",
    avatar: "Marcus",
    industry: "Finance",
    duration: "8:15",
    status: "draft",
    createdAt: "1 day ago",
  },
  {
    id: 4,
    title: "Healthy Breakfast Ideas",
    avatar: "Elena",
    industry: "Health",
    duration: "4:30",
    status: "generating",
    createdAt: "Just now",
  },
];

export default function ScriptsPage() {
  return (
    <div className="h-full overflow-hidden">
      <div className="h-full overflow-y-auto px-6 pb-8 pt-6 lg:px-8 scrollbar-thin">
        <FadeIn direction="down" distance={10}>
          <header className="mb-12 flex items-end justify-between border-b border-[#d6dbd4] pb-10">
            <div className="flex flex-col gap-3">
              <h1 className="font-display text-7xl font-bold leading-none tracking-tighter text-[#1f3027]">Scripts</h1>
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#8ca1c5]">
                INTELLECTUAL ASSET REPOSITORY & PIPELINE
              </p>
            </div>
            
            <motion.button 
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="group relative flex items-center gap-3 overflow-hidden rounded-full bg-[#1c2120] px-8 py-4 text-[11px] font-bold uppercase tracking-[0.2em] text-white shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all duration-300 hover:shadow-[0_20px_40px_rgba(60,159,149,0.25)]"
              onClick={() => console.log("Generate script")}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#3c9f95] to-[#90d5c8] opacity-0 transition-opacity duration-300 group-hover:opacity-20" />
              <span className="material-symbols-outlined !text-[20px] text-[#3c9f95] transition-transform duration-300 group-hover:scale-110">edit_note</span>
              Generate Script
            </motion.button>
          </header>
        </FadeIn>

        <FadeIn direction="up" distance={10} delay={0.1}>
          <div className="mb-12 flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-[300px]">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#8da1bf] transition-colors duration-300 peer-focus:text-[#3c9f95]">search</span>
              <input 
                type="text" 
                placeholder="DISCOVER ASSETS..." 
                className="peer w-full rounded-2xl border border-[#d6dbd4] bg-white/50 py-4 pl-12 pr-4 text-[11px] font-bold uppercase tracking-[0.1em] text-[#1c2120] ring-[#3c9f95] transition-all duration-300 focus:bg-white focus:outline-none focus:ring-2 focus:shadow-[0_8px_30px_rgb(60,159,149,0.1)]"
              />
            </div>
            
            <div className="flex gap-2">
              {["All", "Drafts", "Generating", "Ready"].map((filter) => (
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
          {/* Scripts List */}
          <section>
            <FadeIn direction="up" distance={10}>
              <div className="mb-8 flex gap-2.5">
                <span className="inline-block w-1 shrink-0 rounded-full bg-[#3c9f95]" />
                <div className="flex flex-col justify-center">
                  <h2 className="font-display text-2xl leading-tight text-[#233529]">All Scripts</h2>
                  <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8ca1c5]">
                    Intellectual assets under management
                  </p>
                </div>
              </div>
            </FadeIn>

            <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden rounded-[24px] bg-white">
              <CardContent className="p-0">
                <StaggerContainer className="divide-y divide-[#d6dbd4]/30">
                  {scripts.map((script) => (
                    <StaggerItem key={script.id}>
                      <motion.div
                        whileHover={{ backgroundColor: "rgba(60,159,149,0.03)" }}
                        className="group p-5 flex items-center justify-between transition-all cursor-pointer"
                      >
                        <div className="flex items-center gap-5 flex-1">
                          <div className="relative">
                            <motion.div 
                              whileHover={{ rotate: 5, scale: 1.1 }}
                              className="w-12 h-12 rounded-2xl bg-[#3c9f95]/5 flex items-center justify-center transition-all duration-300 group-hover:bg-[#3c9f95]/10"
                            >
                              <span className="material-symbols-outlined text-[#3c9f95] !text-[20px]">article</span>
                            </motion.div>
                            {/* Avatar Token Integration */}
                            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-white bg-[#1c2120] flex items-center justify-center overflow-hidden shadow-sm">
                              <span className="material-symbols-outlined !text-[12px] text-white">face</span>
                            </div>
                          </div>
                          
                          <div className="flex-1">
                            <h3 className="font-display text-[15px] font-bold text-[#1c2120]">
                              {script.title}
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[10px] font-bold uppercase tracking-widest text-[#8ca1c5]">
                                {script.avatar}
                              </span>
                              <span className="text-[#d6dbd4]">·</span>
                              <span className="text-[10px] font-bold uppercase tracking-widest text-[#8ca1c5]">
                                {script.industry}
                              </span>
                              <span className="text-[#d6dbd4]">·</span>
                              <span className="text-[10px] font-bold uppercase tracking-widest text-[#3c9f95]">
                                {script.duration}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-6">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-[#8ca1c5] hidden md:block">
                            {script.createdAt}
                          </span>
                          
                          <Badge
                            className={`rounded-full px-3 py-1 text-[9px] font-bold uppercase tracking-[0.12em] border-none ${
                              script.status === "ready"
                                ? "bg-[#ecfdf5] text-[#10b981]"
                                : script.status === "generating"
                                ? "bg-[#fefce8] text-[#a16207]"
                                : "bg-[#f0fdfa] text-[#3c9f95]"
                            }`}
                          >
                            <div className="flex items-center gap-1.5">
                              {script.status === "generating" && (
                                <motion.span 
                                  animate={{ rotate: 360 }}
                                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                                  className="material-symbols-outlined !text-[12px]"
                                >
                                  autorenew
                                </motion.span>
                              )}
                              {script.status}
                            </div>
                          </Badge>

                          <div className="flex items-center">
                            <motion.button 
                              whileHover={{ scale: 1.1, backgroundColor: "rgba(0,0,0,0.05)" }}
                              whileTap={{ scale: 0.9 }}
                              className="p-2 rounded-lg transition-colors"
                            >
                              <span className="material-symbols-outlined text-[#8ca1c5] !text-[20px]">
                                more_vert
                              </span>
                            </motion.button>
                            <span className="material-symbols-outlined text-[#d6dbd4] opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-1 group-hover:text-[#3c9f95] ml-2">chevron_right</span>
                          </div>
                        </div>
                      </motion.div>
                    </StaggerItem>
                  ))}
                </StaggerContainer>
              </CardContent>
            </Card>
            
            <div className="mt-12 flex justify-center pb-12">
              <button className="group flex items-center gap-2 rounded-full bg-white px-8 py-4 text-[11px] font-bold uppercase tracking-[0.2em] text-[#1c2120] shadow-[0_4px_14px_rgba(0,0,0,0.05)] border border-[#d6dbd4] transition-all duration-300 hover:border-[#3c9f95] hover:text-[#3c9f95] hover:shadow-[0_8px_30_rgba(60,159,149,0.15)] hover:-translate-y-1">
                Load More Scripts
                <span className="material-symbols-outlined !text-[18px] transition-transform duration-300 group-hover:translate-y-0.5">expand_more</span>
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
