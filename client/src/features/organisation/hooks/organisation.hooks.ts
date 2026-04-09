'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { organisationService } from '../services/organisation.service';
import { queryKeys } from '@/constants/queryKeys';

export function useOrganisations() {
  return useQuery({
    queryKey: queryKeys.organisation.all,
    queryFn: organisationService.getOrganisations,
  });
}

export function useCreateOrganisation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: organisationService.createOrganisation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.organisation.all });
    },
  });
}
