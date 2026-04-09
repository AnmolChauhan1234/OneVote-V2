export enum OrganisationStatus {
  PENDING_VERIFICATION = "PENDING_VERIFICATION",
  VERIFIED = "VERIFIED",
  REJECTED = "REJECTED",
}

export interface OrganisationDocumentResponse {
  id: number;
  org_id: string;
  file_url: string;
  uploaded_at: string;
}

export interface OrganisationResponse {
  name: string;
  type?: string;
  description?: string;
  owner_id?: string;
  id: string;
  status: OrganisationStatus;
  created_at: string;
  verified_at?: string;
  isVerified: boolean;
}

export interface OrganisationListPendingResponse {
  id: string;
  name: string;
  submittedAt: string;
}

export interface OrganisationEligibilityResponse {
  orgId: string;
  isVerified: boolean;
  eligibleForElection: boolean;
}
