"use client";

import { useState, useEffect } from "react";

import SignUpForm from "@/features/auth/components/SignUpForm";
import IdentityForm from "@/features/identity/components/IdentityForm";
import { BiometricEnrollForm } from "@/features/biometric/components/BiometricEnrollForm";
import { useRouter } from "next/navigation";

const STEPS = [
  { id: 1, label: "Register" },
  { id: 2, label: "Identity" },
  { id: 3, label: "Biometric" },
];

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

  //Cleanup after final step
  const handleComplete = () => {
    localStorage.removeItem("tempUserId");
    localStorage.removeItem("tempStep");
    setUserId(null);
    setStep(1);
    router.replace("/login");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      {/* STEP INDICATOR */}
      <div className="flex items-center gap-6 mb-10">
        {STEPS.map((s) => (
          <div key={s.id} className="flex items-center gap-2">
            <div
              className={`w-6 h-6 flex items-center justify-center text-xs border ${
                step >= s.id
                  ? "bg-white text-black"
                  : "border-white/40 text-white/40"
              }`}
            >
              {s.id}
            </div>
            <span className="text-xs tracking-widest uppercase text-white/60">
              {s.label}
            </span>
          </div>
        ))}
      </div>

      {/* STEP CONTENT */}
      <div className="w-full max-w-md">
        {step === 1 && (
          <SignUpForm
            onSuccess={(userId) => {
              setUserId(userId);
              setStep(2);
            }}
          />
        )}

        {step === 2 && userId && (
          <IdentityForm userId={userId} onSuccess={() => setStep(3)} />
        )}

        {step === 3 && userId && (
          <BiometricEnrollForm userId={userId} onSuccess={handleComplete} />
        )}
      </div>
    </div>
  );
}
