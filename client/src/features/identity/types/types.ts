export interface DigiLockerMockResponse {
  full_name: string;
  dob: string;
  gender: string;
  address: string;
  aadhar_id: string;
}

export interface IdentityResponse {
  user_id: string;
  aadhar_id: string;
  is_verified: boolean;
  verified_at?: string;
}

export interface MessageResponse {
  message: string;
}
