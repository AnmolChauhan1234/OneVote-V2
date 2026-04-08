import axiosClient from "@/lib/instances/axios";
import { GenerateOTPFormData, OTPVerifyFormData } from "../schemas/otp.schema";
import { OTPResponse } from "../types/types";
import { API_URLS } from "@/constants/apiURLs";


export async function generateOtp(payload: GenerateOTPFormData): Promise<OTPResponse>{
  const res = await axiosClient.post<OTPResponse>(API_URLS.AUTH.GENERATE_OTP, payload);
  return res.data;
}

export async function verifyOtp(payload: OTPVerifyFormData): Promise<OTPResponse>{
  const res = await axiosClient.post<OTPResponse>(API_URLS.AUTH.VERIFY_OTP, payload);
  return res.data;
}