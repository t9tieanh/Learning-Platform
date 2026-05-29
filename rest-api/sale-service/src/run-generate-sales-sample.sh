#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

# Load .env if present
if [[ -f ".env" ]]; then
  set -a
  # shellcheck disable=SC1091
  source .env
  set +a
fi

CONFIG_PATH="src/sample-sales-config.example.json"
DRY_RUN=""
# Target DB name for enrollment inserts (course-service schema).
# This script uses sale-service DB credentials (DATABASE_URL) and writes enrollments into this schema.
COURSE_DB_NAME="${COURSE_DB_NAME:-course_service}"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --config)
      CONFIG_PATH="$2"
      shift 2
      ;;
    --dry-run)
      DRY_RUN="--dry-run"
      shift 1
      ;;
    --course-db-name)
      COURSE_DB_NAME="$2"
      shift 2
      ;;
    *)
      echo "Unknown arg: $1"
      echo "Usage: src/run-generate-sales-sample.sh [--config <path>] [--dry-run] [--course-db-name <db_name>]"
      exit 1
      ;;
  esac
done

if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "ERROR: DATABASE_URL is not set."
  echo "Set it in rest-api/sale-service/.env or export before running."
  exit 1
fi

export COURSE_DB_NAME
npx ts-node -r tsconfig-paths/register src/scripts/generate-sales-sample.ts --config "$CONFIG_PATH" $DRY_RUN
