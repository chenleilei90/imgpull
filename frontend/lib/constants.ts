export const APP_NAME = "ImgPull";

export const SITE_COMPLIANCE_CONFIG = {
  siteName: "ImgPull 镜像助手",
  siteSlogan: "把海外容器镜像同步到你的私有仓库",
  companyName: "公司名称待配置",
  copyrightText: "© 2026 ImgPull. All rights reserved.",
  icpRecordNo: "ICP备案号待配置",
  icpRecordLink: "https://beian.miit.gov.cn/",
  policeRecordNo: "公安备案号待配置",
  policeRecordLink: "https://beian.mps.gov.cn/",
  termsUrl: "/terms",
  privacyUrl: "/privacy",
  contactEmail: "support@example.com",
  contactPhone: "联系电话待配置",
  supportWechat: "客服微信待配置",
  showIcp: true,
  showPoliceRecord: true
};

export const DESIGN_TOKENS = {
  primary: "#2563EB",
  secondary: "#06B6D4",
  success: "#16A34A",
  warning: "#D97706",
  danger: "#DC2626",
  background: "#F6F9FF",
  card: "#FFFFFF",
  border: "#E2E8F0"
};

export const P0_BOUNDARIES = [
  "当前为前端演示环境，不请求真实 API",
  "登录入口只用于演示路由保护，不保存真实账号凭据",
  "充值仅展示管理员人工确认流程，支付宝和微信支付保持预留状态",
  "镜像复制能力暂不在前端执行，真实环境由后端和 Worker 服务完成",
  "用户私有仓库由用户自己控制，平台不接管业务集群"
];

export const SUPPORTED_REGISTRIES = [
  {
    name: "阿里云 ACR",
    protocol: "Docker Registry V2 push",
    note: "使用标准 registry 登录与 push 能力，P0 不接阿里云 OpenAPI。"
  },
  {
    name: "腾讯云 TCR",
    protocol: "Docker Registry V2 push",
    note: "目标 namespace / project 需提前存在，第一版不自动创建仓库。"
  },
  {
    name: "华为云 SWR",
    protocol: "Docker Registry V2 push",
    note: "通过用户配置的仓库地址和凭据完成推送语义。"
  },
  {
    name: "火山云镜像仓库",
    protocol: "Docker Registry V2 push",
    note: "作为 UI 预设和帮助说明，底层仍走标准 Docker Registry 协议。"
  },
  {
    name: "自建 Harbor",
    protocol: "Docker Registry V2 push",
    note: "自签名证书需要管理员在 Worker 节点配置可信 CA。"
  },
  {
    name: "通用 Docker Registry",
    protocol: "Docker Registry V2 push",
    note: "适合公网可访问、支持标准登录和 push 的私有仓库。"
  }
];
