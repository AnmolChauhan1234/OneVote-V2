import axiosClient from "@/lib/instances/axios";
import { API_URLS } from "@/constants/apiURLs";
import {
  PendingOrganisation,
  OrganisationDocument,
  ApproveOrganisationPayload,
  RejectOrganisationPayload
} from "../types/admin.types";

export const getPendingOrganisations = async (): Promise<PendingOrganisation[]> => {
  const res = await axiosClient.get<PendingOrganisation[]>(
    API_URLS.ADMIN.LIST_PENDING_ORGS
  );
  return res.data;
};

export const getOrganisationDocuments = async (orgId: string): Promise<OrganisationDocument[]> => {
  const res = await axiosClient.get<OrganisationDocument[]>(
    API_URLS.ADMIN.GET_ORG_DOCUMENTS(orgId)
  );
  return res.data;
};

export const approveOrganisation = async (orgId: string, payload: ApproveOrganisationPayload): Promise<any> => {
  const res = await axiosClient.post(
    API_URLS.ADMIN.APPROVE_ORG(orgId),
    payload
  );
  return res.data;
};

export const rejectOrganisation = async (orgId: string, payload: RejectOrganisationPayload): Promise<any> => {
  const res = await axiosClient.post(
    API_URLS.ADMIN.REJECT_ORG(orgId),
    payload
  );
  return res.data;
};
