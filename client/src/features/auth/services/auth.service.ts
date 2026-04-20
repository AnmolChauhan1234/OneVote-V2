import axiosClient from "@/lib/instances/axios";

import { API_URLS } from "@/constants/apiURLs";
import { User } from "@/types/index";

import { LoginFormData, RegisterFormData } from "../schemas/user.schema";
import {
  LoginResponse,
  RegisterResponse,
  LogoutResponse,
} from "../types/types";

// LOGIN USER
export async function loginUser(
  credentials: LoginFormData,
): Promise<LoginResponse> {
  const res = await axiosClient.post<LoginResponse>(
    API_URLS.AUTH.LOGIN,
    credentials,
  );
  return res.data;
}

// REGISTER USER
export async function registerUser(
  payload: RegisterFormData,
): Promise<RegisterResponse> {
  const res = await axiosClient.post<RegisterResponse>(
    API_URLS.AUTH.REGISTER,
    payload,
  );
  return res.data;
}

// LOGOUT USER
export async function logoutUser(): Promise<LogoutResponse> {
  const res = await axiosClient.post<LogoutResponse>(API_URLS.AUTH.LOGOUT);
  return res.data;
}

import {
  UserOrgIdentifierCreateData,
  UserOrgIdentifierUpdateData
} from "../schemas/identifier.schema";

// GET CURRENT USER
export async function getCurrentUser(): Promise<User> {
  const res = await axiosClient.get<User>(API_URLS.AUTH.ME);
  return res.data;
}

// GET USER IDENTIFIERS
export async function getUserOrgIdentifiers(): Promise<any[]> {
  const res = await axiosClient.get(API_URLS.AUTH.GET_ORG_IDENTIFIER);
  return res.data;
}

// ADD USER IDENTIFIER
export async function addUserOrgIdentifier(payload: UserOrgIdentifierCreateData): Promise<any> {
  const res = await axiosClient.post(API_URLS.AUTH.ADD_ORG_IDENTIFIER, payload);
  return res.data;
}

// UPDATE USER IDENTIFIER
export async function updateUserOrgIdentifier(id: string, payload: UserOrgIdentifierUpdateData): Promise<any> {
  const res = await axiosClient.put(API_URLS.AUTH.UPDATE_ORG_IDENTIFIER(id), payload);
  return res.data;
}
