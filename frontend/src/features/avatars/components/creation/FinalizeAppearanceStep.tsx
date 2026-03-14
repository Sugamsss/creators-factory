"use client";

import React from "react";
import { motion } from "framer-motion";

export function FinalizeAppearanceStep() {
  return (
    <div className="h-full flex flex-col p-4 lg:p-6 overflow-y-auto scrollbar-none">
      <div className="max-w-7xl mx-auto w-full">
        <div className="mb-6 flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-1">
              <span className="h-1.5 w-1.5 rounded-full bg-[#3c9f95]" />
              <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-[#3c9f95]">Stage 02: Consistency</p>
            </div>
            <h3 className="font-display text-3xl lg:text-4xl text-[#1a3a2a]">Identity Pipeline</h3>
            <p className="text-[12px] text-[#5c6d66] max-w-xl leading-relaxed font-medium">
              Generating reference images to train the LoRA model and maintain likeness.
            </p>
          </div>
          
          <div className="bg-white/70 backdrop-blur-xl px-6 py-4 rounded-[24px] border border-[#d6dbd4] shadow-xl shadow-black/5 flex items-center gap-8">
            <div className="text-left">
              <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-[#8ca1c5] mb-1.5">Process Engine</p>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <div className="h-2 w-2 rounded-full bg-amber-500" />
                  <div className="absolute inset-0 h-2 w-2 rounded-full bg-amber-500 animate-ping" />
                </div>
                <span className="text-[11px] font-bold text-[#1a3a2a] uppercase tracking-wider">Synthesizing</span>
              </div>
            </div>
            <div className="h-8 w-px bg-[#d6dbd4]/60" />
            <div className="text-left">
              <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-[#8ca1c5] mb-1.5">Progress</p>
              <div className="flex items-end gap-1">
                <span className="text-lg font-display text-[#1a3a2a] leading-none">09</span>
                <span className="text-[11px] font-bold text-[#8ca1c5] leading-none mb-0.5">/ 15</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 pb-10">
          {[...Array(15)].map((_, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`aspect-[3/4.2] rounded-[32px] overflow-hidden border transition-all duration-500 group cursor-pointer relative ${
                i < 9 
                  ? 'bg-white border-[#d6dbd4] hover:border-[#3c9f95] shadow-lg shadow-black/5 hover:shadow-2xl hover:shadow-[#3c9f95]/10' 
                  : 'bg-[#fafcfb] border-[#d6dbd4]/50 border-dashed'
              }`}
            >
              {i < 9 ? (
                <>
                  <img 
                    src={`https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&h=800&fit=crop&q=${i*10}`} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    alt={`Reference ${i}`}
                  />
                  <div className="absolute inset-x-3 bottom-3 bg-white/90 backdrop-blur-md p-4 rounded-[24px] border border-white/50 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                    <p className="text-[8px] font-bold text-[#3c9f95] uppercase tracking-widest mb-1">Perspective Shot</p>
                    <p className="text-[11px] text-[#1a3a2a] font-bold">Angle: Slight Left</p>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-[9px] font-medium text-[#8ca1c5]">Ready for LoRA</span>
                      <span className="material-symbols-outlined !text-[16px] text-green-500">check_circle</span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-4 px-6 text-center">
                  <div className="relative">
                    <div className="h-16 w-16 rounded-full border-2 border-dashed border-[#3c9f95]/30 animate-spin-slow" />
                    <span className="material-symbols-outlined absolute inset-0 flex items-center justify-center text-[#3c9f95]/40 !text-[24px]">cloud_sync</span>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-[#1a3a2a] uppercase tracking-widest mb-1">Rendering</p>
                    <p className="text-[9px] font-medium text-[#8ca1c5] uppercase tracking-widest italic animate-pulse">Emotional Anchor {i+1}</p>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
