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
  subscribeAvatarEvents,
  trainLora,
  updateAvatar,
} from "@/features/avatars/services/avatarApi";
import type { AvatarDetailModel } from "@/features/avatars/types";
import {
  pipelineAccentButtonClass,
  pipelineDangerButtonClass,
  pipelineSecondaryButtonClass,
} from "./pipelineControls";
import { cn } from "@/shared/lib/utils";

interface CreationWorkspaceProps {
  draftId: string;
}

const steps = [
  { id: 1, name: "Visual Identity", description: "Generate and choose the active base face." },
  { id: 2, name: "Finalize Appearance", description: "Generate references and complete LoRA training." },
  { id: 3, name: "Personality", description: "Define voice, profile, and complete the avatar." },
] as const;
const NOTICE_DISMISS_MS = 3200;
const WORKSPACE_REFRESH_DEBOUNCE_MS = 150;
const WORKSPACE_REFRESH_EVENTS = new Set([
  "avatar.visual.generation.completed",
  "avatar.visual.generation.failed",
  "avatar.references.generation.completed",
  "avatar.references.generation.failed",
  "avatar.training.completed",
  "avatar.training.failed",
  "avatar.training.retrying",
]);

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
  const workspaceRefreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const avatarNumericId = Number(draftId);
  const validAvatarId = Number.isInteger(avatarNumericId) && avatarNumericId > 0;

  const loadWorkspace = useCallback(async (showSpinner: boolean = true) => {
    if (!validAvatarId) return;

    if (showSpinner) {
      setIsLoadingWorkspace(true);
    }
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

      setCurrentStep((previous) => {
        const selected = readinessMap[previous];
        if (selected && (selected.can_enter || selected.is_complete)) return previous;
        return readiness.current_step;
      });
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load avatar workspace.");
    } finally {
      if (showSpinner) {
        setIsLoadingWorkspace(false);
      }
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
    const source = subscribeAvatarEvents(avatarNumericId, (eventType) => {
      if (!WORKSPACE_REFRESH_EVENTS.has(eventType)) return;
      if (workspaceRefreshTimerRef.current) {
        clearTimeout(workspaceRefreshTimerRef.current);
      }
      workspaceRefreshTimerRef.current = setTimeout(() => {
        void loadWorkspace(false);
      }, WORKSPACE_REFRESH_DEBOUNCE_MS);
    });

    return () => {
      source.close();
      if (workspaceRefreshTimerRef.current) {
        clearTimeout(workspaceRefreshTimerRef.current);
      }
    };
  }, [avatarNumericId, loadWorkspace, validAvatarId]);

  useEffect(() => {
    if (!validAvatarId) return;
    if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);

    autosaveTimerRef.current = setTimeout(() => {
      void flushNameAutosave().catch(() => {
        // keep autosave non-blocking
      });
    }, 700);

    return () => {
      if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);
    };
  }, [avatarName, flushNameAutosave, validAvatarId]);

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(null), NOTICE_DISMISS_MS);
    return () => clearTimeout(timer);
  }, [notice]);

  const currentTrainingStatus = avatar?.training_summary?.status || "not_started";

  const stepStatus = useMemo(
    () => ({
      one: stepReadiness[1],
      two: stepReadiness[2],
      three: stepReadiness[3],
    }),
    [stepReadiness]
  );

  const canGoToStep = (stepId: number): boolean => {
    const info = stepReadiness[stepId];
    if (!info) return stepId === 1;
    return info.can_enter || info.is_complete || stepId === currentStep;
  };

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
        setError(
          proceedError instanceof Error
            ? proceedError.message
            : "Failed to start references generation."
        );
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
        setError(
          proceedError instanceof Error
            ? proceedError.message
            : "Failed to start LoRA training."
        );
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

    const confirmed = window.confirm(
      "Delete this avatar draft? You can restore it from Recycle Bin for 10 days."
    );
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

  if (!isAuthChecked || isCreating || isLoadingWorkspace) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-9 w-9 animate-spin rounded-full border-2 border-[#3c9f95] border-t-transparent" />
      </div>
    );
  }

  if (!avatar || !validAvatarId) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-muted">Avatar draft not found.</p>
      </div>
    );
  }

  const stepActionLabel =
    currentStep === 1
      ? "Generate References"
      : currentStep === 2
        ? currentTrainingStatus === "failed"
          ? "Retry Training"
          : "Train LoRA"
        : "Step Complete";

  return (
    <div className="flex h-full min-h-0 overflow-hidden bg-transparent">
      <aside className="hidden w-80 shrink-0 border-r border-[#d6dbd4] bg-white/70 backdrop-blur-xl xl:flex">
        <div className="flex h-full w-full flex-col px-7 py-7">
          <Link
            href="/avatars"
            className="group mb-7 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#5c6d66] transition hover:text-[#1a3a2a]"
          >
            <span className="material-symbols-outlined text-[17px] transition group-hover:-translate-x-0.5">arrow_back</span>
            Exit Pipeline
          </Link>

          <h1 className="font-display text-[36px] leading-tight text-[#1a3a2a]">Avatar Creation</h1>
          <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8ca1c5]">Draft Workflow</p>

          <div className="my-6 h-px w-full bg-[#eef3ef]" />

          <label className="mb-1 ml-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[#8ca1c5]">Avatar Name</label>
          <input
            type="text"
            value={avatarName}
            onChange={(event) => setAvatarName(event.target.value)}
            className="h-11 rounded-xl border border-[#d6dbd4] bg-[#fafcfb] px-4 text-sm font-semibold text-[#1a3a2a] outline-none transition focus:border-[#3c9f95] focus:ring-2 focus:ring-[#3c9f95]/20"
            placeholder="Enter avatar name"
          />

          <div className="my-6 h-px w-full bg-[#eef3ef]" />

          <div className="flex-1 space-y-2 overflow-y-auto pr-1">
            {steps.map((step) => {
              const info = stepReadiness[step.id];
              const isCurrent = currentStep === step.id;
              const enabled = canGoToStep(step.id);
              const statusLabel = info?.is_complete ? "Ready" : enabled ? "In Progress" : "Blocked";

              return (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => {
                    if (enabled) setCurrentStep(step.id);
                  }}
                  disabled={!enabled}
                  className={cn(
                    "w-full rounded-xl border px-3.5 py-3 text-left transition",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3c9f95]/35",
                    isCurrent
                      ? "border-[#3c9f95] bg-[#eaf4f2]"
                      : enabled
                        ? "border-[#d6dbd4] bg-white hover:border-[#3c9f95]/45"
                        : "border-[#e8ece8] bg-[#f7f9f8] opacity-85"
                  )}
                  aria-current={isCurrent ? "step" : undefined}
                >
                  <div className="mb-1 flex items-center justify-between">
                    <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#8ca1c5]">Step {step.id}</p>
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.12em]",
                        statusLabel === "Ready"
                          ? "bg-[#eaf7f4] text-[#2c7c73]"
                          : statusLabel === "Blocked"
                            ? "bg-red-50 text-red-600"
                            : "bg-[#eef3f1] text-[#5c6d66]"
                      )}
                    >
                      {statusLabel}
                    </span>
                  </div>
                  <p className="text-sm font-bold text-[#1a3a2a]">{step.name}</p>
                  <p className="mt-1 text-[11px] leading-snug text-[#5c6d66]">{step.description}</p>

                  {info?.blocked_reasons?.[0] && !enabled && (
                    <p className="mt-2 rounded-lg border border-red-200 bg-red-50 px-2 py-1 text-[10px] font-medium text-red-700">
                      {info.blocked_reasons[0]}
                    </p>
                  )}
                </button>
              );
            })}
          </div>

          <div className="my-5 h-px w-full bg-[#eef3ef]" />

          {(error || notice) && (
            <div className="mb-3 space-y-2">
              {error && (
                <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">{error}</p>
              )}
              {notice && (
                <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
                  {notice}
                </p>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => {
                void handleDelete();
              }}
              className={pipelineDangerButtonClass}
              disabled={isProcessing}
            >
              Delete
            </button>
            <button
              type="button"
              onClick={() => {
                void handleSaveAndExit();
              }}
              className={pipelineSecondaryButtonClass}
              disabled={isProcessing}
            >
              Save & Exit
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              void handleProceed();
            }}
            disabled={isProcessing || currentStep === 3}
            className={cn(pipelineAccentButtonClass, "mt-2 w-full")}
          >
            {isProcessing ? "Processing..." : stepActionLabel}
          </button>
        </div>
      </aside>

      <div className="flex min-h-0 flex-1 flex-col">
        <div className="border-b border-[#d6dbd4] bg-white/85 px-3 py-3 backdrop-blur md:px-5 xl:hidden">
          <div className="flex items-center justify-between gap-3">
            <Link href="/avatars" className="inline-flex items-center gap-1 text-xs font-semibold text-[#1a3a2a]">
              <span className="material-symbols-outlined text-[16px]">arrow_back</span>
              Exit
            </Link>
            <h2 className="font-display text-xl text-[#1a3a2a]">Avatar Creation</h2>
            <div className="w-[48px]" />
          </div>

          <div className="mt-3 flex gap-2 overflow-x-auto no-scrollbar">
            {steps.map((step) => {
              const info = stepReadiness[step.id];
              const enabled = canGoToStep(step.id);
              const isCurrent = currentStep === step.id;
              const isReady = info?.is_complete;
              return (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => enabled && setCurrentStep(step.id)}
                  disabled={!enabled}
                  className={cn(
                    "shrink-0 rounded-lg border px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em]",
                    isCurrent
                      ? "border-[#3c9f95] bg-[#eaf4f2] text-[#1a3a2a]"
                      : isReady
                        ? "border-[#b8d9d2] bg-[#f0faf7] text-[#2c7c73]"
                        : "border-[#d6dbd4] bg-white text-[#5c6d66]"
                  )}
                >
                  {step.id}. {step.name}
                </button>
              );
            })}
          </div>

          <div className="mt-3">
            <label className="mb-1 ml-1 block text-[10px] font-bold uppercase tracking-[0.16em] text-[#8ca1c5]">Avatar Name</label>
            <input
              type="text"
              value={avatarName}
              onChange={(event) => setAvatarName(event.target.value)}
              className="h-10 w-full rounded-xl border border-[#d6dbd4] bg-[#fafcfb] px-3 text-sm font-semibold text-[#1a3a2a] outline-none focus:border-[#3c9f95]"
              placeholder="Enter avatar name"
            />
          </div>
        </div>

        <main className="min-h-0 flex-1">
          {currentStep === 1 && <VisualIdentityStep avatarId={draftId} />}
          {currentStep === 2 && <FinalizeAppearanceStep avatarId={draftId} />}
          {currentStep === 3 && <PersonalityStep avatarId={draftId} />}
        </main>

        <div className="border-t border-[#d6dbd4] bg-white/90 p-3 backdrop-blur md:p-4 xl:hidden">
          {(error || notice) && (
            <div className="mb-2 space-y-2">
              {error && (
                <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">{error}</p>
              )}
              {notice && (
                <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
                  {notice}
                </p>
              )}
            </div>
          )}

          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => {
                void handleDelete();
              }}
              disabled={isProcessing}
              className={pipelineDangerButtonClass}
            >
              Delete
            </button>
            <button
              type="button"
              onClick={() => {
                void handleSaveAndExit();
              }}
              disabled={isProcessing}
              className={pipelineSecondaryButtonClass}
            >
              Save & Exit
            </button>
            <button
              type="button"
              onClick={() => {
                void handleProceed();
              }}
              disabled={isProcessing || currentStep === 3}
              className={pipelineAccentButtonClass}
            >
              {isProcessing ? "..." : stepActionLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
