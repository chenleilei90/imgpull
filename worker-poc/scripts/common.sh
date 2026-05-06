#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd -P)"
POC_DIR="$(cd "${SCRIPT_DIR}/.." && pwd -P)"
REPO_ROOT="$(cd "${POC_DIR}/.." && pwd -P)"
ENV_FILE="${ENV_FILE:-${POC_DIR}/.env}"

if [ -f "${ENV_FILE}" ]; then
  set -a
  # shellcheck disable=SC1090
  source "${ENV_FILE}"
  set +a
fi

RESULT_DIR="${RESULT_DIR:-worker-poc/results}"
case "${RESULT_DIR}" in
  /*) RESULT_PATH="${RESULT_DIR}" ;;
  [A-Za-z]:*) RESULT_PATH="${RESULT_DIR}" ;;
  *) RESULT_PATH="${REPO_ROOT}/${RESULT_DIR}" ;;
esac
mkdir -p "${RESULT_PATH}"

RUN_NAME="$(basename "$0" .sh)"
LOG_FILE="${LOG_FILE:-${RESULT_PATH}/${RUN_NAME}.log}"
START_TS=""

log() {
  local message="$*"
  printf '[%s] %s\n' "$(date '+%Y-%m-%d %H:%M:%S')" "${message}" | tee -a "${LOG_FILE}"
}

fail() {
  log "ERROR: $*"
  exit 1
}

require_cmd() {
  local name="$1"
  command -v "${name}" >/dev/null 2>&1 || fail "missing required tool: ${name}"
}

require_env() {
  local name
  for name in "$@"; do
    if [ -z "${!name:-}" ]; then
      fail "missing required env: ${name}"
    fi
  done
}

bool_true() {
  case "${1:-}" in
    true|TRUE|1|yes|YES|y|Y) return 0 ;;
    *) return 1 ;;
  esac
}

split_platform() {
  local platform="${PLATFORM:-linux/amd64}"
  PLATFORM_OS="${platform%%/*}"
  PLATFORM_ARCH="${platform#*/}"
  if [ "${PLATFORM_OS}" = "${PLATFORM_ARCH}" ] || [ -z "${PLATFORM_OS}" ] || [ -z "${PLATFORM_ARCH}" ]; then
    fail "PLATFORM must look like linux/amd64, current: ${platform}"
  fi
}

read_extra_args() {
  local input="${1:-}"
  local -n out_array="$2"
  out_array=()
  if [ -n "${input}" ]; then
    # POC helper: simple whitespace splitting. Avoid putting secrets here.
    read -r -a out_array <<< "${input}"
  fi
}

start_run() {
  : > "${LOG_FILE}"
  START_TS="$(date -u '+%Y-%m-%dT%H:%M:%SZ')"
  log "start ${RUN_NAME}"
  log "repo_root=${REPO_ROOT}"
  log "result_dir=${RESULT_PATH}"
  if [ -f "${ENV_FILE}" ]; then
    log "env_file=${ENV_FILE}"
  else
    log "env_file=${ENV_FILE} not found; using process env and defaults"
  fi
}

finish_run() {
  local rc="$1"
  local end_ts
  end_ts="$(date -u '+%Y-%m-%dT%H:%M:%SZ')"
  log "end ${RUN_NAME} rc=${rc} started_at=${START_TS} ended_at=${end_ts}"
}

write_summary_line() {
  local file="$1"
  shift
  printf '%s\n' "$*" >> "${file}"
}

image_ref() {
  printf 'docker://%s' "$1"
}

skopeo_auth_args_for_inspect() {
  local authfile="${1:-}"
  if [ -n "${authfile}" ]; then
    printf '%s\n' "--authfile"
    printf '%s\n' "${authfile}"
  fi
}
