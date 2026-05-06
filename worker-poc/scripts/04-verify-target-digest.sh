#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd -P)"
# shellcheck source=common.sh
source "${SCRIPT_DIR}/common.sh"

LOG_FILE="${RESULT_PATH}/verify-digest.log"
start_run

require_cmd skopeo
require_cmd jq
require_env SOURCE_IMAGE TARGET_IMAGE

source_json="${RESULT_PATH}/verify-source-inspect.json"
target_json="${RESULT_PATH}/verify-target-inspect.json"
report="${RESULT_PATH}/verify-digest.txt"
: > "${report}"

source_auth=()
target_auth=()
if [ -n "${SOURCE_AUTHFILE:-}" ]; then
  source_auth=(--authfile "${SOURCE_AUTHFILE}")
  log "source_authfile configured; content will not be printed"
fi
if [ -n "${TARGET_AUTHFILE:-}" ]; then
  target_auth=(--authfile "${TARGET_AUTHFILE}")
  log "target_authfile configured; content will not be printed"
fi

log "inspect source digest"
skopeo inspect "${source_auth[@]}" "$(image_ref "${SOURCE_IMAGE}")" > "${source_json}" 2>> "${LOG_FILE}"
log "inspect target digest"
skopeo inspect "${target_auth[@]}" "$(image_ref "${TARGET_IMAGE}")" > "${target_json}" 2>> "${LOG_FILE}"

source_digest="$(jq -r '.Digest // "unknown"' "${source_json}")"
target_digest="$(jq -r '.Digest // "unknown"' "${target_json}")"
source_name="$(jq -r '.Name // "unknown"' "${source_json}")"
target_name="$(jq -r '.Name // "unknown"' "${target_json}")"

{
  echo "source image: ${SOURCE_IMAGE}"
  echo "source name: ${source_name}"
  echo "source digest: ${source_digest}"
  echo "target image: ${TARGET_IMAGE}"
  echo "target name: ${target_name}"
  echo "target digest: ${target_digest}"
  echo
  if [ "${source_digest}" = "${target_digest}" ]; then
    echo "result: digest matched"
  else
    echo "result: digest differs, not automatically a POC failure"
    echo "possible reasons:"
    echo "- multi-arch manifest difference"
    echo "- single-platform copy while source is a manifest list"
    echo "- registry rewrote or normalized manifest"
    echo "- skopeo / crane behavior difference"
    echo "next step: compare raw manifests before judging failure"
  fi
} | tee -a "${report}" | tee -a "${LOG_FILE}" >/dev/null

finish_run 0
