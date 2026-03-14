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

interface FinalizeAppearanceStepProps {
  avatarId: string;
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
      setTrainingMessage(status.replaceAll("_", " "));
    } catch (fetchError) {
      console.error("Failed to fetch appearance state:", fetchError);
      setError(fetchError instanceof Error ? fetchError.message : "Failed to load appearance state");
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
          setTrainingMessage(String(payload.message || "Preparing dataset"));
        }

        if (eventType === "avatar.training.progress") {
          setIsTraining(true);
          setTrainingProgress(Number(payload.progressPercent || 0));
          setTrainingEta(Number(payload.etaSeconds || 0));
          setTrainingMessage(String(payload.message || "Training"));
        }

        if (eventType === "avatar.training.retrying") {
          setIsTraining(true);
          setTrainingProgress(Number(payload.progressPercent || 0));
          setTrainingEta(Number(payload.etaSeconds || 0));
          setTrainingMessage(String(payload.message || "Retrying"));
        }

        if (eventType === "avatar.training.failed") {
          setIsTraining(false);
          setCanRetryTraining(true);
          setTrainingProgress(0);
          setTrainingEta(0);
          setTrainingMessage(String(payload.message || "Failed"));
        }

        if (eventType === "avatar.training.completed") {
          setIsTraining(false);
          setCanRetryTraining(false);
          setTrainingProgress(100);
          setTrainingEta(0);
          setTrainingMessage("Completed");
        }
      },
      () => {
        // Keep previous state; SSE disconnections are non-blocking.
      }
    );

    return () => {
      source.close();
    };
  }, [avatarId]);

  const handleGenerateReferences = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      const response = await generateReferences(avatarId);
      setSlots(response.slots);
      setTrainingMessage("References generated. Ready to train LoRA.");
    } catch (generationError) {
      console.error("Failed to generate references:", generationError);
      setError(
        generationError instanceof Error
          ? generationError.message
          : "Failed to generate references"
      );
    } finally {
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
      console.error("Failed to start LoRA training:", trainError);
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
      console.error("Failed to retry LoRA training:", retryError);
      setError(retryError instanceof Error ? retryError.message : "Failed to retry training");
    }
  };

  const hasAllReferences = slots.length === 15;

  const progressLabel = useMemo(() => {
    if (!isTraining) return trainingMessage;
    if (trainingEta == null) return `${trainingMessage} (${trainingProgress}%)`;
    return `${trainingMessage} (${trainingProgress}% · ETA ${trainingEta}s)`;
  }, [isTraining, trainingEta, trainingMessage, trainingProgress]);

  return (
    <div className="h-full overflow-y-auto p-4 scrollbar-none lg:p-6">
      <div className="mx-auto w-full max-w-7xl">
        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <div className="mb-1 flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#3c9f95]" />
              <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-[#3c9f95]">Stage 02: Appearance</p>
            </div>
            <h3 className="font-display text-3xl text-[#1a3a2a] lg:text-4xl">Reference Set and LoRA Training</h3>
            <p className="max-w-xl text-[12px] font-medium leading-relaxed text-[#5c6d66]">
              Generate exactly 15 deterministic reference images, then train LoRA with live progress updates.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => void handleGenerateReferences()}
              disabled={isGenerating || isTraining}
              className="rounded-xl bg-[#1a3a2a] px-5 py-3 text-[10px] font-bold uppercase tracking-[0.2em] text-white disabled:opacity-50"
            >
              {isGenerating ? "Generating..." : "Generate References"}
            </button>
            <button
              onClick={() => void handleTrainLora()}
              disabled={!hasAllReferences || isTraining}
              className="rounded-xl bg-[#3c9f95] px-5 py-3 text-[10px] font-bold uppercase tracking-[0.2em] text-white disabled:opacity-50"
            >
              Train LoRA
            </button>
            <button
              onClick={() => void handleRetryLora()}
              disabled={!canRetryTraining || isTraining}
              className="rounded-xl border border-[#d6dbd4] bg-white px-5 py-3 text-[10px] font-bold uppercase tracking-[0.2em] text-[#1a3a2a] disabled:opacity-50"
            >
              Retry Training
            </button>
          </div>
        </div>

        <div className="mb-6 rounded-2xl border border-[#d6dbd4] bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#8ca1c5]">Training status</p>
          <p className="mt-2 text-sm font-semibold text-[#1a3a2a]">{progressLabel}</p>
          <div className="mt-3 h-2 w-full rounded-full bg-[#f0f3f0]">
            <div
              className="h-full rounded-full bg-[#3c9f95] transition-all duration-300"
              style={{ width: `${Math.min(100, Math.max(0, trainingProgress))}%` }}
              role="progressbar"
              aria-valuenow={trainingProgress}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="LoRA training progress"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="py-20 text-sm text-muted">Loading reference slots...</div>
        ) : slots.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 pb-10 md:grid-cols-3 lg:grid-cols-5">
            {slots.map((slot) => (
              <div
                key={slot.id}
                className="group relative aspect-[3/4.2] overflow-hidden rounded-[22px] border border-[#d6dbd4] bg-white shadow-sm"
              >
                <Image
                  src={slot.image_url}
                  width={600}
                  height={800}
                  className="h-full w-full object-cover"
                  alt={slot.slot_label}
                />
                <div className="absolute inset-x-3 bottom-3 rounded-xl bg-white/95 p-3">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-[#3c9f95]">{slot.slot_key}</p>
                  <p className="mt-0.5 text-[11px] font-semibold text-[#1a3a2a]">{slot.slot_label}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border-2 border-dashed border-[#d6dbd4] py-14 text-center">
            <p className="text-sm text-[#5c6d66]">No reference slots generated yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
