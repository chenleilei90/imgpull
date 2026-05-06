export type RegistryProvider =
  | "aliyun_acr"
  | "tencent_tcr"
  | "volcengine"
  | "huawei_swr"
  | "harbor"
  | "generic";

export type RegistryConnectionStatus =
  | "success"
  | "auth_failed"
  | "push_denied"
  | "namespace_missing"
  | "tls_ca_required";

export interface RegistryAccount {
  id: string;
  name: string;
  provider: RegistryProvider;
  endpoint: string;
  namespace: string;
  usernameHint: string;
  status: RegistryConnectionStatus;
  lastTestAt: string;
  remark: string;
}
