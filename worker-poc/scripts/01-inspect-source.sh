#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd -P)"
# shellcheck source=common.sh
source "${SCRIPT_DIR}/common.sh"

LOG_FILE="${RESULT_PATH}/inspect-source.log"
start_run

require_cmd skopeo
require_cmd jq
require_env SOURCE_IMAGE

inspect_json="${RESULT_PATH}/source-inspect.json"
raw_json="${RESULT_PATH}/source-raw-manifest.json"
summary="${RESULT_PATH}/source-summary.txt"
: > "${summary}"

auth_args=()
if [ -n "${SOURCE_AUTHFILE:-}" ]; then
  auth_args=(--authfile "${SOURCE_AUTHFILE}")
fi

log "source_image=${SOURCE_IMAGE}"
log "running skopeo inspect for source image"
skopeo inspect "${auth_args[@]}" "$(image_ref "${SOURCE_IMAGE}")" > "${inspect_json}" 2>> "${LOG_FILE}"

log "running skopeo inspect --raw for mediaType and layer sizes"
if skopeo inspect --raw "${auth_args[@]}" "$(image_ref "${SOURCE_IMAGE}")" > "${raw_json}" 2>> "${LOG_FILE}"; then
  raw_available=true
else
  raw_available=false
  log "raw manifest unavailable; continuing with skopeo inspect output"
fi

digest="$(jq -r '.Digest // "unknown"' "${inspect_json}")"
arch="$(jq -r '.Architecture // "multi-arch-or-unknown"' "${inspect_json}")"
os_name="$(jq -r '.Os // "multi-arch-or-unknown"' "${inspect_json}")"

if [ "${raw_available}" = true ]; then
  media_type="$(jq -r '.mediaType // "unknown"' "${raw_json}")"
  layer_count="$(jq '[.layers[]?] | length' "${raw_json}")"
  layer_size="$(jq '[.layers[]?.size] | add // 0' "${raw_json}")"
else
  media_type="unknown"
  layer_count="$(jq '[.Layers[]?] | length' "${inspect_json}")"
  layer_size="0"
fi

{
  echo "source image: ${SOURCE_IMAGE}"
  echo "digest: ${digest}"
  echo "mediaType: ${media_type}"
  echo "architecture/os: ${arch}/${os_name}"
  echo "layers count: ${layer_count}"
  echo "layers size bytes: ${layer_size}"
  echo "inspect json: ${inspect_json}"
  echo "raw manifest json: ${raw_json}"
} | tee -a "${summary}" | tee -a "${LOG_FILE}" >/dev/null

finish_run 0
