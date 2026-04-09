'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { votingService } from '../services/voting.service';

export function useSubmitVote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: votingService.submitVote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['votes'] });
    },
  });
}
