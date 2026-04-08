'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { biometricApi } from './api';

export function useRegisterBiometric() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: biometricApi.registerBiometric,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['biometric'] });
    },
  });
}
