"use client";

import { motion, type HTMLMotionProps, type Transition } from "framer-motion";
import React from "react";

// Standard transitions
export const transitions = {
  spring: {
    type: "spring",
    stiffness: 300,
    damping: 30,
  } as Transition,
  gentle: {
    type: "spring",
    stiffness: 260,
    damping: 20,
  } as Transition,
  smooth: {
    duration: 0.4,
    ease: [0.22, 1, 0.36, 1] as const,
  } as Transition,
};

// Reusable animated items
export const FadeIn = ({ 
  children, 
  delay = 0, 
  duration = 0.5,
  direction = "none",
  distance = 20,
  className
}: { 
  children: React.ReactNode; 
  delay?: number; 
  duration?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
  distance?: number;
  className?: string;
}) => {
  const directions = {
    up: { y: distance },
    down: { y: -distance },
    left: { x: distance },
    right: { x: -distance },
    none: {},
  };

  return (
    <motion.div
      initial={{ 
        opacity: 0, 
        ...directions[direction] 
      }}
      animate={{ 
        opacity: 1, 
        x: 0, 
        y: 0 
      }}
      transition={{ 
        duration, 
        delay, 
        ease: transitions.smooth.ease 
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export const StaggerContainer = ({ 
  children, 
  staggerChildren = 0.1, 
  delayChildren = 0,
  className
}: { 
  children: React.ReactNode; 
  staggerChildren?: number; 
  delayChildren?: number;
  className?: string;
}) => {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={{
        initial: {},
        animate: {
          transition: {
            staggerChildren,
            delayChildren,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export const StaggerItem = ({ 
  children,
  className 
}: { 
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <motion.div
      variants={{
        initial: { opacity: 0, y: 15 },
        animate: { opacity: 1, y: 0, transition: transitions.smooth },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export const HoverCard = ({ 
  children, 
  className,
  ...props 
}: HTMLMotionProps<"div">) => {
  return (
    <motion.div
      whileHover={{ 
        y: -4,
        boxShadow: "0 20px 40px -15px rgba(0,0,0,0.15)",
        transition: transitions.gentle
      }}
      whileTap={{ scale: 0.98 }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export const ButtonClick = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <motion.div
    whileTap={{ scale: 0.95 }}
    className={className}
  >
    {children}
  </motion.div>
);
