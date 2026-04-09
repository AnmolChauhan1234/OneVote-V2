import { z } from "zod";

export const identityCreateSchema = z.object({
  aadhar_id: z.string().regex(/^\d{12}$/),
  user_id: z.uuid(),
});
export type IdentityCreateFormData = z.infer<typeof identityCreateSchema>;

export const identityVerifySchema = z.object({
  aadhar_id: z.string().regex(/^\d{12}$/),
  user_id: z.uuid(),
});
export type IdentityVerifyFormData = z.infer<typeof identityVerifySchema>;
