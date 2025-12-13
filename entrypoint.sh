#!/bin/sh
set -e

POSTGRES_HOST=postgres
POSTGRES_USER=${POSTGRES_USER}
POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
POSTGRES_DB=${POSTGRES_DB}

export PGPASSWORD="$POSTGRES_PASSWORD"

LATEST_MIGRATION_DIR=$(find prisma/migrations -maxdepth 1 -type d -name '[0-9]*' | sort | tail -n 1)
MIGRATION_FILE="$LATEST_MIGRATION_DIR/migration.sql"

if [ ! -f "$MIGRATION_FILE" ]; then
  echo "❌ No migration.sql found in $LATEST_MIGRATION_DIR"
  exit 1
fi

echo "Waiting for Postgres at $POSTGRES_HOST..."

# 🔒 Timeout protection (prevents infinite hang)
MAX_RETRIES=30
COUNT=0

until pg_isready -h "$POSTGRES_HOST" -U "$POSTGRES_USER" >/dev/null 2>&1; do
  COUNT=$((COUNT + 1))
  if [ "$COUNT" -ge "$MAX_RETRIES" ]; then
    echo "❌ Postgres did not become ready in time"
    exit 1
  fi
  sleep 2
done

echo "✅ Postgres is ready"

echo "Running migration: $MIGRATION_FILE"
psql -h "$POSTGRES_HOST" -U "$POSTGRES_USER" -d "$POSTGRES_DB" -f "$MIGRATION_FILE"

echo "✅ Migration complete"
echo "Starting application..."

exec "$@"
