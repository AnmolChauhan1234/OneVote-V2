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

    const arrowColor = isDark ? "#FFFFFF" : "#000000";
    const diamondFill = isDark ? "#FFFFFF" : "#000000";
    const rippleColor = isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.12)";

    return (
      <motion.button
        ref={ref}
        initial={false}
        whileHover={disabled ? undefined : "hover"}
        animate="rest"
        disabled={disabled}
        className={cn(
          "relative overflow-hidden px-8 py-3 text-[11px] uppercase font-medium flex items-center justify-center gap-3 rounded-none",
          "tracking-[0.2em] font-['Poppins','Inter',system-ui,sans-serif]",
          "transition-all duration-200 will-change-transform transform-gpu cursor-pointer",
          isDark
            ? "bg-black text-white border border-white/20"
            : "bg-white text-black border border-black/20",
          disabled && "opacity-50 cursor-not-allowed",
          className,
        )}
        {...props}
      >
        {/* ICON */}
        <span className="relative w-4 h-4 flex items-center justify-center">
          {startIcon ? (
            <>
              <motion.div
                variants={{
                  rest: { scale: 1, rotate: 0, opacity: 1 },
                  hover: { scale: 0, rotate: -90, opacity: 0 },
                }}
                transition={{ duration: 0.25 }}
                className="absolute"
              >
                {startIcon}
              </motion.div>

              <motion.div
                variants={{
                  rest: { scale: 0, rotate: -45, opacity: 0 },
                  hover: { scale: 1.2, rotate: 0, opacity: 1 },
                }}
                transition={{ duration: 0.25, delay: 0.03 }}
                className="absolute"
              >
                <Diamond size={10} fill={diamondFill} stroke="none" />
              </motion.div>
            </>
          ) : (
            <>
              <motion.div
                variants={{
                  rest: { scale: 1, rotate: 0 },
                  hover: { scale: 1.1, rotate: 30 },
                }}
                transition={{ duration: 0.25 }}
                className="relative w-full h-full flex items-center justify-center"
              >
                <motion.div
                  variants={{
                    rest: { scale: 1, rotate: 0, opacity: 1 },
                    hover: { scale: 0, rotate: -90, opacity: 0 },
                  }}
                  transition={{ duration: 0.25 }}
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
                    hover: { scale: 1.2, rotate: 0, opacity: 1 },
                  }}
                  transition={{ duration: 0.25, delay: 0.03 }}
                  className="absolute"
                >
                  <Diamond size={10} fill={diamondFill} stroke="none" />
                </motion.div>
              </motion.div>
            </>
          )}

          {/* RIPPLE */}
          <motion.span
            variants={{
              rest: { scale: 0, opacity: 0 },
              hover: { scale: 1.8, opacity: [0, 0.2, 0] },
            }}
            transition={{ duration: 0.3 }}
            className="absolute rounded-full"
            style={{
              width: "100%",
              height: "100%",
              backgroundColor: rippleColor,
            }}
          />
        </span>

        {/* TEXT */}
        <span className="relative h-[1.2em] overflow-hidden">
          <motion.span
            variants={{
              rest: { y: 0, opacity: 1 },
              hover: { y: "-110%", opacity: 0 },
            }}
            transition={{ duration: 0.25 }}
            className="block whitespace-nowrap"
          >
            {children}
          </motion.span>

          <motion.span
            variants={{
              rest: { y: "110%", opacity: 0 },
              hover: { y: 0, opacity: 1 },
            }}
            transition={{ duration: 0.25, delay: 0.03 }}
            className="absolute inset-0 whitespace-nowrap"
          >
            {children}
          </motion.span>
        </span>

        {/* BOTTOM LINE */}
        <motion.span
          variants={{
            rest: { scaleX: 0, opacity: 0 },
            hover: { scaleX: 1, opacity: 0.4 },
          }}
          transition={{ duration: 0.3 }}
          className={cn(
            "absolute bottom-0 left-0 w-full h-px origin-left",
            isDark ? "bg-white" : "bg-black",
          )}
        />
      </motion.button>
    );
  },
);

PrimaryButton.displayName = "PrimaryButton";
