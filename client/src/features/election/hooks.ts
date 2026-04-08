'use client';

import { useQuery } from '@tanstack/react-query';
import { electionApi } from './api';

export function useElections() {
  return useQuery({
    queryKey: ['elections'],
    queryFn: electionApi.getElections,
  });
}
