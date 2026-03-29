# Production Docker Compose (OneVote)

## Key Differences from Development

- No volumes mapping for external source code (immutable containers).
- Built images contain the full application code.
- Continuous Integration/Continuous Deployment (CI/CD) pipelines handle database migrations.
- The entrypoint strictly executes `alembic upgrade head` prior to service initiation.

---

## Production Configuration (docker-compose.prod.yml)

```yaml
services:
  postgres:
    image: postgres:15
    restart: always
    env_file:
      - .env
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7

  nginx:
    image: onevote-nginx:latest
    ports:
      - "80:80"
    depends_on:
      - auth
      - identity
      - biometric
      - organisation
      - election
      - voting
      - notification

  auth:
    image: onevote-auth:latest
    env_file:
      - .env
    environment:
      DATABASE_URL: ${AUTH_DB_URL}

  identity:
    image: onevote-identity:latest
    env_file:
      - .env
    environment:
      DATABASE_URL: ${IDENTITY_DB_URL}

  biometric:
    image: onevote-biometric:latest
    env_file:
      - .env
    environment:
      DATABASE_URL: ${BIOMETRIC_DB_URL}

  organisation:
    image: onevote-organisation:latest
    env_file:
      - .env
    environment:
      DATABASE_URL: ${ORG_DB_URL}

  election:
    image: onevote-election:latest
    env_file:
      - .env
    environment:
      DATABASE_URL: ${ELECTION_DB_URL}

  voting:
    image: onevote-voting:latest
    env_file:
      - .env
    environment:
      DATABASE_URL: ${VOTING_DB_URL}

  notification:
    image: onevote-notification:latest
    env_file:
      - .env

volumes:
  postgres_data:
```

---

## Production Deployment Workflow

1. **Local Migration Generation:** 
   The developer generates the migration script within the local development environment:
   ```bash
   alembic revision --autogenerate -m "description of changes"
   ```

2. **Version Control:**
   The generated migration script is committed to the main repository track:
   ```bash
   git add .
   git commit -m "chore: add db migration for new features"
   ```

3. **Pipeline Execution (CI/CD):**
   The deployment pipeline is responsible for running the upgrade prior to container spin-up:
   ```bash
   alembic upgrade head
   ```

4. **Container Orchestration:**
   The updated Docker containers are deployed to the host environment.

---

## Important Migration Rules

When operating within the production environment, the following strict protocols must be observed:

- **Do not** generate new migration scripts (`--autogenerate`) against production databases.
- **Only** apply vetted migrations (`upgrade head`) that have successfully passed the CI/CD pipeline.
