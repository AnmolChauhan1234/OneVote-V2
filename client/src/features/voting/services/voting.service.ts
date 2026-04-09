import axiosClient from "@/lib/instances/axios";
import { API_URLS } from "@/constants/apiURLs";

export const votingService = {
  submitVote: async (data: any) => {
    const res = await axiosClient.post(API_URLS.VOTING.CAST_VOTE, data);
    return res.data;
  },
};
