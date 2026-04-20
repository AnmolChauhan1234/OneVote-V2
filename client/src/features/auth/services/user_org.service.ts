import { API_URLS } from "@/constants/apiURLs";

import { ListUserOrgIdentifiersResponse, UserOrgIdentifierDeleteResponse, UserOrgIdentifierResponse, UserOrgIdentifierUpdateResponse } from "../types/types";

import axiosClient from "@/lib/instances/axios";

import { UserOrgIdentifierCreateFormData } from "../schemas/user_org.schema";

export async function addUserOrgId(payload: UserOrgIdentifierCreateFormData): Promise<UserOrgIdentifierCreateFormData> {
  const res = await axiosClient.post<UserOrgIdentifierResponse>(API_URLS.AUTH.ADD_ORG_IDENTIFIER, payload);
  return res.data;
}


export async function getUserOrgIds(): Promise<ListUserOrgIdentifiersResponse> {
  const res = await axiosClient.get<ListUserOrgIdentifiersResponse>(API_URLS.AUTH.GET_ORG_IDENTIFIER);
  return res.data;
}

export async function updateUserOrgIdentifier(identifier_id: string, payload: { identifier_value: string }): Promise<UserOrgIdentifierUpdateResponse> {
  const res = await axiosClient.put<UserOrgIdentifierUpdateResponse>(API_URLS.AUTH.UPDATE_ORG_IDENTIFIER(identifier_id), payload);
  return res.data;
}

export async function deleteUserOrgIdentifier(identifier_id: string): Promise<UserOrgIdentifierDeleteResponse> {
  const res = await axiosClient.delete<UserOrgIdentifierDeleteResponse>(API_URLS.AUTH.DELETE_ORG_IDENTIFIER(identifier_id));
  return res.data;
}
