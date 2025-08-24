#!/usr/bin/env bash
set -euo pipefail

# Wait for DB then run migrations idempotently
echo "Running alembic upgrade head..."
alembic upgrade head

exec "$@"
