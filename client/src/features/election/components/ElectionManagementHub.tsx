"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Users,
  UserPlus,
  Trophy,
  FileText,
  Settings,
  Plus,
  LayoutDashboard,
  Calendar,
  Clock,
  ChevronRight,
  ShieldAlert,
  BarChart3
} from "lucide-react";
import { useElectionDetail, usePositions, useVoters, useCandidates, useUpdateElection } from "../hooks/election.hooks";
import { useMe } from "@/features/auth/hooks/auth.hooks";
import { ROLES } from "@/constants/roles";
import { Loader2 } from "lucide-react";
import { CreatePositionForm } from "./CreatePositionForm";
import { CreateCandidateForm } from "./CreateCandidateForm";
import { BulkImportVotersForm } from "./BulkImportVotersForm";
import { UpdateElectionForm } from "./UpdateElectionForm";
import { ElectionResults } from "./ElectionResults";
import { AnimatePresence } from "framer-motion";
import { parseAPIDate } from "@/lib/utils/dateUtils";

interface Props {
  electionId: string;
  onBack: () => void;
  activeTab?: "overview" | "positions" | "voters" | "settings" | "results";
  onTabChange?: (tab: any) => void;
}

export function ElectionManagementHub({ 
  electionId, 
  onBack, 
  activeTab: externalTab, 
  onTabChange 
}: Props) {
  const [internalTab, setInternalTab] = useState<"overview" | "positions" | "voters" | "settings" | "results">("overview");
  
  // Support both controlled and uncontrolled usage
  const activeTab = externalTab || internalTab;
  const setActiveTab = onTabChange || setInternalTab;
  
  const [isAddingPosition, setIsAddingPosition] = useState(false);
  const [selectedPositionId, setSelectedPositionId] = useState<string | null>(null);
  const [isAddingCandidate, setIsAddingCandidate] = useState(false);
  const [isImportingVoters, setIsImportingVoters] = useState(false);

  const { data: election, isLoading: isElectionLoading, refetch: refetchElection } = useElectionDetail(electionId);
  const { data: positions, isLoading: isPositionsLoading } = usePositions(electionId);
  const { data: voters, isLoading: isVotersLoading } = useVoters(electionId);
  const { data: user } = useMe();

  // 🔥 AUTO-REFRESH STATUS
  // This effect ensures the UI stays in sync with the backend worker
  // It schedules a refetch for the exact moment the election status is expected to change
  useEffect(() => {
    if (!election || election.status === "COMPLETED") return;

    const now = new Date().getTime();
    const startTime = parseAPIDate(election.start_date).getTime();
    const endTime = parseAPIDate(election.end_date).getTime();

    let targetTime = null;
    if (election.status === "UPCOMING" && startTime > now) {
      targetTime = startTime;
    } else if (election.status === "ONGOING" && endTime > now) {
      targetTime = endTime;
    }

    if (targetTime) {
      // Add a 2-second buffer to allow backend worker/sync to complete
      const delay = (targetTime - now) + 2000;

      // Only set timer if it's within a reasonable range (setTimeout limit is ~24 days)
      if (delay > 0 && delay < 2147483647) {
        const timer = setTimeout(() => {
          refetchElection();
        }, delay);
        return () => clearTimeout(timer);
      }
    }
  }, [election?.status, election?.start_date, election?.end_date, refetchElection]);

  const getElectionControls = () => {
    if (!election) return null;
    const status = election.status;
    const isSuperAdmin = user?.role === ROLES.SUPERADMIN;

    const now = new Date();
    const startTime = parseAPIDate(election.start_date);
    const diffInMins = (startTime.getTime() - now.getTime()) / (1000 * 60);
    const isSafetyLocked = status === "UPCOMING" && diffInMins <= 60;

    return {
      canEditFull: (status === "UPCOMING" && !isSafetyLocked) || isSuperAdmin,
      canEditLimited: status === "ONGOING" || isSuperAdmin,
      canAddPositions: (status === "UPCOMING" && !isSafetyLocked) || isSuperAdmin,
      canAddCandidates: (status === "UPCOMING" && !isSafetyLocked) || isSuperAdmin,
      canAddVoters: (status === "UPCOMING" && !isSafetyLocked) || isSuperAdmin,
      isSafetyLocked,
      isOngoing: status === "ONGOING",
      isCompleted: status === "COMPLETED" && !isSuperAdmin,
      isSuperAdmin
    };
  };

  const controls = getElectionControls();

  if (isElectionLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="animate-spin text-black/20" size={32} />
      </div>
    );
  }

  if (!election) return null;

  const formatDate = (dateStr: string) => {
    return parseAPIDate(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Top Navigation */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-black/50 hover:text-black transition group"
      >
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
        <span className="text-xs font-bold uppercase tracking-widest">Back to Dashboard</span>
      </button>

      {/* Header Card */}
      <div className="bg-black text-white p-8 md:p-16 rounded-[2.5rem] relative overflow-hidden shadow-2xl shadow-black/20 group">
        <div className="relative z-10 space-y-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] rounded-full shadow-lg 
              ${election.status === 'ONGOING' ? 'bg-green-500 text-white shadow-green-500/20' :
                election.status === 'COMPLETED' ? 'bg-red-500 text-white shadow-red-500/20' : 'bg-blue-600 text-white shadow-blue-500/20'}`}>
              {election.status}
            </div>
            {election.manual_override && (
              <div className="px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] bg-orange-500 text-white rounded-full shadow-lg shadow-orange-500/20 flex items-center gap-2">
                <ShieldAlert size={12} />
                Manual Override
              </div>
            )}
            <div className="text-white/40 text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-3 bg-white/5 px-4 py-1.5 rounded-full backdrop-blur-md">
              <Clock size={12} className="text-white/20" />
              {election.status === 'UPCOMING' ? `Activation ${formatDate(election.start_date)}` :
                election.status === 'ONGOING' ? `Activated ${formatDate(election.start_date)}` :
                  `Concluded ${formatDate(election.end_date)}`}
            </div>
          </div>

          <div className="space-y-4">
            <h1 className="text-4xl md:text-7xl font-bold tracking-tighter leading-none uppercase italic group-hover:translate-x-2 transition-transform duration-700">
              {election.title}
            </h1>
            <p className="text-white/50 max-w-2xl text-sm md:text-lg font-medium leading-relaxed">
              {election.description || "No description provided for this election node. The ledger entries will determine the scope of this protocol."}
            </p>
          </div>

          <div className="flex items-center gap-8 pt-4">
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-white/20">Protocol ID</p>
              <p className="font-mono text-xs text-white/40">{election.id}</p>
            </div>
          </div>
        </div>

        {/* Abstract Background Design */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/[0.03] rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-1000" />
        <div className="absolute bottom-0 left-10 w-40 h-1 bg-white/20" />
      </div>

      {/* Tabs */}
      <div className="flex border-b border-black/5 overflow-x-auto no-scrollbar">
        {[
          { id: "overview", label: "Overview", icon: <LayoutDashboard size={14} /> },
          { id: "positions", label: `Positions (${positions?.length || 0})`, icon: <Trophy size={14} /> },
          { id: "voters", label: `Voters (${voters?.length || 0})`, icon: <Users size={14} /> },
          ...(election.status === "COMPLETED" ? [{ id: "results" as const, label: "Results", icon: <BarChart3 size={14} /> }] : []),
          { id: "settings", label: "Settings", icon: <Settings size={14} /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-8 py-4 text-[11px] font-bold uppercase tracking-widest transition-all relative whitespace-nowrap ${activeTab === tab.id ? "text-black" : "text-black/30 hover:text-black"
              }`}
          >
            {tab.icon}
            {tab.label}
            {activeTab === tab.id && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-1 bg-black"
              />
            )}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="grid grid-cols-1 gap-10">
        {activeTab === "overview" && (
          <OverviewTab election={election} positions={positions} voters={voters} controls={controls} />
        )}
        {activeTab === "results" && (
          <ElectionResults electionId={electionId} />
        )}
        {activeTab === "positions" && (
          <PositionsTab
            electionId={electionId}
            positions={positions}
            onAddPosition={() => setIsAddingPosition(true)}
            onAddCandidate={(posId: string) => {
              setSelectedPositionId(posId);
              setIsAddingCandidate(true);
            }}
            controls={controls}
          />
        )}
        {activeTab === "voters" && (
          <VotersTab
            electionId={electionId}
            voters={voters}
            onImportVoters={() => setIsImportingVoters(true)}
            controls={controls}
          />
        )}
        {activeTab === "settings" && (
          <div className="space-y-12">
            <UpdateElectionForm
              election={election}
              onSuccess={() => setActiveTab("overview")}
              disabled={!(controls?.canEditFull || controls?.canEditLimited)}
              isSafetyLocked={controls?.isSafetyLocked}
            />

            {controls?.isSuperAdmin && (
              <ManualOverrideSection election={election} />
            )}
          </div>
        )}
      </div>

      {/* MODALS */}
      <AnimatePresence>
        {isAddingPosition && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddingPosition(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative z-10 w-full max-w-lg"
            >
              <CreatePositionForm
                electionId={electionId}
                onCancel={() => setIsAddingPosition(false)}
              />
            </motion.div>
          </div>
        )}

        {isAddingCandidate && selectedPositionId && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddingCandidate(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative z-10 w-full max-w-lg"
            >
              <CreateCandidateForm
                positionId={selectedPositionId}
                onCancel={() => {
                  setIsAddingCandidate(false);
                  setSelectedPositionId(null);
                }}
              />
            </motion.div>
          </div>
        )}

        {isImportingVoters && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsImportingVoters(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative z-10 w-full max-w-lg"
            >
              <BulkImportVotersForm
                electionId={electionId}
                onCancel={() => setIsImportingVoters(false)}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function OverviewTab({ election, positions, voters, controls }: any) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div className="md:col-span-2 space-y-8">
        {controls?.isSafetyLocked && (
          <div className="p-6 bg-red-50 border border-red-200 flex items-start gap-4 animate-pulse">
            <Clock className="text-red-500 mt-1" size={20} />
            <div>
              <p className="text-sm font-bold text-red-900">Election Lockdown Active</p>
              <p className="text-xs text-red-700 mt-1">We are within 60 minutes of the start time. To ensure data integrity, all candidate and voter lists are now locked. No further modifications are allowed.</p>
            </div>
          </div>
        )}
        {election.status === "UPCOMING" && !controls?.isSafetyLocked && (
          <div className="p-6 bg-blue-50 border border-blue-100 flex items-start gap-4">
            <Clock className="text-blue-500 mt-1" size={20} />
            <div>
              <p className="text-sm font-bold text-blue-900">Election is Upcoming</p>
              <p className="text-xs text-blue-700 mt-1">Full configuration is allowed. Make sure all candidates and voters are added before the 60-minute lockdown.</p>
            </div>
          </div>
        )}
        {election.status === "ONGOING" && (
          <div className="p-6 bg-green-50 border border-green-100 flex items-start gap-4">
            <Clock className="text-green-500 mt-1" size={20} />
            <div>
              <p className="text-sm font-bold text-green-900">Election is Live</p>
              <p className="text-xs text-green-700 mt-1">Core settings and candidate lists are locked to ensure election integrity. Only end date and description can be modified.</p>
            </div>
          </div>
        )}
        <div className="bg-white border border-black/5 p-8 space-y-6">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <FileText size={20} />
            Quick Stats
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-6 bg-black/5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-black/40">Total Positions</p>
              <p className="text-3xl font-bold mt-2">{positions?.length || 0}</p>
            </div>
            <div className="p-6 bg-black/5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-black/40">Total Voters</p>
              <p className="text-3xl font-bold mt-2">{voters?.length || 0}</p>
            </div>
          </div>
        </div>
      </div>
      <div className="space-y-8">
        <div className="bg-white border border-black/5 p-8 space-y-6">
          <h3 className="text-xl font-bold">Timeline</h3>
          <div className="space-y-6">
            <div className="relative pl-6 border-l-2 border-black/5">
              <div className="absolute -left-[5px] top-0 w-2 h-2 rounded-full bg-black" />
              <p className="text-[10px] font-bold uppercase tracking-widest text-black/40">Starts</p>
              <p className="text-sm font-bold">{parseAPIDate(election.start_date).toLocaleString()}</p>
            </div>
            <div className="relative pl-6 border-l-2 border-black/5">
              <div className="absolute -left-[5px] top-0 w-2 h-2 rounded-full bg-black" />
              <p className="text-[10px] font-bold uppercase tracking-widest text-black/40">Ends</p>
              <p className="text-sm font-bold">{parseAPIDate(election.end_date).toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PositionsTab({ electionId, positions, onAddPosition, onAddCandidate, controls }: any) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">Active Positions</h2>
        {controls?.canAddPositions && (
          <button
            onClick={onAddPosition}
            className="bg-black text-white px-6 py-2 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 hover:shadow-lg transition active:scale-95"
          >
            <Plus size={14} />
            Add Position
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-8">
        {positions?.length === 0 ? (
          <div className="py-20 bg-white border border-black/5 text-center">
            <Trophy size={48} className="mx-auto text-black/10 mb-4" />
            <p className="text-sm font-bold text-black/40">No positions defined for this election.</p>
            <button
              onClick={onAddPosition}
              className="mt-4 text-xs font-bold uppercase tracking-widest hover:underline"
            >
              Define your first role
            </button>
          </div>
        ) : (
          positions?.map((pos: any) => (
            <div key={pos.id} className="space-y-4">
              <div className="bg-white border border-black/5 p-6 hover:border-black/20 transition group relative">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="text-xl font-bold tracking-tight text-black">{pos.name}</h4>
                    <p className="text-sm text-black/60 mt-1 line-clamp-2 max-w-2xl">{pos.description || "No description provided."}</p>

                    <div className="mt-4 flex flex-wrap gap-3">
                      <span className="text-[9px] font-bold uppercase tracking-widest bg-black text-white px-3 py-1.5 shadow-sm">
                        {pos.max_candidates_selectable} Selection Spot(s)
                      </span>
                      {controls?.canAddCandidates && (
                        <button
                          onClick={() => onAddCandidate(pos.id)}
                          className="text-[9px] font-bold uppercase tracking-widest border border-black px-3 py-1.5 hover:bg-black hover:text-white transition flex items-center gap-2 group"
                        >
                          <Plus size={12} className="group-hover:rotate-90 transition-transform" />
                          Add Candidate
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="ml-4">
                    <button className="h-10 w-10 flex items-center justify-center bg-black/5 rounded-full hover:bg-black hover:text-white transition">
                      <Settings size={16} />
                    </button>
                  </div>
                </div>
              </div>

              {/* CANDIDATES LIST UNDER THIS POSITION */}
              <div className="pl-6 border-l-2 border-black/5">
                <CandidateList positionId={pos.id} />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function CandidateList({ positionId }: { positionId: string }) {
  const { data: candidates, isLoading } = useCandidates(positionId);

  if (isLoading) {
    return <div className="py-4 text-[10px] uppercase tracking-widest text-black/20 font-bold">Loading candidates...</div>;
  }

  if (!candidates || candidates.length === 0) {
    return (
      <div className="py-4 text-[10px] uppercase tracking-widest text-black/40 font-bold italic">
        No candidates added to this position yet.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 py-4">
      {candidates.map((candidate: any) => (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          key={candidate.id}
          className="bg-white border border-black/5 p-4 flex items-center gap-4 hover:shadow-md transition group"
        >
          <div className="w-12 h-12 bg-black/5 shrink-0 overflow-hidden relative">
            {candidate.image_url ? (
              <img src={candidate.image_url} alt={candidate.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-black/20 font-bold text-lg">
                {candidate.name[0]}
              </div>
            )}
          </div>
          <div className="min-w-0">
            <h5 className="text-sm font-bold truncate">{candidate.name}</h5>
            <p className="text-[10px] text-black/40 truncate">{candidate.biography || "No biography provided."}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function VotersTab({ electionId, voters, onImportVoters, controls }: any) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">Eligible Voters</h2>
        <div className="flex gap-4">
          <button className="bg-black/5 text-black px-6 py-2 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-black/10 transition">
            Export List
          </button>
          {controls?.canAddVoters && (
            <button
              onClick={onImportVoters}
              className="bg-black text-white px-6 py-2 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 hover:shadow-lg transition active:scale-95"
            >
              <UserPlus size={14} />
              Bulk Import CSV
            </button>
          )}
        </div>
      </div>

      <div className="bg-white border border-black/5 overflow-hidden">
        {voters?.length === 0 ? (
          <div className="py-20 text-center">
            <Users size={48} className="mx-auto text-black/10 mb-4" />
            <p className="text-sm font-bold text-black/40">No voters added to this election yet.</p>
            <button
              onClick={onImportVoters}
              className="mt-4 text-xs font-bold uppercase tracking-widest hover:underline"
            >
              Upload your voter list
            </button>
          </div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-black/5 text-black text-[10px] font-bold uppercase tracking-widest">
              <tr>
                <th className="px-6 py-3">Voter Identifier</th>
                <th className="px-6 py-3">User Status</th>
                <th className="px-6 py-3">Added Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {voters?.map((voter: any) => (
                <tr key={voter.id} className="text-sm hover:bg-black/5 transition">
                  <td className="px-6 py-4 font-medium tracking-tight">{voter.unique_identifier}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 text-[9px] font-bold uppercase ${voter.voter_id ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                      }`}>
                      {voter.voter_id ? 'Registered' : 'Invite Sent'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-black/40 font-medium">
                    {new Date(voter.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function ManualOverrideSection({ election }: { election: any }) {
  const { mutate: updateElection, isPending } = useUpdateElection(election.id);
  const [reason, setReason] = useState("");
  const [newStatus, setNewStatus] = useState<any>(election.status);

  const handleOverride = () => {
    if (!reason) {
      alert("Please provide a reason for manual override.");
      return;
    }
    updateElection({
      status: newStatus,
      manual_override: true,
      override_reason: reason
    });
  };

  return (
    <div className="mt-8 bg-orange-50 border border-orange-200 p-8 space-y-6">
      <div className="space-y-1">
        <h3 className="text-xl font-bold text-orange-900">Super Admin Manual Override</h3>
        <p className="text-xs text-orange-700">Manually force an election state. Use only for emergencies, system failures, or legal interventions. All actions are logged.</p>
      </div>

      <div className="space-y-4 max-w-lg">
        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-widest text-orange-900">New Forced Status</label>
          <select
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value as any)}
            className="w-full bg-white border border-orange-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="UPCOMING">UPCOMING</option>
            <option value="ONGOING">ONGOING</option>
            <option value="COMPLETED">COMPLETED</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-widest text-orange-900">Reason for Intervention</label>
          <textarea
            placeholder="Describe why this manual override is necessary..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full bg-white border border-orange-200 px-4 py-3 text-sm min-h-[100px] focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>

        <button
          onClick={handleOverride}
          disabled={isPending}
          className="w-full bg-orange-600 text-white py-4 text-[10px] font-bold uppercase tracking-widest hover:bg-orange-700 transition disabled:opacity-50"
        >
          {isPending ? "Applying Override..." : "Perform Manual Override"}
        </button>
      </div>
    </div>
  );
}
