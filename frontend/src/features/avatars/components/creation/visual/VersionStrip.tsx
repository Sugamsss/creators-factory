"use client";

import Image from "next/image";
import { cn } from "@/shared/lib/utils";

interface VersionItem {
  id: number;
  version_number: number;
  image_url: string;
  created_at: string;
}

interface VersionStripProps {
  versions: VersionItem[];
  activeVersionId: number | null;
  onSelect: (id: number) => void;
}

function formatVersionTime(value: string): string {
  return new Date(value).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function VersionStrip({ versions, activeVersionId, onSelect }: VersionStripProps) {
  const cardSize = 36;
  const cardGap = 6;
  const pillPadding = 8;

  const contentWidth = versions.length * cardSize + Math.max(0, versions.length - 1) * cardGap;
  const pillWidth = contentWidth + pillPadding * 2;

  return (
    <div
      className="pointer-events-auto absolute bottom-5 left-1/2 z-30 -translate-x-1/2 rounded-2xl border border-[#d6dbd4] bg-white/92 px-2.5 py-2 shadow-[0_14px_30px_-20px_rgba(0,0,0,0.3)] backdrop-blur transition-[width] duration-300 ease-out"
      style={{ width: `min(92vw, ${pillWidth}px)` }}
    >
      {versions.length === 0 ? (
        <p className="px-3 py-1 text-center text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8ca1c5]">
          No visual history yet
        </p>
      ) : (
        <div className="flex items-center justify-center gap-2">
          {versions.map((version) => {
            const isActive = activeVersionId === version.id;
            return (
              <button
                key={version.id}
                type="button"
                onClick={() => onSelect(version.id)}
                title={`Version ${version.version_number} • ${formatVersionTime(version.created_at)}`}
                aria-label={`Jump to version ${version.version_number}`}
                className={cn(
                  "relative shrink-0 overflow-hidden rounded-xl border transition-all",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3c9f95]/45",
                  isActive
                    ? "border-[#3c9f95] opacity-100 shadow-[0_0_0_2px_rgba(60,159,149,0.25)]"
                    : "border-transparent opacity-65 hover:border-[#3c9f95]/40 hover:opacity-100"
                )}
                style={{
                  width: cardSize,
                  height: cardSize,
                }}
              >
                <Image
                  src={version.image_url}
                  alt={`Version ${version.version_number}`}
                  width={cardSize}
                  height={cardSize}
                  className="h-full w-full object-cover"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
