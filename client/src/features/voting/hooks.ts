'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { votingApi } from './api';

export function useSubmitVote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: votingApi.submitVote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['votes'] });
    },
  });
}
