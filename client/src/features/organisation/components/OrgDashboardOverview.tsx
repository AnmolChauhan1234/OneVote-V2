"use client";

import { motion } from "framer-motion";
import { Users, FileText, BarChart3, Settings, Plus, LayoutDashboard } from "lucide-react";

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

export function OrgDashboardOverview() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="space-y-10"
      >
        {/* Header Section */}
        <section className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <motion.h1 
              variants={itemVariants}
              className="text-4xl font-bold tracking-tight text-black"
            >
              Organization Dashboard
            </motion.h1>
            <motion.p 
              variants={itemVariants}
              className="mt-2 text-lg text-black/60"
            >
              Manage your elections, participants, and results.
            </motion.p>
          </div>
          <motion.div variants={itemVariants}>
            <button className="bg-black text-white px-6 py-3 text-xs font-bold uppercase tracking-widest flex items-center gap-2 hover:shadow-xl transition transition-all active:scale-95">
              <Plus size={16} />
              Create Election
            </button>
          </motion.div>
        </section>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard title="Active Elections" value="1" icon={<LayoutDashboard size={18} />} />
          <StatCard title="Total Voters" value="1,240" icon={<Users size={18} />} />
          <StatCard title="Avg. Participation" value="84%" icon={<BarChart3 size={18} />} />
          <StatCard title="Reports Generated" value="14" icon={<FileText size={18} />} />
        </div>

        {/* Management Grid placeholder */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main List */}
          <motion.div variants={itemVariants} className="lg:col-span-2 space-y-6">
            <h2 className="text-2xl font-bold">Your Elections</h2>
            <div className="bg-white border border-black/5 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-black text-white text-[10px] uppercase tracking-widest ">
                        <tr>
                            <th className="px-6 py-3 font-bold">Election Name</th>
                            <th className="px-6 py-3 font-bold">Status</th>
                            <th className="px-6 py-3 font-bold">Voters</th>
                            <th className="px-6 py-3 font-bold"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-black/5 text-sm">
                        {[1, 2].map((i) => (
                            <tr key={i} className="hover:bg-black/5 transition">
                                <td className="px-6 py-4 font-bold">Student Council 2024</td>
                                <td className="px-6 py-4">
                                    <span className="flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                        Active
                                    </span>
                                </td>
                                <td className="px-6 py-4 font-medium">850 / 1,200</td>
                                <td className="px-6 py-4 text-right">
                                    <button className="text-[10px] font-bold uppercase tracking-widest hover:underline">Manage</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
          </motion.div>

          {/* Quick Actions / Sidebar */}
          <motion.div variants={itemVariants} className="space-y-6">
            <h2 className="text-2xl font-bold">Quick Actions</h2>
            <div className="grid grid-cols-1 gap-4">
              <ActionCard icon={<Users size={18} />} title="Manage Voters" />
              <ActionCard icon={<FileText size={18} />} title="Audit Logs" />
              <ActionCard icon={<Settings size={18} />} title="Org Settings" />
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

function StatCard({ title, value, icon }: { title: string; value: string; icon: React.ReactNode }) {
  return (
    <motion.div 
      variants={itemVariants}
      className="bg-white border border-black/5 p-6 space-y-2 hover:border-black/20 transition-all"
    >
      <div className="flex items-center justify-between">
        <span className="p-2 bg-black/5 rounded-none">{icon}</span>
      </div>
      <div>
        <p className="text-[10px] uppercase tracking-widest font-bold text-black/40">{title}</p>
        <p className="text-2xl font-bold tracking-tight">{value}</p>
      </div>
    </motion.div>
  );
}

function ActionCard({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <button className="flex items-center gap-4 w-full p-4 bg-white border border-black/5 hover:border-black transition-all group text-left">
      <div className="p-2 bg-black text-white group-hover:bg-black transition">
        {icon}
      </div>
      <span className="font-bold text-sm tracking-tight">{title}</span>
    </button>
  );
}
