#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd -P)"
# shellcheck source=common.sh
source "${SCRIPT_DIR}/common.sh"

LOG_FILE="${RESULT_PATH}/copy-skopeo.log"
start_run

require_cmd skopeo
require_env SOURCE_IMAGE TARGET_IMAGE

cmd=(skopeo copy)

if bool_true "${COPY_ALL_ARCH:-true}"; then
  cmd+=(--all)
  log "copy_mode=all_arch"
else
  split_platform
  cmd+=(--override-os "${PLATFORM_OS}" --override-arch "${PLATFORM_ARCH}")
  log "copy_mode=single_platform platform=${PLATFORM_OS}/${PLATFORM_ARCH}"
fi

if [ -n "${SOURCE_AUTHFILE:-}" ]; then
  cmd+=(--src-authfile "${SOURCE_AUTHFILE}")
  log "source_authfile configured; content will not be printed"
fi

if [ -n "${TARGET_AUTHFILE:-}" ]; then
  cmd+=(--dest-authfile "${TARGET_AUTHFILE}")
  log "target_authfile configured; content will not be printed"
fi

extra_args=()
read_extra_args "${SKOPEO_EXTRA_ARGS:-}" extra_args
cmd+=("${extra_args[@]}")
cmd+=("$(image_ref "${SOURCE_IMAGE}")" "$(image_ref "${TARGET_IMAGE}")")

log "source_image=${SOURCE_IMAGE}"
log "target_image=${TARGET_IMAGE}"
log "running skopeo copy; full command is logged without secret contents"
printf '+ %q ' "${cmd[@]}" | tee -a "${LOG_FILE}" >/dev/null
printf '\n' | tee -a "${LOG_FILE}" >/dev/null

if "${cmd[@]}" 2>&1 | tee -a "${LOG_FILE}"; then
  {
    echo "skopeo copy: success"
    echo "source: ${SOURCE_IMAGE}"
    echo "target: ${TARGET_IMAGE}"
    echo "log: ${LOG_FILE}"
  } > "${RESULT_PATH}/copy-skopeo-summary.txt"
  finish_run 0
else
  rc=$?
  {
    echo "skopeo copy: failed"
    echo "source: ${SOURCE_IMAGE}"
    echo "target: ${TARGET_IMAGE}"
    echo "log: ${LOG_FILE}"
    echo "exit_code: ${rc}"
  } > "${RESULT_PATH}/copy-skopeo-summary.txt"
  finish_run "${rc}"
  exit "${rc}"
fi
