import { z } from "zod"

const MAX_FILE_SIZE = 5 * 1024 * 1024  // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"]

export const biometricEnrollSchema = z.object({
  user_id: z.string().min(1, "User ID is required"),
  image: z
    .instanceof(File, { message: "Image is required" })
    .refine(
      (file) => file.size <= MAX_FILE_SIZE,
      "Image must be less than 5MB"
    )
    .refine(
      (file) => ACCEPTED_IMAGE_TYPES.includes(file.type),
      "Only .jpg .jpeg .png .webp formats are accepted"
    ),
})
export type BiometricEnrollFormData = z.infer<typeof biometricEnrollSchema>

export const biometricVerifySchema = z.object({
  image: z
    .instanceof(File, { message: "Image is required" })
    .refine(
      (file) => file.size <= MAX_FILE_SIZE,
      "Image must be less than 5MB"
    )
    .refine(
      (file) => ACCEPTED_IMAGE_TYPES.includes(file.type),
      "Only .jpg .jpeg .png .webp formats are accepted"
    ),
})
export type BiometricVerifyFormData = z.infer<typeof biometricVerifySchema>