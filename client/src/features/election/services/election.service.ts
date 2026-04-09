import axiosClient from "@/lib/instances/axios";
import type { ElectionResponse } from "../types/types";
import { API_URLS } from "@/constants/apiURLs";

export const electionService = {
  getElections: async () => {
    const res = await axiosClient.get<ElectionResponse[]>(
      API_URLS.ELECTION.LIST,
    );
    return res.data;
  },
};
