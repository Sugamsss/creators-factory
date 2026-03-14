"use client";

import { Card, CardContent } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { motion } from "framer-motion";
import { StaggerContainer, StaggerItem, FadeIn } from "@/shared/ui/animations";

const industries = [
  {
    id: "education",
    name: "Education",
    description: "Phonics, language learning, STEM education",
    avatarCount: 4,
    eventCount: 12,
    color: "bg-blue-500",
  },
  {
    id: "finance",
    name: "Finance",
    description: "Personal finance, investing, market analysis",
    avatarCount: 3,
    eventCount: 8,
    color: "bg-green-500",
  },
  {
    id: "health",
    name: "Health & Wellness",
    description: "Fitness, nutrition, mental health",
    avatarCount: 2,
    eventCount: 15,
    color: "bg-red-400",
  },
  {
    id: "tech",
    name: "Technology",
    description: "Software reviews, coding tutorials, tech news",
    avatarCount: 5,
    eventCount: 20,
    color: "bg-purple-500",
  },
  {
    id: "lifestyle",
    name: "Lifestyle",
    description: "Fashion, home decor, travel",
    avatarCount: 3,
    eventCount: 9,
    color: "bg-pink-400",
  },
  {
    id: "business",
    name: "Business",
    description: "Entrepreneurship, leadership, career growth",
    avatarCount: 2,
    eventCount: 11,
    color: "bg-amber-500",
  },
];

const trendingEvents = [
  {
    id: 1,
    title: "New AI Tools for Teachers",
    industry: "Education",
    sentiment: "excited",
    trending: true,
  },
  {
    id: 2,
    title: "Federal Interest Rate Decision",
    industry: "Finance",
    sentiment: "neutral",
    trending: true,
  },
  {
    id: 3,
    title: "Remote Work Trends 2026",
    industry: "Business",
    sentiment: "curious",
    trending: false,
  },
];

