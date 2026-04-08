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
  credentials: LoginFormData
): Promise<LoginResponse> {
  const res = await axiosClient.post<LoginResponse>(
    API_URLS.AUTH.LOGIN,
    credentials
  );
  return res.data;
}

// REGISTER USER
export async function registerUser(
  payload: RegisterFormData
): Promise<RegisterResponse> {
  const res = await axiosClient.post<RegisterResponse>(
    API_URLS.AUTH.REGISTER,
    payload
  );
  return res.data;
}

// LOGOUT USER
export async function logoutUser(): Promise<LogoutResponse> {
  const res = await axiosClient.post<LogoutResponse>(
    API_URLS.AUTH.LOGOUT
  );
  return res.data;
}

// GET CURRENT USER
export async function getCurrentUser(): Promise<User> {
  const res = await axiosClient.get<User>(API_URLS.AUTH.ME);
  return res.data;
}