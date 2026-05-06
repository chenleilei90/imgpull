#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd -P)"
# shellcheck source=common.sh
source "${SCRIPT_DIR}/common.sh"

LOG_FILE="${RESULT_PATH}/check-tools.log"
start_run

missing=0
for tool in skopeo crane jq; do
  if command -v "${tool}" >/dev/null 2>&1; then
    log "${tool}: $(command -v "${tool}")"
  else
    log "${tool}: MISSING"
    missing=1
  fi
done

if command -v docker >/dev/null 2>&1; then
  log "docker: $(command -v docker)"
else
  log "docker: not found, optional"
fi

log "system: $(uname -a 2>/dev/null || printf 'unknown')"

if command -v skopeo >/dev/null 2>&1; then
  skopeo --version 2>&1 | tee -a "${LOG_FILE}" || true
fi

if command -v crane >/dev/null 2>&1; then
  crane version 2>&1 | tee -a "${LOG_FILE}" || true
fi

if command -v jq >/dev/null 2>&1; then
  jq --version 2>&1 | tee -a "${LOG_FILE}" || true
fi

if [ "${missing}" -ne 0 ]; then
  finish_run 1
  exit 1
fi

finish_run 0
