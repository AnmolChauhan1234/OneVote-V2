"use client";

import { useState } from "react";
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
  ChevronRight
} from "lucide-react";
import { useElectionDetail, usePositions, useVoters, useCandidates } from "../hooks/election.hooks";
import { Loader2 } from "lucide-react";
import { CreatePositionForm } from "./CreatePositionForm";
import { CreateCandidateForm } from "./CreateCandidateForm";
import { BulkImportVotersForm } from "./BulkImportVotersForm";
import { UpdateElectionForm } from "./UpdateElectionForm";
import { AnimatePresence } from "framer-motion";

interface Props {
  electionId: string;
  onBack: () => void;
}

export function ElectionManagementHub({ electionId, onBack }: Props) {
  const [activeTab, setActiveTab] = useState<"overview" | "positions" | "voters" | "settings">("overview");
  const [isAddingPosition, setIsAddingPosition] = useState(false);
  const [selectedPositionId, setSelectedPositionId] = useState<string | null>(null);
  const [isAddingCandidate, setIsAddingCandidate] = useState(false);
  const [isImportingVoters, setIsImportingVoters] = useState(false);

  const { data: election, isLoading: isElectionLoading } = useElectionDetail(electionId);
  const { data: positions, isLoading: isPositionsLoading } = usePositions(electionId);
  const { data: voters, isLoading: isVotersLoading } = useVoters(electionId);

  if (isElectionLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="animate-spin text-black/20" size={32} />
      </div>
    );
  }

  if (!election) return null;

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
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
      <div className="bg-black text-white p-8 md:p-12 relative overflow-hidden">
        <div className="relative z-10 space-y-4">
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest border border-white/20 ${election.status === 'ACTIVE' ? 'bg-green-500 text-white border-none' : ''
              }`}>
              {election.status}
            </span>
            <span className="text-white/40 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
              <Clock size={12} />
              Started {formatDate(election.start_date)}
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tighter">{election.title}</h1>
          <p className="text-white/60 max-w-2xl text-lg font-light leading-relaxed">
            {election.description || "No description provided for this election."}
          </p>
        </div>

        {/* Abstract Background Design */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 -rotate-45 translate-x-32 -translate-y-32" />
        <div className="absolute bottom-0 right-0 w-32 h-2 bg-white/20" />
      </div>

      {/* Tabs */}
      <div className="flex border-b border-black/5 overflow-x-auto no-scrollbar">
        {[
          { id: "overview", label: "Overview", icon: <LayoutDashboard size={14} /> },
          { id: "positions", label: `Positions (${positions?.length || 0})`, icon: <Trophy size={14} /> },
          { id: "voters", label: `Voters (${voters?.length || 0})`, icon: <Users size={14} /> },
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
          <OverviewTab election={election} positions={positions} voters={voters} />
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
          />
        )}
        {activeTab === "voters" && (
          <VotersTab
            electionId={electionId}
            voters={voters}
            onImportVoters={() => setIsImportingVoters(true)}
          />
        )}
        {activeTab === "settings" && (
          <UpdateElectionForm
            election={election}
            onSuccess={() => setActiveTab("overview")}
          />
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

function OverviewTab({ election, positions, voters }: any) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div className="md:col-span-2 space-y-8">
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
              <p className="text-sm font-bold">{new Date(election.start_date).toLocaleString()}</p>
            </div>
            <div className="relative pl-6 border-l-2 border-black/5">
              <div className="absolute -left-[5px] top-0 w-2 h-2 rounded-full bg-black" />
              <p className="text-[10px] font-bold uppercase tracking-widest text-black/40">Ends</p>
              <p className="text-sm font-bold">{new Date(election.end_date).toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PositionsTab({ electionId, positions, onAddPosition, onAddCandidate }: any) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">Active Positions</h2>
        <button
          onClick={onAddPosition}
          className="bg-black text-white px-6 py-2 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 hover:shadow-lg transition active:scale-95"
        >
          <Plus size={14} />
          Add Position
        </button>
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
                      <button
                        onClick={() => onAddCandidate(pos.id)}
                        className="text-[9px] font-bold uppercase tracking-widest border border-black px-3 py-1.5 hover:bg-black hover:text-white transition flex items-center gap-2 group"
                      >
                        <Plus size={12} className="group-hover:rotate-90 transition-transform" />
                        Add Candidate
                      </button>
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

function VotersTab({ electionId, voters, onImportVoters }: any) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">Eligible Voters</h2>
        <div className="flex gap-4">
          <button className="bg-black/5 text-black px-6 py-2 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-black/10 transition">
            Export List
          </button>
          <button
            onClick={onImportVoters}
            className="bg-black text-white px-6 py-2 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 hover:shadow-lg transition active:scale-95"
          >
            <UserPlus size={14} />
            Bulk Import CSV
          </button>
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
