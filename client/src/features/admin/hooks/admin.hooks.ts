import { useApiQuery } from "@/hooks/useApiQuery";
import { useApiMutation } from "@/hooks/useApiMutation";
import { queryKeys } from "@/constants/queryKeys";
import { queryClient } from "@/lib/instances/queryClient";
import { 
  getPendingOrganisations, 
  getOrganisationDocuments, 
  approveOrganisation, 
  rejectOrganisation 
} from "../services/admin.service";
import { 
  ApproveOrganisationPayload, 
  RejectOrganisationPayload 
} from "../types/admin.types";

export function usePendingOrganisations() {
  return useApiQuery(
    queryKeys.admin.pendingOrgs,
    getPendingOrganisations
  );
}

export function useOrganisationDocuments(orgId: string) {
  return useApiQuery(
    queryKeys.admin.orgDocuments(orgId),
    () => getOrganisationDocuments(orgId),
    { enabled: !!orgId }
  );
}

export function useApproveOrganisation() {
  return useApiMutation(
    ({ orgId, payload }: { orgId: string; payload: ApproveOrganisationPayload }) => 
      approveOrganisation(orgId, payload),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.admin.pendingOrgs });
        queryClient.invalidateQueries({ queryKey: queryKeys.organisation.all });
      }
    }
  );
}

export function useRejectOrganisation() {
  return useApiMutation(
    ({ orgId, payload }: { orgId: string; payload: RejectOrganisationPayload }) => 
      rejectOrganisation(orgId, payload),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.admin.pendingOrgs });
        queryClient.invalidateQueries({ queryKey: queryKeys.organisation.all });
      }
    }
  );
}
