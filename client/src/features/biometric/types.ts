export interface BiometricEnrollResponse {
  success: boolean;
  message: string;
}

export interface BiometricVerifyResponse {
  success: boolean;
  biometric_token?: string;
  message: string;
}

export interface LivenessCheckResponse {
  success: boolean;
  liveness_score: number;
  message: string;
}
