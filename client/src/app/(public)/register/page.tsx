"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SignUpForm from "@/features/auth/components/SignUpForm";
import IdentityForm from "@/features/identity/components/IdentityForm";
import { BiometricEnrollForm } from "@/features/biometric/components/BiometricEnrollForm";
import { useRouter } from "next/navigation";

const STEPS = [
  { id: 1, label: "Register", icon: "📝" },
  { id: 2, label: "Identity", icon: "🪪" },
  { id: 3, label: "Biometric", icon: "🔐" },
];

// Animation variants
const pageVariants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
};

const stepIndicatorVariants = {
  inactive: { scale: 1, opacity: 0.4 },
  active: {
    scale: 1.1,
    opacity: 1,
    backgroundColor: "#0a0a0a",
    color: "#ffffff",
  },
  completed: {
    scale: 1,
    opacity: 1,
    backgroundColor: "#0a0a0a",
    color: "#ffffff",
  },
};

const lineVariants = {
  inactive: { scaleX: 0, opacity: 0.3 },
  active: { scaleX: 1, opacity: 1 },
  completed: { scaleX: 1, opacity: 1 },
};

export default function RegisterPage() {
  const router = useRouter();

  const [step, setStep] = useState<number>(() => {
    if (typeof window === "undefined") return 1;
    return Number(localStorage.getItem("tempStep") ?? "1");
  });

  const [userId, setUserId] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("tempUserId") ?? null;
  });

  // Persist userId
  useEffect(() => {
    if (userId) {
      localStorage.setItem("tempUserId", userId);
    }
  }, [userId]);

  // Persist step
  useEffect(() => {
    localStorage.setItem("tempStep", String(step));
  }, [step]);

  // Safety guard
  useEffect(() => {
    if (!userId && step > 1) {
      setStep(1);
    }
  }, [userId, step]);

  // Cleanup after final step
  const handleComplete = () => {
    localStorage.removeItem("tempUserId");
    localStorage.removeItem("tempStep");
    setUserId(null);
    setStep(1);
    router.replace("/login");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-gradient-to-b from-black/5 via-transparent to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-r from-black/3 to-transparent rounded-full blur-3xl" />
        <div className="absolute top-1/3 right-0 w-[300px] h-[300px] bg-gradient-to-l from-black/3 to-transparent rounded-full blur-2xl" />
      </div>

      {/* STEP INDICATOR */}
      <div className="flex items-center justify-center gap-2 md:gap-6 mb-12 md:mb-16 w-full max-w-lg">
        {STEPS.map((s, idx) => (
          <div key={s.id} className="flex items-center w-full">
            <div className="flex flex-col items-center relative">
              <motion.div
                className="relative z-10 w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center text-sm md:text-base font-medium border-2 transition-all duration-300"
                style={{
                  backgroundColor: step >= s.id ? "#0a0a0a" : "transparent",
                  color: step >= s.id ? "#ffffff" : "#a3a3a3",
                  borderColor:
                    step > s.id
                      ? "#0a0a0a"
                      : step === s.id
                        ? "#0a0a0a"
                        : "#e5e5e5",
                }}
                initial={false}
                animate={
                  step >= s.id
                    ? "completed"
                    : step === s.id
                      ? "active"
                      : "inactive"
                }
                variants={stepIndicatorVariants}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >
                {step > s.id ? (
                  "✓"
                ) : (
                  <span className="hidden md:inline">{s.icon}</span>
                )}
                <span className="md:hidden">{s.id}</span>
              </motion.div>
              <span
                className="absolute -bottom-6 text-[10px] md:text-xs font-medium whitespace-nowrap text-center hidden sm:block"
                style={{ color: step >= s.id ? "#0a0a0a" : "#a3a3a3" }}
              >
                {s.label}
              </span>
            </div>
            {idx < STEPS.length - 1 && (
              <motion.div
                className="flex-1 h-[2px] mx-2 md:mx-4 origin-left"
                style={{ backgroundColor: "#e5e5e5" }}
                initial={false}
                animate={step > s.id ? "completed" : "inactive"}
                variants={lineVariants}
                transition={{ duration: 0.4, ease: "easeInOut" }}
              />
            )}
          </div>
        ))}
      </div>

      {/* STEP CONTENT */}
      <div className="w-full max-w-md">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <SignUpForm
                onSuccess={(userId) => {
                  setUserId(userId);
                  setStep(2);
                }}
              />
            </motion.div>
          )}

          {step === 2 && userId && (
            <motion.div
              key="step2"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <IdentityForm userId={userId} onSuccess={() => setStep(3)} />
            </motion.div>
          )}

          {step === 3 && userId && (
            <motion.div
              key="step3"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <BiometricEnrollForm userId={userId} onSuccess={handleComplete} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Subtle footer decoration */}
      <div className="absolute bottom-6 left-0 right-0 text-center">
        <p className="text-[10px] uppercase tracking-[0.3em] text-muted">
          Secure Registration Flow
        </p>
      </div>
    </div>
  );
}
