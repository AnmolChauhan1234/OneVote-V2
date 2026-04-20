import axiosClient from "@/lib/instances/axios";
import { API_URLS } from "@/constants/apiURLs";

import {
  OrganisationCreateFormData,
  OrganisationUpdateFormData,
} from "../schemas/organisation.schema";

import {
  OrganisationResponse,
  OrganisationDocumentResponse,
} from "../types/types";

// CREATE ORGANISATION
export async function createOrganisation(
  payload: OrganisationCreateFormData,
  document: File
): Promise<OrganisationResponse> {
  const formData = new FormData();
  formData.append("name", payload.name);
  if (payload.type) formData.append("type", payload.type);
  if (payload.description) formData.append("description", payload.description);
  formData.append("document", document);

  const res = await axiosClient.post<OrganisationResponse>(
    API_URLS.ORGANISATION.CREATE_ORG,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return res.data;
}

// GET ORGANISATIONS LIST
export async function getOrganisations(): Promise<OrganisationResponse[]> {
  const res = await axiosClient.get<OrganisationResponse[]>(
    API_URLS.ORGANISATION.LIST_ORGS
  );
  return res.data;
}

// GET ORGANISATION DETAIL
export async function getOrganisation(
  org_id: string
): Promise<OrganisationResponse> {
  const res = await axiosClient.get<OrganisationResponse>(
    API_URLS.ORGANISATION.GET_ORG(org_id)
  );
  return res.data;
}

// UPDATE ORGANISATION
export async function updateOrganisation(
  org_id: string,
  payload: OrganisationUpdateFormData
): Promise<OrganisationResponse> {
  const res = await axiosClient.put<OrganisationResponse>(
    API_URLS.ORGANISATION.UPDATE_ORG(org_id),
    payload
  );
  return res.data;
}

// UPDATE ORGANISATION DOCUMENTS
export async function updateOrganisationDocuments(
  org_id: string,
  documents: File[]
): Promise<OrganisationDocumentResponse[]> {
  const formData = new FormData();
  documents.forEach((file) => formData.append("documents", file));

  const res = await axiosClient.put<OrganisationDocumentResponse[]>(
    API_URLS.ORGANISATION.UPDATE_ORG_DOCUMENTS(org_id),
    formData
  );
  return res.data;
}

// DELETE ORGANISATION
export async function deleteOrganisation(org_id: string): Promise<void> {
  await axiosClient.delete(API_URLS.ORGANISATION.DELETE_ORG(org_id));
}
