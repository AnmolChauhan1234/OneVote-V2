# CI/CD Strategy for OneVote Microservices

## Overview

This project uses Alembic for database migrations.
Migrations are handled differently in development and production.

---

## Development Flow

* GLOBAL_ENV=development
* Migrations run automatically via entrypoint.sh
* No manual migration needed

---

## Production Flow

Migrations are NOT run inside application containers.

Instead:

1. CI/CD pipeline runs migrations ONCE
2. Then services are deployed with multiple replicas

---

## Example GitHub Actions Workflow

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  migrate-and-deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Build auth image
        run: docker build -t auth-service ./backend/services/auth

      - name: Run auth migrations
        run: |
          docker run --rm \
          -e DATABASE_URL=${{ secrets.AUTH_DB_URL }} \
          auth-service alembic upgrade head

      - name: Deploy services
        run: echo "Deploy logic here"
```

---

## Key Principles

* Each microservice has its own migrations
* Migrations run exactly once in production
* Application containers never run migrations in production
* Safe horizontal scaling

---

## Scaling Strategy

* Multiple replicas per service
* Load balancing via Nginx
* No migration race conditions

---

# ✅ FINAL RESULT

DEV:

* Auto migrations via entrypoint

PROD:

* CI/CD handles migrations

SCALING:

* Safe, no race conditions

---

## ❗ FINAL RULE

Never use BOTH:

* create_all()
* alembic

Only Alembic should exist.
