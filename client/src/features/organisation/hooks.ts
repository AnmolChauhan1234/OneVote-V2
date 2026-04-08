'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { organisationApi } from './api';

export function useOrganisations() {
  return useQuery({
    queryKey: ['organisations'],
    queryFn: organisationApi.getOrganisations,
  });
}

export function useCreateOrganisation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: organisationApi.createOrganisation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organisations'] });
    },
  });
}
