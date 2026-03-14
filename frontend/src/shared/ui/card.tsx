"use client";

import * as React from "react";
import { cn } from "@/shared/lib/utils";
import { motion } from "framer-motion";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "glass" | "bordered";
  hover?: boolean;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = "default", hover = true, children, ...props }, ref) => {
    const variants = {
      default: "bg-white dark:bg-surface-900 border border-surface-200 dark:border-white/10 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]",
      glass: "glass-card",
      bordered: "bg-transparent border-2 border-surface-200 dark:border-white/10",
    };

    return (
      <motion.div
        ref={ref}
        whileHover={hover ? { 
          y: -4, 
          boxShadow: "0 20px 40px -12px rgba(0,0,0,0.12)",
          transition: { type: "spring", stiffness: 300, damping: 20 }
        } : undefined}
        className={cn(
          "rounded-2xl overflow-hidden transition-colors",
          variants[variant],
          className
        )}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);
Card.displayName = "Card";

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("p-6 pb-0", className)}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-4", className)} {...props} />
));
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("p-6 pt-0 flex items-center gap-3", className)}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardContent, CardFooter };
