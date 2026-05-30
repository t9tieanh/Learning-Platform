#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
DATA_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"

DEFAULT_FILE="$DATA_DIR/data/normalized/feedbacks.seed.json"
INPUT_FILE="$DEFAULT_FILE"
DROP_COLLECTION="false"
DRY_RUN="false"

usage() {
  cat <<USAGE
Usage: $(basename "$0") [options]

Options:
  --file <path>       Path to feedback JSON file (default: $DEFAULT_FILE)
  --drop              Drop existing feedbacks collection before import
  --dry-run           Validate JSON payload only, do not import
  -h, --help          Show this help
USAGE
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --file)
      INPUT_FILE="$2"
      shift 2
      ;;
    --drop)
      DROP_COLLECTION="true"
      shift
      ;;
    --dry-run)
      DRY_RUN="true"
      shift
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown argument: $1"
      usage
      exit 1
      ;;
  esac
done

if [[ ! -f "$INPUT_FILE" ]]; then
  echo "ERROR: JSON file not found: $INPUT_FILE"
  exit 1
fi

if [[ -f "$DATA_DIR/.env" ]]; then
  set -a
  # shellcheck disable=SC1091
  source "$DATA_DIR/.env"
  set +a
fi

# Support both data pipeline env names and notification-service env names.
MONGO_URI="${MONGO_URI:-${MONGODB_URI:-mongodb://localhost:27017}}"
MONGO_DB_NAME="${MONGO_DB_NAME:-${DATABASE_NAME:-learning_platform}}"

echo "Feedback JSON: $INPUT_FILE"
echo "Mongo URI: $MONGO_URI"
echo "Mongo DB: $MONGO_DB_NAME"
echo "Drop collection: $DROP_COLLECTION"
echo "Dry run: $DRY_RUN"

if [[ "$DRY_RUN" == "true" ]]; then
  python3 - <<'PY' "$INPUT_FILE"
import json
import sys

required = ["_id", "userId", "courseId", "rating", "message", "createdAt", "updatedAt"]
path = sys.argv[1]

with open(path, "r", encoding="utf-8") as f:
    data = json.load(f)

if not isinstance(data, list):
    raise SystemExit("ERROR: Root JSON must be an array.")

for i, row in enumerate(data):
    if not isinstance(row, dict):
        raise SystemExit(f"ERROR: Record #{i+1} must be an object.")
    for key in required:
        if key not in row or row[key] in (None, ""):
            raise SystemExit(f"ERROR: Record #{i+1} missing required field: {key}")
    if not isinstance(row["rating"], int):
        raise SystemExit(f"ERROR: Record #{i+1} field rating must be integer")

print(f"Dry-run validation passed: {len(data)} records")
PY
  exit 0
fi

if ! command -v mongosh >/dev/null 2>&1; then
  echo "ERROR: mongosh is required for import mode."
  echo "Tip: run with --dry-run to validate JSON without MongoDB client."
  exit 1
fi

MONGOSH_SCRIPT="$SCRIPT_DIR/mongosh/import_feedbacks_from_json.mjs"
if [[ ! -f "$MONGOSH_SCRIPT" ]]; then
  echo "ERROR: Missing mongosh script: $MONGOSH_SCRIPT"
  exit 1
fi

mongosh "$MONGO_URI" \
  --quiet \
  --file "$MONGOSH_SCRIPT" \
  --eval "db = db.getSiblingDB('${MONGO_DB_NAME//\'/\\\'}'); const INPUT_FILE='${INPUT_FILE//\'/\\\'}'; const DROP_COLLECTION=${DROP_COLLECTION};"

echo "Import completed."
