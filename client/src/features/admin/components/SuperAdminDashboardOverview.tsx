"use client";

import { motion } from "framer-motion";
import { AdminDashboardOverview } from "./AdminDashboardOverview";
import { ShieldCheck, Users, Activity, Settings, Database } from "lucide-react";

export const SuperAdminDashboardOverview = () => {
  return (
    <div className="max-w-7xl mx-auto py-12 px-6">
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-black text-white p-2 rounded-lg">
            <ShieldCheck size={24} />
          </div>
          <span className="text-xs font-bold uppercase tracking-[0.3em] text-black/40">
            System Control Panel
          </span>
        </div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-black mb-4">
          Super Admin Console
        </h1>
        <p className="text-black/60 max-w-2xl text-lg">
          Global system overview and administrative controls for the OneVote decentralized network.
        </p>
      </div>

      {/* Global Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <MetricCard
          icon={<Users size={20} />}
          label="Total Voters"
          value="4,892"
          detail="+12% this month"
        />
        <MetricCard
          icon={<Activity size={20} />}
          label="Network Status"
          value="Active"
          detail="12 Nodes online"
          status="online"
        />
        <MetricCard
          icon={<Database size={20} />}
          label="Total Elections"
          value="156"
          detail="24 in progress"
        />
      </div>

      {/* Verification Queue (Reusing Admin Component) */}
      <div className="bg-white rounded-[2rem] border border-black/5 shadow-sm overflow-hidden mb-12">
        <div className="p-8 border-b border-black/5 bg-black/[0.02]">
          <h2 className="text-xl font-bold text-black flex items-center gap-2">
            Verification Queue
          </h2>
        </div>
        <div className="p-2">
          <AdminDashboardOverview />
        </div>
      </div>

      {/* System Settings & User Management Placeholders */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <ActionCard
          title="User Management"
          desc="Manage all system users, adjust roles, and handle account suspensions."
          icon={<Users size={24} />}
        />
        <ActionCard
          title="System Settings"
          desc="Configure global voting parameters, API limits, and security protocols."
          icon={<Settings size={24} />}
        />
      </div>
    </div>
  );
};

function MetricCard({ icon, label, value, detail, status }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-8 rounded-[2rem] border border-black/5 shadow-sm"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="w-10 h-10 bg-black/5 rounded-xl flex items-center justify-center text-black">
          {icon}
        </div>
        {status && (
          <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-green-600 bg-green-50 px-3 py-1 rounded-full">
            <span className="w-1.5 h-1.5 bg-green-600 rounded-full animate-pulse" />
            {status}
          </span>
        )}
      </div>
      <div className="text-xs font-bold uppercase tracking-wider text-black/40 mb-1">{label}</div>
      <div className="text-3xl font-black text-black mb-2">{value}</div>
      <div className="text-[11px] font-medium text-black/40">{detail}</div>
    </motion.div>
  );
}

function ActionCard({ title, desc, icon }: any) {
  return (
    <div className="p-8 bg-black text-white rounded-[2rem] flex items-start gap-6 hover:bg-black/90 transition-colors cursor-pointer group">
      <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <div>
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-white/50 text-sm leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}
