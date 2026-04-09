'use client';

import { useQuery } from '@tanstack/react-query';
import { identityService } from '../services/identity.service';
import { queryKeys } from '@/constants/queryKeys';

export function useIdentity(userId: string) {
  return useQuery({
    queryKey: queryKeys.identity.detail(userId),
    queryFn: () => identityService.getIdentity(userId),
    enabled: !!userId,
  });
}
