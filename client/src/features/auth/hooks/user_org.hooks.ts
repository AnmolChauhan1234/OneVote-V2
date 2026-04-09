"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/instances/queryClient";
import { AppError } from "@/lib/errors/AppError";

import {
  addUserOrgId,
  getUserOrgIds,
  updateUserOrgIdentifier,
  deleteUserOrgIdentifier,
} from "../services/user_org.service";

import { 
  UserOrgIdentifierCreateFormData, 
  UpdateUserOrgIdentifierArgs 
} from "../schemas/user_org.schema";
import {
  ListUserOrgIdentifiersResponse,
  UserOrgIdentifierDeleteResponse,
  UserOrgIdentifierUpdateResponse,
} from "../types/types";

import { queryKeys } from "@/constants/queryKeys";

export function useUserOrgIds() {
  return useQuery<ListUserOrgIdentifiersResponse, AppError, void>({
    queryKey: queryKeys.userOrg.all,
    queryFn: getUserOrgIds,
  });
}

export function useAddUserOrgId() {
  return useMutation<
    UserOrgIdentifierCreateFormData,
    AppError,
    UserOrgIdentifierCreateFormData
  >({
    mutationFn: addUserOrgId,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.userOrg.all });
    },
  });
}


export function useUpdateUserOrgIdentifier() {
  return useMutation<
    UserOrgIdentifierUpdateResponse,
    AppError,
    UpdateUserOrgIdentifierArgs
  >({
    mutationFn: ({ identifier_id, payload }: UpdateUserOrgIdentifierArgs) =>
      updateUserOrgIdentifier(identifier_id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.userOrg.all });
    },
  });
}

export function useDeleteUserOrgIdentifier() {
  return useMutation<UserOrgIdentifierDeleteResponse, AppError, string>({
    mutationFn: deleteUserOrgIdentifier,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.userOrg.all });
    },
  });
}
