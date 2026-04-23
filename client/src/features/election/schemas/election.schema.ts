import { z } from "zod";

export const electionCreateSchema = z.object({
  org_id: z.uuid(),
  title: z.string().max(255),
  description: z.string().optional(),
  start_date: z.string(),
  end_date: z.string(),
});
export type ElectionCreateFormData = z.infer<typeof electionCreateSchema>;

export const electionUpdateSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  status: z.enum(["UPCOMING", "ONGOING", "COMPLETED"]).optional(),
  manual_override: z.boolean().optional(),
  override_reason: z.string().optional(),
});
export type ElectionUpdateFormData = z.infer<typeof electionUpdateSchema>;

export const positionCreateSchema = z.object({
  name: z.string().max(255),
  description: z.string().optional(),
  max_candidates_selectable: z.number().min(1),
});
export type PositionCreateFormData = z.infer<typeof positionCreateSchema>;

export const positionUpdateSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  max_candidates_selectable: z.number().optional(),
});
export type PositionUpdateFormData = z.infer<typeof positionUpdateSchema>;

export const candidateCreateSchema = z.object({
  name: z.string().max(255),
  biography: z.string().optional(),
  image_url: z.string().optional(),
});
export type CandidateCreateFormData = z.infer<typeof candidateCreateSchema>;

export const candidateUpdateSchema = z.object({
  name: z.string().optional(),
  biography: z.string().optional(),
  image_url: z.string().optional(),
});
export type CandidateUpdateFormData = z.infer<typeof candidateUpdateSchema>;

export const eligibleVoterCreateSchema = z.object({
  voter_id: z.string().optional(),
  unique_identifier: z.string(),
});
export type EligibleVoterCreateFormData = z.infer<typeof eligibleVoterCreateSchema>;
