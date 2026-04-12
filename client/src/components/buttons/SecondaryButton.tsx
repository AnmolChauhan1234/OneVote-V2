"use client";

import * as React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/util";

type Props = {
  variant?: "dark" | "light";
  children: React.ReactNode;
} & HTMLMotionProps<"button">;

export const SecondaryButton = React.forwardRef<HTMLButtonElement, Props>(
  ({ className, variant = "dark", children, ...props }, ref) => {
    const isDark = variant === "dark";

    return (
      <motion.button
        ref={ref}
        initial="rest"
        whileHover="hover"
        animate="rest"
        className={cn(
          "relative overflow-hidden px-8 py-3.5 text-[11px] uppercase font-medium rounded-none",
          "tracking-[0.25em] font-['Poppins','Inter',system-ui,sans-serif] cursor-pointer",
          isDark
            ? "bg-black text-white"
            : "bg-white text-black border border-neutral-300",
          className,
        )}
        {...props}
      >
        {/* 🔥 BACKGROUND REVEAL */}
        <motion.span
          variants={{
            rest: { clipPath: "inset(100% 0% 0% 0%)" },
            hover: { clipPath: "inset(0% 0% 0% 0%)" },
          }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className={cn(
            "absolute inset-0 z-0",
            isDark ? "bg-white" : "bg-black",
          )}
        />

        {/* 🔥 TEXT */}
        <span className="relative z-10 block h-[1.2em] overflow-hidden">
          <motion.span
            variants={{
              rest: {
                y: 0,
                color: isDark ? "#ffffff" : "#000000",
              },
              hover: {
                y: "150%",
                color: isDark ? "#000000" : "#ffffff",
              },
            }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="block whitespace-nowrap"
          >
            {children}
          </motion.span>

          <motion.span
            variants={{
              rest: {
                y: "-150%",
                color: isDark ? "#ffffff" : "#000000",
              },
              hover: {
                y: 0,
                color: isDark ? "#000000" : "#ffffff",
              },
            }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 whitespace-nowrap"
          >
            {children}
          </motion.span>
        </span>
      </motion.button>
    );
  },
);

SecondaryButton.displayName = "SecondaryButton";
