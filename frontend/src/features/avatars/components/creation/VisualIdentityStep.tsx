"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";

export function VisualIdentityStep() {
  const [activeAspect, setActiveAspect] = useState("3:4");
  const [activeModel, setActiveModel] = useState("Seedream");

  const mockData: Record<string, { img: string; model: string }> = {
    "1:1": { 
      img: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=1000&auto=format&fit=crop", 
      model: "Seedream" 
    },
    "3:4": { 
      img: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?q=80&w=1000&auto=format&fit=crop", 
      model: "Nano Banana" 
    },
    "9:16": { 
      img: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=1000&auto=format&fit=crop", 
      model: "ChatGPT" 
    },
    "4:3": { 
      img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1000&auto=format&fit=crop", 
      model: "Seedream" 
    },
    "16:9": { 
      img: "https://images.unsplash.com/photo-1552058544-f2b08422138a?q=80&w=1000&auto=format&fit=crop", 
      model: "Nano Banana" 
    }
  };

  return (
    <div className="h-full flex flex-col overflow-hidden relative group/workspace bg-transparent">
      {/* Heavy Noise Texture & Frosted Glass Base */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Base frosted color */}
        <div className="absolute inset-0 bg-[#f8faf9]/60 backdrop-blur-[100px]" />
        
        {/* Tactical Grain 1 - High Frequency */}
        <div 
          className="absolute inset-0 opacity-[0.4] mix-blend-soft-light"
          style={{ 
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`
          }}
        />

        {/* Tactical Grain 2 - Low Frequency Contrast */}
        <div 
          className="absolute inset-0 opacity-[0.2] mix-blend-overlay"
          style={{ 
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n2'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.4' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n2)'/%3E%3C/svg%3E")`
          }}
        />

        {/* Ambient Volume Shadow */}
        <div className="absolute inset-0 bg-gradient-to-tr from-[#1a3a2a]/0 via-transparent to-[#3c9f95]/5 opacity-40" />
      </div>
      
      {/* ─── Fixed-Position UI Layer (Centered between top and prompt box) ─── */}
      <div className="absolute top-0 left-0 right-0 bottom-[140px] z-30 pointer-events-none">
        {/* Floating Tools Rail - Locked Right */}
        <div className="absolute right-8 top-1/2 -translate-y-1/2 flex flex-col gap-2 p-1.5 rounded-full bg-white/80 backdrop-blur-md border border-[#e4ebe4] shadow-2xl pointer-events-auto">
          {[
            { icon: "brush", label: "Brush" },
            { icon: "ink_eraser", label: "Eraser" },
            { icon: "add", label: "Zoom In" },
            { icon: "remove", label: "Zoom Out" },
            { icon: "download", label: "Download" },
            { icon: "delete", label: "Delete" },
          ].map((tool) => (
            <button
              key={tool.label}
              title={tool.label}
              className="flex items-center justify-center rounded-full text-[#1a3a2a]/60 border border-transparent hover:border-[#3c9f95] hover:text-[#3c9f95] hover:bg-white hover:scale-110 transition-all duration-200"
              style={{ width: 36, height: 36 }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                {tool.icon}
              </span>
            </button>
          ))}
        </div>

        {/* History Pill - Locked Bottom Center (of this safe zone) */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 pointer-events-auto">
          <div className="flex items-center gap-2 px-2 py-1.5 rounded-full bg-white/90 backdrop-blur-xl border border-[#e4ebe4] shadow-[0_8px_32px_-4px_rgba(0,0,0,0.1)]">
            {Object.entries(mockData).map(([ratio, data]) => (
              <motion.button
                key={ratio}
                onClick={() => setActiveAspect(ratio)}
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="relative rounded-lg overflow-hidden border transition-all duration-200"
                style={{
                  width: 32,
                  height: 32,
                  borderColor: activeAspect === ratio ? "#3c9f95" : "transparent",
                  opacity: activeAspect === ratio ? 1 : 0.6,
                }}
              >
                <img src={data.img} className="w-full h-full object-cover" alt={ratio} />
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Canvas Workspace (Max Available Space) ─── */}
      <div className="flex-1 min-h-0 relative flex items-center justify-center pointer-events-none p-12">
        <div className="w-full h-full relative flex items-center justify-center">
          <motion.div
            key={activeAspect}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="w-full h-full flex items-center justify-center"
          >
            {/* Ambient glow - stays in canvas center */}
            <div className="absolute inset-0 pointer-events-none"
                 style={{ background: "radial-gradient(circle at 50% 50%, rgba(60,159,149,0.08) 0%, transparent 70%)" }} />

            <div className={`relative max-w-full max-h-full transition-all duration-500 pointer-events-auto
                ${activeAspect === '1:1' ? 'aspect-square h-full' : 
                  activeAspect === '3:4' ? 'aspect-[3/4] h-full' : 
                  activeAspect === '9:16' ? 'aspect-[9/16] h-full' : 
                  activeAspect === '4:3' ? 'aspect-[4/3] w-full' : 
                  'aspect-[16/9] w-full'}`}>
              <img
                src={mockData[activeAspect]?.img}
                className="w-full h-full object-cover rounded-[24px] shadow-[0_32px_80px_-16px_rgba(0,0,0,0.22)] border-[4px] border-white"
                alt={activeAspect}
              />
            </div>
          </motion.div>
        </div>
      </div>

      {/* ─── Command Center (Locked Bottom) ─── */}
      <div className="px-8 pb-12 relative z-40 shrink-0">
        <div className="max-w-2xl mx-auto flex flex-col gap-3">
          <div className="bg-white/95 backdrop-blur-2xl rounded-[28px] border border-[#e4ebe4] shadow-[0_24px_56px_-12px_rgba(0,0,0,0.1)]">
            
            {/* Main Prompt Input Area */}
            <div className="flex items-center gap-4 px-6 py-3">
              <input
                type="text"
                placeholder="Evoke a sense of ethereal presence..."
                className="flex-1 bg-transparent border-none outline-none focus:outline-none focus:ring-0 text-[15px] font-medium text-[#1a3a2a] placeholder:text-[#8ca1c5]"
              />
              <button className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1a3a2a] text-white hover:bg-[#3c9f95] transition-all shadow-lg shadow-[#1a3a2a]/20 flex-shrink-0">
                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>send</span>
              </button>
            </div>

            {/* Aesthetic Fine Divider */}
            <div className="h-px mx-6 bg-[#f0f3f0]" />

            {/* Quick Settings Row (New Sequence) */}
            <div className="flex items-center gap-2 px-6 py-2">
              {/* 1. Add Files (+) */}
              <button className="h-8 w-8 flex items-center justify-center rounded-xl bg-[#f4f7f5] text-[#8ca1c5] hover:bg-[#e4ebe4] hover:text-[#1a3a2a] transition-all">
                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>add</span>
              </button>

              <div className="h-5 w-px bg-[#f0f3f0] mx-1" />

              {/* 2. Aspect Ratio Dropdown */}
              <div className="relative group">
                <button className="flex items-center gap-2 px-3 h-8 rounded-xl bg-[#f4f7f5] text-[#1a3a2a] hover:bg-[#e4ebe4] transition-all">
                  <span className="material-symbols-outlined text-[#8ca1c5]" style={{ fontSize: 18 }}>
                    {activeAspect === "1:1" ? "crop_square" : (activeAspect === "9:16" || activeAspect === "3:4") ? "crop_portrait" : activeAspect === "16:9" ? "crop_16_9" : "crop_landscape"}
                  </span>
                  <span className="text-[10px] font-bold tracking-wider">{activeAspect}</span>
                  <span className="material-symbols-outlined text-[#8ca1c5]" style={{ fontSize: 14 }}>expand_more</span>
                </button>
                {/* Aspect Ratio Menu - Contiguous Hover Area */}
                <div className="absolute bottom-full left-0 hidden group-hover:block pt-8 -mt-8 z-50">
                  <div className="mb-2 w-32 bg-white rounded-xl border border-[#e4ebe4] shadow-xl p-1">
                  {["1:1", "3:4", "9:16", "4:3", "16:9"].map((ratio) => (
                    <button 
                      key={ratio}
                      onClick={() => setActiveAspect(ratio)}
                      className="w-full text-left px-3 py-2 rounded-xl text-[10px] font-bold text-[#5c6d66] hover:bg-[#f4f7f5] hover:text-[#1a3a2a] transition-all flex items-center gap-2"
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
                        {ratio === "1:1" ? "crop_square" : (ratio === "9:16" || ratio === "3:4") ? "crop_portrait" : ratio === "16:9" ? "crop_16_9" : "crop_landscape"}
                      </span>
                      {ratio}
                    </button>
                  ))}
                </div>
              </div>
            </div>

              <div className="h-5 w-px bg-[#f0f3f0] mx-1" />

              {/* 3. Model Dropdown */}
              <div className="relative group">
                <button className="flex items-center gap-2 px-3 h-8 rounded-xl bg-[#f4f7f5] text-[#1a3a2a] hover:bg-[#e4ebe4] transition-all">
                  <span className="material-symbols-outlined text-[#8ca1c5]" style={{ fontSize: 18 }}>neurology</span>
                  <span className="text-[10px] font-bold tracking-wider">{activeModel}</span>
                  <span className="material-symbols-outlined text-[#8ca1c5]" style={{ fontSize: 14 }}>expand_more</span>
                </button>
                {/* Model Menu - Contiguous Hover Area */}
                <div className="absolute bottom-full left-0 hidden group-hover:block pt-8 -mt-8 z-50">
                  <div className="mb-2 w-40 bg-white rounded-xl border border-[#e4ebe4] shadow-xl p-1">
                  {["ChatGPT", "Nano Banana", "Seedream"].map((model) => (
                    <button 
                      key={model}
                      onClick={() => setActiveModel(model)}
                      className="w-full text-left px-3 py-2 rounded-xl text-[10px] font-bold text-[#5c6d66] hover:bg-[#f4f7f5] hover:text-[#1a3a2a] transition-all"
                    >
                      {model}
                    </button>
                  ))}
                </div>
              </div>
            </div>

              <div className="h-5 w-px bg-[#f0f3f0] mx-1" />

              {/* 4. Age Input */}
              <div className="flex items-center gap-2 px-3 h-8 rounded-xl bg-[#f4f7f5]">
                <span className="material-symbols-outlined text-[#8ca1c5]" style={{ fontSize: 18 }}>person</span>
                <input 
                  type="text" 
                  placeholder="Age"
                  className="w-12 bg-transparent border-none outline-none focus:outline-none focus:ring-0 text-[10px] font-bold tracking-wider text-[#1a3a2a] placeholder:text-[#8ca1c5]"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
