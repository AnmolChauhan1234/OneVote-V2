"use client";

import { useMutation } from "@tanstack/react-query";
import { AppError } from "@/lib/errors/AppError";

import { generateOtp, verifyOtp } from "../services/otp.service";

import { GenerateOTPFormData, OTPVerifyFormData } from "../schemas/otp.schema";
import { OTPResponse } from "../types/types";

export function useGenerateOtp() {
  return useMutation<OTPResponse, AppError, GenerateOTPFormData>({
    mutationFn: generateOtp,
  });
}

export function useVerifyOtp() {
  return useMutation<OTPResponse, AppError, OTPVerifyFormData>({
    mutationFn: verifyOtp,
  });
}
