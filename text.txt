onevote-v2/
│
├── README.md
├── docker-compose.yml
├── .env.example
├── .gitignore
│
├── infra/
│   ├── nginx/
│   │   └── nginx.conf
│   ├── redis/
│   │   └── redis.conf
│   └── postgres/
│       ├── init.sql
│       └── schemas.sql
│
├── backend/
│   ├── shared/                     # Only pure utilities (NO DB models)
│   │   ├── core/
│   │   │   ├── config.py
│   │   │   ├── security.py
│   │   │   ├── jwt.py
│   │   │   ├── redis.py
│   │   │   └── logging.py
│   │   │
│   │   └── utils/
│   │       ├── hashing.py
│   │       ├── otp.py
│   │       ├── rate_limiter.py
│   │       └── time.py
│   │
│   ├── services/
│   │
│   │   ├── auth/
│   │   │   ├── app/
│   │   │   │   ├── main.py
│   │   │   │   ├── api/v1/auth.py
│   │   │   │   ├── models/
│   │   │   │   │   ├── user.py
│   │   │   │   │   ├── otp.py
│   │   │   │   │   └── session.py
│   │   │   │   ├── schemas/auth.py
│   │   │   │   ├── services/auth_service.py
│   │   │   │   ├── repositories/user_repo.py
│   │   │   │   └── db/
│   │   │   │       ├── base.py
│   │   │   │       ├── session.py
│   │   │   │       └── migrations/
│   │   │   ├── Dockerfile
│   │   │   └── requirements.txt
│   │
│   │   ├── identity/
│   │   │   ├── app/
│   │   │   │   ├── main.py
│   │   │   │   ├── api/v1/identity.py
│   │   │   │   ├── models/identity.py
│   │   │   │   ├── schemas/identity.py
│   │   │   │   ├── services/digilocker.py
│   │   │   │   ├── repositories/identity_repo.py
│   │   │   │   └── db/
│   │   │   │       ├── base.py
│   │   │   │       ├── session.py
│   │   │   │       └── migrations/
│   │   │   ├── Dockerfile
│   │   │   └── requirements.txt
│   │
│   │   ├── biometric/
│   │   │   ├── app/
│   │   │   │   ├── main.py
│   │   │   │   ├── api/v1/biometric.py
│   │   │   │   ├── models/biometric.py
│   │   │   │   ├── schemas/biometric.py
│   │   │   │   ├── services/
│   │   │   │   │   ├── liveness.py
│   │   │   │   │   └── anti_spoof.py
│   │   │   │   ├── repositories/biometric_repo.py
│   │   │   │   └── db/
│   │   │   │       ├── base.py
│   │   │   │       ├── session.py
│   │   │   │       └── migrations/
│   │   │   ├── Dockerfile
│   │   │   └── requirements.txt
│   │
│   │   ├── organisation/
│   │   │   ├── app/
│   │   │   │   ├── main.py
│   │   │   │   ├── api/v1/organisation.py
│   │   │   │   ├── models/organisation.py
│   │   │   │   ├── schemas/organisation.py
│   │   │   │   ├── services/organisation_service.py
│   │   │   │   ├── repositories/organisation_repo.py
│   │   │   │   └── db/
│   │   │   │       ├── base.py
│   │   │   │       ├── session.py
│   │   │   │       └── migrations/
│   │   │   ├── Dockerfile
│   │   │   └── requirements.txt
│   │
│   │   ├── election/
│   │   │   ├── app/
│   │   │   │   ├── main.py
│   │   │   │   ├── api/v1/election.py
│   │   │   │   ├── models/
│   │   │   │   │   ├── election.py
│   │   │   │   │   ├── position.py
│   │   │   │   │   ├── candidate.py
│   │   │   │   │   └── eligible_voter.py
│   │   │   │   ├── schemas/election.py
│   │   │   │   ├── services/election_service.py
│   │   │   │   ├── repositories/election_repo.py
│   │   │   │   └── db/
│   │   │   │       ├── base.py
│   │   │   │       ├── session.py
│   │   │   │       └── migrations/
│   │   │   ├── Dockerfile
│   │   │   └── requirements.txt
│   │
│   │   ├── voting/
│   │   │   ├── app/
│   │   │   │   ├── main.py
│   │   │   │   ├── api/v1/voting.py
│   │   │   │   ├── models/
│   │   │   │   │   ├── vote.py
│   │   │   │   │   ├── token.py
│   │   │   │   │   └── blockchain_anchor.py
│   │   │   │   ├── schemas/voting.py
│   │   │   │   ├── services/
│   │   │   │   │   ├── voting_service.py
│   │   │   │   │   └── hash_chain.py
│   │   │   │   ├── repositories/voting_repo.py
│   │   │   │   └── db/
│   │   │   │       ├── base.py
│   │   │   │       ├── session.py
│   │   │   │       └── migrations/
│   │   │   ├── Dockerfile
│   │   │   └── requirements.txt
│   │
│   │   └── notification/
│   │       ├── app/
│   │       │   ├── main.py
│   │       │   ├── api/v1/notify.py
│   │       │   └── services/
│   │       │       ├── email.py
│   │       │       └── sms.py
│   │       ├── Dockerfile
│   │       └── requirements.txt
│
├── frontend/
│   ├── app/
│   ├── components/
│   ├── lib/
│   ├── hooks/
│   ├── store/
│   ├── styles/
│   ├── public/
│   ├── next.config.js
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   └── package.json
