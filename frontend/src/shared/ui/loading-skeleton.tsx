import * as React from "react";
import { cn } from "@/shared/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "text" | "circular" | "rectangular";
}

export function LoadingSkeleton({ 
  variant = "rectangular", 
  className,
  ...props 
}: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse bg-surface-200 dark:bg-surface-700",
        variant === "circular" && "rounded-full",
        variant === "text" && "rounded h-4",
        variant === "rectangular" && "rounded-xl",
        className
      )}
      {...props}
    />
  );
}

export function AvatarCardSkeleton() {
  return (
    <div className="glass-card rounded-3xl overflow-hidden">
      <LoadingSkeleton className="h-72 w-full" />
      <div className="p-8 space-y-4">
        <LoadingSkeleton variant="text" className="w-1/3" />
        <LoadingSkeleton variant="text" className="w-2/3" />
        <div className="flex gap-3 mt-8">
          <LoadingSkeleton className="h-10 flex-1" />
          <LoadingSkeleton className="h-10 flex-1" />
        </div>
      </div>
    </div>
  );
}

export function SectionSkeleton() {
  return (
    <div className="space-y-6">
      <LoadingSkeleton variant="text" className="w-48 h-4" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <AvatarCardSkeleton />
        <AvatarCardSkeleton />
        <AvatarCardSkeleton />
      </div>
    </div>
  );
}
