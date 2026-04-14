import { z } from "zod";

const aadhaarField = z
  .string()
  .trim()
  .min(1, "Aadhaar number cannot be empty")
  .regex(/^\d+$/, "Aadhaar number must contain only digits")
  .length(12, "Aadhaar number must be exactly 12 digits");

export const identityCreateSchema = z.object({
  aadhar_id: aadhaarField,
  user_id: z.uuid("Invalid session. Please restart the registration process."),
});

export type IdentityCreateFormData = z.infer<typeof identityCreateSchema>;

export const identityVerifySchema = z.object({
  aadhar_id: aadhaarField,
  user_id: z.uuid("Invalid session. Please restart the process."),
});

export type IdentityVerifyFormData = z.infer<typeof identityVerifySchema>;
