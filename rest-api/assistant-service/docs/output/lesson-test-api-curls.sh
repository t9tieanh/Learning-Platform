#!/usr/bin/env bash
#
# Lesson test HTTP smoke checks — assistant-service
#
# Prerequisites:
#   - Server listening (default PORT from env, often 4000).
#   - JWT with Bearer scheme (same secret as assistant-service JWT_SECRET).
#   - POST …/generate-quizzes routes require VIP per checkQuizGenerationVip middleware.
#
# Usage:
#   export BASE_URL="http://localhost:4000"
#   export TOKEN="<jwt>"
#   export LESSON_ID="<uuid>"
#   export GROUP_ID="<uuid>"
#   export JOB_ID="<bull-job-id>"   # from enqueue responses
#   export CHUNK_ID="<uuid>"        # for creating chunk groups (1–3 ids)
#
#   bash docs/output/lesson-test-api-curls.sh
#

set -euo pipefail

BASE_URL="${BASE_URL:-http://localhost:4000}"
HDR_AUTH=( -H "Authorization: Bearer ${TOKEN:?Set TOKEN}" -H "Content-Type: application/json" )

echo "=== GET lesson-test bundle ==="
curl -sS "${HDR_AUTH[@]}" "${BASE_URL}/analysis/lessons/${LESSON_ID:?Set LESSON_ID}/lesson-test" | jq .

echo "=== PUT lesson-test header ==="
curl -sS "${HDR_AUTH[@]}" -X PUT "${BASE_URL}/analysis/lessons/${LESSON_ID}/lesson-test" \
  -d '{"title":"Smoke title","status":"DRAFT","targetTotalQuestions":10,"notes":"curl smoke"}' | jq .

echo "=== POST chunk group (needs CHUNK_ID) ==="
curl -sS "${HDR_AUTH[@]}" -X POST "${BASE_URL}/analysis/lessons/${LESSON_ID}/lesson-test/chunk-groups" \
  -d "{\"chunkIds\":[\"${CHUNK_ID:?Set CHUNK_ID}\"],\"questionCount\":2,\"label\":\"curl-group\"}" | jq .

echo "=== PATCH chunk group by groupId only ==="
curl -sS "${HDR_AUTH[@]}" -X PATCH "${BASE_URL}/analysis/lesson-test/chunk-groups/${GROUP_ID:?Set GROUP_ID}" \
  -d '{"questionCount":2,"label":"patched"}' | jq .

echo "=== POST per-group generate (VIP) ==="
curl -sS "${HDR_AUTH[@]}" -X POST "${BASE_URL}/analysis/lesson-test/chunk-groups/${GROUP_ID}/generate-quizzes" \
  -d '{"userPrompt":"optional instructor hint"}' | jq .

echo "=== GET long-poll-ish generation status ==="
curl -sS "${HDR_AUTH[@]}" \
  "${BASE_URL}/analysis/lesson-test/chunk-groups/${GROUP_ID}/generate-quizzes/status?jobId=${JOB_ID:?Set JOB_ID}" | jq .

echo "=== POST bulk generate all groups (VIP) ==="
curl -sS "${HDR_AUTH[@]}" -X POST "${BASE_URL}/analysis/lessons/${LESSON_ID}/lesson-test/generate-quizzes" \
  -d '{}' | jq .

echo "=== POST bulk generate subset (VIP) ==="
curl -sS "${HDR_AUTH[@]}" -X POST "${BASE_URL}/analysis/lessons/${LESSON_ID}/lesson-test/generate-quizzes" \
  -d "{\"groupIds\":[\"${GROUP_ID}\"]}" | jq .

echo "=== GET bulk job snapshot ==="
curl -sS "${HDR_AUTH[@]}" \
  "${BASE_URL}/analysis/lessons/${LESSON_ID}/lesson-test/generate-quizzes/status?jobId=${JOB_ID}" | jq .

echo "=== DELETE chunk group by groupId only ==="
curl -sS -o /dev/null -w "%{http_code}\n" "${HDR_AUTH[@]}" -X DELETE \
  "${BASE_URL}/analysis/lesson-test/chunk-groups/${GROUP_ID}"

echo "=== DELETE lesson-test blueprint ==="
curl -sS -o /dev/null -w "%{http_code}\n" "${HDR_AUTH[@]}" -X DELETE \
  "${BASE_URL}/analysis/lessons/${LESSON_ID}/lesson-test"

echo "Done."
