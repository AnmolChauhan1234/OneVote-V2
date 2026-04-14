export const USERTYPE = {
  VOTER: "voter",
  ORG_ADMIN: "org_admin",
} as const;

export type UserType = (typeof USERTYPE)[keyof typeof USERTYPE];
