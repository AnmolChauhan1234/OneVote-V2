export const ROUTES = {
  DASHBOARD: {
    PROTECTED: '/dashboard',
    ADMIN: '/admin/dashboard',
    SUPERADMIN: '/superadmin/dashboard',
    ORG: '/org/dashboard',
  },
  PUBLIC: {
    LOGIN: '/login',
  },
  UNAUTHORIZED: '/unauthorized',
} as const;
