export const ROLES = {
  SUPERADMIN: 'super_admin',
  ADMIN: 'admin',
  USER: 'user'
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];
