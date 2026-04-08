import {z} from "zod";


export const adminCreateSchema = z.object({
  email: z.email(),
  password: z.string().min(6),
  full_name: z.string(),
});
export type AdminCreateFormData = z.infer<typeof adminCreateSchema>;


export const userUpdateSchema = z.object({
  full_name: z.string().optional(),
  role: z.string().optional(),
  user_type: z.string().optional(),
  phone_number: z.string().optional(),
  is_blocked: z.boolean().optional(),
  is_suspended: z.boolean().optional(),
});
export type UserUpdateFormData = z.infer<typeof userUpdateSchema>;