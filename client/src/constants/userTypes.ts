export const USERTYPE = {
  VOTER: "voter",
  ORG_ADMIN: "org_admin",
  SUPER_ADMIN: "super_admin",
} as const;

export type UserType = (typeof USERTYPE)[keyof typeof USERTYPE];
