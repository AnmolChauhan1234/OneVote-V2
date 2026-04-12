"use client";

import Link from "next/link";
import { LoginForm } from "@/features/auth/components/LoginForm";
import { motion } from "framer-motion";

export default function LoginPage() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-6 bg-white">
      <div className="w-full max-w-[400px] flex flex-col gap-12">
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col gap-3 text-center"
        >
          <h1 className="text-3xl font-medium tracking-tight text-black">
            Welcome Back
          </h1>
          <p className="text-[11px] uppercase tracking-[0.3em] text-black/40 font-medium">
            Enter your credentials to access your account
          </p>
        </motion.div>

        {/* Form Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="w-full flex justify-center"
        >
          <LoginForm />
        </motion.div>

        {/* Footer Link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-center"
        >
          <Link 
            href="/" 
            className="text-[10px] uppercase tracking-[0.2em] text-black/30 hover:text-black transition-colors"
          >
            ← Back to Home
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
