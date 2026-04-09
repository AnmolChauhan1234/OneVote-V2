"use client";

import { queryClient } from "@/lib/instances/queryClient";

import {
  createAdmin,
  listAllAdims,
  getAllUsers,
  blockUser,
  suspendUser,
  deleteUser,
  getOrgDocuments,
  listPendingOrgs,
  approveOrg,
  rejectOrg,
} from "../services/admin.service";


import { queryKeys } from "@/constants/queryKeys";
import { useApiMutation } from "@/hooks/useApiMutation";
import { useApiQuery } from "@/hooks/useApiQuery";

import {
  ApproveOrganisationFormData,
  RejectOrganisationFormData,
} from "../../organisation/schemas/organisation.schema";


export function useCreateAdmin() {

  return useApiMutation(createAdmin, {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.admins });
    }
  })
}

export function useAdmins() {
  return useApiQuery(queryKeys.admin.admins, listAllAdims);
}

export function useAllUsers() {
  return useApiQuery(queryKeys.admin.users, getAllUsers);
}

export function useBlockUser() {
  return useApiMutation(blockUser, {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.users });
    },
  });
}

export function useSuspendUser() {
  return useApiMutation(suspendUser, {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.users });
    },
  });
}

export function useDeleteUser() {
  return useApiMutation(deleteUser, {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.users });
    },
  });
}

export function useOrgDocuments(org_id: string) {
  return useApiQuery(queryKeys.admin.orgDocuments(org_id), () =>
    getOrgDocuments(org_id),
  );
}

export function usePendingOrgs() {
  return useApiQuery(queryKeys.admin.pendingOrgs, listPendingOrgs);
}

export function useApproveOrg() {
  return useApiMutation(
    ({ org_id, payload }: { org_id: string; payload: ApproveOrganisationFormData }) =>
      approveOrg(org_id, payload),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.admin.pendingOrgs });
      },
    },
  );
}

export function useRejectOrg() {
  return useApiMutation(
    ({ org_id, payload }: { org_id: string; payload: RejectOrganisationFormData }) =>
      rejectOrg(org_id, payload),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.admin.pendingOrgs });
      },
    },
  );
}

