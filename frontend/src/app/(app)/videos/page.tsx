"use client";

import { Card, CardContent } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { Progress } from "@/shared/ui/progress";
import { motion } from "framer-motion";
import { StaggerContainer, StaggerItem, FadeIn } from "@/shared/ui/animations";

const videos = [
  {
    id: 1,
    title: "Phonics Lesson 15 - Letter Sounds",
    avatar: "Amy",
    duration: "4:32",
    status: "rendering",
    progress: 67,
    thumbnail: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&h=225&fit=crop",
  },
  {
    id: 2,
    title: "Market Analysis - January 2026",
    avatar: "Marcus",
    duration: "8:15",
    status: "ready",
    progress: 100,
    thumbnail: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=225&fit=crop",
  },
  {
    id: 3,
    title: "Healthy Morning Routine",
    avatar: "Elena",
    duration: "6:45",
    status: "ready",
    progress: 100,
    thumbnail: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=225&fit=crop",
  },
  {
    id: 4,
    title: "Introduction to React Hooks",
    avatar: "Leo",
    duration: "12:20",
    status: "failed",
    progress: 45,
    thumbnail: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=225&fit=crop",
  },
];

export default function VideosPage() {
  return (
    <div className="h-full overflow-hidden">
      <div className="h-full overflow-y-auto px-6 pb-8 pt-6 lg:px-8 scrollbar-thin">
        <FadeIn direction="down" distance={10}>
          <header className="mb-12 flex items-end justify-between border-b border-[#d6dbd4] pb-10">
            <div className="flex flex-col gap-3">
              <h1 className="font-display text-7xl font-bold leading-none tracking-tighter text-[#1f3027]">Videos</h1>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#8ca1c5]">
                MULTIMEDIA ASSETS & RENDERING PIPELINE
              </p>
            </div>
            
            <motion.button 
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="group relative flex items-center gap-3 overflow-hidden rounded-full bg-[#1c2120] px-8 py-4 text-[11px] font-bold uppercase tracking-[0.2em] text-white shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all duration-300 hover:shadow-[0_20px_40px_rgba(60,159,149,0.25)]"
              onClick={() => console.log("Create video")}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#3c9f95] to-[#90d5c8] opacity-0 transition-opacity duration-300 group-hover:opacity-20" />
              <span className="material-symbols-outlined !text-[20px] text-[#3c9f95] transition-transform duration-300 group-hover:scale-110">video_call</span>
              Create Video
            </motion.button>
          </header>
        </FadeIn>

        <FadeIn direction="up" distance={10} delay={0.1}>
          <div className="mb-12 flex flex-wrap items-center gap-4 border-b border-[#d6dbd4] pb-12">
            <div className="relative flex-1 min-w-[300px]">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#8da1bf] transition-colors duration-300 peer-focus:text-[#3c9f95]">search</span>
              <input 
                type="text" 
                placeholder="DISCOVER PRODUCTIONS..." 
                className="peer w-full rounded-2xl border border-[#d6dbd4] bg-white/50 py-4 pl-12 pr-4 text-[11px] font-bold uppercase tracking-[0.1em] text-[#1c2120] ring-[#3c9f95] transition-all duration-300 focus:bg-white focus:outline-none focus:ring-2 focus:shadow-[0_8px_30px_rgb(60,159,149,0.1)]"
              />
            </div>
            
            <div className="flex gap-2">
              {["All Projects", "Recent", "Favorites"].map((filter) => (
                <button 
                  key={filter}
                  className={`rounded-full px-5 py-2.5 text-[10px] font-bold uppercase tracking-[0.15em] transition-all duration-300 ${
                    filter === "All Projects" 
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
          {/* Rendering Queue */}
          <section>
            <FadeIn direction="up" distance={10}>
              <div className="mb-8 flex gap-2.5">
                <span className="inline-block w-1 shrink-0 rounded-full bg-[#3c9f95]" />
                <div className="flex flex-col justify-center">
                  <h2 className="font-display text-2xl leading-tight text-[#233529]">Rendering Queue</h2>
                  <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8ca1c5]">
                    Active synthesis and processing
                  </p>
                </div>
              </div>
            </FadeIn>

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {videos.filter(v => v.status === "rendering").map((video) => (
              <StaggerItem key={video.id}>
                <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.12)] overflow-hidden rounded-[24px] bg-white group transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_30px_60px_rgb(0,0,0,0.15)]">
                  <div className="relative h-48 bg-surface-200 overflow-hidden">
                    <motion.img
                      whileHover={{ scale: 1.05 }}
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-full h-full object-cover grayscale opacity-50 transition-all duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <div className="relative w-20 h-20 flex items-center justify-center">
                        <motion.div 
                          animate={{ 
                            scale: [1, 1.2, 1],
                            opacity: [0.3, 0.6, 0.3]
                          }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="absolute inset-0 bg-[#3c9f95]/30 rounded-full blur-xl"
                        />
                        <div className="relative w-14 h-14 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/20">
                          <motion.span 
                            animate={{ rotate: 360 }}
                            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                            className="material-symbols-outlined text-white text-3xl"
                          >
                            sync
                          </motion.span>
                        </div>
                      </div>
                    </div>
                    {/* Avatar Token Integration */}
                    <div className="absolute bottom-4 left-4 w-10 h-10 rounded-full border-2 border-white bg-[#1c2120] flex items-center justify-center overflow-hidden shadow-lg transform group-hover:scale-110 transition-transform duration-500">
                      <span className="material-symbols-outlined !text-[20px] text-white">face</span>
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-display text-[16px] font-bold text-[#1c2120] leading-tight line-clamp-1">
                        {video.title}
                      </h3>
                      <Badge className="bg-[#fefce8] text-[#a16207] text-[9px] border-none font-bold uppercase tracking-wider">
                        {video.status}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-widest text-[#8ca1c5] mb-4">
                      <span>{video.avatar}</span>
                      <span className="text-[#3c9f95]">{video.duration}</span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
                        <span className="text-[#8ca1c5]">Synthesizing pipeline</span>
                        <span className="text-[#3c9f95]">{video.progress}%</span>
                      </div>
                      <div className="h-1.5 bg-[#f0fdfa] rounded-full overflow-hidden shadow-inner">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${video.progress}%` }}
                          transition={{ duration: 1.5, ease: "easeOut" }}
                          className="h-full bg-gradient-to-r from-[#3c9f95] to-[#90d5c8] rounded-full relative overflow-hidden"
                        >
                          <motion.div 
                            animate={{ x: ['100%', '-100%'] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                          />
                        </motion.div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </section>

          {/* All Videos */}
          <section className="mt-16">
            <FadeIn direction="up" distance={10}>
              <div className="mb-8 flex gap-2.5">
                <span className="inline-block w-1 shrink-0 rounded-full bg-[#3c9f95]" />
                <div className="flex flex-col justify-center">
                  <h2 className="font-display text-2xl leading-tight text-[#233529]">All Videos</h2>
                  <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8ca1c5]">
                    Intellectual multimedia assets
                  </p>
                </div>
              </div>
            </FadeIn>

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {videos.map((video) => (
              <StaggerItem key={video.id}>
                <article className="group h-full">
                  <motion.div
                    whileHover={{ 
                      y: -8, 
                      boxShadow: "0 30px 60px -12px rgba(0,0,0,0.15)" 
                    }}
                    className="rounded-[24px] overflow-hidden bg-white border border-[#d6dbd4]/30 shadow-[0_8px_30px_rgb(0,0,0,0.04)] h-full flex flex-col transition-all duration-500"
                  >
                    <div className="relative h-48 bg-surface-200 overflow-hidden">
                      <motion.img
                        src={video.thumbnail}
                        alt={video.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      
                      {/* Play Reveal Overlay */}
                      {video.status === "ready" && (
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-500 flex items-center justify-center opacity-0 group-hover:opacity-100">
                          <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center transform scale-90 group-hover:scale-100 transition-all duration-500">
                            <span className="material-symbols-outlined text-white text-4xl">play_arrow</span>
                          </div>
                        </div>
                      )}

                      {/* Status Badges */}
                      <div className="absolute top-4 right-4 flex gap-2 transform translate-y-0 group-hover:-translate-y-1 transition-transform duration-500">
                        {video.status === "ready" && (
                          <Badge className="bg-[#ecfdf5] text-[#10b981] border-none font-bold text-[9px] uppercase tracking-wider">Ready</Badge>
                        )}
                        {video.status === "failed" && (
                          <Badge className="bg-[#fef2f2] text-[#ef4444] border-none font-bold text-[9px] uppercase tracking-wider">Failed</Badge>
                        )}
                      </div>

                      {/* Duration Overlay */}
                      <div className="absolute bottom-4 right-4 px-3 py-1.5 bg-black/60 rounded-full text-[10px] font-bold text-white backdrop-blur-md transform group-hover:scale-110 transition-transform duration-500">
                        {video.duration}
                      </div>

                      {/* Avatar Token Integration */}
                      <div className="absolute bottom-4 left-4 w-10 h-10 rounded-full border-2 border-white bg-[#1c2120] flex items-center justify-center overflow-hidden shadow-lg transform group-hover:scale-110 transition-transform duration-500">
                        <span className="material-symbols-outlined !text-[20px] text-white">face</span>
                      </div>
                    </div>

                    <CardContent className="p-6 flex-1 flex flex-col">
                      <h3 className="font-display text-[16px] font-bold text-[#1c2120] mb-3 line-clamp-1 group-hover:text-[#3c9f95] transition-colors duration-300">
                        {video.title}
                      </h3>
                      
                      <div className="flex items-center justify-between mt-auto">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-[#8ca1c5]">Featured Actor</span>
                          <span className="text-[12px] font-bold text-[#1c2120]">{video.avatar}</span>
                        </div>
                        
                        {video.status === "ready" && (
                          <motion.button 
                            whileHover={{ scale: 1.05, x: 5 }}
                            className="bg-[#3c9f95]/10 text-[#3c9f95] px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-[#3c9f95] hover:text-white transition-all duration-300"
                          >
                            OPEN <span className="material-symbols-outlined !text-[14px]">arrow_forward</span>
                          </motion.button>
                        )}
                      </div>
                    </CardContent>
                  </motion.div>
                </article>
              </StaggerItem>
            ))}
          </StaggerContainer>
            <div className="mt-12 flex justify-center pb-12">
              <button className="group flex items-center gap-2 rounded-full bg-white px-8 py-4 text-[11px] font-bold uppercase tracking-[0.2em] text-[#1c2120] shadow-[0_4px_14px_rgba(0,0,0,0.05)] border border-[#d6dbd4] transition-all duration-300 hover:border-[#3c9f95] hover:text-[#3c9f95] hover:shadow-[0_8px_30px_rgba(60,159,149,0.15)] hover:-translate-y-1">
                Load More Assets
                <span className="material-symbols-outlined !text-[18px] transition-transform duration-300 group-hover:translate-y-0.5">expand_more</span>
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
