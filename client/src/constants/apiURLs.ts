export const API_URLS = {

  AUTH: {
    REGISTER: "/auth/register", // post
    LOGIN: "/auth/login", // post
    LOGOUT: "/auth/logout", // post
    ME: "/auth/me", // get
    REFRESH_TOKEN: "/auth/refresh", // post
    GENERATE_OTP: "/auth/generate-otp", // post
    VERIFY_OTP: "/auth/verify-otp", // post
    ADD_ORG_IDS: "/auth/me/org-identifiers", // post
  },

  ADMIN: {
    REGISTER_ADMIN: "/admin/admins", // post
    GET_ADMINS: "/admin/admins", // get

    GET_USERS: "/admin/users", // get
    BLOCK_USER: "/admin/users", // post
    // "/admin/users/{user_id}/block"
    SUSPEND_USER: "/admin/users", // post
    // "/admin/users/{user_id}/suspend"
    DELETE_USER: "/admin/users", // delete
    // "/admin/users/{user_id}"

    GET_ORG_DOCUMENTS: "/admin/organizations", // get
    // "/admin/organizations/{org_id}/documents"
    LIST_PENDING_ORGS: "/admin/organizations", // get
    APPROVE_ORG: "/admin/organizations", // post
    // "/admin/organizations/{org_id}/approve"
    REJECT_ORG: "/admin/organizations", // post
    // "/admin/organizations/{org_id}/reject"

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
    
    GET: "/election", // get
    // "/election/{election_id}"
    UPDATE: "/election", // patch
    // "/election/{election_id}"
    GET_RESULTS: "/election", // get
    // "/election/{election_id}/results"
    
    CREATE_POSITION: "/election", // post
    // "/election/{election_id}/positions"
    GET_POSITIONS: "/election", // get
    // "/election/{election_id}/positions"
    
    CREATE_CANDIDATE: "/election/positions", // post
    // "/election/positions/{position_id}/candidates"
    GET_CANDIDATES: "/election/positions", // get
    // "/election/positions/{position_id}/candidates"
    
    ADD_VOTERS: "/election", // post
    // "/election/{election_id}/voters"
    GET_VOTERS: "/election", // get
    // "/election/{election_id}/voters"
  },

  IDENTITY: {
    VERIFY_USER_IDENTITY: "/identity/verify", // post
    GET_USER_IDENTITY: "/identity", // get
    // "/identity/{user_id}"
  },

  ORGANISATION: {
    CREATE_ORG: "/organizations", // post
    // "/organizations/"
    LIST_ORGS: "/organizations", // get
    // "/organizations/"
    
    GET_ORG: "/organizations", // get
    // "/organizations/{org_id}"
    UPDATE_ORG: "/organizations", // put
    // "/organizations/{org_id}"
    UPDATE_ORG_DOCUMENTS: "/organizations", // put
    // "/organizations/{org_id}/documents"
    DELETE_ORG: "/organizations", // delete
    // "/organizations/{org_id}"
  },


  VOTING: {
    // HEALTH: "/voting/health", // get
    CAST_VOTE: "/voting/cast-vote", // post
    GET_TOTAL_VOTES: "/voting/verify", // get
    // "/voting/verify/{election_id}"
  },

  TOKEN: {
    GENERATE_VOTING_TOKEN: "/token/generate-token", // post
  }

} as const;
