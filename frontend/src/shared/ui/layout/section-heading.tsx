"use client";

import * as React from "react";
import { FadeIn } from "../animations";

interface SectionHeadingProps {
  title: string;
  description?: string;
  rightControls?: React.ReactNode;
}

export function SectionHeading({ title, description, rightControls }: SectionHeadingProps) {
  return (
    <FadeIn direction="up" distance={10}>
      <div className="mb-8 flex items-center justify-between gap-2.5">
        <div className="flex gap-2.5">
          <span className="inline-block w-1 shrink-0 rounded-full bg-brand" />
          <div className="flex flex-col justify-center">
            <h2 className="font-display text-2xl leading-tight text-ink-muted">
              {title}
            </h2>
            {description && (
              <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">
                {description}
              </p>
            )}
          </div>
        </div>
        {rightControls && <div className="shrink-0">{rightControls}</div>}
      </div>
    </FadeIn>
  );
}
