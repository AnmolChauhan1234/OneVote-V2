"use client";

import { useApiMutation } from "@/hooks/useApiMutation";

import { generateOtp, verifyOtp } from "../services/otp.service";


export function useGenerateOtp() {
  return useApiMutation(generateOtp);
}

export function useVerifyOtp() {
  return useApiMutation(verifyOtp);
}
