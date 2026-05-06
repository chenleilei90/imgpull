#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd -P)"
# shellcheck source=common.sh
source "${SCRIPT_DIR}/common.sh"

LOG_FILE="${RESULT_PATH}/matrix.log"
start_run

matrix_file="${RESULT_PATH}/matrix-plan.txt"
cat > "${matrix_file}" <<'MATRIX'
Worker POC test matrix

Run each case by editing worker-poc/.env, then executing the relevant scripts.
This matrix does not hard-code real registries or credentials.

1. public Docker Hub -> target registry
   Goal: baseline public source copy.
   Suggested scripts: 01-inspect-source.sh, 02-copy-skopeo.sh, 04-verify-target-digest.sh

2. GHCR -> target registry
   Goal: verify another public source registry.
   Suggested scripts: 01-inspect-source.sh, 02-copy-skopeo.sh, 04-verify-target-digest.sh

3. large image
   Goal: observe timeout, bandwidth and storage behavior.
   Suggested scripts: 01-inspect-source.sh, 02-copy-skopeo.sh

4. multi-arch image
   Goal: compare COPY_ALL_ARCH=true vs COPY_ALL_ARCH=false.
   Suggested scripts: 02-copy-skopeo.sh, 04-verify-target-digest.sh

5. target auth failed
   Goal: capture target authentication error.
   Suggested setup: invalid TARGET_AUTHFILE or registry credentials.

6. target namespace not exists
   Goal: capture missing project / namespace behavior.
   Suggested setup: target path with non-existing namespace.

7. target no push permission
   Goal: capture push denied behavior.
   Suggested setup: target credential with pull-only permission.

8. Harbor self-signed cert
   Goal: capture certificate verification behavior.
   Suggested setup: Harbor using self-signed certificate without trusted CA.

9. interrupted copy
   Goal: observe partial copy and retry cleanup requirements.
   Suggested setup: manually interrupt 02-copy-skopeo.sh during a large copy.
MATRIX

cat "${matrix_file}" | tee -a "${LOG_FILE}"

if bool_true "${RUN_MATRIX_EXECUTE:-false}"; then
  log "RUN_MATRIX_EXECUTE=true; running baseline inspect/copy/verify with current .env"
  bash "${SCRIPT_DIR}/01-inspect-source.sh"
  bash "${SCRIPT_DIR}/02-copy-skopeo.sh"
  bash "${SCRIPT_DIR}/04-verify-target-digest.sh"
else
  log "RUN_MATRIX_EXECUTE is not true; matrix written as manual test plan only"
fi

finish_run 0
