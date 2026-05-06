#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${BASE_URL:-http://127.0.0.1:4000/api}"

: "${SMOKE_USER_ACCOUNT:?Set SMOKE_USER_ACCOUNT for the local seed user.}"
: "${SMOKE_USER_PASSWORD:?Set SMOKE_USER_PASSWORD for the local seed user.}"
: "${SMOKE_ADMIN_ACCOUNT:?Set SMOKE_ADMIN_ACCOUNT for the local seed admin.}"
: "${SMOKE_ADMIN_PASSWORD:?Set SMOKE_ADMIN_PASSWORD for the local seed admin.}"

mask_token() {
  local token="$1"
  local length=${#token}
  if [ "$length" -le 12 ]; then
    printf '%s\n' "***"
    return
  fi
  printf '%s***%s\n' "${token:0:6}" "${token: -4}"
}

json_get() {
  local json="$1"
  local path="$2"
  node -e '
const data = JSON.parse(process.argv[1]);
const path = process.argv[2].split(".");
let current = data;
for (const key of path) current = current?.[key];
if (current === undefined || current === null) process.exit(2);
if (typeof current === "object") console.log(JSON.stringify(current));
else console.log(String(current));
' "$json" "$path"
}

assert_success() {
  local name="$1"
  local json="$2"
  local success
  success="$(json_get "$json" "success")"
  if [ "$success" != "true" ]; then
    echo "FAIL $name" >&2
    echo "$json" >&2
    exit 1
  fi
  echo "OK   $name" >&2
}

get_json() {
  local name="$1"
  local url="$2"
  local token="${3:-}"
  local response
  if [ -n "$token" ]; then
    response="$(curl -sS -H "Authorization: Bearer ${token}" "$url")"
  else
    response="$(curl -sS "$url")"
  fi
  assert_success "$name" "$response"
  printf '%s\n' "$response"
}

post_login() {
  local name="$1"
  local url="$2"
  local account_env="$3"
  local password_env="$4"
  local payload
  payload="$(ACCOUNT="$account_env" PASSWORD="$password_env" node -e 'console.log(JSON.stringify({ account: process.env.ACCOUNT, credential: process.env.PASSWORD }))')"
  local response
  response="$(curl -sS -X POST -H "Content-Type: application/json" -d "$payload" "$url")"
  assert_success "$name" "$response"
  printf '%s\n' "$response"
}

post_logout() {
  local name="$1"
  local url="$2"
  local token="$3"
  local response
  response="$(curl -sS -X POST -H "Content-Type: application/json" -H "Authorization: Bearer ${token}" -d '{}' "$url")"
  assert_success "$name" "$response"
}

echo "Smoke base URL: ${BASE_URL}"

get_json "GET /api/health" "${BASE_URL}/health" >/dev/null

user_login="$(post_login "POST /api/auth/login" "${BASE_URL}/auth/login" "$SMOKE_USER_ACCOUNT" "$SMOKE_USER_PASSWORD")"
user_token="$(json_get "$user_login" "data.token")"
echo "User token: $(mask_token "$user_token")"

get_json "GET /api/auth/me" "${BASE_URL}/auth/me" "$user_token" >/dev/null
get_json "GET /api/users/me" "${BASE_URL}/users/me" "$user_token" >/dev/null
post_logout "POST /api/auth/logout" "${BASE_URL}/auth/logout" "$user_token"

admin_login="$(post_login "POST /api/admin/auth/login" "${BASE_URL}/admin/auth/login" "$SMOKE_ADMIN_ACCOUNT" "$SMOKE_ADMIN_PASSWORD")"
admin_token="$(json_get "$admin_login" "data.token")"
echo "Admin token: $(mask_token "$admin_token")"

get_json "GET /api/admin/auth/me" "${BASE_URL}/admin/auth/me" "$admin_token" >/dev/null
get_json "GET /api/admin/users" "${BASE_URL}/admin/users" "$admin_token" >/dev/null
get_json "GET /api/admin/admins" "${BASE_URL}/admin/admins" "$admin_token" >/dev/null
get_json "GET /api/admin/system-configs" "${BASE_URL}/admin/system-configs" "$admin_token" >/dev/null
get_json "GET /api/admin/system-configs/site.basic" "${BASE_URL}/admin/system-configs/site.basic" "$admin_token" >/dev/null
post_logout "POST /api/admin/auth/logout" "${BASE_URL}/admin/auth/logout" "$admin_token"

echo "First batch smoke passed."
