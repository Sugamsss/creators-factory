"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FinalizeAppearanceStep } from "./FinalizeAppearanceStep";
import { PersonalityStep } from "./PersonalityStep";
import { VisualIdentityStep } from "./VisualIdentityStep";
import { buildLoginPath, useAuth } from "@/features/auth";
import {
  createAvatarDraft,
  deleteAvatar,
  generateReferences,
  getAvatar,
  getAvatarReadiness,
  retryLora,
  trainLora,
  updateAvatar,
} from "@/features/avatars/services/avatarApi";
import type { AvatarDetailModel } from "@/features/avatars/types";

interface CreationWorkspaceProps {
  draftId: string;
}

const steps = [
  { id: 1, name: "Visual Identity", description: "Generate and choose the active base face." },
  { id: 2, name: "Finalize Appearance", description: "Generate 15 references and complete LoRA training." },
  { id: 3, name: "Personality", description: "Define voice, profile, and complete the avatar." },
] as const;

type StepMeta = {
  is_complete: boolean;
  can_enter: boolean;
  blocked_reasons: string[];
};

export function CreationWorkspace({ draftId }: CreationWorkspaceProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();

  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isLoadingWorkspace, setIsLoadingWorkspace] = useState(true);
  const [avatar, setAvatar] = useState<AvatarDetailModel | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [stepReadiness, setStepReadiness] = useState<Record<number, StepMeta>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [avatarName, setAvatarName] = useState("");

  const autosaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedNameRef = useRef("");

  const avatarNumericId = Number(draftId);
  const validAvatarId = Number.isInteger(avatarNumericId) && avatarNumericId > 0;

  const loadWorkspace = useCallback(async () => {
    if (!validAvatarId) return;
    setIsLoadingWorkspace(true);
    try {
      const [avatarData, readiness] = await Promise.all([
        getAvatar(avatarNumericId),
        getAvatarReadiness(avatarNumericId),
      ]);
      setAvatar(avatarData);
      setAvatarName(avatarData.name || "");
      lastSavedNameRef.current = avatarData.name || "";
      const readinessMap: Record<number, StepMeta> = {};
      readiness.steps.forEach((step) => {
        readinessMap[step.step_id] = {
          is_complete: step.is_complete,
          can_enter: step.can_enter,
          blocked_reasons: step.blocked_reasons,
        };
      });
      setStepReadiness(readinessMap);
      setCurrentStep((prev) => {
        const selected = readinessMap[prev];
        if (selected && (selected.can_enter || selected.is_complete)) return prev;
        return readiness.current_step;
      });
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load avatar workspace.");
    } finally {
      setIsLoadingWorkspace(false);
    }
  }, [avatarNumericId, validAvatarId]);

  const flushNameAutosave = useCallback(async () => {
    if (!validAvatarId) return;
    const trimmed = avatarName.trim();
    if (trimmed === lastSavedNameRef.current) return;
    await updateAvatar(avatarNumericId, { name: trimmed || undefined, command: "save_draft" });
    lastSavedNameRef.current = trimmed;
  }, [avatarName, avatarNumericId, validAvatarId]);

  useEffect(() => {
    if (isAuthLoading) return;
    if (!isAuthenticated) {
      router.push(buildLoginPath(`/avatars/create/${draftId}`));
      return;
    }
    setIsAuthChecked(true);
  }, [draftId, isAuthenticated, isAuthLoading, router]);

  useEffect(() => {
    if (!isAuthChecked) return;
    if (draftId === "new") {
      setIsCreating(true);
      void createAvatarDraft()
        .then((draft) => router.replace(`/avatars/create/${draft.id}`))
        .catch((createError) => {
          setError(createError instanceof Error ? createError.message : "Failed to create avatar draft.");
        })
        .finally(() => setIsCreating(false));
      return;
    }
    void loadWorkspace();
  }, [draftId, isAuthChecked, loadWorkspace, router]);

  useEffect(() => {
    if (!validAvatarId) return;
    const interval = setInterval(() => {
      void loadWorkspace();
    }, 5000);
    return () => clearInterval(interval);
  }, [loadWorkspace, validAvatarId]);

  useEffect(() => {
    if (!validAvatarId) return;
    if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);
    autosaveTimerRef.current = setTimeout(() => {
      void flushNameAutosave().catch(() => {
        // keep inline error handling non-blocking
      });
    }, 700);
    return () => {
      if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);
    };
  }, [avatarName, flushNameAutosave, validAvatarId]);

  const currentTrainingStatus = avatar?.training_summary?.status || "not_started";

  const stepStatus = useMemo(
    () => ({
      one: stepReadiness[1],
      two: stepReadiness[2],
      three: stepReadiness[3],
    }),
    [stepReadiness]
  );

  const handleProceed = async () => {
    if (!validAvatarId || !avatar) return;
    setError(null);
    setNotice(null);

    if (currentStep === 1) {
      if (!stepStatus.one?.is_complete) {
        setError(stepStatus.one?.blocked_reasons?.[0] || "Select an active base image first.");
        return;
      }
      setIsProcessing(true);
      try {
        await generateReferences(String(avatar.id));
        setNotice("Reference generation request accepted. Step 2 progress will update live.");
      } catch (proceedError) {
        setError(proceedError instanceof Error ? proceedError.message : "Failed to start references generation.");
      } finally {
        setIsProcessing(false);
      }
      return;
    }

    if (currentStep === 2) {
      if (!stepStatus.two?.can_enter) {
        setError(stepStatus.two?.blocked_reasons?.[0] || "Step 2 is not ready.");
        return;
      }
      setIsProcessing(true);
      try {
        if (currentTrainingStatus === "failed") {
          await retryLora(avatar.id);
          setNotice("Training retry accepted.");
        } else {
          await trainLora(String(avatar.id));
          setNotice("LoRA training request accepted.");
        }
      } catch (proceedError) {
        setError(proceedError instanceof Error ? proceedError.message : "Failed to start LoRA training.");
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleSaveAndExit = async () => {
    if (!validAvatarId || !avatar) {
      router.push("/avatars");
      return;
    }
    setIsProcessing(true);
    setError(null);
    try {
      await flushNameAutosave();
      await updateAvatar(avatar.id, { command: "save_and_exit" });
      router.push("/avatars");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Failed to save and exit.");
      setIsProcessing(false);
    }
  };

  const handleDelete = async () => {
    if (!validAvatarId || !avatar) return;
    const confirmed = window.confirm("Delete this avatar draft? You can restore it from Recycle Bin for 10 days.");
    if (!confirmed) return;
    setIsProcessing(true);
    try {
      await deleteAvatar(avatar.id);
      router.push("/avatars");
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Failed to delete avatar.");
      setIsProcessing(false);
    }
  };

  const canGoToStep = (stepId: number): boolean => {
    const info = stepReadiness[stepId];
    if (!info) return stepId === 1;
    return info.can_enter || info.is_complete || stepId === currentStep;
  };

  if (!isAuthChecked || isCreating || isLoadingWorkspace) {
    return null;
  }

  if (!avatar || !validAvatarId) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-sm text-muted">Avatar draft not found.</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-transparent overflow-hidden">
      <div className="w-80 border-r border-[#d6dbd4] bg-white/60 backdrop-blur-3xl flex flex-col z-20">
        <div className="flex flex-col h-full px-8 pt-10 pb-8">
          <div className="shrink-0">
            <Link href="/avatars" className="flex items-center gap-3 text-[#1a3a2a]/60 hover:text-[#3c9f95] transition-all mb-8 group">
              <div className="h-7 w-7 rounded-full border border-[#d6dbd4] flex items-center justify-center transition-transform group-hover:-translate-x-1 group-hover:border-[#3c9f95]">
                <span className="material-symbols-outlined !text-[16px]">arrow_back</span>
              </div>
              <span className="text-[9px] font-bold uppercase tracking-[0.25em]">Exit Pipeline</span>
            </Link>
            <h1 className="font-display text-[36px] font-semibold text-[#1a3a2a] leading-tight tracking-tight">Avatar Creation</h1>
          </div>

          <div className="h-px w-full bg-[#f0f3f0] my-6 rounded-full" />

          <div className="shrink-0 space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#8ca1c5] ml-1">
              Avatar Name
            </label>
            <input
              type="text"
              value={avatarName}
              onChange={(e) => setAvatarName(e.target.value)}
              className="w-full bg-white/50 border border-[#d6dbd4] rounded-xl px-4 py-3 text-sm font-semibold text-[#1a3a2a]"
              placeholder="Enter avatar name..."
            />
          </div>

          <div className="h-px w-full bg-[#f0f3f0] my-6 rounded-full" />

          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {steps.map((step) => {
              const info = stepReadiness[step.id];
              const isCurrent = currentStep === step.id;
              const enabled = canGoToStep(step.id);
              const statusLabel = info?.is_complete ? "Ready" : enabled ? "In Progress" : "Blocked";
              return (
                <button
                  key={step.id}
                  onClick={() => {
                    if (enabled) setCurrentStep(step.id);
                  }}
                  disabled={!enabled}
                  className={`w-full rounded-2xl border p-3 text-left transition-all ${
                    isCurrent
                      ? "border-[#3c9f95] bg-[#3c9f95]/10"
                      : enabled
                        ? "border-[#d6dbd4] bg-white hover:border-[#3c9f95]"
                        : "border-[#e8ece8] bg-[#f7f9f8] opacity-80"
                  }`}
                  aria-current={isCurrent ? "step" : undefined}
                >
                  <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#8ca1c5]">Step {step.id}</p>
                  <p className="mt-1 text-sm font-bold text-[#1a3a2a]">{step.name}</p>
                  <p className="mt-1 text-[11px] text-[#5c6d66]">{step.description}</p>
                  <p className="mt-2 text-[10px] font-semibold uppercase tracking-wide text-[#3c9f95]">
                    {statusLabel}
                  </p>
                  {info?.blocked_reasons?.[0] && !enabled && (
                    <p className="mt-1 text-[10px] text-red-600">{info.blocked_reasons[0]}</p>
                  )}
                </button>
              );
            })}
          </div>

          <div className="h-px w-full bg-[#f0f3f0] my-6 rounded-full" />

          <div className="shrink-0 space-y-3">
            {error && <p className="text-xs text-red-600">{error}</p>}
            {notice && <p className="text-xs text-emerald-700">{notice}</p>}
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => void handleDelete()} className="h-11 rounded-xl border border-[#f0f3f0] text-red-500/70 text-[10px] font-bold uppercase tracking-widest">
                Delete
              </button>
              <button onClick={() => void handleSaveAndExit()} className="h-11 rounded-xl border border-[#f0f3f0] text-[#5c6d66] text-[10px] font-bold uppercase tracking-widest">
                Save & Exit
              </button>
            </div>
            <button
              onClick={() => void handleProceed()}
              disabled={isProcessing || currentStep === 3}
              className="w-full h-11 rounded-xl bg-[#3c9f95] text-white text-[10px] font-bold uppercase tracking-[0.2em] disabled:opacity-50"
            >
              {isProcessing ? "Processing..." : currentStep === 1 ? "Generate References" : currentTrainingStatus === "failed" ? "Retry Training" : "Train LoRA"}
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        <header className="h-4 z-10" />
        <main className="flex-1 overflow-hidden relative">
          {currentStep === 1 && <VisualIdentityStep avatarId={draftId} />}
          {currentStep === 2 && <FinalizeAppearanceStep avatarId={draftId} />}
          {currentStep === 3 && <PersonalityStep avatarId={draftId} />}
        </main>
      </div>
    </div>
  );
}
