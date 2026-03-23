"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { cn } from "@/shared/lib/utils";
import type { Attachment } from "@/features/avatars/types";

interface AttachmentStripProps {
  attachments: Attachment[];
  isUploading: boolean;
  onRemove: (attachmentId: number) => void;
}

const CARD_WIDTH = 48;
const CARD_HEIGHT = 64;
const STACK_OFFSET = 8;
const EXPANDED_GAP = 6;

type ReferenceCard = {
  id: number;
  src: string;
  alt: string;
  uploading?: boolean;
};

export function AttachmentStrip({ attachments, isUploading, onRemove }: AttachmentStripProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isExpanded) return;

    const closeIfOutside = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setIsExpanded(false);
      }
    };

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsExpanded(false);
    };

    document.addEventListener("mousedown", closeIfOutside);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeIfOutside);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [isExpanded]);

  const cards = useMemo<ReferenceCard[]>(() => {
    const base: ReferenceCard[] = attachments.map((attachment) => ({
      id: attachment.id,
      src: attachment.url,
      alt: attachment.filename,
    }));

    if (isUploading) {
      base.push({
        id: -1,
        src: "",
        alt: "Uploading reference",
        uploading: true,
      });
    }

    return base;
  }, [attachments, isUploading]);

  const collapsedWidth = CARD_WIDTH + Math.max(0, cards.length - 1) * STACK_OFFSET;
  const expandedWidth = cards.length * CARD_WIDTH + Math.max(0, cards.length - 1) * EXPANDED_GAP;

  if (attachments.length === 0 && !isUploading) return null;

  return (
    <div ref={rootRef} className="select-none">
      <div
        className={cn(
          "relative cursor-pointer transition-all duration-300 ease-out",
          isExpanded ? "cursor-default" : "hover:scale-[1.02]"
        )}
        style={{
          width: isExpanded ? expandedWidth : collapsedWidth,
          height: CARD_HEIGHT,
        }}
        onClick={() => {
          if (!isExpanded) setIsExpanded(true);
        }}
        role={!isExpanded ? "button" : undefined}
        tabIndex={!isExpanded ? 0 : -1}
        onKeyDown={(event) => {
          if (!isExpanded && (event.key === "Enter" || event.key === " ")) {
            event.preventDefault();
            setIsExpanded(true);
          }
        }}
      >
        {cards.map((card, index) => {
          const left = isExpanded 
            ? index * (CARD_WIDTH + EXPANDED_GAP) 
            : index * STACK_OFFSET;
          const zIndex = isExpanded ? cards.length - index : cards.length - index;

          return (
            <div
              key={card.id}
              className="absolute top-0 transition-all duration-300 ease-out"
              style={{
                left: `${left}px`,
                zIndex,
              }}
            >
              <div
                className={cn(
                  "relative overflow-hidden rounded-lg border border-white/60 shadow-md",
                  card.uploading 
                    ? "border-dashed border-[#3c9f95]/45 bg-[#f2f8f5]" 
                    : "bg-white"
                )}
                style={{
                  width: CARD_WIDTH,
                  height: CARD_HEIGHT,
                }}
              >
                {card.uploading ? (
                  <div className="flex h-full w-full items-center justify-center">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#3c9f95] border-t-transparent" />
                  </div>
                ) : (
                  <Image
                    src={card.src}
                    alt={card.alt}
                    width={CARD_WIDTH}
                    height={CARD_HEIGHT}
                    className="h-full w-full object-cover"
                  />
                )}

                {isExpanded && !card.uploading && (
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      onRemove(card.id);
                    }}
                    className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/55 text-white opacity-0 transition-opacity hover:opacity-100 focus:opacity-100"
                    aria-label={`Remove ${card.alt}`}
                  >
                    <span className="material-symbols-outlined !text-[11px]">close</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
