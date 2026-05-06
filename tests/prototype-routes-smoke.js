const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const assert = require("node:assert");

const root = path.resolve(__dirname, "..");
const appPath = path.join(root, "prototype", "app.js");
const source = fs.readFileSync(appPath, "utf8");

const context = {
  console,
  setTimeout,
  clearTimeout,
  globalThis: {}
};
context.globalThis = context;

vm.createContext(context);
vm.runInContext(source, context, { filename: appPath });

const proto = context.ImgPullPrototype;
assert(proto, "ImgPullPrototype should be exposed");
assert(proto.routes, "routes should be exposed");
assert(proto.nav, "nav should be exposed");

const expectedRoutes = [
  "home",
  "product",
  "supportRegistries",
  "login",
  "register",
  "pricing",
  "help",
  "errorCenter",
  "userDashboard",
  "newTask",
  "tasks",
  "taskDetail",
  "registries",
  "points",
  "orders",
  "activities",
  "messages",
  "account",
  "adminDashboard",
  "adminTasks",
  "adminWorkers",
  "adminUsers",
  "adminOrders",
  "adminActivities",
  "adminAnnouncements",
  "adminHelp",
  "adminErrorCodes",
  "adminSettings",
  "auditLogs",
  "health"
];

for (const route of expectedRoutes) {
  assert.strictEqual(typeof proto.routes[route], "function", `${route} route should exist`);
  const html = proto.renderPage(route);
  assert.strictEqual(typeof html, "string", `${route} should render a string`);
  assert(html.trim().length > 200, `${route} should not render a blank page`);
  assert(!html.includes("undefined"), `${route} should not render undefined text`);
}

const allHtml = expectedRoutes.map((route) => proto.renderPage(route)).join("\n");
for (const keyword of [
  "成功任务",
  "执行中任务",
  "失败并返还积分任务",
  "排队任务",
  "积分冻结",
  "成功结算",
  "失败返还",
  "管理员人工充值",
  "产品介绍",
  "支持仓库",
  "Docker Registry V2 push",
  "P0 不自动创建仓库",
  "消息中心",
  "任务成功通知",
  "系统公告通知",
  "系统配置",
  "注册送积分",
  "lease TTL",
  "人工充值：可用",
  "支付宝：暂未开通",
  "微信支付：暂未开通",
  "人工充值订单：待确认",
  "人工充值订单：已到账",
  "关闭订单",
  "支付 SDK",
  "manual_recharge",
  "docker pull registry.cn-hangzhou.aliyuncs.com/ops/nginx:latest",
  "source digest",
  "target digest",
  "Attempt",
  "task_status",
  "billing_status",
  "worker_status",
  "current_stage",
  "TARGET_AUTH_FAILED",
  "测试连接",
  "认证失败",
  "无 push 权限",
  "namespace / project 不存在",
  "在线",
  "维护中",
  "排空中",
  "离线",
  "禁用",
  "退役",
  "soft deleted",
  "软删除"
]) {
  assert(allHtml.includes(keyword), `prototype should include keyword: ${keyword}`);
}

console.log(`prototype routes smoke passed: ${expectedRoutes.length} routes`);
