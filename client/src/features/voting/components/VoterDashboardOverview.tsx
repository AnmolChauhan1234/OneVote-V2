"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Vote, History, TrendingUp, Info, User, LayoutDashboard, Loader2 } from "lucide-react";
import Link from "next/link";
import { IdentifierMapper } from "@/features/auth/components/IdentifierMapper";
import { useMyElections } from "@/features/election/hooks/election.hooks";

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
  const [activeTab, setActiveTab] = useState<"overview" | "identity">("overview");
  const { data: elections, isLoading: isElectionsLoading } = useMyElections();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="space-y-10"
      >
        {/* Header Section */}
        <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <motion.h1
              variants={itemVariants}
              className="text-5xl font-bold tracking-tighter text-black"
            >
              Voter Dashboard
            </motion.h1>
            <motion.p
              variants={itemVariants}
              className="mt-3 text-lg text-black/60 max-w-xl font-light"
            >
              Manage your verified identities and participate in secure elections across your organizations.
            </motion.p>
          </div>

          <motion.div variants={itemVariants} className="flex border-b border-black/5">
            {[
              { id: "overview", label: "Overview", icon: <LayoutDashboard size={14} /> },
              { id: "identity", label: "My Identities", icon: <User size={14} /> },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] transition-all relative ${activeTab === tab.id ? "text-black" : "text-black/30 hover:text-black"
                  }`}
              >
                {tab.icon}
                {tab.label}
                {activeTab === tab.id && (
                  <motion.div layoutId="voterTab" className="absolute bottom-0 left-0 right-0 h-1 bg-black" />
                )}
              </button>
            ))}
          </motion.div>
        </section>

        <AnimatePresence mode="wait">
          {activeTab === "overview" ? (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-10"
            >
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                  title="Eligible Elections"
                  value={String(elections?.length || 0)}
                  icon={<TrendingUp className="text-black/40" />}
                />
                <StatCard
                  title="Votes Cast"
                  value="—"
                  icon={<Vote className="text-black/40" />}
                />
                <StatCard
                  title="Completion Rate"
                  value="—"
                  icon={<History className="text-black/40" />}
                />
              </div>

              {/* Active Elections */}
              <section className="space-y-6">
                <div className="flex items-center justify-between border-b border-black/5 pb-4">
                  <h2 className="text-3xl font-bold tracking-tight">Your Elections</h2>
                </div>

                {isElectionsLoading ? (
                  <div className="flex h-40 items-center justify-center">
                    <Loader2 className="animate-spin text-black/20" size={28} />
                  </div>
                ) : !elections || elections.length === 0 ? (
                  <div className="py-20 bg-white border border-dashed border-black/10 text-center">
                    <Vote size={48} className="mx-auto text-black/10 mb-4" />
                    <p className="text-sm font-bold text-black/40">You are not linked to any elections yet.</p>
                    <p className="text-xs text-black/30 mt-2 max-w-md mx-auto">
                      Go to the "My Identities" tab and link your organizational ID (e.g. roll number) to start seeing elections.
                    </p>
                    <button
                      onClick={() => setActiveTab("identity")}
                      className="mt-6 bg-black text-white px-8 py-3 text-[10px] font-bold uppercase tracking-[0.2em] hover:shadow-lg transition active:scale-95"
                    >
                      Link Identity
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {elections.map((election: any) => (
                      <div
                        key={election.id}
                        className="group relative bg-white border border-black/5 p-8 hover:shadow-2xl transition-all duration-500 overflow-hidden"
                      >
                        <div className="absolute top-0 left-0 w-full h-[2px] bg-black translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                        <div className="flex justify-between items-start mb-6">
                          <div className="p-3 bg-black/5 rounded-none">
                            <Vote size={20} />
                          </div>
                          <span className={`text-[9px] uppercase tracking-widest px-3 py-1 font-bold ${election.status === 'ONGOING' ? 'bg-green-600 text-white' :
                            election.status === 'UPCOMING' ? 'bg-black text-white' :
                              'bg-black/10 text-black/60'
                            }`}>
                            {election.status}
                          </span>
                        </div>
                        <h3 className="text-xl font-bold mb-2 tracking-tight">{election.title}</h3>
                        <p className="text-xs text-black/40 mb-3 font-medium leading-relaxed line-clamp-2">
                          {election.description || "No description available."}
                        </p>
                        <p className="text-[10px] text-black/30 mb-6">
                          Ends: {new Date(election.end_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </p>
                        <Link
                          href={`/dashboard/user/vote/${election.id}`}
                          className={`w-full py-4 text-center block bg-black text-white text-[10px] font-bold uppercase tracking-[0.2em] transition hover:shadow-xl active:scale-95 ${election.status !== 'ONGOING' ? 'opacity-30 cursor-not-allowed pointer-events-none' : ''}`}
                        >
                          {election.status === 'ONGOING' ? 'Launch Ballot' :
                            election.status === 'UPCOMING' ? 'Not Started Yet' : 'Completed'}
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* Information Section */}
              <div className="bg-black text-white p-12 flex flex-col md:flex-row items-center justify-between gap-10">
                <div className="flex items-start gap-6">
                  <div className="bg-white/10 p-4">
                    <Info className="text-white" size={28} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">Your Vote Matters.</h3>
                    <p className="text-white/40 text-sm max-w-lg leading-relaxed">
                      Every ballot cast on OneVote is encrypted end-to-end and stored on an immutable ledger.
                      Your privacy is our priority, and transparency is our promise.
                    </p>
                  </div>
                </div>
                <button className="whitespace-nowrap border border-white/20 px-10 py-4 text-[10px] uppercase tracking-widest font-bold hover:bg-white hover:text-black transition duration-500">
                  Audit Verification
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="identity"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="max-w-4xl"
            >
              <IdentifierMapper />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

function StatCard({ title, value, icon }: { title: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="bg-white border border-black/5 p-8 flex items-center justify-between hover:border-black transition-all duration-500 group">
      <div>
        <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-black/30 mb-2 group-hover:text-black/50 transition-colors">{title}</p>
        <p className="text-4xl font-bold tracking-tighter">{value}</p>
      </div>
      <div className="p-4 bg-black/5 group-hover:bg-black group-hover:text-white transition-all duration-500">
        {icon}
      </div>
    </div>
  );
}