export default function IndustriesPage() {
  return (
    <div className="h-full overflow-hidden">
      <div className="h-full overflow-y-auto px-6 pb-8 pt-6 lg:px-8 scrollbar-thin">
        <FadeIn direction="down" distance={10}>
          <header className="mb-12 flex items-end justify-between border-b border-[#d6dbd4] pb-10">
            <div className="flex flex-col gap-3">
              <h1 className="font-display text-7xl font-bold leading-none tracking-tighter text-[#1f3027]">Industries</h1>
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#8ca1c5]">
                MARKET SEGMENTS & TOPIC CLUSTERS
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right mr-4 hidden md:block">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#8ca1c5]">Active Analysis</p>
                <p className="text-sm font-semibold text-[#3c9f95]">12 trending events today</p>
              </div>
              <motion.button 
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="group relative flex items-center gap-3 overflow-hidden rounded-full bg-[#1c2120] px-8 py-4 text-[11px] font-bold uppercase tracking-[0.2em] text-white shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all duration-300 hover:shadow-[0_20px_40px_rgba(60,159,149,0.25)]"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[#3c9f95] to-[#90d5c8] opacity-0 transition-opacity duration-300 group-hover:opacity-20" />
                <span className="material-symbols-outlined !text-[20px] text-[#3c9f95] transition-transform duration-300 group-hover:scale-110">analytics</span>
                Market Insights
              </motion.button>
            </div>
          </header>
        </FadeIn>

        <FadeIn direction="up" distance={10} delay={0.1}>
          <div className="mb-12 flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-[300px]">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#8da1bf] transition-colors duration-300 peer-focus:text-[#3c9f95]">search</span>
              <input 
                type="text" 
                placeholder="DISCOVER TOPICS..." 
                className="peer w-full rounded-2xl border border-[#d6dbd4] bg-white/50 py-4 pl-12 pr-4 text-[11px] font-bold uppercase tracking-[0.1em] text-[#1c2120] ring-[#3c9f95] transition-all duration-300 focus:bg-white focus:outline-none focus:ring-2 focus:shadow-[0_8px_30px_rgb(60,159,149,0.1)]"
              />
            </div>
            
            <div className="flex gap-2">
              {["All", "Trends", "Market", "Social"].map((filter) => (
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
          {/* Industry Cards */}
          <section>
            <FadeIn direction="up" distance={10}>
              <div className="mb-8 flex gap-2.5">
                <span className="inline-block w-1 shrink-0 rounded-full bg-[#3c9f95]" />
                <div className="flex flex-col justify-center">
                  <h2 className="font-display text-2xl leading-tight text-[#233529]">Your Industries</h2>
                  <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8ca1c5]">
                    Core sectors under active management
                  </p>
                </div>
              </div>
            </FadeIn>

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {industries.map((industry) => (
              <StaggerItem key={industry.id}>
                <Card className="group relative overflow-hidden bg-white p-7 cursor-pointer h-full border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-500 ease-out hover:-translate-y-2 hover:shadow-[0_20px_40px_rgb(0,0,0,0.12)] rounded-[24px]">
                  <CardContent className="p-0 relative z-10">
                    <div className="flex flex-col gap-6">
                      <div className="flex items-start justify-between">
                        <motion.div 
                          whileHover={{ rotate: 10, scale: 1.1 }}
                          className={`w-14 h-14 rounded-2xl ${industry.color.replace('bg-', 'bg-')}/10 flex items-center justify-center transition-colors duration-300`}
                        >
                          <span className={`material-symbols-outlined !text-[28px] ${industry.color.replace('bg-', 'text-')}`}>business_center</span>
                        </motion.div>
                        <div className="flex gap-1.5">
                          <Badge className="bg-[#f0fdfa] text-[#3c9f95] border-none text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full">
                            {industry.avatarCount} Avatars
                          </Badge>
                        </div>
                      </div>

                      <div className="flex-1">
                        <h3 className="font-display text-[22px] font-bold text-[#1c2120] leading-tight mb-2 tracking-tight">
                          {industry.name}
                        </h3>
                        <p className="text-[13px] font-medium text-[#8ca1c5] leading-relaxed mb-6 line-clamp-2">
                          {industry.description}
                        </p>
                        
                        <div className="flex items-center justify-between pt-4 border-t border-[#d6dbd4]/30">
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined !text-[16px] text-[#3c9f95]">event_note</span>
                            <span className="text-[11px] font-bold uppercase tracking-wider text-[#3c9f95]">
                              {industry.eventCount} Events
                            </span>
                          </div>
                          <span className="material-symbols-outlined text-[#d6dbd4] transition-all duration-300 group-hover:translate-x-1 group-hover:text-[#3c9f95]">arrow_forward</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <div className={`absolute inset-0 bg-gradient-to-br from-white to-${industry.color.replace('bg-', '')}/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                </Card>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </section>

          {/* Trending Events */}
          <section>
            <FadeIn direction="up" distance={10}>
              <div className="mb-8 flex gap-2.5">
                <span className="inline-block w-1 shrink-0 rounded-full bg-[#3c9f95]" />
                <div className="flex flex-col justify-center">
                  <h2 className="font-display text-2xl leading-tight text-[#233529]">Trending Events</h2>
                  <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8ca1c5]">
                    Real-time world events impacting your niche
                  </p>
                </div>
              </div>
            </FadeIn>

            <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden rounded-[24px] bg-white">
              <CardContent className="p-0">
                <StaggerContainer className="divide-y divide-[#d6dbd4]/30">
                  {trendingEvents.map((event) => (
                    <StaggerItem key={event.id}>
                      <motion.div
                        whileHover={{ backgroundColor: "rgba(60,159,149,0.03)" }}
                        className="group p-5 flex items-center justify-between transition-all cursor-pointer"
                      >
                        <div className="flex items-center gap-5">
                          <div className="w-12 h-12 rounded-2xl bg-[#3c9f95]/5 flex items-center justify-center transition-all duration-300 group-hover:bg-[#3c9f95]/10">
                            {event.trending ? (
                              <motion.span 
                                animate={{ scale: [1, 1.2, 1] }} 
                                transition={{ repeat: Infinity, duration: 2 }}
                                className="material-symbols-outlined text-amber-500 !text-[20px]"
                              >
                                trending_up
                              </motion.span>
                            ) : (
                              <span className="material-symbols-outlined text-[#8ca1c5] !text-[20px]">topic</span>
                            )}
                          </div>
                          <div>
                            <p className="font-display text-[15px] font-bold text-[#1c2120]">
                              {event.title}
                            </p>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-[#8ca1c5] mt-0.5">
                              {event.industry}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <Badge
                            className={`rounded-full px-3 py-1 text-[9px] font-bold uppercase tracking-[0.12em] border-none ${
                              event.sentiment === "excited"
                                ? "bg-[#ecfdf5] text-[#10b981]"
                                : event.sentiment === "neutral"
                                ? "bg-[#f0fdfa] text-[#3c9f95]"
                                : "bg-[#fefce8] text-[#a16207]"
                            }`}
                          >
                            {event.sentiment}
                          </Badge>
                          <span className="material-symbols-outlined text-[#d6dbd4] opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-1 group-hover:text-[#3c9f95]">chevron_right</span>
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
