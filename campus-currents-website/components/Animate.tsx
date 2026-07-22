"use client";

import { motion, useReducedMotion } from "motion/react";
import { ReactNode, useEffect, useState } from "react";

interface AnimateProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  scale?: number;
  once?: boolean;
  /** Use "animate" for hero (plays on mount), "inView" for scroll sections */
  trigger?: "animate" | "inView";
}

/**
 * Client-only animation wrapper that avoids hydration mismatches.
 * Renders children in a plain div until mounted, then applies motion.
 */
export default function Animate({
  children,
  className = "",
  delay = 0,
  y = 20,
  scale,
  once = true,
  trigger = "inView",
}: AnimateProps) {
  const [mounted, setMounted] = useState(false);
  const reduce = useReducedMotion();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Before mount or if reduced motion, render static
  if (!mounted || reduce) {
    return <div className={className}>{children}</div>;
  }

  const initialState: Record<string, number> = { opacity: 0 };
  if (y) initialState.y = y;
  if (scale) initialState.scale = scale;

  const animateState: Record<string, number> = { opacity: 1 };
  if (y) animateState.y = 0;
  if (scale) animateState.scale = 1;

  if (trigger === "animate") {
    return (
      <motion.div
        className={className}
        initial={initialState}
        animate={animateState}
        transition={{
          duration: 0.7,
          delay,
          ease: [0.16, 1, 0.3, 1],
        }}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <motion.div
      className={className}
      initial={initialState}
      whileInView={animateState}
      viewport={{ once, amount: 0.2 }}
      transition={{
        duration: 0.6,
        delay,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      {children}
    </motion.div>
  );
}
