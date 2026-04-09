'use client';

import { queryClient } from "@/lib/instances/queryClient";
import { queryKeys } from '@/constants/queryKeys';
import { useApiMutation } from "@/hooks/useApiMutation";
import { useApiQuery } from "@/hooks/useApiQuery";

import { verifyUserIdentity, getIdentity } from '../services/identity.service';

// USE VERIFY IDENTITY
export function useVerifyIdentity() {
  return useApiMutation(verifyUserIdentity, {
    onSuccess: (data, variables) => {
      // Invalidate identity detail for the current user if possible
      // Since we don't have the userId in the onSuccess args directly (it's in the service payload as aadhar_id)
      // we might need to invalidate all identity queries or wait for the user to refetch.
    },
  });
}

// USE IDENTITY DETAIL
export function useIdentity(userId: string) {
  return useApiQuery(
    queryKeys.identity.detail(userId),
    () => getIdentity(userId),
    { enabled: !!userId }
  );
}
