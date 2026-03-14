"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { VisualIdentityStep } from "./VisualIdentityStep";
import { FinalizeAppearanceStep } from "./FinalizeAppearanceStep";
import { PersonalityStep } from "./PersonalityStep";
import { setAuthRedirect, useAuth } from "@/features/auth";
import { createAvatar, getAvatar, updateAvatar } from "@/features/avatars/services/avatarApi";

interface CreationWorkspaceProps {
  draftId: string;
}

const steps = [
  { id: 1, name: "Visual Identity", icon: "face", description: "Defining the minute details and refining the facial features of your avatar." },
  { id: 2, name: "Finalize Appearance", icon: "auto_fix", description: "Defining different angles of the model and confirming a stable identity." },
  { id: 3, name: "Personality", icon: "psychology", description: "Making the avatar relatable by giving it a unique and deep personality." },
];

export function CreationWorkspace({ draftId }: CreationWorkspaceProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [avatarName, setAvatarName] = useState("Loading...");
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (isAuthLoading) return;

    if (!isAuthenticated) {
      setAuthRedirect(`/avatars/create/${draftId}`);
      router.push("/login");
    } else {
      setIsAuthChecked(true);
    }
  }, [draftId, isAuthenticated, isAuthLoading, router]);

  useEffect(() => {
    if (!isAuthChecked) return;

    if (draftId === "new") {
      // Create a new avatar draft
      setIsCreating(true);
      void createAvatar()
        .then(draft => {
          // Redirect to the actual draft page
          router.replace(`/avatars/create/${draft.id}`);
        })
        .catch(err => {
          console.error("Failed to create avatar:", err);
          setAuthRedirect(`/avatars/create/${draftId}`);
          router.push("/login");
        })
        .finally(() => setIsCreating(false));
    } else if (!Number.isNaN(Number(draftId))) {
      // Fetch existing avatar
      void getAvatar(Number(draftId))
        .then(data => data.name && setAvatarName(data.name || "Untitled Avatar"))
        .catch(err => console.error("Failed to fetch avatar name", err));
    }
  }, [draftId, isAuthChecked, router]);

  if (!isAuthChecked || isCreating) {
    return null;
  }

  return (
    <div className="flex h-screen bg-transparent overflow-hidden">
      {/* Sidebar Stepper */}
      <div className="w-80 border-r border-[#d6dbd4] bg-white/60 backdrop-blur-3xl flex flex-col z-20">
        <div className="flex flex-col h-full px-8 pt-10 pb-20">
          {/* 1. Header Section */}
          <div className="shrink-0">
            <Link href="/avatars" className="flex items-center gap-3 text-[#1a3a2a]/60 hover:text-[#3c9f95] transition-all mb-8 group">
              <div className="h-7 w-7 rounded-full border border-[#d6dbd4] flex items-center justify-center transition-transform group-hover:-translate-x-1 group-hover:border-[#3c9f95]">
                <span className="material-symbols-outlined !text-[16px]">arrow_back</span>
              </div>
              <span className="text-[9px] font-bold uppercase tracking-[0.25em]">Exit Pipeline</span>
            </Link>
            <h1 className="font-display text-[40px] font-semibold text-[#1a3a2a] leading-tight tracking-tight">Avatar Creation</h1>
          </div>

          {/* Aesthetic Fine Divider */}
          <div className="h-px w-full bg-[#f0f3f0] my-8 rounded-full" />

          {/* 2. Identity Section */}
          <div className="shrink-0 space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#8ca1c5] ml-1">
              Avatar Name
            </label>
            <input 
              type="text" 
              value={avatarName}
              onChange={(e) => {
                setAvatarName(e.target.value);
                // Debounced save would be better, but for now just update state
              }}
              onBlur={async () => {
                if (draftId === "new" || Number.isNaN(Number(draftId))) return;
                try {
                  await updateAvatar(Number(draftId), { name: avatarName });
                } catch (e) {
                  console.error("Failed to sync name", e);
                }
              }}
              className="w-full bg-white/50 border border-[#d6dbd4] rounded-xl px-4 py-3 text-sm font-semibold text-[#1a3a2a] outline-none focus:outline-none focus:ring-0 focus:border-[#3c9f95] transition-all placeholder:text-[#8ca1c5]/50 hover:bg-white"
              placeholder="Enter avatar name..."
            />
          </div>

          {/* Aesthetic Fine Divider */}
          <div className="h-px w-full bg-[#f0f3f0] my-8 rounded-full" />

          {/* 3. Phases Stepper - Balanced Spacing */}
          <div className="flex-1 relative flex flex-col justify-between py-2">
            {/* Timeline Vertical Line */}
            <div className="absolute left-[19px] top-6 bottom-6 w-[2px] bg-[#f0f3f0] rounded-full">
              <motion.div 
                className="w-full bg-[#3c9f95] rounded-full"
                initial={false}
                animate={{ 
                  height: currentStep === 1 ? "0%" : currentStep === 2 ? "50%" : "100%" 
                }}
                transition={{ duration: 0.5, ease: "circOut" }}
              />
            </div>

            {steps.map((step) => (
              <div
                key={step.id}
                className={`flex items-start gap-4 group cursor-pointer transition-all relative z-10 ${
                  currentStep === step.id ? "translate-x-1" : ""
                }`}
                onClick={() => setCurrentStep(step.id)}
              >
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[16px] transition-all duration-300 border ${
                    currentStep === step.id
                      ? "bg-[#1a3a2a] text-white border-[#1a3a2a] shadow-xl shadow-[#1a3a2a]/20 scale-105"
                      : "bg-white border-[#d6dbd4] text-[#8ca1c5] group-hover:border-[#3c9f95] group-hover:text-[#3c9f95] group-hover:shadow-lg group-hover:shadow-black/5"
                  }`}
                >
                  <span className={`material-symbols-outlined !text-[20px] ${currentStep === step.id ? "animate-pulse" : ""}`}>{step.icon}</span>
                </div>
                <div className="pt-0.5">
                  <p
                    className={`text-[8px] font-bold uppercase tracking-[0.25em] transition-colors mb-0.5 ${
                      currentStep === step.id ? "text-[#3c9f95]" : "text-[#8ca1c5] group-hover:text-[#5c6d66]"
                    }`}
                  >
                    Phase 0{step.id}
                  </p>
                  <p
                    className={`text-[14px] font-bold transition-colors ${
                      currentStep === step.id ? "text-[#1a3a2a]" : "text-[#5c6d66] group-hover:text-[#1a3a2a]"
                    }`}
                  >
                    {step.name}
                  </p>
                  <p className="text-[10px] font-medium text-[#8ca1c5] mt-0.5">{step.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Aesthetic Fine Divider */}
          <div className="h-px w-full bg-[#f0f3f0] my-8 rounded-full" />

          {/* 4. Action Buttons */}
          <div className="shrink-0 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <button className="flex items-center justify-center gap-2 h-11 rounded-xl border border-[#f0f3f0] text-red-500/70 text-[10px] font-bold uppercase tracking-widest transition-all hover:bg-red-50 hover:text-red-500 hover:border-red-100 active:scale-95">
                <span className="material-symbols-outlined !text-[16px]">delete</span>
                Delete
              </button>
              <button className="flex items-center justify-center gap-2 h-11 rounded-xl border border-[#f0f3f0] text-[#5c6d66] text-[10px] font-bold uppercase tracking-widest transition-all hover:bg-black hover:text-white hover:border-black active:scale-95">
                <span className="material-symbols-outlined !text-[16px]">save</span>
                Save
              </button>
            </div>
            <button 
              onClick={() => currentStep < 3 && setCurrentStep(prev => prev + 1)}
              className="w-full flex items-center justify-center gap-3 h-11 rounded-xl bg-[#3c9f95] text-white text-[10px] font-bold uppercase tracking-[0.2em] shadow-lg shadow-[#3c9f95]/20 transition-all hover:bg-[#2d7a72] hover:shadow-xl active:scale-[0.98] group"
            >
              Proceed Further
              <span className="material-symbols-outlined !text-[16px] transition-transform group-hover:translate-x-1">arrow_forward</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Background Gradients */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#3c9f95]/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/4 pointer-events-none" />

        {/* Simplified Header - Empty/Reduced */}
        <header className="h-4 z-10" />

        <main className="flex-1 overflow-hidden relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
              className="h-full"
            >
              {currentStep === 1 && <VisualIdentityStep avatarId={draftId} />}
              {currentStep === 2 && <FinalizeAppearanceStep avatarId={draftId} />}
              {currentStep === 3 && <PersonalityStep avatarId={draftId} />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
