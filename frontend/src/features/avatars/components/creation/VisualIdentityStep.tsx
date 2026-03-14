"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  attachImage,
  deleteAttachment,
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
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [maskHistory, setMaskHistory] = useState<string[]>([]);
  const [maskFuture, setMaskFuture] = useState<string[]>([]);
  
  // Canvas & Transformation State
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [brushMode, setBrushMode] = useState<'brush' | 'eraser' | 'pan' | null>(null);
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
    if (!canvas || (brushMode !== 'brush' && brushMode !== 'eraser')) return;

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      const scaleFactor = window.devicePixelRatio || 1;
      canvas.width = rect.width * scaleFactor;
      canvas.height = rect.height * scaleFactor;
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.scale(scaleFactor, scaleFactor);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [brushMode, activeVersionId, activeAspect]);

  const clearMask = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }, []);

  useEffect(() => {
    clearMask();
    setMaskHistory([]);
    setMaskFuture([]);
  }, [activeVersionId, activeAspect, clearMask]);

  const captureMaskSnapshot = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setMaskHistory((previous) => [...previous, canvas.toDataURL("image/png")]);
    setMaskFuture([]);
  }, []);

  const applyMaskSnapshot = useCallback((snapshot: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const image = new window.Image();
    image.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    };
    image.src = snapshot;
  }, []);

  const undoMask = useCallback(() => {
    setMaskHistory((previous) => {
      if (previous.length === 0) return previous;
      const canvas = canvasRef.current;
      if (!canvas) return previous;
      const currentSnapshot = canvas.toDataURL("image/png");
      const nextHistory = previous.slice(0, -1);
      const targetSnapshot = previous[previous.length - 1];
      setMaskFuture((future) => [currentSnapshot, ...future]);
      applyMaskSnapshot(targetSnapshot);
      return nextHistory;
    });
  }, [applyMaskSnapshot]);

  const redoMask = useCallback(() => {
    setMaskFuture((future) => {
      if (future.length === 0) return future;
      const canvas = canvasRef.current;
      if (!canvas) return future;
      const currentSnapshot = canvas.toDataURL("image/png");
      const [targetSnapshot, ...remaining] = future;
      setMaskHistory((history) => [...history, currentSnapshot]);
      applyMaskSnapshot(targetSnapshot);
      return remaining;
    });
  }, [applyMaskSnapshot]);

  const getMaskBase64 = () => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    // Check if canvas is empty
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    let hasMask = false;
    for (let i = 3; i < pixels.length; i += 4) {
      if (pixels[i] > 0) {
        hasMask = true;
        break;
      }
    }
    return hasMask ? canvas.toDataURL('image/png') : null;
  };

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
      const maskData = getMaskBase64();
      const selectedModel =
        MODEL_MAPPING[activeModel as keyof typeof MODEL_MAPPING] || "seedream_v5";
      if (maskData && selectedModel !== "openai_image_1_5") {
        setError("Mask editing is only supported for ChatGPT Image.");
        setIsGenerating(false);
        abortControllerRef.current = null;
        return;
      }
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
            mask_image_url: maskData
          }
        : {
            prompt,
            model: selectedModel,
            aspect_ratio: activeAspect,
            age: parsedAge,
          };

      const data = isEditMode
        ? await editBaseImage(avatarId, payload, abortControllerRef.current.signal)
        : await generateBaseImage(avatarId, payload, abortControllerRef.current.signal);
      if (data) {
        await fetchVersions();
        setActiveVersionId(data.version_id);
        clearMask();
        setMaskHistory([]);
        setMaskFuture([]);
        setBrushMode(null); // Exit inpainting mode after successful edit
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
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileUpload(e.dataTransfer.files);
  };

  const handleToolAction = (tool: string) => {
    switch (tool) {
      case 'brush':
        setBrushMode(prev => prev === 'brush' ? null : 'brush');
        break;
      case 'ink_eraser':
        setBrushMode(prev => prev === 'eraser' ? null : 'eraser');
        break;
      case 'pan':
        setBrushMode(prev => prev === 'pan' ? null : 'pan');
        break;
      case 'add':
        setScale(prev => Math.min(prev + 0.2, 3));
        break;
      case 'remove':
        setScale(prev => Math.max(prev - 0.2, 0.5));
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
        captureMaskSnapshot();
        clearMask();
        setBrushMode(null);
        break;
      case 'undo':
        undoMask();
        break;
      case 'redo':
        redoMask();
        break;
    }
  };

  const onMouseDown = (e: React.MouseEvent) => {
    if (brushMode === 'pan') {
      setIsPanning(true);
      setLastMousePos({ x: e.clientX, y: e.clientY });
    } else if (brushMode === 'brush' || brushMode === 'eraser') {
      captureMaskSnapshot();
      setIsDrawing(true);
      draw(e);
    }
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      const dx = e.clientX - lastMousePos.x;
      const dy = e.clientY - lastMousePos.y;
      setOffset(prev => ({ x: prev.x + dx, y: prev.y + dy }));
      setLastMousePos({ x: e.clientX, y: e.clientY });
    } else if (isDrawing) {
      draw(e);
    }
  };

  const onMouseUp = () => {
    setIsPanning(false);
    setIsDrawing(false);
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) ctx.beginPath();
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || (brushMode !== 'brush' && brushMode !== 'eraser') || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = (('clientX' in e ? (e as React.MouseEvent).clientX : (e as React.TouchEvent).touches[0].clientX) - rect.left);
    const y = (('clientY' in e ? (e as React.MouseEvent).clientY : (e as React.TouchEvent).touches[0].clientY) - rect.top);

    ctx.lineWidth = 20;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#ef4444';
    ctx.globalCompositeOperation = brushMode === 'eraser' ? 'destination-out' : 'source-over';

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
    if (brushMode === 'pan') {
      return isPanning ? 'grabbing' : 'grab';
    }
    if (brushMode === 'brush' || brushMode === 'eraser') {
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
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Drag and Drop Overlay */}
      {isDragging && (
        <div className="absolute inset-0 z-50 bg-[#3c9f95]/10 backdrop-blur-sm flex items-center justify-center pointer-events-auto transition-all">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white/90 backdrop-blur-md rounded-[32px] p-10 shadow-[0_32px_80px_-16px_rgba(0,0,0,0.1)] border border-[#3c9f95] flex flex-col items-center gap-4"
          >
            <div className="w-16 h-16 rounded-2xl bg-[#3c9f95]/10 flex items-center justify-center text-[#3c9f95]">
              <span className="material-symbols-outlined text-4xl">cloud_upload</span>
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold text-[#1a3a2a]">Drop to Iterate</p>
              <p className="text-sm text-[#8ca1c5] mt-1">Add context for the next generation</p>
            </div>
          </motion.div>
        </div>
      )}
      
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
            { icon: "pan_tool", label: "Pan", action: "pan", active: brushMode === 'pan' },
            { icon: "brush", label: "Brush", action: "brush", active: brushMode === 'brush' },
            { icon: "ink_eraser", label: "Eraser", action: "ink_eraser", active: brushMode === 'eraser' },
            { icon: "undo", label: "Undo Mask", action: "undo", disabled: maskHistory.length === 0 },
            { icon: "redo", label: "Redo Mask", action: "redo", disabled: maskFuture.length === 0 },
            { icon: "add", label: "Zoom In", action: "add" },
            { icon: "remove", label: "Zoom Out", action: "remove" },
            { icon: "download", label: "Download", action: "download" },
            { icon: "layers_clear", label: "Clear Mask", action: "delete" },
          ].map((tool) => (
            <button
              key={tool.label}
              title={tool.label}
              aria-label={tool.label}
              aria-pressed={Boolean(tool.active)}
              onClick={() => handleToolAction(tool.action)}
              disabled={Boolean(tool.disabled) || (tool.action === 'download' && !activeVersion)}
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
        ref={containerRef}
        className="flex-1 min-h-0 relative flex items-center justify-center pointer-events-none p-12 overflow-hidden"
      >
        <div 
          className="w-full h-full relative flex items-center justify-center transition-transform duration-300"
          style={{ 
            transform: `scale(${scale}) translate(${offset.x}px, ${offset.y}px)`,
          }}
        >
          <AnimatePresence mode="wait">
            {isGenerating ? (
              <motion.div
                key="loading-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-x-[-100%] inset-y-[-100%] z-[60] flex flex-col items-center justify-center pointer-events-auto"
              >
                {/* Immersive Frosted Overlay */}
                <div className="absolute inset-0 bg-[#f8faf9]/40 backdrop-blur-[120px]" />
                
                {/* Animated Background Blobs */}
                <motion.div 
                  animate={{ 
                    scale: [1, 1.2, 1],
                    x: [0, 50, 0],
                    y: [0, -30, 0],
                  }}
                  transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                  className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#3c9f95]/10 rounded-full blur-[100px]"
                />
                <motion.div 
                  animate={{ 
                    scale: [1, 1.3, 1],
                    x: [0, -60, 0],
                    y: [0, 40, 0],
                  }}
                  transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                  className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[#1a3a2a]/5 rounded-full blur-[100px]"
                />

                <div className="relative z-10 flex flex-col items-center gap-8">
                  <div className="relative">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                      className="w-56 h-56 rounded-full border border-[#3c9f95]/20 flex items-center justify-center"
                    >
                      <motion.div
                        animate={{ rotate: -360 }}
                        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                        className="w-48 h-48 rounded-full border border-dashed border-[#3c9f95]/40"
                      />
                    </motion.div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-white shadow-2xl flex items-center justify-center">
                        <motion.span 
                          animate={{ 
                            scale: [1, 1.15, 1],
                            opacity: [0.7, 1, 0.7]
                          }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="material-symbols-outlined text-[#3c9f95] text-3xl"
                        >
                          generating_tokens
                        </motion.span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-center gap-3 text-center">
                    <motion.h2 
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      className="text-[#1a3a2a] font-display text-3xl font-semibold tracking-tight"
                    >
                      Refining Vision
                    </motion.h2>
                    <motion.p 
                      initial={{ y: 15, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.1 }}
                      className="text-[#8ca1c5] text-[12px] font-bold uppercase tracking-[0.3em]"
                    >
                      Neural Engine Pipeline Active
                    </motion.p>
                  </div>

                  <motion.button
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    onClick={handleStop}
                    className="mt-4 px-8 py-3 rounded-full bg-white hover:bg-red-50 text-red-500 font-bold text-[11px] uppercase tracking-[0.15em] border border-red-100 shadow-xl transition-all"
                  >
                    Abort Sequence
                  </motion.button>
                </div>
              </motion.div>
            ) : null}

            {activeVersion ? (
              <motion.div
                key={activeVersionId || 'default'}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                className="w-full h-full flex items-center justify-center relative pointer-events-auto"
                style={{ cursor: getCursorStyle() }}
                onMouseDown={onMouseDown}
                onMouseMove={onMouseMove}
                onMouseUp={onMouseUp}
                onMouseLeave={onMouseUp}
              >
                <div className={`relative max-w-full max-h-full transition-all duration-500
                    ${activeAspect === '1:1' ? 'aspect-square h-full' : 
                      activeAspect === '3:4' ? 'aspect-[3/4] h-full' : 
                      activeAspect === '9:16' ? 'aspect-[9/16] h-full' : 
                      activeAspect === '4:3' ? 'aspect-[4/3] w-full' : 
                      'aspect-[16/9] w-full'}`}>
                  
                  <Image
                    src={activeVersion.image_url}
                    fill
                    className="w-full h-full object-cover rounded-[24px] shadow-[0_32px_80px_-16px_rgba(0,0,0,0.22)] border-[4px] border-white"
                    alt="Current Version"
                    priority
                  />

                  {/* Mask Canvas Overlay */}
                  <canvas
                    ref={canvasRef}
                    className={`absolute inset-0 w-full h-full rounded-[24px] z-10 transition-opacity duration-300
                      ${(brushMode === 'brush' || brushMode === 'eraser') ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                  />

                  {/* Mode Indicator */}
                  {brushMode && (
                    <div className="absolute top-6 left-6 z-20 px-4 py-2 rounded-full bg-[#1a3a2a]/80 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 border border-white/20">
                      <span className="w-2 h-2 rounded-full bg-[#3c9f95] animate-pulse" />
                      {brushMode === 'pan' ? 'Navigation Mode' : `Inpainting Mode: ${brushMode}`}
                    </div>
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center gap-6 py-24 px-16 rounded-[48px] bg-white/40 backdrop-blur-md border border-white/60 shadow-2xl"
              >
                <div className="w-20 h-20 rounded-3xl bg-white border border-[#d6dbd4] flex items-center justify-center text-[#3c9f95] shadow-sm relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-tr from-[#3c9f95]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span className="material-symbols-outlined !text-[36px] relative z-10">auto_awesome</span>
                </div>
                <div className="text-center">
                  <h3 className="text-[#1a3a2a] font-display text-2xl font-semibold tracking-tight">Vast Potential</h3>
                  <p className="text-[#8ca1c5] text-sm mt-2 max-w-[280px] leading-relaxed">Illuminate your avatar&apos;s digital soul by describing their essence below.</p>
                </div>
              </motion.div>
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
