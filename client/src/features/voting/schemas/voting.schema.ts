import { z } from "zod";

export const castVoteSchema = z.object({
  user_id: z.string().uuid(),
  organisation_id: z.string().uuid(),
  election_id: z.string().uuid(),
  selections: z.array(z.object({
    position_id: z.string().uuid(),
    candidate_id: z.string().uuid()
  })),
  biometric_token: z.string(),
});
export type CastVoteFormData = z.infer<typeof castVoteSchema>;

export const generateTokenSchema = z.object({
  user_id: z.uuid(),
  election_id: z.uuid(),
});
export type GenerateTokenFormData = z.infer<typeof generateTokenSchema>;
