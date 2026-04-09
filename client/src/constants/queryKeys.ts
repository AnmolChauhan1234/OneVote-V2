// src/lib/queryKeys.ts

export const queryKeys = {

  // ----------------------------------------------------------------
  // AUTH
  // Only "me" is a query — all other auth endpoints are mutations
  // (login, logout, register, otp) — no cache needed
  // ----------------------------------------------------------------
  auth: {
    me: ["me"] as const,
    session: ["session"] as const, 
  },

  // ----------------------------------------------------------------
  // USER ORG IDENTIFIERS
  // GET /auth/me/org-identifiers
  // ----------------------------------------------------------------
  userOrg: {
    all: ["user-org-identifiers"] as const,
  },

  // ----------------------------------------------------------------
  // ADMIN
  // ----------------------------------------------------------------
  admin: {
    // GET /admin/admins
    admins: ["admin", "admins"] as const,

    // GET /admin/users
    users: ["admin", "users"] as const,

    // GET /admin/users/{user_id} — if you ever need a single user
    user: (userId: string) =>
      ["admin", "users", userId] as const,

    // GET /admin/organizations — pending list
    pendingOrgs: ["admin", "organizations", "pending"] as const,

    // GET /admin/organizations/{org_id}/documents
    orgDocuments: (orgId: string) =>
      ["admin", "organizations", orgId, "documents"] as const,
  },

  // ----------------------------------------------------------------
  // ELECTION
  // ----------------------------------------------------------------
  election: {
    // GET /election/
    all: ["elections"] as const,

    // GET /election/{election_id}
    detail: (electionId: string) =>
      ["elections", electionId] as const,

    // GET /election/{election_id}/results
    results: (electionId: string) =>
      ["elections", electionId, "results"] as const,

    // GET /election/{election_id}/positions
    positions: (electionId: string) =>
      ["elections", electionId, "positions"] as const,

    // GET /election/positions/{position_id}/candidates
    candidates: (positionId: string) =>
      ["elections", "positions", positionId, "candidates"] as const,

    // GET /election/{election_id}/voters
    voters: (electionId: string) =>
      ["elections", electionId, "voters"] as const,
  },

  // ----------------------------------------------------------------
  // IDENTITY
  // GET /identity/{user_id}
  // ----------------------------------------------------------------
  identity: {
    detail: (userId: string) =>
      ["identity", userId] as const,
  },

  // ----------------------------------------------------------------
  // ORGANISATION
  // ----------------------------------------------------------------
  organisation: {
    // GET /organizations/
    all: ["organizations"] as const,

    // GET /organizations/{org_id}
    detail: (orgId: string) =>
      ["organizations", orgId] as const,

    // GET /organizations/{org_id}/documents
    documents: (orgId: string) =>
      ["organizations", orgId, "documents"] as const,
  },

  // ----------------------------------------------------------------
  // VOTING
  // GET /voting/verify/{election_id}
  // ----------------------------------------------------------------
  voting: {
    totalVotes: (electionId: string) =>
      ["voting", "verify", electionId] as const,
  },

  // ----------------------------------------------------------------
  // BIOMETRIC   — all mutations (enroll, verify, liveness)
  // TOKEN       — all mutations (generate-voting-token)
  // AUTH OTP    — all mutations (generate-otp, verify-otp)
  // No query keys needed for any of the above
  // ----------------------------------------------------------------

} as const

// ----------------------------------------------------------------
// Type export — lets you use QueryKey type anywhere if needed
// ----------------------------------------------------------------
export type QueryKeys = typeof queryKeys