"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  generateAllReferences,
  getReferenceSlots,
  type ReferenceSlot,
} from "@/features/avatars/services/avatarApi";

interface FinalizeAppearanceStepProps {
  avatarId: string;
}

export function FinalizeAppearanceStep({ avatarId }: FinalizeAppearanceStepProps) {
  const [slots, setSlots] = useState<ReferenceSlot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSlots = useCallback(async () => {
    try {
      const data = await getReferenceSlots(avatarId);
      setSlots(data);
    } catch (error) {
      console.error("Failed to fetch reference slots:", error);
      setError(error instanceof Error ? error.message : "Failed to load reference slots");
    } finally {
      setIsLoading(false);
    }
  }, [avatarId]);

  useEffect(() => {
    fetchSlots();
  }, [fetchSlots]);

  const handleGenerateAll = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      await generateAllReferences(avatarId);
      await fetchSlots();
    } catch (error) {
      console.error("Batch generation failed:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to generate references. Select an active base first."
      );
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="h-full flex flex-col p-4 lg:p-6 overflow-y-auto scrollbar-none relative">
      <div className="max-w-7xl mx-auto w-full">
        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}
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
                {isGenerating ? (
                  <div className="relative">
                    <div className="h-2 w-2 rounded-full bg-amber-500" />
                    <div className="absolute inset-0 h-2 w-2 rounded-full bg-amber-500 animate-ping" />
                  </div>
                ) : (
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                )}
                <span className="text-[11px] font-bold text-[#1a3a2a] uppercase tracking-wider">
                  {isGenerating ? "Synthesizing" : "Standby"}
                </span>
              </div>
            </div>
            <div className="h-8 w-px bg-[#d6dbd4]/60" />
            <div className="text-left">
              <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-[#8ca1c5] mb-1.5">Slots</p>
              <div className="flex items-end gap-1">
                <span className="text-lg font-display text-[#1a3a2a] leading-none">{slots.length}</span>
                <span className="text-[11px] font-bold text-[#8ca1c5] leading-none mb-0.5">/ 15</span>
              </div>
            </div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-20 flex flex-col items-center justify-center gap-4"
            >
              <div className="w-12 h-12 rounded-full border-2 border-[#3c9f95]/20 border-t-[#3c9f95] animate-spin" />
              <p className="text-[10px] font-bold text-[#8ca1c5] uppercase tracking-widest">Loading Pipeline...</p>
            </motion.div>
          ) : slots.length > 0 ? (
            <motion.div 
              key="grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 pb-10"
            >
              {slots.map((slot, i) => (
                <motion.div 
                  key={slot.id} 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="aspect-[3/4.2] rounded-[32px] overflow-hidden border bg-white border-[#d6dbd4] hover:border-[#3c9f95] shadow-lg shadow-black/5 hover:shadow-2xl hover:shadow-[#3c9f95]/10 group cursor-pointer relative"
                >
                  <Image 
                    src={slot.image_url} 
                    width={600}
                    height={800}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    alt={slot.slot_label}
                  />
                  <div className="absolute inset-x-3 bottom-3 bg-white/90 backdrop-blur-md p-4 rounded-[24px] border border-white/50 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                    <p className="text-[8px] font-bold text-[#3c9f95] uppercase tracking-widest mb-1">{slot.slot_key}</p>
                    <p className="text-[11px] text-[#1a3a2a] font-bold">{slot.slot_label}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-[9px] font-medium text-[#8ca1c5]">Ready for LoRA</span>
                      <span className="material-symbols-outlined !text-[16px] text-green-500">check_circle</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div 
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-12 border-2 border-dashed border-[#d6dbd4] rounded-[40px] flex flex-col items-center justify-center gap-6"
            >
              <div className="w-16 h-16 rounded-3xl bg-white border border-[#d6dbd4] flex items-center justify-center text-[#8ca1c5] shadow-sm">
                <span className="material-symbols-outlined !text-[32px]">photo_library</span>
              </div>
              <div className="text-center space-y-2">
                <p className="text-[#1a3a2a] font-bold text-lg">Identity Variants Empty</p>
                <p className="text-[#8ca1c5] text-sm max-w-[320px] mx-auto">To ensure stable identity across all frames, we need to generate reference variants from your base image.</p>
              </div>
              <button 
                onClick={handleGenerateAll}
                disabled={isGenerating}
                className="flex items-center gap-3 px-8 h-12 rounded-2xl bg-[#1a3a2a] text-white text-[11px] font-bold uppercase tracking-widest hover:bg-[#3c9f95] transition-all shadow-xl shadow-black/10 disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <span className="material-symbols-outlined animate-spin" style={{ fontSize: 18 }}>sync</span>
                    Generating Pipeline...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined" style={{ fontSize: 18 }}>auto_mode</span>
                    Populate Identity Pipeline
                  </>
                )}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {isGenerating && (
        <div className="fixed inset-0 bg-white/40 backdrop-blur-sm z-50 pointer-events-auto flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
             <div className="w-16 h-16 rounded-full border-4 border-[#3c9f95]/10 border-t-[#3c9f95] animate-spin" />
             <p className="text-[12px] font-bold text-[#1a3a2a] uppercase tracking-[0.2em] animate-pulse">Synthesizing Variants...</p>
          </div>
        </div>
      )}
    </div>
  );
}
