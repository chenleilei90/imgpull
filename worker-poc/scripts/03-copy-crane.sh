#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd -P)"
# shellcheck source=common.sh
source "${SCRIPT_DIR}/common.sh"

LOG_FILE="${RESULT_PATH}/copy-crane.log"
start_run

require_cmd crane
require_env SOURCE_IMAGE TARGET_IMAGE_CRANE

cmd=(crane copy)

if ! bool_true "${COPY_ALL_ARCH:-true}"; then
  cmd+=(--platform "${PLATFORM:-linux/amd64}")
  log "copy_mode=single_platform platform=${PLATFORM:-linux/amd64}"
else
  log "copy_mode=default_crane_behavior"
fi

extra_args=()
read_extra_args "${CRANE_EXTRA_ARGS:-}" extra_args
cmd+=("${extra_args[@]}")
cmd+=("${SOURCE_IMAGE}" "${TARGET_IMAGE_CRANE}")

if [ -n "${SOURCE_AUTHFILE:-}" ] || [ -n "${TARGET_AUTHFILE:-}" ]; then
  log "authfile variables are set, but crane uses Docker credential config or crane auth login; authfile content is not read"
fi

log "source_image=${SOURCE_IMAGE}"
log "target_image_crane=${TARGET_IMAGE_CRANE}"
printf '+ %q ' "${cmd[@]}" | tee -a "${LOG_FILE}" >/dev/null
printf '\n' | tee -a "${LOG_FILE}" >/dev/null

if "${cmd[@]}" 2>&1 | tee -a "${LOG_FILE}"; then
  {
    echo "crane copy: success"
    echo "source: ${SOURCE_IMAGE}"
    echo "target: ${TARGET_IMAGE_CRANE}"
    echo "log: ${LOG_FILE}"
  } > "${RESULT_PATH}/copy-crane-summary.txt"
  finish_run 0
else
  rc=$?
  {
    echo "crane copy: failed"
    echo "source: ${SOURCE_IMAGE}"
    echo "target: ${TARGET_IMAGE_CRANE}"
    echo "log: ${LOG_FILE}"
    echo "exit_code: ${rc}"
  } > "${RESULT_PATH}/copy-crane-summary.txt"
  finish_run "${rc}"
  exit "${rc}"
fi
