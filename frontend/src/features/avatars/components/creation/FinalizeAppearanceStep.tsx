"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import {
  generateReferences,
  getAvatar,
  getReferenceSlots,
  retryLora,
  subscribeAvatarEvents,
  trainLora,
  type ReferenceSlot,
} from "@/features/avatars/services/avatarApi";
import {
  pipelineAccentButtonClass,
  pipelinePanelClass,
  pipelinePrimaryButtonClass,
  pipelineSecondaryButtonClass,
  pipelineStageBadgeClass,
  pipelineMutedTextClass,
} from "./pipelineControls";
import { cn } from "@/shared/lib/utils";

interface FinalizeAppearanceStepProps {
  avatarId: string;
}

function toTrainingLabel(status?: string, message?: string): string {
  if (status === "retrying") return "Retrying";
  if (status === "failed") return "Failed";
  if (status === "completed") return "Completed";
  if (status === "queued" || status === "not_started") return "Preparing dataset";

  const normalized = (message || "").toLowerCase();
  if (normalized.includes("validat")) return "Validating";
  if (normalized.includes("prepar")) return "Preparing dataset";
  return "Training";
}

function formatEta(eta: number | null): string {
  if (eta == null || eta <= 0) return "--";
  if (eta < 60) return `${eta}s`;
  const minutes = Math.floor(eta / 60);
  const seconds = eta % 60;
  return `${minutes}m ${seconds}s`;
}

