import { z } from "zod";

export const castVoteSchema = z.object({
  user_id: z.uuid(),
  organisation_id: z.uuid(),
  election_id: z.uuid(),
  position_id: z.uuid(),
  candidate_id: z.uuid(),
  biometric_token: z.string(),
});
export type CastVoteFormData = z.infer<typeof castVoteSchema>;

export const generateTokenSchema = z.object({
  user_id: z.uuid(),
  election_id: z.uuid(),
});
export type GenerateTokenFormData = z.infer<typeof generateTokenSchema>;
