"use client";

import { motion } from "framer-motion";
import { Vote, History, TrendingUp, Info } from "lucide-react";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 },
};

export function VoterDashboardOverview() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="space-y-10"
      >
        {/* Header Section */}
        <section>
          <motion.h1 
            variants={itemVariants}
            className="text-4xl font-bold tracking-tight text-black"
          >
            Voter Dashboard
          </motion.h1>
          <motion.p 
            variants={itemVariants}
            className="mt-2 text-lg text-black/60"
          >
            Exercise your right to vote. Securely and transparently.
          </motion.p>
        </section>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard 
            title="Active Elections" 
            value="3" 
            icon={<TrendingUp className="text-blue-500" />} 
          />
          <StatCard 
            title="Votes Cast" 
            value="12" 
            icon={<Vote className="text-green-500" />} 
          />
          <StatCard 
            title="Completion Rate" 
            value="100%" 
            icon={<History className="text-purple-500" />} 
          />
        </div>

        {/* Active Elections list Placeholder */}
        <section className="space-y-6">
          <motion.div variants={itemVariants} className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Active Elections</h2>
            <button className="text-sm font-medium text-black/40 hover:text-black transition">
              View All
            </button>
          </motion.div>
          
          <motion.div 
            variants={itemVariants}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {/* Template Card */}
            {[1, 2, 3].map((i) => (
              <div 
                key={i}
                className="group relative bg-white border border-black/5 p-6 hover:shadow-2xl transition-all duration-500"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2 bg-black/5 rounded-full">
                    <Vote size={18} />
                  </div>
                  <span className="text-[10px] uppercase tracking-widest bg-black text-white px-2 py-0.5 font-bold">
                    Ongoing
                  </span>
                </div>
                <h3 className="text-lg font-bold mb-1">General Election 2024</h3>
                <p className="text-sm text-black/50 mb-6 font-medium">National selection for parliament members.</p>
                <button className="w-full py-3 bg-black text-white text-xs font-bold uppercase tracking-[0.2em] transition transform hover:scale-[1.02] active:scale-[0.98]">
                  Cast Your Vote
                </button>
              </div>
            ))}
          </motion.div>
        </section>

        {/* Information Section */}
        <motion.div 
          variants={itemVariants}
          className="bg-black text-white p-8 flex flex-col md:flex-row items-center justify-between gap-6"
        >
          <div className="flex items-start gap-4">
            <div className="bg-white/10 p-3">
              <Info className="text-white/60" size={24} />
            </div>
            <div>
              <h3 className="font-bold text-lg">Blockchain Secured</h3>
              <p className="text-white/40 text-sm max-w-md">Your vote is encrypted and stored on a distributed ledger, ensuring it can never be tampered with or deleted.</p>
            </div>
          </div>
          <button className="whitespace-nowrap border border-white/20 px-6 py-2 text-xs uppercase tracking-widest font-bold hover:bg-white hover:text-black transition duration-300">
            Learn More
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}

function StatCard({ title, value, icon }: { title: string; value: string; icon: React.ReactNode }) {
  return (
    <motion.div 
      variants={itemVariants}
      className="bg-white border border-black/5 p-6 flex items-center justify-between hover:border-black/20 transition-all duration-300"
    >
      <div>
        <p className="text-xs uppercase tracking-widest font-bold text-black/40 mb-1">{title}</p>
        <p className="text-3xl font-bold tracking-tight">{value}</p>
      </div>
      <div className="p-3 bg-black/5">
        {icon}
      </div>
    </motion.div>
  );
}
