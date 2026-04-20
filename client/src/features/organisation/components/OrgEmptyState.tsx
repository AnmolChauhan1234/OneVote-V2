"use client";

import { motion } from "framer-motion";
import { Plus, Building2, ShieldCheck, Sparkles } from "lucide-react";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const itemVariants = {
  hidden: { y: 30, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const } },
};

interface OrgEmptyStateProps {
  onCreateClick?: () => void;
}

export function OrgEmptyState({ onCreateClick }: OrgEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="max-w-2xl w-full text-center space-y-12"
      >
        {/* Decorative Icon */}
        <motion.div
          variants={itemVariants}
          className="relative inline-block"
        >
          <div className="w-24 h-24 bg-black/5 rounded-none flex items-center justify-center relative z-10">
            <Building2 size={40} className="text-black/20" />
          </div>
          <div className="absolute -top-4 -right-4 w-12 h-12 bg-white border border-black/5 flex items-center justify-center shadow-lg">
            <Plus size={20} className="text-black" />
          </div>
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{ duration: 4, repeat: Infinity }}
            className="absolute -inset-4 bg-black/5 blur-2xl -z-10"
          />
        </motion.div>

        {/* Content */}
        <div className="space-y-4">
          <motion.h2
            variants={itemVariants}
            className="text-3xl font-bold tracking-tight text-black sm:text-4xl"
          >
            No Organization Found
          </motion.h2>
          <motion.p
            variants={itemVariants}
            className="text-lg text-black/50 font-medium"
          >
            You haven't setup your organization yet. Register your institution to start creating secure, transparent elections.
          </motion.p>
        </div>

        {/* Features List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
          <FeatureItem
            icon={<ShieldCheck size={20} />}
            title="Verified Identity"
            desc="Institutional verification for trusted voting."
          />
          <FeatureItem
            icon={<Sparkles size={20} />}
            title="Custom Branding"
            desc="Add your logo and thematic styling."
          />
        </div>

        {/* CTA */}
        <motion.div variants={itemVariants} className="pt-6">
          <button
            onClick={onCreateClick}
            className="group relative bg-black text-white px-10 py-4 font-bold uppercase tracking-[0.2em] text-xs transition-all duration-300 hover:shadow-2xl active:scale-95"
          >
            <span className="relative z-10 flex items-center gap-3">
              Create Organization
              <Plus size={16} className="transition-transform duration-300 group-hover:rotate-90" />
            </span>
            <div className="absolute inset-x-0 bottom-0 h-0.5 bg-white scale-x-0 group-hover:scale-x-full transition-transform duration-500 origin-left" />
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}

function FeatureItem({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <motion.div
      variants={itemVariants}
      className="flex gap-4 p-4 border border-black/5 bg-white/50 backdrop-blur-sm transition-colors hover:bg-white hover:border-black/10"
    >
      <div className="flex-shrink-0 w-10 h-10 bg-black text-white flex items-center justify-center">
        {icon}
      </div>
      <div>
        <h4 className="font-bold text-sm tracking-tight">{title}</h4>
        <p className="text-xs text-black/50 font-medium">{desc}</p>
      </div>
    </motion.div>
  );
}
