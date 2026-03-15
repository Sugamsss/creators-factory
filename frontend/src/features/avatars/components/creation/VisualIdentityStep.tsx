"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
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
  type VisualVersion,
} from "@/features/avatars/services/avatarApi";
import type { Attachment } from "@/features/avatars/types";

interface VisualIdentityStepProps {
  avatarId: string;
}

type AspectRatio = "1:1" | "3:4" | "4:3" | "9:16" | "16:9";

const MODEL_MAPPING = {
  "ChatGPT": "openai_image_1_5",
  "Nano Banana": "google_nano_banana_2",
  "Seedream v5 Lite": "seedream_v5"
} as const;

const REVERSE_MODEL_MAPPING: Record<string, string> = {
  "openai_image_1_5": "ChatGPT",
  "google_nano_banana_2": "Nano Banana",
  "seedream_v5": "Seedream v5 Lite"
};
const SUPPORTED_ASPECT_RATIOS: AspectRatio[] = ["1:1", "3:4", "9:16", "4:3", "16:9"];

const isAspectRatio = (value: string): value is AspectRatio =>
  SUPPORTED_ASPECT_RATIOS.includes(value as AspectRatio);

export function VisualIdentityStep({ avatarId }: VisualIdentityStepProps) {
  const [activeAspect, setActiveAspect] = useState<AspectRatio>("16:9");
  const [activeModel, setActiveModel] = useState("Seedream v5 Lite");
  const [age, setAge] = useState<string>("");
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [versions, setVersions] = useState<VisualVersion[]>([]);
  const [activeVersionId, setActiveVersionId] = useState<number | null>(null);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isAnnotating, setIsAnnotating] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const activeVersion = versions.find(v => v.id === activeVersionId) || versions[0];

  const fetchVersions = useCallback(async () => {
    try {
      const data = await getVisualVersions(avatarId);
      setVersions(data);
      if (data.length > 0) {
        const active = data.find((v: VisualVersion) => v.is_active_base) || data[0];
        setActiveVersionId(active.id);
        if (isAspectRatio(active.aspect_ratio)) {
          setActiveAspect(active.aspect_ratio);
        }
        setActiveModel(REVERSE_MODEL_MAPPING[active.model_used] || active.model_used);
      }
    } catch (error) {
      console.error("Failed to fetch versions:", error);
    }
  }, [avatarId]);

  const fetchAvatarBasics = useCallback(async () => {
    try {
      const avatar = await getAvatar(Number(avatarId));
      if (avatar.age) {
        setAge(String(avatar.age));
      }
    } catch (loadError) {
      console.error("Failed to fetch avatar basics:", loadError);
    }
  }, [avatarId]);

  const fetchAttachmentData = useCallback(async () => {
    try {
      const data = await getAttachments(avatarId);
      setAttachments(data);
    } catch (loadError) {
      console.error("Failed to fetch attachments:", loadError);
    }
  }, [avatarId]);

  useEffect(() => {
    void fetchVersions();
    void fetchAttachmentData();
    void fetchAvatarBasics();
  }, [fetchAttachmentData, fetchAvatarBasics, fetchVersions]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const rect = parent.getBoundingClientRect();
      const scaleFactor = window.devicePixelRatio || 1;
      canvas.width = rect.width * scaleFactor;
      canvas.height = rect.height * scaleFactor;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(scaleFactor, scaleFactor);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }
    };

    if (isAnnotating) {
      resizeCanvas();
      window.addEventListener('resize', resizeCanvas);
    }

    return () => window.removeEventListener('resize', resizeCanvas);
  }, [isAnnotating, activeVersionId]);

  const handleSend = async () => {
    if (!prompt.trim() || isGenerating) return;
    const parsedAge = Number(age);
    if (!Number.isInteger(parsedAge) || parsedAge < 1 || parsedAge > 120) {
      setError("Age is required and must be a whole number between 1 and 120.");
      return;
    }

    setIsGenerating(true);
    setError(null);
    abortControllerRef.current = new AbortController();

    try {
      const isEditMode = attachments.length > 0 || !!activeVersion;
      const selectedModel =
        MODEL_MAPPING[activeModel as keyof typeof MODEL_MAPPING] || "seedream_v5";
      const orderedReferenceImages: string[] = [];
      if (activeVersion) {
        orderedReferenceImages.push(activeVersion.image_url);
      }
      orderedReferenceImages.push(...attachments.map((attachment) => attachment.url));
      
      const payload = isEditMode
        ? {
            prompt,
            model: selectedModel,
            aspect_ratio: activeAspect,
            age: parsedAge,
            reference_image_urls: orderedReferenceImages,
          }
        : {
            prompt,
            model: selectedModel,
            aspect_ratio: activeAspect,
            age: parsedAge,
          };

      let data;
      try {
        data = isEditMode
          ? await editBaseImage(avatarId, payload, abortControllerRef.current.signal)
          : await generateBaseImage(avatarId, payload, abortControllerRef.current.signal);
      } catch (err) {
        console.log("API call returned error, fetching versions...");
        const currentVersions = await getVisualVersions(avatarId);
        if (currentVersions.length > 0) {
          data = {
            version_id: currentVersions[0].id,
            version_number: currentVersions[0].version_number,
            image_url: currentVersions[0].image_url,
            prompt: currentVersions[0].prompt,
            model: currentVersions[0].model_used,
            aspect_ratio: currentVersions[0].aspect_ratio,
          };
        }
      }
      
      if (data) {
        setActiveVersionId(data.version_id);
        setScale(1);
        setOffset({ x: 0, y: 0 });
        
        if (data.aspect_ratio && isAspectRatio(data.aspect_ratio)) {
          setActiveAspect(data.aspect_ratio);
        }
        
        setVersions(prev => [{
          id: data.version_id,
          version_number: data.version_number,
          image_url: data.image_url,
          prompt: data.prompt,
          model_used: data.model,
          aspect_ratio: data.aspect_ratio,
          is_active_base: true,
          is_edit: isEditMode,
          created_at: new Date().toISOString(),
        }, ...prev]);
      }
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        console.log("Generation aborted");
      } else {
        console.error("Generation error:", error);
        setError(error instanceof Error ? error.message : "Generation failed");
      }
    } finally {
      setIsGenerating(false);
      abortControllerRef.current = null;
    }
  };

  const handleFileUpload = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const imageFiles = fileArray.filter(f => f.type.startsWith('image/'));
    
    if (imageFiles.length === 0) return;
    
    setIsUploading(true);
    setError(null);
    
    try {
      for (const file of imageFiles) {
        const attachment = await attachImage(avatarId, file);
        setAttachments(prev => [...prev, attachment]);
      }
    } catch (error) {
      console.error("Failed to upload files:", error);
      setError(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveAttachment = async (attachmentId: number) => {
    try {
      await deleteAttachment(avatarId, attachmentId);
      
      setAttachments(prev => {
        return prev.filter(a => a.id !== attachmentId);
      });
    } catch (error) {
      console.error("Failed to remove attachment:", error);
      setError(error instanceof Error ? error.message : "Delete failed");
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    handleFileUpload(e.dataTransfer.files);
  };

  const handleToolAction = async (tool: string) => {
    switch (tool) {
      case 'brush':
        if (isAnnotating) {
          await attachAnnotatedImage();
        }
        setIsAnnotating(prev => !prev);
        break;
      case 'add':
        setScale(prev => Math.min(prev + 0.25, 3));
        break;
      case 'remove':
        setScale(prev => {
          const newScale = Math.max(prev - 0.25, 1);
          if (newScale === 1) {
            setOffset({ x: 0, y: 0 });
          }
          return newScale;
        });
        break;
      case 'download':
        if (activeVersion) {
          const link = document.createElement('a');
          link.href = activeVersion.image_url;
          link.download = `avatar-v${activeVersion.version_number}.png`;
          link.target = '_blank';
          link.click();
        }
        break;
      case 'delete':
        if (activeVersion) {
          try {
            const currentVersionId = activeVersion.id;
            const wasLastVersion = versions.length === 1;
            await deleteVisualVersion(avatarId, currentVersionId);
            await fetchVersions();
            if (wasLastVersion) {
              setActiveVersionId(null);
              setScale(1);
              setOffset({ x: 0, y: 0 });
            }
          } catch (err) {
            console.error("Failed to delete version:", err);
          }
        }
        break;
      case 'attach':
        if (activeVersion) {
          try {
            const response = await fetch(activeVersion.image_url);
            const blob = await response.blob();
            const file = new File([blob], `avatar-v${activeVersion.version_number}.png`, { type: 'image/png' });
            const attachment = await attachImage(avatarId, file);
            setAttachments(prev => [...prev, attachment]);
          } catch (err) {
            console.error("Failed to attach image:", err);
          }
        }
        break;
    }
  };

  const attachAnnotatedImage = async () => {
    if (!activeVersion || !canvasRef.current) return;
    
    try {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const imageElement = new window.Image();
      imageElement.crossOrigin = "anonymous";
      
      await new Promise<void>((resolve, reject) => {
        imageElement.onload = () => resolve();
        imageElement.onerror = reject;
        imageElement.src = activeVersion.image_url;
      });

      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = imageElement.naturalWidth;
      tempCanvas.height = imageElement.naturalHeight;
      const tempCtx = tempCanvas.getContext('2d');
      if (!tempCtx) return;

      tempCtx.drawImage(imageElement, 0, 0);
      
      const scaleX = canvas.width / (canvas.offsetWidth || canvas.offsetWidth);
      const scaleY = canvas.height / (canvas.offsetHeight || canvas.offsetHeight);
      
      tempCtx.drawImage(canvas, 0, 0, canvas.width, canvas.height, 0, 0, tempCanvas.width, tempCanvas.height);

      tempCanvas.toBlob(async (blob) => {
        if (!blob) return;
        const file = new File([blob], 'annotation.png', { type: 'image/png' });
        const attachment = await attachImage(avatarId, file);
        setAttachments(prev => [...prev, attachment]);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }, 'image/png');
    } catch (err) {
      console.error("Failed to attach annotated image:", err);
    }
  };

  const onMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (scale > 1) {
      setIsPanning(prev => !prev);
      setLastMousePos({ x: e.clientX, y: e.clientY });
      e.preventDefault();
    } else if (isAnnotating) {
      setIsDrawing(true);
      draw(e);
    }
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (isPanning && scale > 1) {
      const dx = e.clientX - lastMousePos.x;
      const dy = e.clientY - lastMousePos.y;
      setOffset(prev => ({ x: prev.x + dx, y: prev.y + dy }));
      setLastMousePos({ x: e.clientX, y: e.clientY });
    } else if (isDrawing) {
      draw(e);
    }
  };

  const onMouseUp = () => {
    setIsDrawing(false);
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) ctx.beginPath();
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !isAnnotating || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = (('clientX' in e ? (e as React.MouseEvent).clientX : (e as React.TouchEvent).touches[0].clientX) - rect.left);
    const y = (('clientY' in e ? (e as React.MouseEvent).clientY : (e as React.TouchEvent).touches[0].clientY) - rect.top);

    ctx.lineWidth = 20;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.5)';

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsGenerating(false);
  };

  const getCursorStyle = () => {
    if (scale > 1) {
      return isPanning ? 'grabbing' : 'grab';
    }
    if (isAnnotating) {
      return 'crosshair';
    }
    return 'default';
  };

  const parsedAge = Number(age);
  const isAgeValid = Number.isInteger(parsedAge) && parsedAge >= 1 && parsedAge <= 120;

  return (
    <div 
      className="h-full flex flex-col overflow-hidden relative group/workspace bg-transparent"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* Heavy Noise Texture & Frosted Glass Base */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute inset-0 bg-[#f8faf9]/60 backdrop-blur-[100px]" />
        <div 
          className="absolute inset-0 opacity-[0.4] mix-blend-soft-light"
          style={{ 
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`
          }}
        />
        <div 
          className="absolute inset-0 opacity-[0.2] mix-blend-overlay"
          style={{ 
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n2'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.4' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n2)'/%3E%3C/svg%3E")`
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-[#1a3a2a]/0 via-transparent to-[#3c9f95]/5 opacity-40" />
      </div>
      
      {/* ─── Fixed-Position UI Layer ─── */}
      <div className="absolute top-0 left-0 right-0 bottom-[140px] z-30 pointer-events-none">
        {/* Floating Tools Rail */}
        <div className="absolute right-8 top-1/2 -translate-y-1/2 flex flex-col gap-2 p-1.5 rounded-full bg-white/80 backdrop-blur-md border border-[#e4ebe4] shadow-2xl pointer-events-auto">
          {[
            { icon: "brush", label: "Brush", action: "brush", active: isAnnotating },
            { icon: "add", label: "Zoom In", action: "add", disabled: scale >= 3 },
            { icon: "remove", label: "Zoom Out", action: "remove", disabled: scale <= 1 },
            { icon: "download", label: "Download", action: "download" },
            { icon: "delete", label: "Delete", action: "delete", disabled: !activeVersion },
            { icon: "attach_file", label: "Attach", action: "attach", disabled: !activeVersion },
          ].map((tool) => (
            <button
              key={tool.label}
              title={tool.label}
              aria-label={tool.label}
              aria-pressed={Boolean(tool.active)}
              onClick={() => handleToolAction(tool.action)}
              disabled={Boolean(tool.disabled)}
              className={`flex items-center justify-center rounded-full transition-all duration-200 disabled:opacity-30 disabled:hover:scale-100
                ${tool.active 
                  ? 'bg-[#1a3a2a] text-white shadow-lg scale-110' 
                  : 'text-[#1a3a2a]/60 border border-transparent hover:border-[#3c9f95] hover:text-[#3c9f95] hover:bg-white hover:scale-110'}`}
              style={{ width: 36, height: 36 }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                {tool.icon}
              </span>
            </button>
          ))}
        </div>

        {/* History Pill - Showing real versions */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 pointer-events-auto">
          <div className="flex items-center gap-2 px-2 py-1.5 rounded-full bg-white/90 backdrop-blur-xl border border-[#e4ebe4] shadow-[0_8px_32px_-4px_rgba(0,0,0,0.1)] overflow-x-auto max-w-[400px] no-scrollbar">
            {versions.length === 0 ? (
              <div className="px-4 py-1 text-[10px] font-bold text-[#8ca1c5] uppercase tracking-wider">No history yet</div>
            ) : (
              versions.map((v) => (
                <motion.button
                  key={v.id}
                  onClick={async () => {
                    try {
                      await setActiveBase(avatarId, v.id);
                      await fetchVersions();
                      setActiveVersionId(v.id);
                      if (isAspectRatio(v.aspect_ratio)) {
                        setActiveAspect(v.aspect_ratio);
                      }
                      setError(null);
                    } catch (selectionError) {
                      setError(
                        selectionError instanceof Error
                          ? selectionError.message
                          : "Failed to set active base image"
                      );
                    }
                  }}
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="relative rounded-lg overflow-hidden border transition-all duration-200 shrink-0"
                  style={{
                    width: 32,
                    height: 32,
                    borderColor: activeVersionId === v.id ? "#3c9f95" : "transparent",
                    opacity: activeVersionId === v.id ? 1 : 0.6,
                  }}
                >
                  <Image src={v.image_url} width={32} height={32} className="w-full h-full object-cover" alt={`Version ${v.version_number}`} />
                </motion.button>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ─── Canvas Workspace ─── */}
      <div 
        className="flex-1 min-h-0 relative flex items-center justify-center pointer-events-none p-12 overflow-hidden"
      >
        <div className="w-full h-full relative flex items-center justify-center">
          <AnimatePresence mode="wait">
            {/* Empty State - Glass with Grain */}
            {!activeVersion && !isGenerating && (
              <motion.div
                key="empty-frame"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full h-full flex items-center justify-center"
              >
                <div 
                  className={`relative max-w-full max-h-full overflow-hidden rounded-2xl shadow-lg pointer-events-auto
                    ${activeAspect === '1:1' ? 'aspect-square h-full' : 
                      activeAspect === '3:4' ? 'aspect-[3/4] h-full' : 
                      activeAspect === '9:16' ? 'aspect-[9/16] h-full' : 
                      activeAspect === '4:3' ? 'aspect-[4/3] w-full' : 
                      'aspect-[16/9] w-full'}`}
                >
                  {/* Base gradient */}
                  <div className="absolute inset-0 bg-gradient-to-br from-[#f5f7f6] to-[#e4ebe8]" />
                  
                  {/* Grain overlay - stationary */}
                  <div className="absolute inset-0 grain-texture opacity-[0.025] pointer-events-none" />

                  {/* Content */}
                  <div className="relative z-10 flex flex-col items-center justify-center h-full gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/60 backdrop-blur-sm border border-white/30 shadow-sm flex items-center justify-center text-[#3c9f95]">
                      <span className="material-symbols-outlined !text-[18px]">auto_awesome</span>
                    </div>
                    <div className="text-center px-4">
                      <p className="text-[#1a3a2a] text-xs font-semibold tracking-wide">First Pass Generation</p>
                      <p className="text-[#8ca1c5] text-[10px] mt-0.5">describe the Avatar you want to see below</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {(activeVersion || isGenerating) && (
              <div className="w-full h-full flex items-center justify-center">
                {/* Frame */}
                <div 
                  ref={containerRef}
                  className={`relative max-w-full max-h-full overflow-hidden rounded-2xl shadow-lg pointer-events-auto
                    ${activeAspect === '1:1' ? 'aspect-square h-full' : 
                      activeAspect === '3:4' ? 'aspect-[3/4] h-full' : 
                      activeAspect === '9:16' ? 'aspect-[9/16] h-full' : 
                      activeAspect === '4:3' ? 'aspect-[4/3] w-full' : 
                      'aspect-[16/9] w-full'}`}
                  style={{ cursor: getCursorStyle() }}
                  onMouseDown={onMouseDown}
                  onMouseMove={onMouseMove}
                  onMouseUp={onMouseUp}
                  onMouseLeave={onMouseUp}
                >
                  {/* Loading overlay - First generation (no image yet) */}
                  {isGenerating && !activeVersion && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 z-[55] flex flex-col items-center justify-center"
                    >
                      {/* Base gradient */}
                      <div className="absolute inset-0 bg-gradient-to-br from-[#f5f7f6] to-[#e4ebe8]" />
                      
                      {/* Grain overlay - animated */}
                      <motion.div 
                        className="absolute inset-0 grain-texture opacity-[0.03] pointer-events-none"
                        animate={{ opacity: [0.02, 0.04, 0.02] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                      />

                      <div className="relative z-10 flex flex-col items-center gap-4">
                        <div className="relative">
                          <div className="w-14 h-14 rounded-full border-2 border-[#3c9f95]/30" />
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            className="absolute inset-0 flex items-center justify-center"
                          >
                            <div className="w-10 h-10 rounded-full border-2 border-t-[#3c9f95] border-transparent" />
                          </motion.div>
                        </div>
                        <div className="text-center">
                          <p className="text-[#1a3a2a] text-sm font-semibold">Creating</p>
                          <p className="text-[#8ca1c5] text-[10px] mt-0.5">Generation in progress</p>
                        </div>
                        <motion.button
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          onClick={handleStop}
                          className="px-4 py-1.5 rounded-full bg-white/80 text-red-500 text-[10px] font-semibold border border-red-100 shadow-sm transition-all hover:bg-red-50"
                        >
                          Abort
                        </motion.button>
                      </div>
                    </motion.div>
                  )}

                  {/* Loading overlay - Edit mode (image exists, generating) */}
                  {isGenerating && activeVersion && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 z-[55] flex items-end justify-center pb-4 pointer-events-auto bg-black/20"
                    >
                      <div className="bg-white/90 backdrop-blur-sm rounded-full px-3 py-1.5 shadow-md flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full border-2 border-t-[#3c9f95] border-transparent animate-spin" />
                        <span className="text-[#1a3a2a] text-[9px] font-semibold">Refining</span>
                      </div>
                    </motion.div>
                  )}

                  {/* Image container - This moves with zoom/pan */}
                  {activeVersion && (
                    <div 
                      className="absolute inset-0 transition-transform duration-300"
                      style={{ 
                        transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
                        width: '100%',
                        height: '100%',
                      }}
                    >
                      <Image
                        src={activeVersion.image_url}
                        fill
                        className="w-full h-full object-cover"
                        alt="Current Version"
                        priority
                      />

                      {/* Annotation Canvas Overlay */}
                      <canvas
                        ref={canvasRef}
                        className={`absolute inset-0 w-full h-full z-10 transition-opacity duration-300
                          ${isAnnotating ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                      />
                    </div>
                  )}

                  {/* Mode Indicator */}
                  {isAnnotating && (
                    <div className="absolute top-6 left-6 z-20 px-4 py-2 rounded-full bg-[#1a3a2a]/80 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 border border-white/20">
                      <span className="w-2 h-2 rounded-full bg-[#3c9f95] animate-pulse" />
                      Annotation Mode
                    </div>
                  )}
                </div>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ─── Command Center ─── */}
      <div className="px-8 pb-12 relative z-40 shrink-0">
        <div className="max-w-2xl mx-auto flex flex-col gap-3">
          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}
          <div className="bg-white/95 backdrop-blur-2xl rounded-[28px] border border-[#e4ebe4] shadow-[0_24px_56px_-12px_rgba(0,0,0,0.1)]">
            
            {/* Main Prompt Input Area */}
            <div className="flex items-center gap-4 px-6 py-3">
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Evoke a sense of ethereal presence..."
                disabled={isGenerating}
                className="flex-1 bg-transparent border-none outline-none focus:outline-none focus:ring-0 text-[15px] font-medium text-[#1a3a2a] placeholder:text-[#8ca1c5] disabled:opacity-50"
              />
              {isGenerating ? (
                <button 
                  onClick={handleStop}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600 transition-all shadow-lg shadow-red-500/20 flex-shrink-0"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 20 }}>stop</span>
                </button>
              ) : (
                <button 
                  onClick={handleSend}
                  disabled={!prompt.trim() || !isAgeValid}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1a3a2a] text-white hover:bg-[#3c9f95] transition-all shadow-lg shadow-[#1a3a2a]/20 flex-shrink-0 disabled:opacity-30 disabled:grayscale"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 20 }}>send</span>
                </button>
              )}
            </div>

            {/* Attachments Display */}
            {attachments.length > 0 && (
              <div className="flex items-center gap-2 px-6 py-3 overflow-x-auto">
                {attachments.map((attachment) => (
                  <div key={attachment.id} className="relative group shrink-0">
                    <Image
                      src={attachment.url}
                      alt={attachment.filename}
                      width={48}
                      height={48}
                      className="w-12 h-12 rounded-lg object-cover border-2 border-[#3c9f95]"
                    />
                    <button
                      onClick={() => handleRemoveAttachment(attachment.id)}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                ))}
                {isUploading && (
                  <div className="w-12 h-12 rounded-lg border-2 border-dashed border-[#3c9f95] flex items-center justify-center">
                    <div className="w-4 h-4 border-2 border-[#3c9f95] border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>
            )}

            {attachments.length > 0 && <div className="h-px mx-6 bg-[#f0f3f0]" />}

            <div className="h-px mx-6 bg-[#f0f3f0]" />

            {/* Quick Settings Row */}
            <div className="flex items-center gap-2 px-6 py-2">
              <input
                type="file"
                id="file-upload"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
              />
              <label 
                htmlFor="file-upload"
                className="h-8 w-8 flex items-center justify-center rounded-xl bg-[#f4f7f5] text-[#8ca1c5] hover:bg-[#e4ebe4] hover:text-[#1a3a2a] transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>attach_file</span>
              </label>

              <div className="h-5 w-px bg-[#f0f3f0] mx-1" />

              {/* Aspect Ratio */}
              <div className="relative group">
                <button 
                  disabled={isGenerating}
                  className="flex items-center gap-2 px-3 h-8 rounded-xl bg-[#f4f7f5] text-[#1a3a2a] hover:bg-[#e4ebe4] transition-all disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[#8ca1c5]" style={{ fontSize: 18 }}>
                    {activeAspect === "1:1" ? "crop_square" : (activeAspect === "9:16" || activeAspect === "3:4") ? "crop_portrait" : activeAspect === "16:9" ? "crop_16_9" : "crop_landscape"}
                  </span>
                  <span className="text-[10px] font-bold tracking-wider">{activeAspect}</span>
                  <span className="material-symbols-outlined text-[#8ca1c5]" style={{ fontSize: 14 }}>expand_more</span>
                </button>
                <div className="absolute bottom-full left-0 hidden group-hover:block pt-8 -mt-8 z-50">
                  <div className="mb-2 w-32 bg-white rounded-xl border border-[#e4ebe4] shadow-xl p-1">
                  {SUPPORTED_ASPECT_RATIOS.map((ratio) => (
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

              {/* Model */}
              <div className="relative group">
                <button 
                  disabled={isGenerating}
                  className="flex items-center gap-2 px-3 h-8 rounded-xl bg-[#f4f7f5] text-[#1a3a2a] hover:bg-[#e4ebe4] transition-all disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[#8ca1c5]" style={{ fontSize: 18 }}>neurology</span>
                  <span className="text-[10px] font-bold tracking-wider">{activeModel}</span>
                  <span className="material-symbols-outlined text-[#8ca1c5]" style={{ fontSize: 14 }}>expand_more</span>
                </button>
                <div className="absolute bottom-full left-0 hidden group-hover:block pt-8 -mt-8 z-50">
                  <div className="mb-2 w-40 bg-white rounded-xl border border-[#e4ebe4] shadow-xl p-1">
                  {["ChatGPT", "Nano Banana", "Seedream v5 Lite"].map((model) => (
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

              {/* Age */}
              <div className="flex items-center gap-2 px-3 h-8 rounded-xl bg-[#f4f7f5]">
                <span className="material-symbols-outlined text-[#8ca1c5]" style={{ fontSize: 18 }}>person</span>
                <input 
                  type="number" 
                  placeholder="Age"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  min={1}
                  max={120}
                  disabled={isGenerating}
                  className="w-12 bg-transparent border-none outline-none focus:outline-none focus:ring-0 text-[10px] font-bold tracking-wider text-[#1a3a2a] placeholder:text-[#8ca1c5] disabled:opacity-50"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
