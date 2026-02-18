# OneVote V2 🗳️

OneVote V2 is a **scalable, secure, microservices-based digital voting
platform** designed for high integrity, transparency, and future
blockchain integration.

------------------------------------------------------------------------

## 🚀 Architecture Overview

-   Microservices-based backend
-   FastAPI services (isolated domains)
-   PostgreSQL (per service)
-   Redis (caching + rate limiting)
-   Nginx (reverse proxy)
-   Dockerized infrastructure
-   Next.js frontend
-   Designed for future blockchain anchoring

------------------------------------------------------------------------

## 📂 Project Structure

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
    │   │   ├── identity/
    │   │   ├── biometric/
    │   │   ├── organisation/
    │   │   ├── election/
    │   │   ├── voting/
    │   │   └── notification/
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

------------------------------------------------------------------------

## 🧠 Service Responsibilities

### 1️⃣ Auth Service

-   User registration & login
-   JWT issuance
-   Session management
-   OTP verification

### 2️⃣ Identity Service

-   Government identity verification (e.g., DigiLocker)
-   Identity validation storage

### 3️⃣ Biometric Service

-   Facial recognition
-   Liveness detection
-   Anti-spoofing mechanisms

### 4️⃣ Organisation Service

-   Organisation onboarding
-   Admin management

### 5️⃣ Election Service

-   Election creation
-   Candidate & position management
-   Eligible voter management

### 6️⃣ Voting Service

-   Secure vote casting
-   Token validation
-   Hash chain generation
-   Blockchain anchoring (future-ready)

### 7️⃣ Notification Service

-   Email notifications
-   SMS notifications

------------------------------------------------------------------------

## 🔐 Security Features

-   JWT Authentication
-   Redis-based rate limiting
-   OTP verification
-   Vote hash chaining
-   Microservice isolation
-   Future blockchain anchor support

------------------------------------------------------------------------

## 🐳 Running the Project

### 1️⃣ Clone the repository

``` bash
git clone <repo-url>
cd onevote-v2
```

### 2️⃣ Setup environment

``` bash
cp .env.example .env
```

Update environment variables accordingly.

### 3️⃣ Start services

``` bash
docker compose up --build
```

------------------------------------------------------------------------

## 🌍 Future Roadmap

-   Public blockchain anchoring
-   Distributed vote verification nodes
-   End-to-end encryption enhancements
-   Audit dashboards
-   Horizontal scaling with Kubernetes

------------------------------------------------------------------------

## 👨‍💻 Tech Stack

### Backend

-   FastAPI
-   PostgreSQL
-   Redis
-   Docker
-   SQLAlchemy

### Frontend

-   Next.js
-   TypeScript
-   Tailwind CSS
-   Redux Toolkit

------------------------------------------------------------------------

## 📌 Design Goals

-   High scalability
-   Strong consistency
-   Secure vote storage
-   Microservice independence
-   Production-ready architecture

------------------------------------------------------------------------

## 📜 License

This project is intended for educational and research purposes.
