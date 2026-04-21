"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Vote,
  CheckCircle2,
  ShieldCheck,
  Fingerprint,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Info,
  AlertTriangle,
  User
} from "lucide-react";
import { useRouter } from "next/navigation";

import { useElectionDetail, usePositions, useCandidates } from "@/features/election/hooks/election.hooks";
import { useGenerateVotingToken, useCastVote } from "@/features/voting/hooks/voting.hooks";
import { useBiometricVerify } from "@/features/biometric/hooks/biometric.hooks";
import { useMe } from "@/features/auth/hooks";
import { PrimaryButton } from "@/components/buttons/PrimaryButton";
import { CandidateResponse, PositionResponse } from "@/features/election/types/types";
import { CameraCapture } from "@/features/biometric/components/CameraCapture";

interface VotingBoothProps {
  electionId: string;
}

type VotingStep = "selection" | "review" | "biometric" | "verification" | "success";

export function VotingBooth({ electionId }: VotingBoothProps) {
  const router = useRouter();
  const { data: user } = useMe();
  const { data: election, isLoading: isElectionLoading } = useElectionDetail(electionId);
  const { data: positions, isLoading: isPositionsLoading } = usePositions(electionId);

  const [step, setStep] = useState<VotingStep>("selection");
  const [selections, setSelections] = useState<Record<string, CandidateResponse[]>>({});
  const [biometricToken, setBiometricToken] = useState<string | null>(null);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { mutateAsync: generateToken } = useGenerateVotingToken();
  const { mutateAsync: verifyBiometric } = useBiometricVerify();
  const { mutateAsync: castVote } = useCastVote();

  // Validate if all positions have at least one selection
  const isSelectionValid = positions?.every(pos =>
    (selections[pos.id]?.length || 0) >= 1 &&
    (selections[pos.id]?.length || 0) <= pos.max_candidates_selectable
  );

  const handleSelectCandidate = (positionId: string, candidate: CandidateResponse, maxSelectable: number) => {
    setSelections(prev => {
      const current = prev[positionId] || [];
      const exists = current.find(c => c.id === candidate.id);

      if (exists) {
        return { ...prev, [positionId]: current.filter(c => c.id !== candidate.id) };
      }

      if (current.length < maxSelectable) {
        return { ...prev, [positionId]: [...current, candidate] };
      }

      if (maxSelectable === 1) {
        return { ...prev, [positionId]: [candidate] };
      }

      return prev;
    });
  };

  const handleFinalSubmit = async () => {
    if (!user || !election || !biometricToken) return;

    try {
      setIsFinalizing(true);
      setError(null);

      // 1. Generate Voting Token
      await generateToken({
        user_id: user.id,
        election_id: electionId
      });

      // 2. Prepare selections array
      const finalizedSelections = Object.entries(selections).flatMap(([posId, cands]) =>
        cands.map(c => ({ position_id: posId, candidate_id: c.id }))
      );

      // 3. Cast the Vote
      await castVote({
        user_id: user.id,
        organisation_id: election.org_id,
        election_id: electionId,
        selections: finalizedSelections,
        biometric_token: biometricToken
      });

      setStep("success");
    } catch (err: any) {
      console.error(err);
      setError(err?.response?.data?.detail || "Failed to submit your vote. Please try again.");
    } finally {
      setIsFinalizing(false);
    }
  };

  const handleBiometricVerify = async (image: File) => {
    try {
      setIsFinalizing(true);
      setError(null);
      
      const res = await verifyBiometric({ 
        image: image
      });
      
      setBiometricToken(res.biometric_token ?? null);
      setStep("verification");
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Biometric verification failed. Please ensure your face is well-lit and matches your registered identity.");
    } finally {
      setIsFinalizing(false);
    }
  };

  if (isElectionLoading || isPositionsLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="animate-spin text-black/20" size={40} />
        <p className="text-sm font-bold uppercase tracking-widest text-black/40">Initializing Secure Proxy...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      {/* Progress Header */}
      <div className="mb-12 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tighter uppercase italic">{election?.title}</h1>
          <p className="text-xs font-bold text-black/40 uppercase tracking-[0.2em] mt-1">Voting in progress</p>
        </div>
        <div className="flex items-center gap-2">
          {["selection", "review", "biometric", "verification", "success"].map((s, i) => (
            <div
              key={s}
              className={`h-1.5 w-12 transition-all duration-500 ${step === s ? "bg-black w-20" :
                  (i < ["selection", "review", "biometric", "verification", "success"].indexOf(step) ? "bg-black/20" : "bg-black/5")
                }`}
            />
          ))}
        </div>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 p-4 bg-red-50 border border-red-100 flex items-center gap-3 text-red-600 text-xs font-bold uppercase tracking-widest"
        >
          <AlertTriangle size={16} />
          {error}
        </motion.div>
      )}

      <AnimatePresence mode="wait">
        {step === "selection" && (
          <motion.div
            key="selection"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-12"
          >
            {positions?.map((position) => (
              <PositionSection
                key={position.id}
                position={position}
                selectedCandidates={selections[position.id] || []}
                onSelect={(candidate) => handleSelectCandidate(position.id, candidate, position.max_candidates_selectable)}
              />
            ))}

            <div className="flex justify-end pt-8 border-t border-black/5">
              <PrimaryButton
                disabled={!isSelectionValid}
                onClick={() => setStep("review")}
                className="group"
              >
                Review Ballot <ArrowRight className="ml-2 transition-transform group-hover:translate-x-1" size={16} />
              </PrimaryButton>
            </div>
          </motion.div>
        )}

        {step === "review" && (
          <motion.div
            key="review"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-10"
          >
            <div className="bg-black/5 p-8 border border-black/5">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
                <ShieldCheck size={24} /> Review Your Choices
              </h2>
              <div className="space-y-8">
                {positions?.map(pos => (
                  <div key={pos.id} className="border-l-2 border-black pl-6">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-black/40 mb-2">{pos.name}</p>
                    <div className="flex flex-wrap gap-2">
                      {selections[pos.id]?.map(candidate => (
                        <CandidateSummaryItem key={candidate.id} candidate={candidate} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-start gap-4 p-6 bg-amber-50 border border-amber-100 italic text-amber-700 text-sm">
              <Info className="shrink-0" size={18} />
              <p>Verify your selections carefully. Once you authenticate biometrically and submit, your vote will be permanently locked onto the blockchain ledger and cannot be changed.</p>
            </div>

            <div className="flex justify-between pt-8 border-t border-black/5">
              <button
                onClick={() => setStep("selection")}
                className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-black/40 hover:text-black transition"
              >
                <ArrowLeft size={16} /> Edit Ballot
              </button>
              <PrimaryButton 
                onClick={() => setStep("biometric")}
              >
                <Fingerprint className="mr-2" size={16} />
                Continue to Authentication
              </PrimaryButton>
            </div>
          </motion.div>
        )}

        {step === "biometric" && (
          <motion.div
            key="biometric"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-md mx-auto space-y-10 py-10"
          >
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-black/5 mx-auto flex items-center justify-center">
                <ShieldCheck size={32} />
              </div>
              <h2 className="text-2xl font-bold tracking-tight">Identity Verification</h2>
              <p className="text-sm text-black/50 leading-relaxed">
                Please capture a live photo to verify your identity against your registered biometric profile.
              </p>
            </div>

            <div className="bg-white border border-black/5 p-8 shadow-sm">
              <CameraCapture onCapture={handleBiometricVerify} />
              
              {isFinalizing && (
                <div className="mt-6 flex items-center justify-center gap-3 text-xs font-bold uppercase tracking-widest text-black/40">
                  <Loader2 className="animate-spin" size={14} />
                  Matching Biometrics...
                </div>
              )}
            </div>

            <button 
              onClick={() => setStep("review")}
              className="w-full flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest text-black/40 hover:text-black transition"
            >
              <ArrowLeft size={16} /> Back to Review
            </button>
          </motion.div>
        )}

        {step === "verification" && (
          <motion.div
            key="verification"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-20 bg-black text-white p-12 text-center"
          >
            <div className="w-20 h-20 bg-white/10 flex items-center justify-center mb-8">
              <ShieldCheck size={40} className="text-green-400" />
            </div>
            <h2 className="text-3xl font-bold mb-4">Identity Verified</h2>
            <p className="text-white/50 max-w-md mb-10 leading-relaxed font-light">
              Your biometric signature has been matched. A unique voting token has been issued to authorize this transaction.
            </p>
            <PrimaryButton
              variant="light"
              onClick={handleFinalSubmit}
              disabled={isFinalizing}
              className="w-full max-w-xs"
            >
              {isFinalizing ? (
                <>
                  <Loader2 className="animate-spin mr-2" size={16} />
                  Generating Blockchain Link...
                </>
              ) : (
                "Cast Final Ballot"
              )}
            </PrimaryButton>
          </motion.div>
        )}

        {step === "success" && (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <div className="w-24 h-24 bg-green-500 text-white flex items-center justify-center mb-10 shadow-2xl shadow-green-500/20">
              <CheckCircle2 size={48} />
            </div>
            <h2 className="text-4xl font-bold mb-4 tracking-tighter">Vote Successfully Cast</h2>
            <p className="text-black/50 max-w-md mb-10 leading-relaxed">
              Your ballot has been encrypted and stored on the immutable ledger. You can view your voting receipt and chain history in your dashboard activities.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => router.push("/dashboard/user")}
                className="px-10 py-4 border border-black/10 text-[10px] font-bold uppercase tracking-widest hover:border-black transition"
              >
                Back to Dashboard
              </button>
              <button className="px-10 py-4 bg-black text-white text-[10px] font-bold uppercase tracking-widest hover:shadow-2xl transition">
                View Receipt
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function PositionSection({
  position,
  selectedCandidates,
  onSelect
}: {
  position: PositionResponse;
  selectedCandidates: CandidateResponse[];
  onSelect: (candidate: CandidateResponse) => void;
}) {
  const { data: candidates, isLoading } = useCandidates(position.id);
  const selectedIds = selectedCandidates.map(c => c.id);

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between border-b border-black/10 pb-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{position.name}</h2>
          <p className="text-sm text-black/50 mt-1">{position.description || `Select up to ${position.max_candidates_selectable} candidate(s)`}</p>
        </div>
        <div className="text-[10px] font-black uppercase tracking-widest px-3 py-1 bg-black text-white">
          {selectedCandidates.length} / {position.max_candidates_selectable} Selected
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map(i => <div key={i} className="h-32 bg-black/5 animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {candidates?.map(candidate => (
            <CandidateCard
              key={candidate.id}
              candidate={candidate}
              isSelected={selectedIds.includes(candidate.id)}
              onClick={() => onSelect(candidate)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function CandidateCard({
  candidate,
  isSelected,
  onClick
}: {
  candidate: CandidateResponse;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`relative p-6 text-left border transition-all duration-300 group ${isSelected ? "border-black bg-black text-white" : "border-black/5 bg-white hover:border-black/20"
        }`}
    >
      <div className="flex items-start gap-4">
        <div className={`w-12 h-12 shrink-0 ${isSelected ? "bg-white/10" : "bg-black/5"} flex items-center justify-center`}>
          <User size={24} className={isSelected ? "text-white" : "text-black/20"} />
        </div>
        <div className="flex-1">
          <h4 className="font-bold text-sm leading-none mb-1">{candidate.name}</h4>
          <p className={`text-[10px] uppercase font-medium tracking-widest ${isSelected ? "text-white/50" : "text-black/40"}`}>Candidate</p>
          {candidate.biography && (
            <p className={`text-[11px] mt-4 line-clamp-2 leading-relaxed ${isSelected ? "text-white/40" : "text-black/40"}`}>
              {candidate.biography}
            </p>
          )}
        </div>
        {isSelected && (
          <div className="absolute top-4 right-4">
            <CheckCircle2 size={16} />
          </div>
        )}
      </div>
    </button>
  );
}

function CandidateSummaryItem({ candidate }: { candidate: CandidateResponse }) {
  return (
    <div className="px-4 py-3 bg-black text-white flex items-center gap-3">
      <div className="w-6 h-6 bg-white/20 flex items-center justify-center">
        <User size={12} />
      </div>
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest">{candidate.name}</p>
        <p className="text-[8px] text-white/40 uppercase font-bold">Confirmed Selection</p>
      </div>
    </div>
  );
}
