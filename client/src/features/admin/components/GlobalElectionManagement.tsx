"use client";

import { useState, useMemo } from "react";
import {
  Search,
  Building2,
  Clock,
  ShieldAlert,
  ArrowRight,
  ExternalLink,
  Loader2,
  Inbox
} from "lucide-react";
import { useAdminElections, useUpdateElection } from "@/features/election/hooks/election.hooks";
import { useOrganisations } from "@/features/organisation/hooks/organisation.hooks";
import { ElectionManagementHub } from "@/features/election/components/ElectionManagementHub";
import { motion, AnimatePresence } from "framer-motion";

export function GlobalElectionManagement() {
  const [selectedElectionId, setSelectedElectionId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: elections, isLoading: isElectionsLoading } = useAdminElections();
  const { data: organisations, isLoading: isOrgsLoading } = useOrganisations();
  const { mutate: updateElection } = useUpdateElection(""); // We'll set the ID dynamically

  const filteredElections = useMemo(() => {
    if (!elections) return [];
    return elections.filter(election =>
      election.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      election.org_id.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [elections, searchQuery]);

  const orgMap = useMemo(() => {
    if (!organisations) return {};
    return organisations.reduce((acc: any, org: any) => {
      acc[org.id] = org.name;
      return acc;
    }, {});
  }, [organisations]);

  if (selectedElectionId) {
    return (
      <ElectionManagementHub
        electionId={selectedElectionId}
        onBack={() => setSelectedElectionId(null)}
      />
    );
  }

  if (isElectionsLoading || isOrgsLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center bg-white/50 backdrop-blur-md rounded-3xl border border-black/5">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-black/20" size={40} />
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/30">Syncing Registry...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Search Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 px-2">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tighter text-black flex items-center gap-3">
            Election Registry
            <span className="text-[10px] font-black bg-black text-white px-2 py-0.5 rounded-full">{filteredElections.length}</span>
          </h2>
          <p className="text-xs font-medium text-black/40">Manage global election lifecycle and overrides.</p>
        </div>
        <div className="relative w-full sm:w-72 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-black/30 group-focus-within:text-black transition-colors" size={14} />
          <input
            type="text"
            placeholder="Search registry..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-black/5 focus:border-black/20 focus:ring-4 focus:ring-black/5 rounded-2xl text-xs font-bold outline-none transition-all shadow-sm"
          />
        </div>
      </div>

      {/* Registry Display */}
      <div className="grid grid-cols-1 gap-4 lg:hidden">
        {/* Mobile View: Cards */}
        {filteredElections.map((election) => (
          <motion.div
            key={election.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-black/5 p-6 rounded-3xl space-y-4 shadow-sm active:scale-[0.98] transition-transform"
            onClick={() => setSelectedElectionId(election.id)}
          >
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <StatusBadge status={election.status} />
                <h3 className="font-bold text-black text-lg tracking-tight line-clamp-1">{election.title}</h3>
                <div className="flex items-center gap-2 text-[10px] font-bold text-black/30 uppercase tracking-widest">
                  <Building2 size={10} />
                  {orgMap[election.org_id] || "System"}
                </div>
              </div>
              <button className="p-2 bg-black/5 rounded-full">
                <ArrowRight size={16} />
              </button>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-black/5">
              <div className="flex items-center gap-2 text-[10px] font-bold text-black/40 uppercase">
                <Clock size={12} />
                Ends {new Date(election.end_date).toLocaleDateString()}
              </div>
              {election.manual_override && (
                <div className="flex items-center gap-1 text-[9px] font-black text-orange-600 bg-orange-50 px-2 py-1 rounded-full uppercase">
                  <ShieldAlert size={10} /> Override
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Desktop View: Enhanced Table */}
      <div className="hidden lg:block bg-white border border-black/5 rounded-[2rem] overflow-hidden shadow-xl shadow-black/[0.02]">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-black/[0.01] border-b border-black/5">
              <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-black/30">Election Identity</th>
              <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-black/30">Host Organization</th>
              <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-black/30">Governance State</th>
              <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-black/30">Persistence</th>
              <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-black/30 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5">
            {filteredElections.map((election, idx) => (
              <motion.tr
                key={election.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: idx * 0.05 }}
                className="group hover:bg-black/[0.01] transition-colors"
                onDoubleClick={() => setSelectedElectionId(election.id)}
              >
                <td className="px-8 py-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-black/[0.03] rounded-2xl flex items-center justify-center font-black text-black/20 group-hover:bg-black group-hover:text-white transition-all duration-500 text-lg">
                      {election.title[0]}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-black tracking-tight">{election.title}</p>
                      <p className="text-[10px] font-mono text-black/20 uppercase tracking-tighter">{election.id.slice(0, 8)}...</p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <div className="flex items-center gap-2 text-[11px] font-bold text-black/60">
                    <div className="w-6 h-6 rounded-full bg-black/5 flex items-center justify-center">
                      <Building2 size={10} className="text-black/30" />
                    </div>
                    {orgMap[election.org_id] || "System"}
                  </div>
                </td>
                <td className="px-8 py-6">
                  <div className="flex items-center gap-3">
                    <StatusBadge status={election.status} />
                    {election.manual_override && (
                      <div className="group/ov relative">
                        <ShieldAlert size={14} className="text-orange-500 animate-pulse" />
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-[8px] font-bold rounded opacity-0 group-hover/ov:opacity-100 transition-opacity whitespace-nowrap z-50">
                          Manual Override Active
                        </div>
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-8 py-6">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-black/40 uppercase tracking-wider">
                      <Clock size={10} />
                      {new Date(election.end_date).toLocaleDateString()}
                    </div>
                    <div className="w-24 h-1 bg-black/5 rounded-full overflow-hidden">
                      <div className="h-full bg-black/20 w-1/3" />
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6 text-right">
                  <div className="flex items-center justify-end gap-2 pr-2">
                    <button
                      onClick={() => setSelectedElectionId(election.id)}
                      className="h-10 px-6 bg-black text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:shadow-lg hover:-translate-y-0.5 transition-all active:scale-95 flex items-center gap-2"
                    >
                      Manage
                      <ExternalLink size={12} />
                    </button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>

        {filteredElections.length === 0 && (
          <div className="py-32 text-center">
            <div className="w-20 h-20 bg-black/5 rounded-full flex items-center justify-center mx-auto mb-6">
              <Inbox size={32} className="text-black/10" />
            </div>
            <p className="text-sm font-bold text-black/20 uppercase tracking-[0.3em]">Registry Empty</p>
            <p className="text-xs text-black/10 mt-2 font-medium">No matching election records found in the ledger.</p>
          </div>
        )}
      </div>

      {/* Footer System Status */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 px-4 py-8 border-t border-black/5">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-black/40">Sync Protocol: Active</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-black/40">Audit: Passed</span>
          </div>
        </div>
        <p className="text-[9px] font-bold text-black/20 uppercase tracking-[0.2em]">OneVote Node Registry v2.4.0</p>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: any = {
    ONGOING: "bg-green-500/10 text-green-700 border-green-200",
    COMPLETED: "bg-red-500/10 text-red-700 border-red-200",
    UPCOMING: "bg-blue-500/10 text-blue-700 border-blue-200",
  };

  return (
    <span className={`px-3 py-1 text-[9px] font-black uppercase tracking-widest border rounded-full ${styles[status] || "bg-black/5 text-black/40 border-black/10"}`}>
      {status}
    </span>
  );
}
