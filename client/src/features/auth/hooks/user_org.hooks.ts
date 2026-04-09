"use client";


import { queryClient } from "@/lib/instances/queryClient";

import {
  addUserOrgId,
  getUserOrgIds,
  updateUserOrgIdentifier,
  deleteUserOrgIdentifier,
} from "../services/user_org.service";

import { 
  UpdateUserOrgIdentifierArgs 
} from "../schemas/user_org.schema";


import { queryKeys } from "@/constants/queryKeys";
import { useApiMutation } from "@/hooks/useApiMutation";
import { useApiQuery } from "@/hooks/useApiQuery";

export function useUserOrgIds() {
  return useApiQuery(queryKeys.userOrg.all, getUserOrgIds);
}

export function useAddUserOrgId() {
  return useApiMutation(addUserOrgId, {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.userOrg.all });
    },
  });
}


export function useUpdateUserOrgIdentifier() {
  return useApiMutation(
    ({ identifier_id, payload }: UpdateUserOrgIdentifierArgs) =>
      updateUserOrgIdentifier(identifier_id, payload),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.userOrg.all });
      },
    }
  );
}

export function useDeleteUserOrgIdentifier() {
  return useApiMutation(deleteUserOrgIdentifier, {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.userOrg.all });
    },
  });
}
