import { z } from "zod";

export const userOrgIdentifierCreateSchema = z.object({
  org_id: z.string().uuid(),
  identifier_value: z.string().min(1, "Identifier value is required"),
});

export type UserOrgIdentifierCreateData = z.infer<typeof userOrgIdentifierCreateSchema>;

export const userOrgIdentifierUpdateSchema = z.object({
  identifier_value: z.string().min(1, "Identifier value is required"),
});

export type UserOrgIdentifierUpdateData = z.infer<typeof userOrgIdentifierUpdateSchema>;
