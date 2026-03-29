#!/bin/sh

echo "GLOBAL_ENV: $GLOBAL_ENV"

if [ "$GLOBAL_ENV" = "development" ]; then
  echo "Running migrations..."
  alembic upgrade head
else
  echo "Skipping migrations..."
fi

echo "Starting app..."
exec uvicorn app.main:app --host 0.0.0.0 --port 8000
