"use client";

import * as React from "react";
import { cn } from "@/shared/lib/utils";

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function PageContainer({ children, className }: PageContainerProps) {
  return (
    <div className="h-full overflow-hidden">
      <div className={cn("h-full overflow-y-auto px-6 pb-8 pt-6 lg:px-8 scrollbar-thin", className)}>
        {children}
      </div>
    </div>
  );
}
