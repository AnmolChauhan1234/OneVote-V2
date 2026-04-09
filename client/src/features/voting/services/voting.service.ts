import axiosClient from "@/lib/instances/axios";
import { API_URLS } from "@/constants/apiURLs";

import { CastVoteFormData, GenerateTokenFormData } from "../schemas/voting.schema";
import { TokenResponse } from "../types/types";
import { MessageResponse } from "../../auth/types/types";

// CAST VOTE
export async function castVote(
  payload: CastVoteFormData
): Promise<MessageResponse> {
  const res = await axiosClient.post<MessageResponse>(
    API_URLS.VOTING.CAST_VOTE,
    payload
  );
  return res.data;
}

// GET TOTAL VOTES
export async function getTotalVotes(
  election_id: string
): Promise<any> { // TODO: Replace 'any' with proper response type if available
  const res = await axiosClient.get(
    `${API_URLS.VOTING.GET_TOTAL_VOTES}/${election_id}`
  );
  return res.data;
}

// GENERATE VOTING TOKEN
export async function generateVotingToken(
  payload: GenerateTokenFormData
): Promise<TokenResponse> {
  const res = await axiosClient.post<TokenResponse>(
    API_URLS.TOKEN.GENERATE_VOTING_TOKEN,
    payload
  );
  return res.data;
}
