import axiosClient from "@/lib/instances/axios";
import { API_URLS } from "@/constants/apiURLs";

import {
  ElectionCreateFormData,
  ElectionUpdateFormData,
  PositionCreateFormData,
  CandidateCreateFormData,
  EligibleVoterCreateFormData,
} from "../schemas/election.schema";

import {
  ElectionResponse,
  PositionResponse,
  CandidateResponse,
  ElectionResultResponse,
  EligibleVoterResponse,
  BulkVoterUploadResponse,
} from "../types/types";

// CREATE ELECTION
export async function createElection(
  payload: ElectionCreateFormData
): Promise<ElectionResponse> {
  const res = await axiosClient.post<ElectionResponse>(
    API_URLS.ELECTION.CREATE,
    payload
  );
  return res.data;
}

// GET ELECTIONS LIST
export async function getElections(): Promise<ElectionResponse[]> {
  const res = await axiosClient.get<ElectionResponse[]>(API_URLS.ELECTION.LIST);
  return res.data;
}

// GET ELECTION DETAIL
export async function getElectionDetail(
  election_id: string
): Promise<ElectionResponse> {
  const res = await axiosClient.get<ElectionResponse>(
    API_URLS.ELECTION.GET(election_id)
  );
  return res.data;
}

// UPDATE ELECTION
export async function updateElection(
  election_id: string,
  payload: ElectionUpdateFormData
): Promise<ElectionResponse> {
  const res = await axiosClient.patch<ElectionResponse>(
    API_URLS.ELECTION.UPDATE(election_id),
    payload
  );
  return res.data;
}

// GET ELECTION RESULTS
export async function getElectionResults(
  election_id: string
): Promise<ElectionResultResponse> {
  const res = await axiosClient.get<ElectionResultResponse>(
    API_URLS.ELECTION.GET_RESULTS(election_id)
  );
  return res.data;
}

// CREATE POSITION
export async function createPosition(
  election_id: string,
  payload: PositionCreateFormData
): Promise<PositionResponse> {
  const res = await axiosClient.post<PositionResponse>(
    API_URLS.ELECTION.CREATE_POSITION(election_id),
    payload
  );
  return res.data;
}

// GET POSITIONS
export async function getPositions(
  election_id: string
): Promise<PositionResponse[]> {
  const res = await axiosClient.get<PositionResponse[]>(
    API_URLS.ELECTION.GET_POSITIONS(election_id)
  );
  return res.data;
}

// CREATE CANDIDATE
export async function createCandidate(
  position_id: string,
  payload: CandidateCreateFormData
): Promise<CandidateResponse> {
  const res = await axiosClient.post<CandidateResponse>(
    API_URLS.ELECTION.CREATE_CANDIDATE(position_id),
    payload
  );
  return res.data;
}

// GET CANDIDATES
export async function getCandidates(
  position_id: string
): Promise<CandidateResponse[]> {
  const res = await axiosClient.get<CandidateResponse[]>(
    API_URLS.ELECTION.GET_CANDIDATES(position_id)
  );
  return res.data;
}

// ADD VOTERS (Bulk)
export async function addVoters(
  election_id: string,
  voters: EligibleVoterCreateFormData[]
): Promise<BulkVoterUploadResponse> {
  const res = await axiosClient.post<BulkVoterUploadResponse>(
    API_URLS.ELECTION.ADD_VOTERS(election_id),
    { voters }
  );
  return res.data;
}

// GET VOTERS
export async function getVoters(
  election_id: string
): Promise<EligibleVoterResponse[]> {
  const res = await axiosClient.get<EligibleVoterResponse[]>(
    API_URLS.ELECTION.GET_VOTERS(election_id)
  );
  return res.data;
}
