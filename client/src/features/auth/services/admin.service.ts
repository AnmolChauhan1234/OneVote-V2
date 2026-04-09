import axiosClient from "@/lib/instances/axios";

import { API_URLS } from "@/constants/apiURLs";

import { AdminCreateFormData } from "../schemas/admin.schema";

import {
  BlockUserResponse,
  CreateAdminResponse,
  ListAllAdminResponse,
  ListAllUserAdminResponse,
  SuspendUserResponse,
  DeleteUserResponse,
  MessageResponse,
} from "../types/types";

import {
  OrganisationDocumentResponse,
  OrganisationListPendingResponse,
} from "../../organisation/types/types";

import {
  ApproveOrganisationFormData,
  RejectOrganisationFormData,
} from "../../organisation/schemas/organisation.schema";




export async function createAdmin(
  payload: AdminCreateFormData,
): Promise<CreateAdminResponse> {
  const res = await axiosClient.post<CreateAdminResponse>(
    API_URLS.ADMIN.REGISTER_ADMIN,
    payload,
  );
  return res.data;
}

export async function listAllAdims(): Promise<ListAllAdminResponse> {
  const res = await axiosClient.get<ListAllAdminResponse>(
    API_URLS.ADMIN.GET_ADMINS,
  );

  return res.data;
}

export async function getAllUsers(): Promise<ListAllUserAdminResponse> {
  const res = await axiosClient.get<ListAllUserAdminResponse>(
    API_URLS.ADMIN.GET_USERS,
  );
  return res.data;
}

export async function blockUser(user_id: string): Promise<BlockUserResponse> {
  const res = await axiosClient.post<BlockUserResponse>(
    `${API_URLS.ADMIN.BLOCK_USER}/${user_id}/block`,
  );
  return res.data;
}

export async function suspendUser(
  user_id: string,
): Promise<SuspendUserResponse> {
  const res = await axiosClient.post<SuspendUserResponse>(
    `${API_URLS.ADMIN.SUSPEND_USER}/${user_id}/suspend`,
  );
  return res.data;
}

export async function deleteUser(user_id: string): Promise<DeleteUserResponse> {
  const res = await axiosClient.delete<DeleteUserResponse>(
    `${API_URLS.ADMIN.DELETE_USER}/${user_id}`,
  );
  return res.data;
}

export async function getOrgDocuments(
  org_id: string,
): Promise<OrganisationDocumentResponse[]> {
  const res = await axiosClient.get<OrganisationDocumentResponse[]>(
    `${API_URLS.ADMIN.GET_ORG_DOCUMENTS}/${org_id}/documents`,
  );
  return res.data;
}

export async function listPendingOrgs(): Promise<
  OrganisationListPendingResponse[]
> {
  const res = await axiosClient.get<OrganisationListPendingResponse[]>(
    API_URLS.ADMIN.LIST_PENDING_ORGS,
  );
  return res.data;
}

export async function approveOrg(
  org_id: string,
  payload: ApproveOrganisationFormData,
): Promise<MessageResponse> {
  const res = await axiosClient.post<MessageResponse>(
    `${API_URLS.ADMIN.APPROVE_ORG}/${org_id}/approve`,
    payload,
  );
  return res.data;
}

export async function rejectOrg(
  org_id: string,
  payload: RejectOrganisationFormData,
): Promise<MessageResponse> {
  const res = await axiosClient.post<MessageResponse>(
    `${API_URLS.ADMIN.REJECT_ORG}/${org_id}/reject`,
    payload,
  );
  return res.data;
}

