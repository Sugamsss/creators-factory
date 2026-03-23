"use client";

import { cn } from "@/shared/lib/utils";

interface ToolConfig {
  icon: string;
  label: string;
  action: string;
  active?: boolean;
  disabled?: boolean;
}

interface ToolRailProps {
  isAnnotating: boolean;
  hasMaskImage: boolean;
  scale: number;
  hasActiveVersion: boolean;
  onAction: (action: string) => void;
}

function ToolButton({ icon, label, action, active, disabled, onAction }: ToolConfig & { onAction: (action: string) => void }) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={Boolean(active)}
      onClick={() => onAction(action)}
      disabled={disabled}
      className={cn(
        "flex h-10 w-10 items-center justify-center rounded-xl border transition-all",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3c9f95]/40",
        active
          ? "border-[#1a3a2a] bg-[#1a3a2a] text-white"
          : "border-transparent bg-white text-[#1a3a2a]/70 hover:border-[#3c9f95]/35 hover:text-[#1a3a2a]",
        disabled && "cursor-not-allowed opacity-35 hover:border-transparent"
      )}
    >
      <span className="material-symbols-outlined !text-[18px]">{icon}</span>
    </button>
  );
}

export function ToolRail({
  isAnnotating,
  hasMaskImage,
  scale,
  hasActiveVersion,
  onAction,
}: ToolRailProps) {
  const groups: ToolConfig[][] = [
    [
      { icon: "brush", label: isAnnotating ? "Capture Mask" : "Mask Brush", action: "brush", active: isAnnotating },
      { icon: "ink_eraser", label: "Clear Mask", action: "clear_mask", disabled: !isAnnotating && !hasMaskImage },
    ],
    [
      { icon: "add", label: "Zoom In", action: "add", disabled: scale >= 3 },
      { icon: "remove", label: "Zoom Out", action: "remove", disabled: scale <= 1 },
    ],
    [
      { icon: "download", label: "Download", action: "download", disabled: !hasActiveVersion },
      { icon: "delete", label: "Delete Version", action: "delete", disabled: !hasActiveVersion },
      { icon: "attach_file", label: "Attach Version", action: "attach", disabled: !hasActiveVersion },
    ],
  ];

  return (
    <div className="pointer-events-auto absolute right-4 top-1/2 z-30 -translate-y-1/2 rounded-2xl border border-[#d6dbd4] bg-white/90 p-2 shadow-[0_16px_34px_-20px_rgba(0,0,0,0.4)] backdrop-blur md:right-7">
      <div className="flex flex-col gap-2">
        {groups.map((group, index) => (
          <div key={index} className={cn("flex flex-col gap-2", index < groups.length - 1 && "border-b border-[#eef2ef] pb-2") }>
            {group.map((tool) => (
              <ToolButton key={tool.label} {...tool} onAction={onAction} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
