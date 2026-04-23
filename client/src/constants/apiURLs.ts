export const API_URLS = {

  AUTH: {
    REGISTER: "/auth/register", // post
    LOGIN: "/auth/login", // post
    LOGOUT: "/auth/logout", // post
    ME: "/auth/me", // get
    REFRESH_TOKEN: "/auth/refresh", // post
    GENERATE_OTP: "/auth/generate-otp", // post
    VERIFY_OTP: "/auth/verify-otp", // post
    ADD_ORG_IDENTIFIER: "/auth/me/org-identifiers", // post
    GET_ORG_IDENTIFIER: "/auth/me/org-identifiers", // get
    UPDATE_ORG_IDENTIFIER: (identifier_id: string) =>
      `/auth/me/org-identifiers/${identifier_id}`, // put
    DELETE_ORG_IDENTIFIER: (identifier_id: string) =>
      `/auth/me/org-identifiers/${identifier_id}`, // delete
  },


  ADMIN: {
    REGISTER_ADMIN: "/auth/admin/admins", // post
    GET_ADMINS: "/auth/admin/admins", // get

    GET_USERS: "/auth/admin/users", // get

    BLOCK_USER: (user_id: string) =>
      `/auth/admin/users/${user_id}/block`, // post
    // "/auth/admin/users/{user_id}/block"

    SUSPEND_USER: (user_id: string) =>
      `/auth/admin/users/${user_id}/suspend`, // post
    // "/auth/admin/users/{user_id}/suspend"

    DELETE_USER: (user_id: string) =>
      `/auth/admin/users/${user_id}`, // delete
    // "/auth/admin/users/{user_id}"

    GET_ORG_DOCUMENTS: (org_id: string) =>
      `/organisation/admin/organizations/${org_id}/documents`, // get
    // "/organisation/admin/organizations/{org_id}/documents"

    LIST_PENDING_ORGS: "/organisation/admin/organizations", // get

    APPROVE_ORG: (org_id: string) =>
      `/organisation/admin/organizations/${org_id}/approve`, // post
    // "/organisation/admin/organizations/{org_id}/approve"

    REJECT_ORG: (org_id: string) =>
      `/organisation/admin/organizations/${org_id}/reject`, // post
    // "/organisation/admin/organizations/{org_id}/reject"

    ADMIN_LIST_ELECTIONS: "/election/admin", // get
  },

  BIOMETRIC: {
    ENROLL: "/biometric/enroll", // post
    VERIFY: "/biometric/verify", // post
    LIVENESS_CHECK: "/biometric/liveness-check", // post
  },

  ELECTION: {
    CREATE: "/election", // post
    // "/election/"

    LIST: "/election", // get
    // "/election/"

    MY_ELECTIONS: "/election/my-elections", // get (voter's eligible elections)

    GET: (election_id: string) =>
      `/election/${election_id}`, // get
    // "/election/{election_id}"

    UPDATE: (election_id: string) =>
      `/election/${election_id}`, // patch
    // "/election/{election_id}"

    GET_RESULTS: (election_id: string) =>
      `/election/${election_id}/results`, // get
    // "/election/{election_id}/results"

    CREATE_POSITION: (election_id: string) =>
      `/election/${election_id}/positions`, // post
    // "/election/{election_id}/positions"

    GET_POSITIONS: (election_id: string) =>
      `/election/${election_id}/positions`, // get
    // "/election/{election_id}/positions"

    CREATE_CANDIDATE: (position_id: string) =>
      `/election/positions/${position_id}/candidates`, // post
    // "/election/positions/{position_id}/candidates"

    GET_CANDIDATES: (position_id: string) =>
      `/election/positions/${position_id}/candidates`, // get
    // "/election/positions/{position_id}/candidates"

    ADD_VOTERS: (election_id: string) =>
      `/election/${election_id}/voters`, // post
    // "/election/{election_id}/voters"

    GET_VOTERS: (election_id: string) =>
      `/election/${election_id}/voters`, // get
    // "/election/{election_id}/voters"
  },

  IDENTITY: {
    VERIFY_USER_IDENTITY: "/identity/verify", // post

    GET_USER_IDENTITY: (user_id: string) =>
      `/identity/${user_id}`, // get
    // "/identity/{user_id}"
  },

  ORGANISATION: {
    CREATE_ORG: "/organisation", // post
    // "/organisation/"

    LIST_ORGS: "/organisation", // get
    // "/organisation/"

    GET_ORG: (org_id: string) =>
      `/organisation/${org_id}`, // get
    // "/organisation/{org_id}"

    UPDATE_ORG: (org_id: string) =>
      `/organisation/${org_id}`, // put
    // "/organisation/{org_id}"

    UPDATE_ORG_DOCUMENTS: (org_id: string) =>
      `/organisation/${org_id}/documents`, // put
    // "/organisation/{org_id}/documents"

    DELETE_ORG: (org_id: string) =>
      `/organisation/${org_id}`, // delete
    // "/organisation/{org_id}"
  },

  VOTING: {
    // HEALTH: "/voting/health", // get

    CAST_VOTE: "/voting/cast-vote", // post

    GET_TOTAL_VOTES: (election_id: string) =>
      `/voting/verify/${election_id}`, // get
    // "/voting/verify/{election_id}"
  },

  TOKEN: {
    GENERATE_VOTING_TOKEN: "/voting/token/generate-token", // post
  },

  NOTIFICATION: {
    GET_NOTIFICATIONS: "/notification", // get
  },

} as const;