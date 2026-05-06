export const P0_ERROR_CODES = {
  TARGET_AUTH_FAILED: "目标仓库认证失败",
  TARGET_NAMESPACE_MISSING: "目标 namespace / project 不存在",
  TARGET_PUSH_DENIED: "目标仓库无 push 权限",
  SOURCE_REGISTRY_UNREACHABLE: "源 registry 网络不可达",
  WORKER_LEASE_EXPIRED: "Worker 租约过期"
} as const;
