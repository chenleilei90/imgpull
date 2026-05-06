export interface NavRoute {
  href: string;
  label: string;
  icon?: string;
  group: "public" | "user" | "admin";
}

export const publicRoutes: NavRoute[] = [
  { href: "/", label: "首页", group: "public" },
  { href: "/product", label: "产品介绍", group: "public" },
  { href: "/pricing", label: "价格会员", group: "public" },
  { href: "/registries", label: "支持仓库", group: "public" },
  { href: "/help", label: "帮助中心", group: "public" }
];

export const authRoutes: NavRoute[] = [
  { href: "/login", label: "登录", group: "public" },
  { href: "/register", label: "注册", group: "public" }
];

export const userRoutes: NavRoute[] = [
  { href: "/dashboard", label: "仪表盘", icon: "home", group: "user" },
  { href: "/dashboard/tasks/new", label: "新建镜像任务", icon: "plus", group: "user" },
  { href: "/dashboard/tasks", label: "任务列表", icon: "tasks", group: "user" },
  { href: "/dashboard/registries", label: "私有仓库", icon: "registry", group: "user" },
  { href: "/dashboard/points", label: "积分中心", icon: "points", group: "user" },
  { href: "/dashboard/orders", label: "订单记录", icon: "orders", group: "user" },
  { href: "/dashboard/activities", label: "活动中心", icon: "activities", group: "user" },
  { href: "/dashboard/messages", label: "消息中心", icon: "messages", group: "user" },
  { href: "/dashboard/settings", label: "账号设置", icon: "settings", group: "user" }
];

export const adminRoutes: NavRoute[] = [
  { href: "/admin", label: "仪表盘", icon: "home", group: "admin" },
  { href: "/admin/tasks", label: "任务管理", icon: "tasks", group: "admin" },
  { href: "/admin/workers", label: "Worker 节点", icon: "workers", group: "admin" },
  { href: "/admin/users", label: "用户管理", icon: "users", group: "admin" },
  { href: "/admin/points", label: "积分管理", icon: "points", group: "admin" },
  { href: "/admin/orders", label: "订单管理", icon: "orders", group: "admin" },
  { href: "/admin/activities", label: "活动管理", icon: "activities", group: "admin" },
  { href: "/admin/announcements", label: "公告管理", icon: "messages", group: "admin" },
  { href: "/admin/docs", label: "帮助文档", icon: "docs", group: "admin" },
  { href: "/admin/config", label: "系统配置", icon: "settings", group: "admin" },
  { href: "/admin/audit-logs", label: "操作日志", icon: "audit", group: "admin" },
  { href: "/admin/health", label: "系统健康", icon: "health", group: "admin" }
];
