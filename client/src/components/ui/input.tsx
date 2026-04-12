"use client";

import * as React from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/util";

type Props = {
  variant?: "dark" | "light";
  label?: string;
  error?: string;
  icon?: React.ReactNode;
} & React.InputHTMLAttributes<HTMLInputElement>;

export const Input = React.forwardRef<HTMLInputElement, Props>(
  (
    { className, variant = "dark", label, error, icon, type, ...props },
    ref,
  ) => {
    const isDark = variant === "dark";
    const hasError = !!error;
    const [showPassword, setShowPassword] = React.useState(false);

    const isPassword = type === "password";
    const inputType = isPassword ? (showPassword ? "text" : "password") : type;

    return (
      <div className="w-full">
        {/* Label */}
        {label && (
          <label
            className={cn(
              "block text-[11px] uppercase tracking-[0.2em] font-medium mb-2",
              "font-['Poppins','Inter',system-ui,sans-serif]",
              isDark ? "text-white/70" : "text-black/70",
              hasError && "text-red-500",
            )}
          >
            {label}
          </label>
        )}

        <div className="relative">
          {/* Icon */}
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 z-10">
              <div
                className={cn(
                  "flex items-center justify-center",
                  isDark ? "text-white/40" : "text-black/40",
                  hasError && "text-red-500",
                )}
              >
                {icon}
              </div>
            </div>
          )}

          {/* Input */}
          <input
            ref={ref}
            type={inputType}
            className={cn(
              "w-full px-4 py-3 text-sm font-normal outline-none transition-all duration-200",
              "font-['Inter',system-ui,sans-serif]",
              // Base styles
              isDark
                ? "bg-black text-white placeholder:text-white/30 border border-white/10 focus:border-white/30"
                : "bg-white text-black placeholder:text-black/30 border border-black/10 focus:border-black/30",
              // Icon padding
              icon ? "pl-9" : "pl-4",
              // Password toggle padding
              isPassword ? "pr-10" : "pr-4",
              // Error styles
              hasError &&
                (isDark
                  ? "border-red-500 focus:border-red-500"
                  : "border-red-500 focus:border-red-500"),
              className,
            )}
            {...props}
          />

          {/* Password Toggle */}
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className={cn(
                "absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4",
                "flex items-center justify-center transition-colors duration-200 cursor-pointer",
                isDark
                  ? "text-white/40 hover:text-white/70"
                  : "text-black/40 hover:text-black/70",
                hasError && "text-red-500 hover:text-red-500",
              )}
            >
              {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          )}
        </div>

        {/* Error message */}
        {error && (
          <p className="mt-1.5 text-[10px] uppercase tracking-[0.15em] text-red-500 font-medium">
            {error}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";
