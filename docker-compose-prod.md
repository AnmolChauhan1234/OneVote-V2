# 🚀 Production Docker Compose (OneVote)

## Key Differences from Development

- ❌ No volumes for services (immutable containers)
- ❌ No local code mounting
- ✅ Images contain full code
- ✅ CI/CD handles migrations
- ✅ EntryPoint only runs `alembic upgrade head`

---

## docker-compose (production)

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

## Production Workflow

1. Developer generates migration locally:

   ```
   alembic revision --autogenerate
   ```

2. Commit migration:

   ```
   git add .
   git commit
   ```

3. CI/CD runs:

   ```
   alembic upgrade head
   ```

4. Deploy containers

---

## Important Rule

Containers in production:

- DO NOT generate migrations
- ONLY apply migrations

---
