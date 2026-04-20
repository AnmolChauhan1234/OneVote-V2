"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { Users, FileText, BarChart3, Settings, Plus, LayoutDashboard, Calendar, ArrowRight } from "lucide-react";
import { CreateElectionForm } from "@/features/election/components/CreateElectionForm";
import { useElections } from "@/features/election/hooks/election.hooks";

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

import { ElectionManagementHub } from "@/features/election/components/ElectionManagementHub";

interface Props {
  orgId: string;
}

export function OrgDashboardOverview({ orgId }: Props) {
  const [isCreatingElection, setIsCreatingElection] = useState(false);
  const [selectedElectionId, setSelectedElectionId] = useState<string | null>(null);
  const { data: elections, isLoading } = useElections();

  // Filter elections for this org (though the backend should technically only return those for the user)
  const orgElections = elections || [];

  if (isCreatingElection) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <CreateElectionForm
          orgId={orgId}
          onCancel={() => setIsCreatingElection(false)}
        />
      </div>
    );
  }

  if (selectedElectionId) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <ElectionManagementHub 
          electionId={selectedElectionId} 
          onBack={() => setSelectedElectionId(null)} 
        />
      </div>
    );
  }

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
            <button
              onClick={() => setIsCreatingElection(true)}
              className="bg-black text-white px-6 py-3 text-xs font-bold uppercase tracking-widest flex items-center gap-2 hover:shadow-xl transition transition-all active:scale-95"
            >
              <Plus size={16} />
              Create Election
            </button>
          </motion.div>
        </section>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard title="Total Elections" value={orgElections.length.toString()} icon={<LayoutDashboard size={18} />} />
          <StatCard title="Total Voters" value="0" icon={<Users size={18} />} />
          <StatCard title="Avg. Participation" value="0%" icon={<BarChart3 size={18} />} />
          <StatCard title="Reports Generated" value="0" icon={<FileText size={18} />} />
        </div>

        {/* Management Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main List */}
          <motion.div variants={itemVariants} className="lg:col-span-2 space-y-6">
            <h2 className="text-2xl font-bold">Your Elections</h2>
            <div className="bg-white border border-black/5 overflow-hidden">
              {orgElections.length === 0 ? (
                <div className="py-20 text-center space-y-4">
                  <div className="inline-flex p-4 bg-black/5 rounded-full text-black/20">
                    <Calendar size={32} />
                  </div>
                  <p className="text-sm text-black/40 font-medium">No elections created yet.</p>
                  <button
                    onClick={() => setIsCreatingElection(true)}
                    className="text-xs font-bold uppercase tracking-widest hover:underline"
                  >
                    Start your first election
                  </button>
                </div>
              ) : (
                <table className="w-full text-left">
                  <thead className="bg-black text-white text-[10px] uppercase tracking-widest ">
                    <tr>
                      <th className="px-6 py-3 font-bold">Election Name</th>
                      <th className="px-6 py-3 font-bold">Status</th>
                      <th className="px-6 py-3 font-bold">Start Date</th>
                      <th className="px-6 py-3 font-bold"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/5 text-sm">
                    {orgElections.map((election) => (
                      <tr key={election.id} className="hover:bg-black/5 transition group">
                        <td className="px-6 py-4">
                          <p className="font-bold text-black">{election.title}</p>
                          <p className="text-[10px] text-black/40 uppercase tracking-tighter truncate max-w-[200px]">ID: {election.id}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${election.status === 'ACTIVE' ? 'bg-green-500 animate-pulse' :
                                election.status === 'UPCOMING' ? 'bg-blue-500' : 'bg-black/20'
                              }`} />
                            <span className="text-[10px] font-bold uppercase tracking-widest">{election.status}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4 font-medium text-black/60 capitalize">
                          {new Date(election.start_date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button 
                            onClick={() => setSelectedElectionId(election.id)}
                            className="h-8 w-8 flex items-center justify-center bg-black/5 rounded-full hover:bg-black hover:text-white transition group-hover:scale-110"
                          >
                            <ArrowRight size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
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
