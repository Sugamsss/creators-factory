"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import {
  attachImage,
  deleteAttachment,
  deleteVisualVersion,
  editBaseImage,
  generateBaseImage,
  getAvatar,
  getAttachments,
  getVisualVersions,
  setActiveBase,
  subscribeAvatarEvents,
  type VisualVersion,
} from "@/features/avatars/services/avatarApi";
import type { Attachment } from "@/features/avatars/types";
import { cn } from "@/shared/lib/utils";
import { pipelinePanelClass } from "./pipelineControls";
import { AttachmentStrip } from "./visual/AttachmentStrip";
import { ToolRail } from "./visual/ToolRail";
import { VersionStrip } from "./visual/VersionStrip";
import {
  isAspectRatio,
  MODEL_MAPPING,
  MODEL_OPTIONS,
  REVERSE_MODEL_MAPPING,
  SUPPORTED_ASPECT_RATIOS,
  type AspectRatio,
  type ModelLabel,
} from "./visual/types";

interface VisualIdentityStepProps {
  avatarId: string;
}

const PROMPT_MIN_LENGTH = 10;
const AGE_MIN = 1;
const AGE_MAX = 120;
const ERROR_BANNER_DISMISS_MS = 5000;
const GENERATION_POLL_INTERVAL_MS = 2500;
const GENERATION_POLL_TIMEOUT_MS = 300000;

function getAspectFrameClass(aspect: AspectRatio): string {
  if (aspect === "1:1") return "aspect-square h-full";
  if (aspect === "3:4") return "aspect-[3/4] h-full";
  if (aspect === "9:16") return "aspect-[9/16] h-full";
  if (aspect === "4:3") return "aspect-[4/3] w-full";
  return "aspect-[16/9] w-full";
}

function parseAgeValue(raw: string): number {
  return Number(raw);
}

function sanitizeAgeInput(value: string): string {
  return value.replace(/\D/g, "").slice(0, 3);
}

