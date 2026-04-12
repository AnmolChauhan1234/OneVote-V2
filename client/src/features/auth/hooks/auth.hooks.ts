"use client";

import { useRouter } from "next/navigation";

import { queryClient } from "@/lib/instances/queryClient";

import {
  getCurrentUser,
  loginUser,
  registerUser,
  logoutUser,
} from "../services/auth.service";

import { queryKeys } from "@/constants/queryKeys";
import { useApiMutation } from "@/hooks/useApiMutation";
import { useApiQuery } from "@/hooks/useApiQuery";

export function useLogin() {
  const router = useRouter();

  return useApiMutation(loginUser, {
    onSuccess: async () => {
      await queryClient.fetchQuery({
        queryKey: queryKeys.auth.me,
        queryFn: getCurrentUser,
      });
      router.replace("/dashboard");
    },
  });
}

export function useRegister() {
  const router = useRouter();

  return useApiMutation(registerUser, {
    onSuccess: () => router.replace("/login"),
  });
}

export function useLogout() {
  const router = useRouter();

  return useApiMutation(logoutUser, {
    onSuccess: () => {
      queryClient.clear();
      router.replace("/");
    },
    onError: () => {
      // logout failed (401 expired token) — still clear and redirect
      queryClient.clear();
      router.replace("/");
    },
  });
}

export function useMe() {
  return useApiQuery(queryKeys.auth.me, getCurrentUser);
}

// ----------------------------------------------------------------
// useSession
// Lightweight session info — role, user_type
// Available immediately after login without waiting for SSR
// Use this for quick role checks in components, not for profile data
// ----------------------------------------------------------------
export function useSession() {
  return useApiQuery(queryKeys.auth.session, getCurrentUser, {
    staleTime: Infinity,
    retry: false,
  });
}

// export function useRefreshToken() {
//   return useApiMutation(refreshUserToken);
// }
