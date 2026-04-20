export interface PendingOrganisation {
  id: string;
  name: string;
  submittedAt: string;
}

export interface OrganisationDocument {
  id: number;
  org_id: string;
  file_url: string;
  uploaded_at: string;
}

export interface ApproveOrganisationPayload {
  remarks?: string;
}

export interface RejectOrganisationPayload {
  reason: string;
}
