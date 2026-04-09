'use client';

import { useMutation } from '@tanstack/react-query';
import { biometricService } from '../services/biometric.service';

export function useEnroll() {
  return useMutation({
    mutationFn: biometricService.enroll,
  });
}

export function useVerify() {
  return useMutation({
    mutationFn: biometricService.verify,
  });
}

export function useLivenessCheck() {
  return useMutation({
    mutationFn: biometricService.livenessCheck,
  });
}
