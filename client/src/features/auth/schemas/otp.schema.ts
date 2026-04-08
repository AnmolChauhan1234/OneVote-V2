import {z} from "zod";

export const generateOTPSchema = z.object({
  email: z.email(),
  purpose: z.string().regex(/^(register|2fa|voting)$/).default("2fa"),
});
export type GenerateOTPFormData = z.infer<typeof generateOTPSchema>;

export const otpVerifySchema = z.object({
  email: z.email().optional(),
  user_id: z.uuid().optional(),
  otp: z.string(),
  purpose: z.string().regex(/^(register|2fa|voting)$/).default("2fa"),
});
export type OTPVerifyFormData = z.infer<typeof otpVerifySchema>;