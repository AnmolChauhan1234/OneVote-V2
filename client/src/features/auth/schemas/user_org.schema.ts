import {z} from "zod";


// USER-ORG INDENTIFIER CREATE
export const userOrgIdentifierCreateSchema = z.object({
  org_id: z.uuid(),
  identifier_value: z.string(),
});
export type UserOrgIdentifierCreateFormData = z.infer<typeof userOrgIdentifierCreateSchema>;

// UPDATE USER-ORG INDENTIFIER
export const userOrgIdentifierUpdateSchema = z.object({
  identifier_value: z.string(),
});
export type UserOrgIdentifierUpdateFormData = z.infer<typeof userOrgIdentifierCreateSchema>;