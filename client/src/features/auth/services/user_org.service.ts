import { API_URLS } from "@/constants/apiURLs";

import { ListUserOrgIdentifiersResponse, UserOrgIdentifierDeleteResponse, UserOrgIdentifierResponse, UserOrgIdentifierUpdateResponse } from "../types/types";

import axiosClient from "@/lib/instances/axios";

import { UserOrgIdentifierCreateFormData } from "../schemas/user_org.schema";

export async function addUserOrgId(payload: UserOrgIdentifierCreateFormData): Promise<UserOrgIdentifierCreateFormData> {
  const res = await axiosClient.post<UserOrgIdentifierResponse>(API_URLS.USER_ORG.ADD_ORG_IDS, payload);
  return res.data;
}


export async function getUserOrgIds(): Promise<ListUserOrgIdentifiersResponse> {
  const res = await axiosClient.get<ListUserOrgIdentifiersResponse>(API_URLS.USER_ORG.GET_ORG_IDS);
  return res.data;
}

export async function updateUserOrgIdentifier(identifier_id: string, payload: {identifier_value: string}): Promise<UserOrgIdentifierUpdateResponse> {
  const res = await axiosClient.patch<UserOrgIdentifierUpdateResponse>(`${API_URLS.USER_ORG.UPDATE_ORG_IDENTIFIER}/${identifier_id}`, payload);
  return res.data;
}

export async function deleteUserOrgIdentifier(identifier_id: string): Promise<UserOrgIdentifierDeleteResponse> {
  const res = await axiosClient.delete<UserOrgIdentifierDeleteResponse>(`${API_URLS.USER_ORG.DELETE_ORG_IDENTIFIER}/${identifier_id}`);
  return res.data;
}
