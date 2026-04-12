"use client";

import * as React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { CornerDownRight, Diamond } from "lucide-react";
import { cn } from "@/lib/util";

type Props = {
  variant?: "dark" | "light";
  children: React.ReactNode;
  startIcon?: React.ReactNode;
} & HTMLMotionProps<"button">;

export const PrimaryButton = React.forwardRef<HTMLButtonElement, Props>(
  (
    { className, variant = "dark", children, startIcon, disabled, ...props },
    ref,
  ) => {
    const isDark = variant === "dark";

    // Colors for better visibility in both themes
    const arrowColor = isDark ? "#FFFFFF" : "#000000";
    const diamondColor = isDark ? "#FFFFFF" : "#000000";
    const diamondFill = isDark ? "#FFFFFF" : "#000000";
    const rippleColor = isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.15)";

    return (
      <motion.button
        ref={ref}
        initial="rest"
        whileHover={disabled ? undefined : "hover"}
        animate="rest"
        disabled={disabled}
        className={cn(
          "relative overflow-hidden px-8 py-3.5 text-[11px] uppercase font-medium flex items-center justify-center gap-3 rounded-none",
          "tracking-[0.2em] font-['Poppins','Inter',system-ui,sans-serif] cursor-pointer",
          "transition-all duration-300",
          isDark ? "bg-black text-white" : "bg-white text-black border",
          disabled && "opacity-50 cursor-not-allowed",
          className,
        )}
        {...props}
      >
        {/* START ICON SECTION */}
        <span className="relative w-4 h-4 flex items-center justify-center">
          {startIcon ? (
            // Custom start icon that morphs to diamond
            <>
              <motion.div
                variants={{
                  rest: { scale: 1, rotate: 0, opacity: 1 },
                  hover: { scale: 0, rotate: -90, opacity: 0 },
                }}
                transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                className="absolute flex items-center justify-center"
              >
                {startIcon}
              </motion.div>

              <motion.div
                variants={{
                  rest: { scale: 0, rotate: -45, opacity: 0 },
                  hover: { scale: 1.3, rotate: 0, opacity: 1 },
                }}
                transition={{
                  duration: 0.4,
                  ease: [0.4, 0, 0.2, 1],
                  delay: 0.05,
                }}
                className="absolute flex items-center justify-center"
              >
                <Diamond
                  size={10}
                  fill={diamondFill}
                  color={diamondColor}
                  strokeWidth={0}
                />
              </motion.div>

              <motion.span
                variants={{
                  rest: { scale: 0, opacity: 0 },
                  hover: { scale: 2.5, opacity: [0, 0.3, 0] },
                }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="absolute rounded-full"
                style={{
                  width: "100%",
                  height: "100%",
                  backgroundColor: rippleColor,
                }}
              />
            </>
          ) : (
            // Default arrow to diamond morphing
            <>
              <motion.div
                variants={{
                  rest: { scale: 1, rotate: 0 },
                  hover: { scale: 1.2, rotate: 45 },
                }}
                transition={{ duration: 0.5, ease: [0.34, 1.2, 0.64, 1] }}
                className="relative w-full h-full flex items-center justify-center"
              >
                <motion.div
                  variants={{
                    rest: { scale: 1, rotate: 0, opacity: 1 },
                    hover: { scale: 0, rotate: -90, opacity: 0 },
                  }}
                  transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                  className="absolute"
                >
                  <CornerDownRight
                    size={14}
                    strokeWidth={1.5}
                    color={arrowColor}
                  />
                </motion.div>

                <motion.div
                  variants={{
                    rest: { scale: 0, rotate: -45, opacity: 0 },
                    hover: { scale: 1.3, rotate: 0, opacity: 1 },
                  }}
                  transition={{
                    duration: 0.4,
                    ease: [0.4, 0, 0.2, 1],
                    delay: 0.05,
                  }}
                  className="absolute"
                >
                  <Diamond
                    size={10}
                    fill={diamondFill}
                    color={diamondColor}
                    strokeWidth={0}
                  />
                </motion.div>
              </motion.div>

              <motion.span
                variants={{
                  rest: { scale: 0, opacity: 0 },
                  hover: { scale: 2.5, opacity: [0, 0.3, 0] },
                }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="absolute rounded-full"
                style={{
                  width: "100%",
                  height: "100%",
                  backgroundColor: rippleColor,
                }}
              />
            </>
          )}
        </span>

        {/* TEXT SLIDE WITH STAGGERED ANIMATION */}
        <span className="relative h-[1.2em] overflow-hidden">
          <motion.span
            variants={{
              rest: { y: 0, opacity: 1 },
              hover: { y: "-120%", opacity: 0 },
            }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="block whitespace-nowrap"
          >
            {children}
          </motion.span>

          <motion.span
            variants={{
              rest: { y: "120%", opacity: 0 },
              hover: { y: 0, opacity: 1 },
            }}
            transition={{
              duration: 0.4,
              ease: [0.22, 1, 0.36, 1],
              delay: 0.05,
            }}
            className="absolute inset-0 whitespace-nowrap"
          >
            {children}
          </motion.span>
        </span>

        {/* BACKGROUND SHINE EFFECT */}
        <motion.span
          variants={{
            rest: { x: "-100%", opacity: 0 },
            hover: { x: "100%", opacity: isDark ? 0.1 : 0.08 },
          }}
          transition={{ duration: 0.7, ease: "easeInOut", delay: 0.1 }}
          className={cn(
            "absolute inset-0 w-full h-full bg-gradient-to-r pointer-events-none",
            isDark
              ? "from-transparent via-white to-transparent"
              : "from-transparent via-black to-transparent",
          )}
        />

        {/* Subtle Border Animation */}
        <motion.span
          variants={{
            rest: { scaleX: 0, opacity: 0 },
            hover: { scaleX: 1, opacity: 0.5 },
          }}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
          className={cn(
            "absolute bottom-0 left-0 w-full h-px",
            isDark ? "bg-white" : "bg-black",
          )}
        />

        {/* Corner accent animation */}
        <motion.span
          variants={{
            rest: { scale: 0, opacity: 0 },
            hover: { scale: 1, opacity: 0.3 },
          }}
          transition={{ duration: 0.3, delay: 0.15 }}
          className={cn(
            "absolute top-0 right-0 w-2 h-2",
            isDark
              ? "border-t border-r border-white"
              : "border-t border-r border-black",
          )}
        />
      </motion.button>
    );
  },
);

PrimaryButton.displayName = "PrimaryButton";
