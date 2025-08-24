#!/usr/bin/env bash
set -euo pipefail

# backup_and_upgrade.sh
# Usage: run from repo root or anywhere. Script will cd into server/ and use .env there.

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SERVER_DIR="$REPO_ROOT"
# If this file lives in server/scripts, adjust SERVER_DIR
if [ -d "$REPO_ROOT/server" ] && [ -f "$REPO_ROOT/server/.env" ]; then
  SERVER_DIR="$REPO_ROOT/server"
fi

cd "$SERVER_DIR"

if [ ! -f .env ]; then
  echo "ERROR: .env not found in $SERVER_DIR"
  exit 1
fi

# Extract DATABASE_URL from .env (strip surrounding quotes)
DATABASE_URL=$(grep -E '^DATABASE_URL=' .env | sed 's/^DATABASE_URL=//; s/^"//; s/"$//')
if [ -z "$DATABASE_URL" ]; then
  echo "ERROR: DATABASE_URL is empty in $SERVER_DIR/.env"
  exit 1
fi

TIMESTAMP=$(date +%Y%m%dT%H%M%S)
BACKUP_FILE="kfats_pre_alembic_backup_${TIMESTAMP}.dump"

echo "Creating pg_dump (custom format) -> $BACKUP_FILE"
pg_dump -Fc -f "$BACKUP_FILE" "$DATABASE_URL"
ls -lh "$BACKUP_FILE"

echo "Running Alembic upgrade heads"
PYTHONPATH="$SERVER_DIR" "$SERVER_DIR/venv/bin/python" -m alembic -c "$SERVER_DIR/alembic.ini" upgrade heads

echo "Done. If something went wrong, restore from $BACKUP_FILE"

# end