export function FinalizeAppearanceStep({ avatarId }: FinalizeAppearanceStepProps) {
  const [slots, setSlots] = useState<ReferenceSlot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  const [isTraining, setIsTraining] = useState(false);
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [trainingEta, setTrainingEta] = useState<number | null>(null);
  const [trainingMessage, setTrainingMessage] = useState<string>("Not started");
  const [canRetryTraining, setCanRetryTraining] = useState(false);

  const [referenceProgress, setReferenceProgress] = useState<{ current: number; total: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchState = useCallback(async () => {
    setIsLoading(true);
    try {
      const [slotData, avatar] = await Promise.all([
        getReferenceSlots(avatarId),
        getAvatar(Number(avatarId)),
      ]);
      setSlots(slotData);

      const status = avatar.training_summary?.status || "not_started";
      setIsTraining(status === "running" || status === "queued" || status === "retrying");
      setCanRetryTraining(status === "failed");
      setTrainingMessage(toTrainingLabel(status));
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : "Failed to load appearance state.");
    } finally {
      setIsLoading(false);
    }
  }, [avatarId]);

  useEffect(() => {
    void fetchState();
  }, [fetchState]);

  useEffect(() => {
    const source = subscribeAvatarEvents(
      Number(avatarId),
      (eventType, payload) => {
        if (eventType === "avatar.training.started") {
          setIsTraining(true);
          setCanRetryTraining(false);
          setTrainingProgress(Number(payload.progressPercent || 0));
          setTrainingEta(Number(payload.etaSeconds || 0));
          setTrainingMessage(toTrainingLabel("running", String(payload.message || "Preparing dataset")));
          return;
        }

        if (eventType === "avatar.training.progress") {
          setIsTraining(true);
          setTrainingProgress(Number(payload.progressPercent || 0));
          setTrainingEta(Number(payload.etaSeconds || 0));
          setTrainingMessage(toTrainingLabel("running", String(payload.message || "Training")));
          return;
        }

        if (eventType === "avatar.training.retrying") {
          setIsTraining(true);
          setTrainingProgress(Number(payload.progressPercent || 0));
          setTrainingEta(Number(payload.etaSeconds || 0));
          setTrainingMessage("Retrying");
          return;
        }

        if (eventType === "avatar.training.failed") {
          setIsTraining(false);
          setCanRetryTraining(true);
          setTrainingProgress(0);
          setTrainingEta(0);
          setTrainingMessage("Failed");
          return;
        }

        if (eventType === "avatar.training.completed") {
          setIsTraining(false);
          setCanRetryTraining(false);
          setTrainingProgress(100);
          setTrainingEta(0);
          setTrainingMessage("Completed");
          return;
        }

        if (eventType === "avatar.references.generation.started") {
          setIsGenerating(true);
          setReferenceProgress({ current: 0, total: 15 });
          setError(null);
          return;
        }

        if (eventType === "avatar.references.generation.progress") {
          const progress = payload as { progress?: number; total?: number };
          setIsGenerating(true);
          setReferenceProgress({
            current: Number(progress.progress || 0),
            total: Number(progress.total || 15),
          });
          void getReferenceSlots(avatarId).then(setSlots);
          return;
        }

        if (eventType === "avatar.references.generation.completed") {
          setIsGenerating(false);
          setReferenceProgress(null);
          void getReferenceSlots(avatarId).then(setSlots);
          setTrainingMessage("References generated. Ready to train LoRA.");
          return;
        }

        if (eventType === "avatar.references.generation.failed") {
          setIsGenerating(false);
          setReferenceProgress(null);
          setError(String(payload.error || "Reference generation failed"));
        }
      },
      () => {
        // EventSource reconnect handled automatically.
      }
    );

    return () => source.close();
  }, [avatarId]);

  const handleGenerateReferences = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      await generateReferences(avatarId);
    } catch (generationError) {
      setError(
        generationError instanceof Error
          ? generationError.message
          : "Failed to generate references"
      );
      setIsGenerating(false);
    }
  };

  const handleTrainLora = async () => {
    setError(null);
    try {
      await trainLora(avatarId);
      setIsTraining(true);
      setTrainingProgress(0);
      setTrainingMessage("Preparing dataset");
    } catch (trainError) {
      setError(trainError instanceof Error ? trainError.message : "Failed to start training");
    }
  };

  const handleRetryLora = async () => {
    setError(null);
    try {
      await retryLora(Number(avatarId));
      setIsTraining(true);
      setCanRetryTraining(false);
      setTrainingProgress(0);
      setTrainingMessage("Retrying");
    } catch (retryError) {
      setError(retryError instanceof Error ? retryError.message : "Failed to retry training");
    }
  };

  const hasAllReferences = slots.length === 15;

  const progressLabel = useMemo(() => {
    if (isGenerating && referenceProgress) {
      return `Generating references: ${referenceProgress.current} / ${referenceProgress.total}`;
    }

    if (!isTraining) return trainingMessage;
    return `${trainingMessage} • ${Math.min(100, Math.max(0, trainingProgress))}% • ETA ${formatEta(trainingEta)}`;
  }, [isGenerating, isTraining, referenceProgress, trainingEta, trainingMessage, trainingProgress]);

  const progressValue = isGenerating
    ? Math.round(((referenceProgress?.current || 0) / Math.max(1, referenceProgress?.total || 15)) * 100)
    : Math.min(100, Math.max(0, trainingProgress));

  return (
    <div className="h-full overflow-y-auto p-4 scrollbar-none lg:p-6">
      <div className="mx-auto w-full max-w-7xl pb-10">
        <header className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <div className="mb-1 flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#3c9f95]" />
              <p className={pipelineStageBadgeClass}>Stage 02: Appearance</p>
            </div>
            <h3 className="font-display text-3xl text-[#1a3a2a] lg:text-4xl">Reference Set and LoRA Training</h3>
            <p className={pipelineMutedTextClass}>
              Generate 15 deterministic reference images, then train LoRA with live progress updates.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                void handleGenerateReferences();
              }}
              disabled={isGenerating || isTraining}
              className={pipelinePrimaryButtonClass}
            >
              {isGenerating ? "Generating..." : "Generate References"}
            </button>
            <button
              type="button"
              onClick={() => {
                void handleTrainLora();
              }}
              disabled={!hasAllReferences || isTraining}
              className={pipelineAccentButtonClass}
            >
              Train LoRA
            </button>
            <button
              type="button"
              onClick={() => {
                void handleRetryLora();
              }}
              disabled={!canRetryTraining || isTraining}
              className={pipelineSecondaryButtonClass}
            >
              Retry Training
            </button>
          </div>
        </header>

        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="sticky top-0 z-20 mb-6 bg-[#f4f8f6]/95 pb-3 pt-1 backdrop-blur">
          <div className={cn(pipelinePanelClass, "border-[#d6dbd4] p-4") }>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#8ca1c5]">
                {isGenerating ? "Generation Progress" : "Training Status"}
              </p>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#5c6d66]">
                {hasAllReferences ? "15 / 15 references ready" : `${slots.length} / 15 references`}
              </p>
            </div>

            <p className="mt-2 text-sm font-semibold text-[#1a3a2a]" aria-live="polite">
              {progressLabel}
            </p>

            <div className="mt-3 h-2 w-full rounded-full bg-[#edf2ee]">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-300",
                  isGenerating ? "bg-[#1f7db2]" : "bg-[#3c9f95]"
                )}
                style={{ width: `${progressValue}%` }}
                role="progressbar"
                aria-valuenow={progressValue}
                aria-valuemin={0}
                aria-valuemax={100}
              />
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="py-20 text-center text-sm text-[#5c6d66]">Loading reference slots...</div>
        ) : slots.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
            {slots.map((slot) => (
              <article
                key={slot.id}
                className="group relative overflow-hidden rounded-[22px] border border-[#d6dbd4] bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="relative aspect-[3/4.2] overflow-hidden">
                  <Image
                    src={slot.image_url}
                    width={600}
                    height={800}
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                    alt={slot.slot_label}
                  />
                </div>

                <div className="space-y-1 border-t border-[#edf2ee] p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-[#3c9f95]">
                      {slot.slot_key}
                    </p>
                    {slot.is_refined && (
                      <span className="rounded-full bg-[#ecf7f5] px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.12em] text-[#2c7c73]">
                        Refined {slot.refinement_count > 0 ? `(${slot.refinement_count})` : ""}
                      </span>
                    )}
                  </div>
                  <p className="text-[12px] font-semibold leading-snug text-[#1a3a2a]">{slot.slot_label}</p>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border-2 border-dashed border-[#d6dbd4] bg-white/70 py-16 text-center">
            <p className="text-sm font-medium text-[#5c6d66]">No reference slots generated yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
