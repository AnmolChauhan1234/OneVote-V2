"use client";

import { motion } from "framer-motion";
import { Trophy, Users, BarChart3, Medal, Crown, Loader2, AlertCircle } from "lucide-react";
import { useElectionResults } from "../hooks/election.hooks";

interface Props {
  electionId: string;
}

export function ElectionResults({ electionId }: Props) {
  const { data: results, isLoading, error } = useElectionResults(electionId);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <Loader2 className="animate-spin text-black/20" size={40} />
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-black/40">Calculating Final Tally...</p>
      </div>
    );
  }

  if (error || !results) {
    return (
      <div className="bg-red-50 border border-red-100 p-12 text-center space-y-4">
        <AlertCircle className="mx-auto text-red-400" size={48} />
        <div className="space-y-1">
          <h3 className="text-xl font-bold text-red-900">Result Aggregation Failed</h3>
          <p className="text-sm text-red-700 font-medium">There was an error communicating with the voting node. Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-12"
    >
      <div className="flex items-center justify-between border-b border-black/5 pb-8">
        <div>
          <h2 className="text-4xl font-bold tracking-tighter uppercase italic">Election Results</h2>
          <p className="text-black/40 text-xs font-bold uppercase tracking-widest mt-2">Final Certified Tally • Immutable Ledger Records</p>
        </div>
        <div className="bg-black text-white px-6 py-3 text-[10px] font-bold uppercase tracking-widest flex items-center gap-3">
          <BarChart3 size={14} />
          Certified
        </div>
      </div>

      <div className="grid grid-cols-1 gap-12">
        {results.positions.map((position: any, index: number) => (
          <motion.div 
            key={position.position_id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-4">
              <div className="h-12 w-1 bg-black" />
              <h3 className="text-2xl font-bold tracking-tight uppercase">{position.name}</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {position.candidates.map((candidate: any) => (
                <div 
                  key={candidate.candidate_id}
                  className={`relative p-8 border transition-all duration-500 group ${
                    candidate.is_winner 
                      ? 'bg-black text-white border-black shadow-2xl shadow-black/20 scale-[1.02] z-10' 
                      : 'bg-white text-black border-black/5 hover:border-black/20'
                  }`}
                >
                  {candidate.is_winner && (
                    <div className="absolute -top-4 -right-4 bg-yellow-400 text-black p-3 rounded-full shadow-xl animate-bounce">
                      <Crown size={20} />
                    </div>
                  )}

                  <div className="space-y-6">
                    <div className="flex justify-between items-start">
                      <div className={`p-3 ${candidate.is_winner ? 'bg-white/10' : 'bg-black/5'}`}>
                        {candidate.is_winner ? <Trophy size={20} /> : <Medal size={20} />}
                      </div>
                      <div className="text-right">
                        <p className={`text-[10px] font-black uppercase tracking-widest ${candidate.is_winner ? 'text-white/40' : 'text-black/30'}`}>Votes</p>
                        <p className="text-3xl font-bold tracking-tighter">{candidate.vote_count}</p>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xl font-bold tracking-tight uppercase truncate">{candidate.name}</h4>
                      <p className={`text-[10px] font-bold uppercase tracking-[0.2em] mt-1 ${candidate.is_winner ? 'text-white/40' : 'text-black/30'}`}>
                        {candidate.is_winner ? 'Elected Representative' : 'Candidate'}
                      </p>
                    </div>

                    {candidate.is_winner && (
                      <div className="pt-4 border-t border-white/10">
                        <div className="flex items-center gap-2 text-yellow-400">
                          <Users size={12} />
                          <span className="text-[10px] font-black uppercase tracking-widest">Majority Confirmed</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="bg-black/5 p-12 text-center border border-black/5">
        <p className="text-xs font-bold text-black/40 uppercase tracking-[0.3em]">
          End of Certified Record • OneVote Immutable Protocol
        </p>
      </div>
    </motion.div>
  );
}
