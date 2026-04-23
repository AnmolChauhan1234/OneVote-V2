"use client";

import { motion } from "framer-motion";
import { AdminDashboardOverview } from "./AdminDashboardOverview";
import { 
  ShieldCheck, 
  Users, 
  Activity, 
  Settings, 
  Database,
  ArrowRight
} from "lucide-react";
import { GlobalElectionManagement } from "./GlobalElectionManagement";
import { useAdminElections } from "@/features/election/hooks/election.hooks";

export const SuperAdminDashboardOverview = () => {
  const { data: elections } = useAdminElections();
  const ongoingCount = elections?.filter(e => e.status === 'ONGOING').length || 0;

  return (
    <div className="max-w-7xl mx-auto py-8 md:py-12 px-4 sm:px-6">
      {/* Header */}
      <div className="mb-8 md:mb-12 border-b border-black/5 pb-8 sm:px-2">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-black text-white p-2.5 rounded-2xl shadow-xl shadow-black/10">
            <ShieldCheck size={20} />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-black/40">
              Nexus One Node
            </span>
            <span className="text-[9px] font-bold text-green-600 flex items-center gap-1.5 uppercase tracking-widest">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              Secure Protocol Active
            </span>
          </div>
        </div>
        <h1 className="text-3xl md:text-5xl font-bold tracking-tighter text-black mb-4 uppercase italic">
          Super Admin Console
        </h1>
        <p className="text-black/50 max-w-2xl text-sm md:text-base font-medium leading-relaxed">
          Global system overview, decentralized node monitoring, and organization verification queue. 
          Manage the entire OneVote infrastructure from a single pane of glass.
        </p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-12">
        <MetricCard
          icon={<Users size={18} />}
          label="Total Voters"
          value="14,204"
          detail="+8% this cycle"
        />
        <MetricCard
          icon={<Activity size={18} />}
          label="Nodes Online"
          value="32"
          status="Operational"
        />
        <MetricCard
          icon={<Database size={18} />}
          label="Total Elections"
          value={elections?.length || 0}
          detail={`${ongoingCount} active`}
        />
        <MetricCard
          icon={<Settings size={18} />}
          label="Sys Health"
          value="99.9%"
          detail="Uptime"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
        {/* Main Content */}
        <div className="lg:col-span-8 space-y-16">
          {/* Verification Queue Section */}
          <section className="space-y-6">
            <div className="px-2">
              <h2 className="text-xl md:text-2xl font-bold text-black tracking-tight flex items-center gap-3">
                Verification Queue
                <span className="text-[10px] bg-black/5 text-black/40 px-3 py-1 rounded-full uppercase font-black">Pending Approval</span>
              </h2>
            </div>
            <div className="bg-white border border-black/5 rounded-[2.5rem] p-2 md:p-4 max-h-[600px] overflow-y-auto custom-scrollbar shadow-2xl shadow-black/[0.02]">
              <AdminDashboardOverview />
            </div>
          </section>

          {/* Registry Section */}
          <section className="bg-black/[0.01] rounded-[3rem] p-1 md:p-8 border border-dashed border-black/5">
            <GlobalElectionManagement />
          </section>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-black text-white p-8 md:p-10 rounded-[3rem] space-y-8 shadow-2xl shadow-black/20 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-1000" />
            
            <div className="relative z-10 space-y-2">
              <h3 className="text-xl font-bold tracking-tight">Quick Control</h3>
              <p className="text-white/40 text-xs font-medium leading-relaxed">Access core system settings and global audit logs.</p>
            </div>

            <div className="space-y-3 relative z-10">
              <QuickAction icon={<ShieldCheck size={14} />} label="Security Protocols" />
              <QuickAction icon={<Users size={14} />} label="Global User Policy" />
              <QuickAction icon={<Database size={14} />} label="Audit Logs" />
              <QuickAction icon={<Settings size={14} />} label="Core Settings" />
            </div>
            
            <div className="pt-4 relative z-10">
              <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30 mb-2">Node Version</p>
                <div className="flex justify-between items-end">
                  <p className="text-lg font-mono font-bold tracking-tighter">v2.4.0-stable</p>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-ping" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] border border-black/5 shadow-sm space-y-6">
             <div className="flex items-center gap-3">
               <div className="w-8 h-8 bg-black/5 rounded-full flex items-center justify-center">
                 <Activity size={14} className="text-black/40" />
               </div>
               <h4 className="font-bold text-black tracking-tight">Technical Specs</h4>
             </div>
             <p className="text-black/40 text-xs leading-relaxed font-medium">
               Running on Nexus 2.0. Distributed ledger consistency is currently 100%. Node synchronization is active across all global clusters.
             </p>
             <div className="pt-4 border-t border-black/5 flex justify-between items-center">
                <span className="text-[9px] font-black uppercase text-black/20">Latency</span>
                <span className="text-[10px] font-bold text-black">12ms</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

function MetricCard({ icon, label, value, detail, status }: any) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-black/5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="text-black/30 bg-black/5 p-2 rounded-lg">
          {icon}
        </div>
        {status && (
          <span className="text-[9px] font-bold uppercase tracking-widest text-green-600 flex items-center gap-1.5">
            <span className="w-1 h-1 bg-green-600 rounded-full animate-pulse" />
            {status}
          </span>
        )}
      </div>
      <div className="text-[10px] font-bold uppercase tracking-widest text-black/30 mb-1">{label}</div>
      <div className="text-2xl font-bold text-black mb-1">{value}</div>
      <div className="text-[10px] font-medium text-black/40 italic">{detail}</div>
    </div>
  );
}

function QuickAction({ icon, label }: any) {
  return (
    <button className="w-full flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-white/80 text-[10px] font-bold uppercase tracking-widest text-left">
      <div className="flex items-center gap-3">
        {icon}
        {label}
      </div>
      <ArrowRight size={12} className="opacity-30" />
    </button>
  );
}
