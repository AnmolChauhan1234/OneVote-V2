'use client';

import { queryClient } from "@/lib/instances/queryClient";
import { queryKeys } from '@/constants/queryKeys';
import { useApiMutation } from "@/hooks/useApiMutation";
import { useApiQuery } from "@/hooks/useApiQuery";

import { castVote, getTotalVotes, generateVotingToken } from '../services/voting.service';

// USE CAST VOTE
export function useCastVote() {
  return useApiMutation(castVote, {
    onSuccess: () => {
      // Invalidate votes or election results if necessary
    },
  });
}

// USE TOTAL VOTES
export function useTotalVotes(election_id: string) {
  return useApiQuery(
    queryKeys.voting.totalVotes(election_id),
    () => getTotalVotes(election_id),
    { enabled: !!election_id }
  );
}

// USE GENERATE VOTING TOKEN
export function useGenerateVotingToken() {
  return useApiMutation(generateVotingToken);
}
