"use client";

import { VoterDashboardOverview } from "@/features/voting/components/VoterDashboardOverview";
import { motion } from "framer-motion";

export default function UserDashboard() {
  return (
    <div className="min-h-screen bg-[#fafafa]">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        <VoterDashboardOverview />
      </motion.div>
    </div>
  );
}
