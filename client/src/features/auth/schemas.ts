import {z} from "zod";


export const adminCreateSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  full_name: z.string(),
});
export type AdminCreateFormData = z.infer<typeof adminCreateSchema>;


export const generateOTPSchema = z.object({
  email: z.string().email(),
  purpose: z.string().regex(/^(register|2fa|voting)$/).default("2fa"),
});
export type GenerateOTPFormData = z.infer<typeof generateOTPSchema>;

export const otpVerifySchema = z.object({
  email: z.string().email().optional(),
  user_id: z.uuid().optional(),
  otp: z.string(),
  purpose: z.string().regex(/^(register|2fa|voting)$/).default("2fa"),
});
export type OTPVerifyFormData = z.infer<typeof otpVerifySchema>;

export const userUpdateSchema = z.object({
  full_name: z.string().optional(),
  role: z.string().optional(),
  user_type: z.string().optional(),
  phone_number: z.string().optional(),
  is_blocked: z.boolean().optional(),
  is_suspended: z.boolean().optional(),
});
export type UserUpdateFormData = z.infer<typeof userUpdateSchema>;

export const userOrgIdentifierCreateSchema = z.object({
  org_id: z.uuid(),
  identifier_value: z.string(),
});
export type UserOrgIdentifierCreateFormData = z.infer<typeof userOrgIdentifierCreateSchema>;

export const internalVoterVerificationSchema = z.object({
  org_id: z.uuid(),
  identifiers: z.array(z.string()),
});
export type InternalVoterVerificationFormData = z.infer<typeof internalVoterVerificationSchema>;

export const verificationUpdateSchema = z.object({
  user_id: z.uuid(),
});
export type VerificationUpdateFormData = z.infer<typeof verificationUpdateSchema>;

export const userTypeUpdateSchema = z.object({
  user_id: z.uuid(),
  user_type: z.string(),
});
export type UserTypeUpdateFormData = z.infer<typeof userTypeUpdateSchema>;
