"use client";

import { useRouter } from "next/navigation";

import { queryClient } from "@/lib/instances/queryClient";

import {
  getCurrentUser,
  loginUser,
  registerUser,
  logoutUser,
  getUserOrgIdentifiers,
  addUserOrgIdentifier,
  updateUserOrgIdentifier
} from "../services/auth.service";
import { UserOrgIdentifierCreateData } from "../schemas/identifier.schema";

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
      router.refresh();
    },
  });
}

export function useRegister() {
  const router = useRouter();

  return useApiMutation(registerUser);
}

export function useLogout() {
  const router = useRouter();

  return useApiMutation(logoutUser, {
    onSuccess: () => {
      // 1. Clear everything first
      queryClient.clear();

      // 2. 🔥 Set user to null AFTER clearing, so it sticks and stops active hooks from refetching
      queryClient.setQueryData(queryKeys.auth.me, null);
      queryClient.setQueryData(queryKeys.auth.session, null);

      router.replace("/");
    },
    onError: () => {
      queryClient.clear();
      queryClient.setQueryData(queryKeys.auth.me, null);
      router.replace("/");
    },
  });
}

export function useMe() {
  return useApiQuery(queryKeys.auth.me, getCurrentUser, {
    retry: false, // Don't retry 401s
    staleTime: 1000 * 60 * 5, // 5 mins
  });
}

// USE USER IDENTIFIERS
export function useUserOrgIdentifiers() {
  return useApiQuery(queryKeys.auth.orgIdentifiers.all, getUserOrgIdentifiers);
}

// USE ADD IDENTIFIER
export function useAddUserOrgIdentifier() {
  return useApiMutation(
    (payload: UserOrgIdentifierCreateData) => addUserOrgIdentifier(payload),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.auth.orgIdentifiers.all });
      },
    }
  );
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
