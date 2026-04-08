"use client";

import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";

import { queryClient } from "@/lib/instances/queryClient";
import { AppError } from "@/lib/errors/AppError";

import { User } from "@/types";
import { LoginResponse, LogoutResponse, RegisterResponse } from "../types/types";
import { LoginFormData, RegisterFormData } from "../schemas/user.schema";

import { getCurrentUser, loginUser, registerUser, logoutUser } from "../services/auth.service";

import { queryKeys } from "@/constants/queryKeys";

export function useLogin() {
  const router = useRouter();

  return useMutation<LoginResponse, AppError, LoginFormData>({
    mutationFn: loginUser,
    onSuccess: async () => {
      await queryClient.fetchQuery({
        queryKey: queryKeys.auth.me,
        queryFn: getCurrentUser,
      });
      router.push("/dashboard");
    },
  });
}

export function useRegister() {
  const router = useRouter();

  return useMutation<RegisterResponse, AppError, RegisterFormData>({
    mutationFn: registerUser,
    onSuccess: () => {
      router.push("/dashboard");
    },
  });
}

export function useLogout() {
  const router = useRouter();

  return useMutation<LogoutResponse, AppError>({
    mutationFn: logoutUser,
    onSuccess: () => {
      queryClient.clear();
      router.push("/");
    },
  });
}

export function useMe() {
  return useQuery<User, AppError>({
    queryKey: queryKeys.auth.me,
    queryFn: getCurrentUser,
  });
}
