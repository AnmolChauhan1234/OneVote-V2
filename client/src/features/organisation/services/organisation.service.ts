import axiosClient from "@/lib/instances/axios";
import type { OrganisationResponse } from "../types/types";
import { API_URLS } from "@/constants/apiURLs";

export const organisationService = {
  getOrganisations: async () => {
    const res = await axiosClient.get<OrganisationResponse[]>(
      API_URLS.ORGANISATION.LIST_ORGS,
    );
    return res.data;
  },
  createOrganisation: async (data: any) => {
    const res = await axiosClient.post(API_URLS.ORGANISATION.CREATE_ORG, data);
    return res.data;
  },
};
