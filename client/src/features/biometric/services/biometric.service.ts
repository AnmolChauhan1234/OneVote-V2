import axiosClient from "@/lib/instances/axios";
import { API_URLS } from "@/constants/apiURLs";

import { BiometricEnrollFormData , BiometricVerifyFormData } from "../schemas/biometric.schema";

import { BiometricEnrollResponse , BiometricVerifyResponse , LivenessCheckResponse} from "../types/types";


// ENROLL BIOMETRIC
export async function enrollBiometric(
  payload: BiometricEnrollFormData
): Promise<BiometricEnrollResponse> {
  const formData = new FormData();
  formData.append("user_id", payload.user_id);
  formData.append("image", payload.image);

  const res = await axiosClient.post<BiometricEnrollResponse>(
    API_URLS.BIOMETRIC.ENROLL,
    formData
  );

  return res.data;
}


// VERIFY BIOMETRIC
export async function verifyBiometric(
  payload: BiometricVerifyFormData
): Promise<BiometricVerifyResponse> {
  const res = await axiosClient.post<BiometricVerifyResponse>(
    API_URLS.BIOMETRIC.VERIFY,
    payload
  );

  return res.data;
}


// LIVENESS CHECK
export async function livenessCheck(): Promise<LivenessCheckResponse> {
  const res = await axiosClient.post<LivenessCheckResponse>(
    API_URLS.BIOMETRIC.LIVENESS_CHECK
  );

  return res.data;
}


