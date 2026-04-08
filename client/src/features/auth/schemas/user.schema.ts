import { z } from "zod";

import { USERTYPE } from "@/constants/userTypes";

// SIGNUP SCHEMA 
export const registerSchema = z.object({
  email: z.email(),
  password: z.string().min(6),
  full_name: z.string(),
  phone_number: z.string(),
  user_type: z.enum([USERTYPE.VOTER, USERTYPE.ORG_ADMIN]).default(USERTYPE.VOTER),
});
export type RegisterFormData = z.infer<typeof registerSchema>;


// LOGIN SCHEMA
export const loginSchema = z.object({
  email: z.email(),
  password: z.string(),
  device_id: z.string().optional(),
});
export type LoginFormData = z.infer<typeof loginSchema>;

