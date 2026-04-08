'use client';

import { useQuery } from '@tanstack/react-query';
import { identityApi } from './api';

export function useIdentity() {
  return useQuery({
    queryKey: ['identity'],
    queryFn: identityApi.getIdentity,
  });
}
