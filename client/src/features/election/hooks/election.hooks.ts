'use client';

import { useQuery } from '@tanstack/react-query';
import { electionService } from '../services/election.service';
import { queryKeys } from '@/constants/queryKeys';

export function useElections() {
  return useQuery({
    queryKey: queryKeys.election.all,
    queryFn: electionService.getElections,
  });
}
