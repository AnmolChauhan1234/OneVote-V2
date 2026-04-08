import { z } from "zod";

export const organisationCreateSchema = z.object({
  name: z.string(),
  type: z.string().optional(),
  description: z.string().optional(),
  owner_id: z.string().optional(),
});
export type OrganisationCreateFormData = z.infer<typeof organisationCreateSchema>;

export const organisationUpdateSchema = z.object({
  name: z.string().optional(),
  type: z.string().optional(),
  description: z.string().optional(),
  owner_id: z.string().optional(),
});
export type OrganisationUpdateFormData = z.infer<typeof organisationUpdateSchema>;

export const approveOrganisationSchema = z.object({
  remarks: z.string().optional(),
});
export type ApproveOrganisationFormData = z.infer<typeof approveOrganisationSchema>;

export const rejectOrganisationSchema = z.object({
  reason: z.string(),
});
export type RejectOrganisationFormData = z.infer<typeof rejectOrganisationSchema>;
