'use client';

import { queryClient } from "@/lib/instances/queryClient";
import { queryKeys } from '@/constants/queryKeys';
import { useApiMutation } from "@/hooks/useApiMutation";
import { useApiQuery } from "@/hooks/useApiQuery";

import {
  createOrganisation,
  getOrganisations,
  getOrganisation,
  updateOrganisation,
  updateOrganisationDocuments,
  deleteOrganisation,
} from '../services/organisation.service';

import { 
  OrganisationUpdateFormData 
} from "../schemas/organisation.schema";

// USE ORGANISATIONS LIST
export function useOrganisations() {
  return useApiQuery(queryKeys.organisation.all, getOrganisations);
}

// USE ORGANISATION DETAIL
export function useOrganisation(org_id: string) {
  return useApiQuery(
    queryKeys.organisation.detail(org_id),
    () => getOrganisation(org_id),
    { enabled: !!org_id }
  );
}

// USE CREATE ORGANISATION
export function useCreateOrganisation() {
  return useApiMutation(createOrganisation, {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.organisation.all });
    },
  });
}

// USE UPDATE ORGANISATION
export function useUpdateOrganisation(org_id: string) {
  return useApiMutation(
    (payload: OrganisationUpdateFormData) => updateOrganisation(org_id, payload),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.organisation.all });
        queryClient.invalidateQueries({ queryKey: queryKeys.organisation.detail(org_id) });
      },
    }
  );
}

// USE UPDATE ORGANISATION DOCUMENTS
export function useUpdateOrganisationDocuments(org_id: string) {
  return useApiMutation(
    (documents: File[]) => updateOrganisationDocuments(org_id, documents),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.organisation.documents(org_id) });
      },
    }
  );
}

// USE DELETE ORGANISATION
export function useDeleteOrganisation() {
  return useApiMutation(deleteOrganisation, {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.organisation.all });
    },
  });
}
