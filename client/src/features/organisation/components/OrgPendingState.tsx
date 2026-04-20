"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Clock, Building2, ShieldCheck, RefreshCw } from "lucide-react";
import { queryClient } from "@/lib/instances/queryClient";
import { queryKeys } from "@/constants/queryKeys";

export function OrgPendingState() {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await queryClient.invalidateQueries({ queryKey: queryKeys.auth.me });
    await queryClient.invalidateQueries({ queryKey: queryKeys.organisation.all });
    setTimeout(() => setIsRefreshing(false), 800);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="max-w-xl w-full text-center space-y-8 bg-white border border-black/5 p-12 shadow-sm relative overflow-hidden"
      >
        {/* Decorative Background Spinner */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-32 -right-32 w-64 h-64 border-[40px] border-black/[0.02] rounded-full pointer-events-none"
        />

        {/* Icons */}
        <div className="relative inline-flex items-center justify-center">
          <div className="w-20 h-20 bg-black/5 rounded-full flex items-center justify-center">
            <Building2 size={32} className="text-black/40" />
          </div>
          <div className="absolute -bottom-2 -right-2 bg-yellow-400 w-10 h-10 rounded-full flex items-center justify-center border-4 border-white shadow-sm">
            <Clock size={20} className="text-white" />
          </div>
        </div>

        {/* Text Content */}
        <div className="space-y-3">
          <h2 className="text-2xl font-bold tracking-tight text-black">
            Verification Pending
          </h2>
          <p className="text-sm text-black/50 font-medium leading-relaxed max-w-sm mx-auto">
            Your organization details are currently under review by the global administrators. This process typically takes 1-2 business days.
          </p>
        </div>

        {/* Information Box */}
        <div className="bg-black/5 text-left p-4 space-y-3 border border-black/5">
          <div className="flex items-start gap-3">
            <ShieldCheck size={18} className="text-black/60 mt-0.5 shrink-0" />
            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-black">Why verify?</h4>
              <p className="text-[11px] font-medium text-black/60 mt-1">
                Verification ensures maximum security and prevents fraudulent elections from being hosted on OneVote.
              </p>
            </div>
          </div>
        </div>

        {/* Refresh Action */}
        <div className="pt-4 flex justify-center">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-black/40 hover:text-black transition-colors"
          >
            <motion.div animate={isRefreshing ? { rotate: 360 } : {}} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
              <RefreshCw size={14} />
            </motion.div>
            Check Status
          </button>
        </div>
      </motion.div>
    </div>
  );
}
