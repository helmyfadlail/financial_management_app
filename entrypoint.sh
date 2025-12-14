#!/bin/sh
set -e

echo "⏳ Waiting for PostgreSQL..."

until pg_isready \
  -h "$POSTGRES_HOST" \
  -p "$POSTGRES_PORT" \
  -U "$POSTGRES_USER"; do
  sleep 2
done

echo "✅ PostgreSQL is ready"

# Create migration tracking table
psql "$DATABASE_URL" <<EOF
CREATE TABLE IF NOT EXISTS __manual_migrations (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE,
  executed_at TIMESTAMP DEFAULT NOW()
);
EOF

# Find latest Prisma migration directory safely
LATEST_MIGRATION_DIR=$(find prisma/migrations -maxdepth 1 -type d -name '[0-9]*' | sort | tail -n 1)
MIGRATION_FILE="$LATEST_MIGRATION_DIR/migration.sql"
MIGRATION_NAME=$(basename "$LATEST_MIGRATION_DIR")

if [ ! -f "$MIGRATION_FILE" ]; then
  echo "⚠️ No migration.sql found, skipping migration"
else
  MIGRATION_APPLIED=$(psql "$DATABASE_URL" -tAc \
    "SELECT 1 FROM __manual_migrations WHERE name='$MIGRATION_NAME'")

  if [ "$MIGRATION_APPLIED" = "1" ]; then
    echo "ℹ️ Migration already applied: $MIGRATION_NAME"
  else
    echo "🚀 Running migration: $MIGRATION_NAME"
    psql "$DATABASE_URL" -f "$MIGRATION_FILE"
    psql "$DATABASE_URL" -c \
      "INSERT INTO __manual_migrations (name) VALUES ('$MIGRATION_NAME')"
    echo "✅ Migration completed"
  fi
fi

echo "🚀 Starting application"
exec "$@"
