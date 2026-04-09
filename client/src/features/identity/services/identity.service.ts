import axiosClient from "@/lib/instances/axios";
import { API_URLS } from "@/constants/apiURLs";

export const identityService = {
  getIdentity: async (userId: string) => {
    const res = await axiosClient.get(
      `${API_URLS.IDENTITY.GET_USER_IDENTITY}/${userId}`,
    );
    return res.data;
  },
};