export function VisualIdentityStep({ avatarId }: VisualIdentityStepProps) {
  const [generationAspect, setGenerationAspect] = useState<AspectRatio>("3:4");
  const [activeModel, setActiveModel] = useState<ModelLabel>("ChatGPT");
  const [openMenu, setOpenMenu] = useState<"aspect" | "model" | null>(null);

  const [age, setAge] = useState<string>("");
  const [prompt, setPrompt] = useState("");

  const [isGenerating, setIsGenerating] = useState(false);
  const [versions, setVersions] = useState<VisualVersion[]>([]);
  const [activeVersionId, setActiveVersionId] = useState<number | null>(null);

  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isDraggingFiles, setIsDraggingFiles] = useState(false);

  const prevAttachmentCountRef = useRef(attachments.length);
  useEffect(() => {
    const hadAttachments = prevAttachmentCountRef.current > 0;
    const hasAttachments = attachments.length > 0;
    prevAttachmentCountRef.current = attachments.length;

    // Only auto-switch model on transition between having/not-having attachments
    if (hasAttachments && !hadAttachments) {
      setActiveModel("Seedream v5 Lite");
    } else if (!hasAttachments && hadAttachments) {
      setActiveModel("ChatGPT");
    }
  }, [attachments]);

  const [error, setError] = useState<string | null>(null);
  const [maskImageUrl, setMaskImageUrl] = useState<string | null>(null);

  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isAnnotating, setIsAnnotating] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const promptTextareaRef = useRef<HTMLTextAreaElement>(null);
  const menusContainerRef = useRef<HTMLDivElement>(null);
  const hasInitializedGenerationAspectRef = useRef(false);
  const pendingOperationIdRef = useRef<string | null>(null);
  const generationBaselineVersionRef = useRef<number | null>(null);
  const generationStartedAtRef = useRef<number | null>(null);

  const activeVersion = useMemo(
    () => versions.find((version) => version.id === activeVersionId) || versions[0],
    [activeVersionId, versions]
  );
  const previewAspect = useMemo<AspectRatio>(() => {
    if (activeVersion && isAspectRatio(activeVersion.aspect_ratio)) {
      return activeVersion.aspect_ratio;
    }
    return generationAspect;
  }, [activeVersion, generationAspect]);

  const isPromptValid = prompt.trim().length >= PROMPT_MIN_LENGTH;

  const hasAgeInput = age.trim().length > 0;
  const parsedAge = parseAgeValue(age);
  const isAgeValid =
    !hasAgeInput || (Number.isInteger(parsedAge) && parsedAge >= AGE_MIN && parsedAge <= AGE_MAX);
  const ageErrorMessage =
    hasAgeInput && !isAgeValid ? `Age must be a whole number between ${AGE_MIN} and ${AGE_MAX}.` : null;

  const fetchVersions = useCallback(async (): Promise<VisualVersion[]> => {
    try {
      const data = await getVisualVersions(avatarId);
      setVersions(data);
      if (data.length > 0) {
        const active = data.find((version) => version.is_active_base) || data[0];
        setActiveVersionId(active.id);
        if (!hasInitializedGenerationAspectRef.current && isAspectRatio(active.aspect_ratio)) {
          setGenerationAspect(active.aspect_ratio);
          hasInitializedGenerationAspectRef.current = true;
        }
        setActiveModel(REVERSE_MODEL_MAPPING[active.model_used] || "Seedream v5 Lite");
      } else {
        setActiveVersionId(null);
      }
      return data;
    } catch (loadError) {
      console.error("Failed to fetch versions", loadError);
      return [];
    }
  }, [avatarId]);

  const fetchAttachmentData = useCallback(async () => {
    try {
      const data = await getAttachments(avatarId);
      setAttachments(data);
    } catch (loadError) {
      console.error("Failed to fetch attachments", loadError);
    }
  }, [avatarId]);

  const fetchAvatarBasics = useCallback(async () => {
    try {
      const avatar = await getAvatar(Number(avatarId));
      if (avatar.age) setAge(String(avatar.age));
    } catch (loadError) {
      console.error("Failed to fetch avatar basics", loadError);
    }
  }, [avatarId]);

  useEffect(() => {
    void fetchVersions();
    void fetchAttachmentData();
    void fetchAvatarBasics();
  }, [fetchAttachmentData, fetchAvatarBasics, fetchVersions]);

  useEffect(() => {
    const source = subscribeAvatarEvents(
      Number(avatarId),
      (eventType, payload) => {
        const eventOperationId =
          typeof payload.operationId === "string" ? payload.operationId : null;

        if (eventType === "avatar.visual.generation.started") {
          if (
            pendingOperationIdRef.current &&
            eventOperationId === pendingOperationIdRef.current
          ) {
            setIsGenerating(true);
            setError(null);
          }
        }

        if (eventType === "avatar.visual.generation.completed") {
          const data = payload.version as Record<string, unknown> | null;
          if (data) {
            setVersions((previous) => {
              const id = Number(data.id);
              if (previous.some((item) => item.id === id)) return previous;
              const next: VisualVersion = {
                id,
                version_number: Number(data.version_number),
                image_url: String(data.image_url),
                prompt: String(data.prompt || ""),
                model_used: String(data.model_used || data.model || "seedream_v5"),
                aspect_ratio: String(data.aspect_ratio || generationAspect),
                is_active_base: Boolean(data.is_active_base ?? true),
                is_edit: Boolean(data.is_edit ?? false),
                created_at: String(data.created_at || new Date().toISOString()),
              };
              return [next, ...previous];
            });
            setActiveVersionId(Number(data.id));
            setScale(1);
            setOffset({ x: 0, y: 0 });
          } else {
            void fetchVersions();
          }
          if (
            !pendingOperationIdRef.current ||
            !eventOperationId ||
            eventOperationId === pendingOperationIdRef.current
          ) {
            pendingOperationIdRef.current = null;
            generationBaselineVersionRef.current = null;
            generationStartedAtRef.current = null;
            setIsGenerating(false);
          }
          
        }

        if (eventType === "avatar.visual.generation.failed") {
          if (
            !pendingOperationIdRef.current ||
            !eventOperationId ||
            eventOperationId === pendingOperationIdRef.current
          ) {
            pendingOperationIdRef.current = null;
            generationBaselineVersionRef.current = null;
            generationStartedAtRef.current = null;
            setError(String(payload.error || "Generation failed"));
            setIsGenerating(false);
          }
        }
      },
      () => {
        // Let EventSource auto-reconnect silently.
      }
    );

    return () => source.close();
  }, [avatarId, fetchVersions, generationAspect]);

  useEffect(() => {
    if (!isGenerating) return;

    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const pollUntilSettled = async () => {
      if (cancelled) return;

      const baselineVersion = generationBaselineVersionRef.current;
      const startedAt = generationStartedAtRef.current;
      if (baselineVersion == null || startedAt == null) return;

      const latestVersions = await fetchVersions();
      if (cancelled) return;

      const latestVersionNumber =
        latestVersions.length > 0 ? latestVersions[0].version_number : null;

      if (latestVersionNumber != null && latestVersionNumber > baselineVersion) {
        pendingOperationIdRef.current = null;
        generationBaselineVersionRef.current = null;
        generationStartedAtRef.current = null;
        setIsGenerating(false);
        setError(null);
        
        return;
      }

      if (Date.now() - startedAt >= GENERATION_POLL_TIMEOUT_MS) {
        pendingOperationIdRef.current = null;
        generationBaselineVersionRef.current = null;
        generationStartedAtRef.current = null;
        setIsGenerating(false);
        setError("Generation status timed out. Latest versions were refreshed.");
        return;
      }

      timeoutId = setTimeout(pollUntilSettled, GENERATION_POLL_INTERVAL_MS);
    };

    timeoutId = setTimeout(pollUntilSettled, GENERATION_POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [fetchVersions, isGenerating]);

  useEffect(() => {
    const textarea = promptTextareaRef.current;
    if (!textarea) return;

    textarea.style.height = "0px";
    const scrollHeight = textarea.scrollHeight;
    const maxHeight = window.innerWidth < 768 ? 128 : 144;
    textarea.style.height = `${Math.min(scrollHeight, maxHeight)}px`;
    textarea.style.overflowY = scrollHeight > maxHeight ? "auto" : "hidden";
  }, [prompt]);

  useEffect(() => {
    if (!error) return;
    const timer = setTimeout(() => setError(null), ERROR_BANNER_DISMISS_MS);
    return () => clearTimeout(timer);
  }, [error]);

  useEffect(() => {
    const handleCloseMenus = (event: MouseEvent) => {
      if (!menusContainerRef.current?.contains(event.target as Node)) {
        setOpenMenu(null);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpenMenu(null);
    };

    document.addEventListener("mousedown", handleCloseMenus);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleCloseMenus);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !isAnnotating) return;

    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const rect = parent.getBoundingClientRect();
      const scaleFactor = window.devicePixelRatio || 1;
      canvas.width = rect.width * scaleFactor;
      canvas.height = rect.height * scaleFactor;

      const context = canvas.getContext("2d");
      if (!context) return;
      context.scale(scaleFactor, scaleFactor);
      context.lineCap = "round";
      context.lineJoin = "round";
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    return () => window.removeEventListener("resize", resizeCanvas);
  }, [activeVersionId, isAnnotating]);

  const exportMaskImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    try {
      return canvas.toDataURL("image/png");
    } catch {
      return null;
    }
  };

  const clearMaskCanvas = () => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;
    context.clearRect(0, 0, canvas.width, canvas.height);
  };

  const handleToolAction = async (tool: string) => {
    if (tool === "brush") {
      if (isAnnotating) {
        const mask = exportMaskImage();
        if (mask) {
          setMaskImageUrl(mask);
          
        }
        setIsAnnotating(false);
      } else {
        setIsAnnotating(true);
        
      }
      return;
    }

    if (tool === "clear_mask") {
      clearMaskCanvas();
      setMaskImageUrl(null);
      
      return;
    }

    if (tool === "add") {
      setScale((previous) => Math.min(previous + 0.25, 3));
      return;
    }

    if (tool === "remove") {
      setScale((previous) => {
        const next = Math.max(previous - 0.25, 1);
        if (next === 1) setOffset({ x: 0, y: 0 });
        return next;
      });
      return;
    }

    if (tool === "download" && activeVersion) {
      const link = document.createElement("a");
      link.href = activeVersion.image_url;
      link.download = `avatar-v${activeVersion.version_number}.png`;
      link.target = "_blank";
      link.click();
      return;
    }

    if (tool === "delete" && activeVersion) {
      try {
        const removingId = activeVersion.id;
        const isLast = versions.length === 1;
        await deleteVisualVersion(avatarId, removingId);
        await fetchVersions();
        if (isLast) {
          setActiveVersionId(null);
          setScale(1);
          setOffset({ x: 0, y: 0 });
        }

      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Failed to delete version.");
      }
      return;
    }

    if (tool === "attach" && activeVersion) {
      try {
        const response = await fetch(activeVersion.image_url);
        const blob = await response.blob();
        const file = new File([blob], `avatar-v${activeVersion.version_number}.png`, {
          type: "image/png",
        });
        const attachment = await attachImage(avatarId, file);
        setAttachments((previous) => [...previous, attachment]);

      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Failed to attach image.");
      }
    }
  };

  const handleFileUpload = async (files: FileList | File[]) => {
    const imageFiles = Array.from(files).filter((file) => file.type.startsWith("image/"));
    if (imageFiles.length === 0) return;

    setIsUploading(true);
    setError(null);

    try {
      for (const file of imageFiles) {
        const attachment = await attachImage(avatarId, file);
        setAttachments((previous) => [...previous, attachment]);
      }

    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Upload failed.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveAttachment = async (attachmentId: number) => {
    try {
      await deleteAttachment(avatarId, attachmentId);
      setAttachments((previous) => previous.filter((attachment) => attachment.id !== attachmentId));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Delete failed.");
    }
  };

  const onMouseDown = (event: React.MouseEvent) => {
    event.stopPropagation();

    if (isAnnotating) {
      setIsDrawing(true);
      draw(event);
      return;
    }

    if (scale > 1) {
      setIsPanning(true);
      setLastMousePos({ x: event.clientX, y: event.clientY });
      event.preventDefault();
    }
  };

  const onMouseMove = (event: React.MouseEvent) => {
    if (isPanning && scale > 1) {
      const dx = event.clientX - lastMousePos.x;
      const dy = event.clientY - lastMousePos.y;
      setOffset((previous) => ({ x: previous.x + dx, y: previous.y + dy }));
      setLastMousePos({ x: event.clientX, y: event.clientY });
      return;
    }

    if (isDrawing) draw(event);
  };

  const onMouseUp = () => {
    setIsDrawing(false);
    setIsPanning(false);
    const context = canvasRef.current?.getContext("2d");
    if (context) context.beginPath();
  };

  const draw = (event: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !isAnnotating || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    if (!context) return;

    const rect = canvas.getBoundingClientRect();
    const pointX =
      ("clientX" in event
        ? (event as React.MouseEvent).clientX
        : (event as React.TouchEvent).touches[0].clientX) - rect.left;
    const pointY =
      ("clientY" in event
        ? (event as React.MouseEvent).clientY
        : (event as React.TouchEvent).touches[0].clientY) - rect.top;

    context.lineWidth = 20;
    context.strokeStyle = "rgba(239, 68, 68, 0.45)";
    context.lineTo(pointX, pointY);
    context.stroke();
    context.beginPath();
    context.moveTo(pointX, pointY);
  };

  const handleStop = () => {
    abortControllerRef.current?.abort();
    pendingOperationIdRef.current = null;
    generationBaselineVersionRef.current = null;
    generationStartedAtRef.current = null;
    setIsGenerating(false);
  };

  const handleSend = async () => {
    if (isGenerating) return;

    const trimmedPrompt = prompt.trim();
    if (trimmedPrompt.length < PROMPT_MIN_LENGTH) {
      setError(`Prompt must be at least ${PROMPT_MIN_LENGTH} characters.`);
      return;
    }

    if (hasAgeInput && !isAgeValid) {
      setError(`Age must be a whole number between ${AGE_MIN} and ${AGE_MAX}.`);
      return;
    }

    setError(null);
    const currentTopVersion = versions.length > 0 ? versions[0].version_number : 0;
    generationBaselineVersionRef.current = currentTopVersion;
    generationStartedAtRef.current = Date.now();
    pendingOperationIdRef.current = null;
    setIsGenerating(true);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    const selectedModel = MODEL_MAPPING[activeModel] || "seedream_v5";
    const isEditMode = attachments.length > 0 || Boolean(maskImageUrl);

    const orderedReferenceImages: string[] = [];
    if (maskImageUrl && activeVersion) {
      orderedReferenceImages.push(activeVersion.image_url);
    }
    orderedReferenceImages.push(...attachments.map((attachment) => attachment.url));

    const payload = isEditMode
      ? {
          prompt: trimmedPrompt,
          model: selectedModel,
          aspect_ratio: generationAspect,
          ...(hasAgeInput ? { age: parsedAge } : {}),
          reference_image_urls: orderedReferenceImages,
          mask_image_url:
            selectedModel === "openai_image_1_5" && maskImageUrl ? maskImageUrl : undefined,
        }
      : {
          prompt: trimmedPrompt,
          model: selectedModel,
          aspect_ratio: generationAspect,
          ...(hasAgeInput ? { age: parsedAge } : {}),
        };

    try {
      const response = isEditMode
        ? await editBaseImage(avatarId, payload, controller.signal)
        : await generateBaseImage(avatarId, payload, controller.signal);
      pendingOperationIdRef.current = response.operation_id;

    } catch (loadError) {
      if (loadError instanceof Error && loadError.name === "AbortError") {
        pendingOperationIdRef.current = null;
        generationBaselineVersionRef.current = null;
        generationStartedAtRef.current = null;
        setIsGenerating(false);
      } else {
        pendingOperationIdRef.current = null;
        generationBaselineVersionRef.current = null;
        generationStartedAtRef.current = null;
        setError(loadError instanceof Error ? loadError.message : "Failed to start generation.");
        setIsGenerating(false);
      }
    } finally {
      abortControllerRef.current = null;
    }
  };

  const handleSelectVersion = async (versionId: number) => {
    try {
      await setActiveBase(avatarId, versionId);
      await fetchVersions();
      setActiveVersionId(versionId);
      setError(null);
    } catch (selectionError) {
      const message =
        selectionError instanceof Error
          ? selectionError.message
          : "Failed to set active base image.";

      if (message.toLowerCase().includes("invalidate")) {
        const confirmed = window.confirm(
          "Changing base image will invalidate references, training, and reactions. Continue?"
        );

        if (confirmed) {
          try {
            await setActiveBase(avatarId, versionId, { confirmInvalidation: true });
            await fetchVersions();
            setActiveVersionId(versionId);
            setError(null);
            return;
          } catch (retryError) {
            setError(
              retryError instanceof Error
                ? retryError.message
                : "Failed to set active base image."
            );
            return;
          }
        }
      }

      setError(message);
    }
  };

  const handlePromptKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      void handleSend();
    }
  };

  const onDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    if (!isDraggingFiles) setIsDraggingFiles(true);
  };

  const onDragLeave = (event: React.DragEvent) => {
    if (event.currentTarget.contains(event.relatedTarget as Node)) return;
    setIsDraggingFiles(false);
  };

  const onDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDraggingFiles(false);
    void handleFileUpload(event.dataTransfer.files);
  };

  return (
    <div
      className="relative flex h-full min-h-0 flex-col overflow-hidden"
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-[#f6f9f7] via-[#f4f8f6] to-[#edf3ef]" />
      <div className="absolute inset-0 z-0 opacity-[0.03] grain-texture" />

      {isDraggingFiles && (
        <div className="absolute inset-4 z-50 flex items-center justify-center rounded-[28px] border-2 border-dashed border-[#3c9f95]/70 bg-[#ecf6f3]/90 backdrop-blur">
          <div className="rounded-xl border border-[#cce3de] bg-white/85 px-5 py-4 text-center">
            <p className="text-sm font-semibold text-[#1a3a2a]">Drop images to attach</p>
            <p className="mt-1 text-xs text-[#5c6d66]">PNG, JPG, WEBP supported</p>
          </div>
        </div>
      )}

      <div className="relative z-10 flex min-h-0 flex-1 items-center justify-center px-3 pb-5 pt-4 md:px-8 md:pt-8">
        <div className="relative flex h-full w-full max-w-6xl items-center justify-center">
          <div
            ref={containerRef}
            className={cn(
              "relative max-h-full max-w-full overflow-hidden rounded-[28px] border border-[#d6dbd4] bg-white shadow-[0_20px_45px_-26px_rgba(0,0,0,0.4)]",
              getAspectFrameClass(previewAspect)
            )}
            style={{ cursor: scale > 1 && !isAnnotating ? (isPanning ? "grabbing" : "grab") : isAnnotating ? "crosshair" : "default" }}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseUp}
          >
            {!activeVersion && !isGenerating && (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#f8fbf9] to-[#eaf1ed]">
                <div className="rounded-2xl border border-[#dfe8e2] bg-white/88 px-8 py-8 text-center shadow-sm">
                  <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-[#f2f8f5] text-[#3c9f95]">
                    <span className="material-symbols-outlined text-[20px]">auto_awesome</span>
                  </div>
                  <p className="text-sm font-semibold text-[#1a3a2a]">First Pass Generation</p>
                  <p className="mt-1 text-xs text-[#5c6d66]">Write a detailed prompt below to create your base face.</p>
                </div>
              </div>
            )}

            {activeVersion && (
              <div
                className="absolute inset-0 transition-transform duration-300"
                style={{
                  transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
                  width: "100%",
                  height: "100%",
                }}
              >
                <Image
                  src={activeVersion.image_url}
                  fill
                  alt="Current avatar version"
                  className="h-full w-full object-cover"
                  priority
                />
                <canvas
                  ref={canvasRef}
                  className={cn(
                    "absolute inset-0 z-10 h-full w-full transition-opacity duration-300",
                    isAnnotating ? "opacity-100" : "pointer-events-none opacity-0"
                  )}
                />
              </div>
            )}

            {isGenerating && (
              <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/30 backdrop-blur-lg">
                <div
                  className="relative rounded-2xl border border-white/40 bg-white/20 px-6 py-5 text-center shadow-2xl backdrop-blur-2xl"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
                    backgroundBlendMode: "overlay",
                  }}
                >
                  <div className="relative mx-auto h-6 w-6 animate-spin rounded-full border-2 border-[#3c9f95] border-t-transparent" />
                  <p className="relative mt-3 text-sm font-semibold text-white drop-shadow">
                    {activeVersion ? "Refining visual" : "Generating visual"}
                  </p>
                  <button
                    type="button"
                    onClick={handleStop}
                    className="relative mt-3 inline-flex h-8 items-center justify-center rounded-full border border-white/30 bg-white/20 px-4 text-[10px] font-bold uppercase tracking-[0.16em] text-white backdrop-blur-sm hover:bg-white/30"
                  >
                    Stop
                  </button>
                </div>
              </div>
            )}

            {isAnnotating && (
              <div className="absolute left-4 top-4 z-30 rounded-full border border-white/20 bg-[#1a3a2a]/80 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-white backdrop-blur">
                Mask Mode Active
              </div>
            )}
          </div>

          <ToolRail
            isAnnotating={isAnnotating}
            hasMaskImage={Boolean(maskImageUrl)}
            scale={scale}
            hasActiveVersion={Boolean(activeVersion)}
            onAction={(action) => {
              void handleToolAction(action);
            }}
          />

          <VersionStrip
            versions={versions}
            activeVersionId={activeVersionId}
            onSelect={(versionId) => {
              void handleSelectVersion(versionId);
            }}
          />
        </div>
      </div>

      {error && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="mx-4 rounded-2xl border border-red-200 bg-white p-6 shadow-2xl max-w-sm">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-red-500">error</span>
              <div className="flex-1">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setError(null)}
                className="rounded-lg bg-red-100 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-200"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="relative z-20 px-3 pb-4 md:px-8 md:pb-7">
        <div className="mx-auto w-full max-w-5xl">

          <div className="relative">
            <div className={cn(pipelinePanelClass, "relative overflow-visible border-[#d6dbd4] bg-white px-4 py-3 md:px-5") }>
              <div className="pointer-events-none absolute -top-16 left-4 z-30 md:left-8">
                <div className="pointer-events-auto">
                  <AttachmentStrip
                    attachments={attachments}
                    isUploading={isUploading}
                    onRemove={(attachmentId) => {
                      void handleRemoveAttachment(attachmentId);
                    }}
                  />
                </div>
              </div>
              <div className="flex items-end gap-3">
                <div className="flex-1">
                  <label htmlFor="avatar-prompt" className="sr-only">
                    Visual prompt
                  </label>
                  <textarea
                    ref={promptTextareaRef}
                    id="avatar-prompt"
                    value={prompt}
                    onChange={(event) => setPrompt(event.target.value)}
                    onKeyDown={handlePromptKeyDown}
                    rows={1}
                    placeholder="Describe the avatar visual in detail..."
                    disabled={isGenerating}
                    className="max-h-36 min-h-[42px] w-full resize-none rounded-xl border border-[#d6dbd4] bg-[#fafcfb] px-4 py-2.5 text-sm text-[#1a3a2a] outline-none transition placeholder:text-[#8ca1c5] focus:border-[#3c9f95] focus:ring-2 focus:ring-[#3c9f95]/20 disabled:opacity-60"
                  />
                </div>

                {isGenerating ? (
                  <button
                    type="button"
                    onClick={handleStop}
                    className="flex h-11 w-11 items-center justify-center rounded-full bg-red-500 text-white transition hover:bg-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300"
                    aria-label="Stop generation"
                  >
                    <span className="material-symbols-outlined text-[18px]">stop</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      void handleSend();
                    }}
                    disabled={!isPromptValid || (hasAgeInput && !isAgeValid)}
                    className="flex h-11 w-11 items-center justify-center rounded-full bg-[#1a3a2a] text-white transition hover:bg-[#3c9f95] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3c9f95]/45 disabled:cursor-not-allowed disabled:opacity-30"
                    aria-label="Generate visual"
                  >
                    <span className="material-symbols-outlined text-[18px]">send</span>
                  </button>
                )}
              </div>

              {ageErrorMessage && (
                <p className="mt-2 text-[11px] font-medium text-red-600">{ageErrorMessage}</p>
              )}

              <div className="my-3 h-px w-full bg-[#edf2ee]" />

              <div className="flex flex-wrap items-center gap-2" ref={menusContainerRef}>
                <input
                  type="file"
                  id="visual-file-upload"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(event) => {
                    if (event.target.files) {
                      void handleFileUpload(event.target.files);
                      event.target.value = "";
                    }
                  }}
                />
                <label
                  htmlFor="visual-file-upload"
                  className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-[#d6dbd4] bg-[#f4f7f5] text-[#1a3a2a]/70 transition hover:border-[#3c9f95]/40 hover:text-[#1a3a2a]"
                  aria-label="Attach reference images"
                >
                  <span className="material-symbols-outlined text-[18px]">attach_file</span>
                </label>

                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setOpenMenu((previous) => (previous === "aspect" ? null : "aspect"))}
                    disabled={isGenerating}
                    aria-expanded={openMenu === "aspect"}
                    className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#d6dbd4] bg-[#f4f7f5] px-3 text-[11px] font-semibold text-[#1a3a2a] transition hover:border-[#3c9f95]/40 disabled:opacity-45"
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      {generationAspect === "1:1"
                        ? "crop_square"
                        : generationAspect === "16:9"
                          ? "crop_16_9"
                          : generationAspect === "4:3"
                            ? "crop_landscape"
                            : "crop_portrait"}
                    </span>
                    <span>{generationAspect}</span>
                    <span className="material-symbols-outlined text-[14px]">expand_more</span>
                  </button>

                  {openMenu === "aspect" && (
                    <div className="absolute bottom-[calc(100%+8px)] left-0 z-40 w-36 rounded-xl border border-[#d6dbd4] bg-white p-1 shadow-lg">
                      {SUPPORTED_ASPECT_RATIOS.map((ratio) => (
                        <button
                          key={ratio}
                          type="button"
                          onClick={() => {
                            setGenerationAspect(ratio);
                            hasInitializedGenerationAspectRef.current = true;
                            setOpenMenu(null);
                          }}
                          className={cn(
                            "flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-[11px] font-semibold transition",
                            ratio === generationAspect
                              ? "bg-[#eaf4f2] text-[#1a3a2a]"
                              : "text-[#5c6d66] hover:bg-[#f4f7f5]"
                          )}
                        >
                          <span className="material-symbols-outlined text-[14px]">
                            {ratio === "1:1"
                              ? "crop_square"
                              : ratio === "16:9"
                                ? "crop_16_9"
                                : ratio === "4:3"
                                  ? "crop_landscape"
                                  : "crop_portrait"}
                          </span>
                          <span>{ratio}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setOpenMenu((previous) => (previous === "model" ? null : "model"))}
                    disabled={isGenerating}
                    aria-expanded={openMenu === "model"}
                    className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#d6dbd4] bg-[#f4f7f5] px-3 text-[11px] font-semibold text-[#1a3a2a] transition hover:border-[#3c9f95]/40 disabled:opacity-45"
                  >
                    <span className="material-symbols-outlined text-[16px]">neurology</span>
                    <span>{activeModel}</span>
                    <span className="material-symbols-outlined text-[14px]">expand_more</span>
                  </button>

                  {openMenu === "model" && (
                    <div className="absolute bottom-[calc(100%+8px)] left-0 z-40 w-44 rounded-xl border border-[#d6dbd4] bg-white p-1 shadow-lg">
                      {MODEL_OPTIONS.map((model) => (
                        <button
                          key={model}
                          type="button"
                          onClick={() => {
                            setActiveModel(model);
                            setOpenMenu(null);
                          }}
                          className={cn(
                            "w-full rounded-lg px-2.5 py-2 text-left text-[11px] font-semibold transition",
                            model === activeModel
                              ? "bg-[#eaf4f2] text-[#1a3a2a]"
                              : "text-[#5c6d66] hover:bg-[#f4f7f5]"
                          )}
                        >
                          {model}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#d6dbd4] bg-[#f4f7f5] px-3 transition">
                  <span className="material-symbols-outlined text-[16px] text-[#5c6d66]">person</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="Age 1-120"
                    value={age}
                    onChange={(event) => setAge(sanitizeAgeInput(event.target.value))}
                    disabled={isGenerating}
                    onWheel={(event) => (event.target as HTMLInputElement).blur()}
                    className="w-24 appearance-none border-0 bg-transparent p-0 text-[12px] font-semibold text-[#1a3a2a] shadow-none outline-none ring-0 placeholder:text-[#8ca1c5] focus:border-0 focus:outline-none focus:ring-0 focus-visible:outline-none disabled:bg-transparent"
                  />
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
