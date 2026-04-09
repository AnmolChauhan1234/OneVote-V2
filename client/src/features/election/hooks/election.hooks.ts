'use client';

import { queryClient } from "@/lib/instances/queryClient";
import { queryKeys } from '@/constants/queryKeys';
import { useApiMutation } from "@/hooks/useApiMutation";
import { useApiQuery } from "@/hooks/useApiQuery";

import {
  createElection,
  getElections,
  getElectionDetail,
  updateElection,
  getElectionResults,
  createPosition,
  getPositions,
  createCandidate,
  getCandidates,
  addVoters,
  getVoters,
} from '../services/election.service';

import {
  ElectionCreateFormData,
  ElectionUpdateFormData,
  PositionCreateFormData,
  CandidateCreateFormData,
  EligibleVoterCreateFormData,
} from "../schemas/election.schema";

// USE ELECTION LIST
export function useElections() {
  return useApiQuery(queryKeys.election.all, getElections);
}

// USE ELECTION DETAIL
export function useElectionDetail(election_id: string) {
  return useApiQuery(
    queryKeys.election.detail(election_id),
    () => getElectionDetail(election_id),
    { enabled: !!election_id }
  );
}

// USE CREATE ELECTION
export function useCreateElection() {
  return useApiMutation(createElection, {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.election.all });
    },
  });
}

// USE UPDATE ELECTION
export function useUpdateElection(election_id: string) {
  return useApiMutation(
    (payload: ElectionUpdateFormData) => updateElection(election_id, payload),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.election.all });
        queryClient.invalidateQueries({ queryKey: queryKeys.election.detail(election_id) });
      },
    }
  );
}

// USE ELECTION RESULTS
export function useElectionResults(election_id: string) {
  return useApiQuery(
    queryKeys.election.results(election_id),
    () => getElectionResults(election_id),
    { enabled: !!election_id }
  );
}

// USE CREATE POSITION
export function useCreatePosition(election_id: string) {
  return useApiMutation(
    (payload: PositionCreateFormData) => createPosition(election_id, payload),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.election.positions(election_id) });
      },
    }
  );
}

// USE POSITIONS
export function usePositions(election_id: string) {
  return useApiQuery(
    queryKeys.election.positions(election_id),
    () => getPositions(election_id),
    { enabled: !!election_id }
  );
}

// USE CREATE CANDIDATE
export function useCreateCandidate(position_id: string) {
  return useApiMutation(
    (payload: CandidateCreateFormData) => createCandidate(position_id, payload),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.election.candidates(position_id) });
      },
    }
  );
}

// USE CANDIDATES
export function useCandidates(position_id: string) {
  return useApiQuery(
    queryKeys.election.candidates(position_id),
    () => getCandidates(position_id),
    { enabled: !!position_id }
  );
}

// USE ADD VOTERS
export function useAddVoters(election_id: string) {
  return useApiMutation(
    (voters: EligibleVoterCreateFormData[]) => addVoters(election_id, voters),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.election.voters(election_id) });
      },
    }
  );
}

// USE VOTERS
export function useVoters(election_id: string) {
  return useApiQuery(
    queryKeys.election.voters(election_id),
    () => getVoters(election_id),
    { enabled: !!election_id }
  );
}
