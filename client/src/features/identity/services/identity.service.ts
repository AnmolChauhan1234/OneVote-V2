import axiosClient from "@/lib/instances/axios";
import { API_URLS } from "@/constants/apiURLs";
import { IdentityResponse, MessageResponse } from "../types/types";

// VERIFY USER IDENTITY
export async function verifyUserIdentity(payload: {
  aadhar_id: string;
}): Promise<MessageResponse> {
  const res = await axiosClient.post<MessageResponse>(
    API_URLS.IDENTITY.VERIFY_USER_IDENTITY,
    payload
  );
  return res.data;
}

// GET USER IDENTITY
export async function getIdentity(userId: string): Promise<IdentityResponse> {
  const res = await axiosClient.get<IdentityResponse>(
    API_URLS.IDENTITY.GET_USER_IDENTITY(userId)
  );
  return res.data;
}
