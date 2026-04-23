export type ElectionStatus = "UPCOMING" | "ONGOING" | "COMPLETED";

export interface ElectionResponse {
  org_id: string;
  title: string;
  description?: string;
  start_date: string;
  end_date: string;
  id: string;
  status: ElectionStatus;
  manual_override: boolean;
  override_reason?: string;
  overridden_by?: string;
  created_at: string;
  updated_at: string;
}

export interface PositionResponse {
  name: string;
  description?: string;
  max_candidates_selectable: number;
  id: string;
  election_id: string;
}

export interface CandidateResponse {
  name: string;
  biography?: string;
  image_url?: string;
  id: string;
  position_id: string;
}

export interface EligibleVoterResponse {
  id: string;
  election_id: string;
  voter_id?: string;
  unique_identifier: string;
  created_at: string;
}

export interface BulkVoterUploadResponse {
  total_processed: number;
  added: number;
  skipped: number;
  errors: string[];
  voters: EligibleVoterResponse[];
}

export interface CandidateResultResponse {
  candidate_id: string;
  name: string;
  vote_count: number;
  is_winner: boolean;
}

export interface PositionResultResponse {
  position_id: string;
  name: string;
  candidates: CandidateResultResponse[];
}

export interface ElectionResultResponse {
  election_id: string;
  title: string;
  status: ElectionStatus;
  positions: PositionResultResponse[];
}
