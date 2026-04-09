'use client';

import { enrollBiometric, verifyBiometric, livenessCheck } from '../services/biometric.service';
import { useApiMutation } from "@/hooks/useApiMutation";

export function useBiometricEnroll() {
  return useApiMutation(enrollBiometric);
}

export function useBiometricVerify() {
  return useApiMutation(verifyBiometric);
}

export function useLivenessCheck() {
  return useApiMutation(livenessCheck);
}

