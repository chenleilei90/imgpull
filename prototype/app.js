(function initPrototype(global) {
  const glyphs = {
    box: "▣",
    play: "▶",
    user: "◉",
    plus: "+",
    send: "➜",
    check: "✓",
    fail: "×",
    warn: "!",
    copy: "⧉",
    gear: "⚙",
    lock: "◆",
    doc: "◇",
    pulse: "●"
  };

  const nav = {
    site: [
      ["home", "官网首页"],
      ["product", "产品介绍"],
      ["supportRegistries", "支持仓库"],
      ["login", "登录"],
      ["register", "注册"],
      ["pricing", "会员积分"],
      ["help", "帮助中心"],
      ["errorCenter", "错误码中心"]
    ],
    user: [
      ["userDashboard", "用户仪表盘"],
      ["newTask", "新建镜像任务"],
      ["tasks", "任务列表"],
      ["taskDetail", "任务详情"],
      ["registries", "私有仓库管理"],
      ["points", "积分中心"],
      ["orders", "订单记录"],
      ["activities", "活动中心"],
      ["messages", "消息中心"],
      ["account", "账号设置"]
    ],
    admin: [
      ["adminDashboard", "管理员仪表盘"],
      ["adminTasks", "任务管理"],
      ["adminWorkers", "Worker 节点管理"],
      ["adminUsers", "用户 / 积分管理"],
      ["adminOrders", "订单管理"],
      ["adminActivities", "活动管理"],
      ["adminAnnouncements", "公告管理"],
      ["adminHelp", "帮助文档管理"],
      ["adminErrorCodes", "错误码管理"],
      ["adminSettings", "系统配置"],
      ["auditLogs", "操作日志"],
      ["health", "系统健康"]
    ]
  };

  const stages = ["提交任务", "参数校验", "积分冻结", "排队", "节点分配", "源镜像解析", "镜像拉取", "镜像推送", "目标验证", "积分结算"];

  const tasks = [
    {
      id: "img-20260503-001",
      title: "执行中任务",
      source: "docker.io/library/nginx:latest",
      target: "registry.cn-hangzhou.aliyuncs.com/ops/nginx:latest",
      registry: "阿里云生产仓库",
      worker: "harbor-01",
      taskStatus: "running",
      billingStatus: "frozen",
      workerStatus: "running",
      stageIndex: 7,
      points: 8,
      sourceDigest: "sha256:source-nginx-91c4",
      targetDigest: "等待推送完成",
      targetManifestDigest: "等待验证",
      errorCode: "",
      failureReason: "",
      attemptNo: 1,
      logs: ["Attempt #1 节点 harbor-01 已领取任务", "解析 manifest 成功，架构策略 all", "正在复制 layer sha256:ab12", "已推送 3.8GB / 5.2GB"]
    },
    {
      id: "img-20260503-000",
      title: "成功任务",
      source: "ghcr.io/acme/api:v1.8",
      target: "harbor.ops.example.com/platform/api:v1.8",
      registry: "Harbor 运维项目",
      worker: "harbor-02",
      taskStatus: "succeeded",
      billingStatus: "settled",
      workerStatus: "completed",
      stageIndex: stages.length,
      points: 7,
      sourceDigest: "sha256:source-api-a12f",
      targetDigest: "sha256:target-api-a12f",
      targetManifestDigest: "sha256:manifest-api-a12f",
      errorCode: "",
      failureReason: "",
      attemptNo: 1,
      logs: ["Attempt #1 skopeo inspect 成功", "copy 完成，pulled=4.6GB pushed=4.6GB", "target digest 校验一致", "冻结 10 积分，成功结算 7，退回 3"]
    },
    {
      id: "img-20260502-118",
      title: "失败并返还积分任务",
      source: "quay.io/coreos/etcd:v3.5",
      target: "ccr.ccs.tencentyun.com/ops/etcd:v3.5",
      registry: "腾讯云 TCR",
      worker: "harbor-03",
      taskStatus: "failed",
      billingStatus: "refunded",
      workerStatus: "completed",
      stageIndex: 6,
      points: 12,
      sourceDigest: "sha256:source-etcd-ff91",
      targetDigest: "未生成",
      targetManifestDigest: "未生成",
      errorCode: "TARGET_AUTH_FAILED",
      failureReason: "目标仓库认证失败，请检查用户名、Robot Account 或 Token",
      attemptNo: 2,
      logs: ["Attempt #1 拉取超时，已重试", "Attempt #2 目标仓库认证失败", "错误码 TARGET_AUTH_FAILED", "冻结 12 积分已全额返还"]
    },
    {
      id: "img-20260502-119",
      title: "排队任务",
      source: "registry.k8s.io/pause:3.9",
      target: "swr.cn-east-3.myhuaweicloud.com/ops/pause:3.9",
      registry: "华为云 SWR",
      worker: "等待分配",
      taskStatus: "queued",
      billingStatus: "frozen",
      workerStatus: "unclaimed",
      stageIndex: 4,
      points: 3,
      sourceDigest: "等待解析",
      targetDigest: "等待推送",
      targetManifestDigest: "等待验证",
      errorCode: "",
      failureReason: "",
      attemptNo: 1,
      logs: ["任务已创建", "冻结 3 积分", "当前等待 Worker 调度"]
    }
  ];

  const pointRows = [
    ["积分冻结", "img-20260503-001", "-8", "+8", "新任务提交，冻结预计积分"],
    ["成功结算", "img-20260503-000", "+3", "-10", "按实际消耗 7 积分结算，退回差额 3"],
    ["失败返还", "img-20260502-118", "+12", "-12", "任务失败，全额返还冻结积分"],
    ["管理员人工充值", "ord-20260503-002", "+200", "0", "manual_recharge，线下收款后管理员确认到账"]
  ];

  const rechargePackages = [
    ["积分包 100", "10.00", "100", "适合少量镜像推送"],
    ["积分包 500", "39.00", "500", "适合批量常用镜像"],
    ["积分包 1500", "99.00", "1500", "适合高频运维"]
  ];

  const workers = [
    ["harbor-01", "online", "skopeo", 3, "42%", "64%", "98.2%"],
    ["harbor-02", "maintenance", "crane", 0, "11%", "44%", "97.4%"],
    ["harbor-03", "draining", "nerdctl", 1, "31%", "58%", "96.1%"],
    ["harbor-04", "offline", "docker", 0, "0%", "72%", "91.8%"],
    ["harbor-disabled", "disabled", "skopeo", 0, "0%", "18%", "停用"],
    ["harbor-old", "retired", "docker", 0, "0%", "0%", "退役"],
    ["harbor-deleted", "deleted", "skopeo", 0, "0%", "0%", "soft deleted"]
  ];

  const orders = [
    { no: "ord-20260503-001", user: "ops@demo.com", item: "人工充值订单：待确认", amount: "10.00", points: 100, channel: "manual", status: "pending", note: "用户线下付款后等待管理员确认" },
    { no: "ord-20260503-002", user: "ops@demo.com", item: "人工充值订单：已到账", amount: "20.00", points: 200, channel: "manual", status: "paid", note: "管理员确认到账，已写入积分流水" },
    { no: "ord-20260502-010", user: "ops@demo.com", item: "关闭订单", amount: "5.00", points: 50, channel: "manual", status: "closed", note: "用户取消线下付款" },
    { no: "ord-20260502-011", user: "dev@demo.com", item: "支付宝预留状态", amount: "39.00", points: 500, channel: "alipay", status: "reserved", note: "P0 暂未开通，不生成二维码" },
    { no: "ord-20260502-012", user: "dev@demo.com", item: "微信支付预留状态", amount: "39.00", points: 500, channel: "wechat", status: "reserved", note: "P0 暂未开通，不接 SDK" }
  ];

  const activities = [
    ["新用户注册送积分", "注册后领取 30 积分", "进行中", "每账号一次"],
    ["五一运维活动", "点击领取 50 积分", "进行中", "2026-05-01 至 2026-05-07"],
    ["Harbor 迁移补贴", "失败率低用户额外赠送", "已结束", "后台人工发放"]
  ];

  const errorCodes = [
    ["SOURCE_NOT_FOUND", "源镜像不存在或无法访问", "检查镜像名、tag、源站连通性"],
    ["TARGET_AUTH_FAILED", "目标仓库认证失败", "检查用户名、密码、Robot Account 或 Token"],
    ["TARGET_NAMESPACE_MISSING", "目标命名空间不存在", "先在云厂商控制台创建 namespace / project"],
    ["WORKER_LEASE_EXPIRED", "Worker 租约过期", "系统会重新调度或标记失败返还积分"]
  ];

  const auditRows = [
    ["2026-05-03 00:21", "super_admin", "人工充值", "为 ops@demo.com 增加 200 积分"],
    ["2026-05-03 00:18", "super_admin", "排空节点", "harbor-03 进入 draining"],
    ["2026-05-03 00:12", "system", "失败返还", "img-20260502-118 全额返还 12 积分"]
  ];

  const userMessages = [
    { title: "任务成功通知", type: "任务", status: "未读", time: "2026-05-03 00:26", content: "img-20260503-000 已成功，目标镜像可拉取。", target: "查看任务" },
    { title: "任务失败并积分返还通知", type: "任务", status: "未读", time: "2026-05-03 00:12", content: "img-20260502-118 失败，错误码 TARGET_AUTH_FAILED，12 积分已返还。", target: "查看任务" },
    { title: "人工充值到账通知", type: "订单", status: "已读", time: "2026-05-03 00:21", content: "管理员已确认 ord-20260503-002，200 积分已到账。", target: "查看订单" },
    { title: "活动积分到账通知", type: "积分", status: "已读", time: "2026-05-02 18:20", content: "五一运维活动 50 积分已到账。", target: "查看积分流水" },
    { title: "系统公告通知", type: "公告", status: "未读", time: "2026-05-02 09:00", content: "本周将扩容 Worker 节点，不影响已提交任务。", target: "查看公告" }
  ];

  const state = {
    area: "site",
    page: "home",
    selectedTaskId: "img-20260503-001",
    pointsBalance: 326,
    frozenBalance: 11,
    rechargeApplied: false,
    toastTimer: null
  };

  function icon(name) {
    return `<span class="ico" aria-hidden="true">${glyphs[name] || "□"}</span>`;
  }

  function selectedTask() {
    return tasks.find((item) => item.id === state.selectedTaskId) || tasks[0];
  }

  function statusPill(status) {
    const map = {
      succeeded: ["success", "成功"],
      running: ["info", "执行中"],
      failed: ["danger", "失败"],
      queued: ["warning", "排队中"],
      frozen: ["warning", "已冻结"],
      settled: ["success", "已结算"],
      refunded: ["success", "已返还"],
      pending: ["warning", "待确认"],
      paid: ["success", "已支付"],
      closed: ["muted", "已关闭"],
      reserved: ["muted", "预留"],
      online: ["success", "在线"],
      maintenance: ["warning", "维护中"],
      draining: ["warning", "排空中"],
      offline: ["danger", "离线"],
      disabled: ["danger", "禁用"],
      retired: ["muted", "退役"],
      deleted: ["muted", "软删除"],
      completed: ["success", "已完成"],
      unclaimed: ["warning", "待领取"],
      normal: ["success", "正常"],
      degraded: ["warning", "注意"]
    };
    const item = map[status] || ["muted", status];
    return `<span class="pill ${item[0]}">${item[1]}</span>`;
  }

  function pageTitle(title, desc, action = "") {
    return `<div class="page-title"><div><h1>${title}</h1><p>${desc}</p></div>${action}</div>`;
  }

  function metric(label, value, hint = "") {
    return `<div class="panel metric"><span>${label}</span><strong>${value}</strong><small>${hint}</small></div>`;
  }

  function table(headers, rows) {
    return `<div class="panel table-wrap"><table class="table"><thead><tr>${headers.map((h) => `<th>${h}</th>`).join("")}</tr></thead><tbody>${rows.join("")}</tbody></table></div>`;
  }

  function currentStage(task) {
    if (task.taskStatus === "succeeded") return "积分结算";
    if (task.taskStatus === "failed") return "失败返还";
    if (task.taskStatus === "queued") return "排队";
    return stages[Math.min(task.stageIndex, stages.length - 1)] || "等待中";
  }

  function channelName(channel) {
    const map = {
      manual: "人工充值",
      alipay: "支付宝",
      wechat: "微信支付"
    };
    return map[channel] || channel;
  }

  function applyManualRecharge() {
    if (state.rechargeApplied) {
      showToast("该人工充值幂等键已处理，不会重复加积分");
      return;
    }
    state.rechargeApplied = true;
    state.pointsBalance += 100;
    orders.unshift({
      no: "ord-20260503-099",
      user: "ops@demo.com",
      item: "人工充值订单：已到账",
      amount: "10.00",
      points: 100,
      channel: "manual",
      status: "paid",
      note: "静态表单模拟：线下收款，管理员确认到账"
    });
    pointRows.unshift(["管理员人工充值", "ord-20260503-099", "+100", "0", "manual_recharge，幂等键 manual-recharge-20260502-0001"]);
    auditRows.unshift(["2026-05-03 00:40", "super_admin", "人工充值", "为 ops@demo.com 增加 100 积分，写入订单和支付记录"]);
    userMessages.unshift({ title: "人工充值到账通知", type: "订单", status: "未读", time: "2026-05-03 00:40", content: "ord-20260503-099 已到账，100 积分已加入账户。", target: "查看订单" });
    render();
    showToast("已模拟人工充值：订单 paid，积分 +100，已写审计和用户消息");
  }

  function shell(content) {
    const side = nav[state.area].map(([key, label]) => `<button class="nav-item ${state.page === key ? "active" : ""}" onclick="setPage('${key}')">${label}</button>`).join("");
    return `
      <div class="app">
        <header class="topbar">
          <button class="brand" onclick="setArea('site')"><span class="brand-mark">${icon("box")}</span><span>镜像推送平台</span></button>
          <nav class="top-tabs">
            <button class="${state.area === "site" ? "active" : ""}" onclick="setArea('site')">官网</button>
            <button class="${state.area === "user" ? "active" : ""}" onclick="setArea('user')">用户后台</button>
            <button class="${state.area === "admin" ? "active" : ""}" onclick="setArea('admin')">管理员后台</button>
          </nav>
          <div class="top-actions">
            <button class="btn ghost" onclick="setPage('login')">登录</button>
            <button class="btn primary" onclick="setArea('user')">${icon("play")}进入工作台</button>
          </div>
        </header>
        ${state.area === "site" ? `<main>${content}</main>` : `<main class="layout"><aside class="sidebar"><p>${state.area === "user" ? "用户工作台" : "管理员控制台"}</p>${side}</aside><section class="content">${content}</section></main>`}
      </div>
    `;
  }

  function home() {
    return shell(`
      <section class="hero">
        <div class="hero-copy">
          <h1>把海外镜像稳定推送到你的国内私有仓库</h1>
          <p>面向运维、开发和 DevOps 用户。提交公开源镜像，平台通过可配置 Worker 节点拉取并推送到阿里云、腾讯云、火山云、华为云或自建 Harbor。</p>
          <div class="actions">
            <button class="btn primary" onclick="setPage('register')">${icon("user")}注册体验</button>
            <button class="btn" onclick="setArea('user')">${icon("send")}查看任务流</button>
          </div>
          <div class="quick-submit">
            <input class="input" value="docker.io/library/nginx:latest" aria-label="镜像地址" />
            <button class="btn primary" onclick="setPage('newTask')">提交镜像</button>
          </div>
        </div>
        <div class="hero-board">
          ${tasks.map((task) => `<div class="board-row"><div><strong>${task.id}</strong><span>${task.source}</span></div>${statusPill(task.taskStatus)}</div>`).join("")}
        </div>
      </section>
      <section class="section grid cols-4">
        ${["失败返还积分", "Digest 验证", "多节点调度", "私有仓库推送"].map((item) => `<div class="card"><strong>${item}</strong><p>P0 原型已覆盖对应静态状态和用户展示。</p></div>`).join("")}
      </section>
    `);
  }

  function login() {
    return shell(`<section class="auth-wrap">${authCard("登录", "使用账号进入用户后台或管理员后台。", "登录并进入用户后台", "setArea('user')")}</section>`);
  }

  function product() {
    return shell(`${pageTitle("产品介绍", "平台把海外公开镜像复制并推送到用户自己的国内或自建私有仓库。")}
      <div class="grid cols-4">
        ${["公开源镜像提交", "Worker 节点拉取", "推送私有仓库", "Digest 验证"].map((item) => `<div class="card"><strong>${item}</strong><p>P0 用静态原型展示从提交到结果的完整任务链路。</p></div>`).join("")}
      </div>
      <div class="section split">
        <div class="panel"><h3>适用场景</h3><p>面向运维、开发和 DevOps 用户，解决 Docker Hub、GHCR、Quay、registry.k8s.io 等公开镜像在国内环境拉取不稳定的问题。</p><p>用户最终使用自己的阿里云 ACR、腾讯云 TCR、火山云、华为云 SWR、自建 Harbor 或通用 Docker Registry 地址拉取镜像。</p></div>
        <div class="panel"><h3>任务流程</h3>${flowList(tasks[0])}</div>
      </div>
      <div class="panel"><h3>积分计费简述</h3><p>提交任务前先预估并冻结积分；成功后按实际消耗结算，多退少补按 P0 封顶规则处理；失败或取消后全额返还冻结积分。</p></div>`);
  }

  function supportRegistries() {
    const rows = [
      ["阿里云 ACR", "UI 预设", "Docker Registry V2 push"],
      ["腾讯云 TCR", "UI 预设", "Docker Registry V2 push"],
      ["火山云", "UI 预设", "Docker Registry V2 push"],
      ["华为云 SWR", "UI 预设", "Docker Registry V2 push"],
      ["自建 Harbor", "UI 预设", "Docker Registry V2 push"],
      ["通用 Docker Registry", "通用能力", "Docker Registry V2 push"]
    ];
    return shell(`${pageTitle("支持仓库", "P0 后端统一走 Docker Registry V2 push，云厂商只作为 UI 预设和帮助文档。")}
      ${table(["仓库类型", "P0 定位", "后端协议"], rows.map((row) => `<tr><td>${row[0]}</td><td>${row[1]}</td><td>${row[2]}</td></tr>`))}
      <div class="panel"><h3>重要限制</h3><p>目标 namespace / project 必须提前在云厂商或 Harbor 中存在。P0 不自动创建仓库、项目或命名空间，也不接各云厂商 OpenAPI。</p><p>测试连接只用于验证登录、push 权限和目标命名空间可用性。</p></div>`);
  }

  function register() {
    return shell(`<section class="auth-wrap">${authCard("注册", "注册后领取首登积分，用于提交第一批镜像任务。", "注册并领取 30 积分", "setPage('activities')", true)}</section>`);
  }

  function authCard(title, desc, button, action, isRegister = false) {
    return `<div class="panel auth-card">
      <h1>${title}</h1><p>${desc}</p>
      <label>邮箱</label><input class="input" value="${isRegister ? "newops@example.com" : "ops@demo.com"}" />
      <label>密码</label><input class="input" value="demo-password" type="password" />
      ${isRegister ? `<label>确认密码</label><input class="input" value="demo-password" type="password" />` : ""}
      <button class="btn primary full" onclick="${action}">${button}</button>
      <button class="btn full" onclick="setPage('${isRegister ? "login" : "register"}')">${isRegister ? "已有账号，去登录" : "没有账号，去注册"}</button>
    </div>`;
  }

  function pricing() {
    const rows = [
      ["免费用户", "0 元", "注册赠送 30 积分", "每日 3 个任务"],
      ["普通会员", "19 元/月", "每月 300 积分", "每日 30 个任务"],
      ["专业会员", "59 元/月", "每月 1500 积分", "优先队列"]
    ];
    return shell(`${pageTitle("会员积分", "套餐、额度、积分包和活动发放均由后台配置。")}<div class="grid cols-3">${rows.map((p) => `<div class="panel price"><h3>${p[0]}</h3><strong>${p[1]}</strong><p>${p[2]}</p><p>${p[3]}</p><button class="btn primary">选择套餐</button></div>`).join("")}</div>`);
  }

  function help() {
    return shell(`${pageTitle("帮助中心", "P0 提供基础帮助文档管理，面向用户展示配置步骤。")}<div class="grid cols-3">${["阿里云 ACR Robot Account", "腾讯云 TCR 命名空间", "Harbor 项目权限", "containerd 拉取说明", "1Panel 镜像配置", "积分失败返还规则"].map((item) => `<div class="card"><strong>${item}</strong><p>包含字段说明、权限建议和常见错误处理。</p></div>`).join("")}</div>`);
  }

  function errorCenter() {
    return shell(`${pageTitle("错误码中心", "用户可按错误码查询原因和处理建议。")}${table(["错误码", "含义", "处理建议"], errorCodes.map((e) => `<tr><td><code>${e[0]}</code></td><td>${e[1]}</td><td>${e[2]}</td></tr>`))}`);
  }

  function userDashboard() {
    return shell(`${pageTitle("用户仪表盘", "总览积分、会员额度、最近任务和仓库状态。", `<button class="btn primary" onclick="setPage('newTask')">${icon("plus")}新建任务</button>`)}
      <div class="grid cols-4">${metric("可用积分", "326", "含管理员人工充值 200")}${metric("冻结积分", "11", "执行中和排队任务")}${metric("当前会员", "普通会员", "每日 30 任务")}${metric("今日任务", "9 / 30", "剩余 21")}</div>
      <div class="section split">${taskDetailPanel(selectedTask())}<div class="stack">${registryPanel()}${workerMiniPanel()}</div></div>`);
  }

  function newTask() {
    return shell(`${pageTitle("新建镜像任务", "填写源镜像和目标仓库，P0 默认公开源镜像和 all 架构。")}
      <div class="split">
        <div class="panel">
          <div class="form-grid">
            <label class="field full">源镜像地址<input class="input" value="docker.io/library/nginx:latest" /></label>
            <label class="field">目标仓库<select class="input"><option>阿里云生产仓库</option><option>Harbor 运维项目</option><option>腾讯云 TCR</option></select></label>
            <label class="field">命名空间 / 项目<input class="input" value="ops" /></label>
            <label class="field">目标镜像名<input class="input" value="nginx" /></label>
            <label class="field">目标 Tag<input class="input" value="latest" /></label>
            <div class="field full"><span>预计目标地址</span><div class="code">registry.cn-hangzhou.aliyuncs.com/ops/nginx:latest</div></div>
          </div>
          <div class="actions"><button class="btn" onclick="showToast('镜像格式校验通过，预计冻结 8 积分')">校验镜像</button><button class="btn primary" onclick="selectTask('img-20260502-119')">提交为排队任务</button></div>
        </div>
        <div class="panel"><h3>预估费用</h3><p>预估 5.2GB，冻结 8 积分。P0 成功后按实际消耗结算，失败全额返还。</p>${flowList(tasks[3])}</div>
      </div>`);
  }

  function tasksPage() {
    return shell(`${pageTitle("任务列表", "覆盖成功、执行中、失败返还、排队四种 P0 状态。", `<button class="btn danger" onclick="selectTask('img-20260502-118')">查看失败任务案例</button>`)}
      ${table(["任务", "源镜像", "目标仓库", "任务状态", "结算状态", "操作"], tasks.map((task) => `<tr><td>${task.id}<br><small>${task.title}</small></td><td>${task.source}</td><td>${task.registry}</td><td>${statusPill(task.taskStatus)}</td><td>${statusPill(task.billingStatus)}</td><td><button class="btn" onclick="selectTask('${task.id}')">详情</button></td></tr>`))}`);
  }

  function taskDetailPage() {
    return shell(`${pageTitle("任务详情", "展示命令、digest、attempt、阶段和日志。", `<button class="btn" onclick="setPage('tasks')">返回列表</button>`)}${taskDetailPanel(selectedTask())}`);
  }

  function taskDetailPanel(task) {
    const tagCommand = `docker pull ${task.target}`;
    const digestTarget = task.target.includes(":") ? task.target.split(":")[0] : task.target;
    const digestCommand = `docker pull ${digestTarget}@${task.targetDigest.startsWith("sha256") ? task.targetDigest : "sha256:pending"}`;
    return `<div class="panel task-detail">
      <div class="section-head"><div><h2>${task.id}</h2><p>${task.source} → ${task.target}</p></div><div>${statusPill(task.taskStatus)} ${statusPill(task.billingStatus)}</div></div>
      <div class="status-grid">
        <div><span>task_status</span><strong>${task.taskStatus}</strong></div>
        <div><span>billing_status</span><strong>${task.billingStatus}</strong></div>
        <div><span>worker_status</span><strong>${task.workerStatus}</strong></div>
        <div><span>current_stage</span><strong>${currentStage(task)}</strong></div>
      </div>
      <div class="digest-grid">
        <div><span>source digest</span><code>${task.sourceDigest}</code></div>
        <div><span>target digest</span><code>${task.targetDigest}</code></div>
        <div><span>target manifest digest</span><code>${task.targetManifestDigest}</code></div>
        <div><span>Worker</span><code>${task.worker}</code></div>
      </div>
      <div class="code-block"><span>${tagCommand}</span><button class="btn" onclick="copyText('${tagCommand}')">${icon("copy")}复制 tag pull</button></div>
      <div class="code-block"><span>${digestCommand}</span><button class="btn" onclick="copyText('${digestCommand}')">${icon("copy")}复制 digest pull</button></div>
      <h3>Attempt 记录</h3>
      <div class="attempts"><div><strong>Attempt #${task.attemptNo}</strong><span>${task.workerStatus} · ${task.points} 积分</span></div><div>${statusPill(task.workerStatus)}</div></div>
      ${task.errorCode ? `<div class="notice danger"><strong>错误码 ${task.errorCode}</strong><p>${task.failureReason}</p><p>billing_status = ${task.billingStatus}，积分返还流水已写入，用户消息已通知。</p></div>` : ""}
      <div class="notice"><strong>积分信息</strong><p>${task.taskStatus === "failed" ? `冻结 ${task.points} 积分，任务失败后已全额返还。` : task.taskStatus === "succeeded" ? `冻结 10 积分，成功消费 ${task.points} 积分，退回差额 3。` : `当前冻结 ${task.points} 积分，等待任务完成后结算。`}</p></div>
      <h3>阶段日志</h3>
      ${flowList(task)}
      <div class="log-box">${task.logs.map((line) => `<p>${line}</p>`).join("")}</div>
    </div>`;
  }

  function flowList(task) {
    return `<div class="timeline">${stages.map((stage, index) => `<div class="timeline-item"><span class="dot ${index < task.stageIndex ? "done" : index === task.stageIndex ? "run" : ""}"></span><div><strong>${stage}</strong><p>${index < task.stageIndex ? "已完成" : index === task.stageIndex ? "执行中" : "等待中"}</p></div></div>`).join("")}</div>`;
  }

  function registryPanel() {
    return `<div class="panel"><h3>私有仓库</h3><div class="stack">
      ${["阿里云生产仓库 · registry.cn-hangzhou.aliyuncs.com", "Harbor 运维项目 · harbor.ops.example.com", "腾讯云 TCR · ccr.ccs.tencentyun.com"].map((row) => `<div class="board-row"><div><strong>${row.split(" · ")[0]}</strong><span>${row.split(" · ")[1]}</span></div>${statusPill("normal")}</div>`).join("")}
    </div></div>`;
  }

  function registries() {
    const tests = [
      ["阿里云生产仓库", "测试成功", "login 成功，namespace 已存在，具备 push 权限"],
      ["腾讯云 TCR", "认证失败", "用户名、密码、Robot Account 或 Token 不正确"],
      ["火山云镜像仓库", "无 push 权限", "当前账号只有 pull 权限，请调整权限"],
      ["华为云 SWR", "namespace / project 不存在", "请先在云控制台创建目标 namespace / project"],
      ["自建 Harbor", "Harbor 自签名证书暂不支持", "需管理员在 Worker 配可信 CA 后再测试"]
    ];
    return shell(`${pageTitle("私有仓库管理", "P0 以 Generic Docker Registry V2 push 为后端能力，云厂商作为 UI 预设。")}
      <div class="split">
        <div class="panel form-grid">
          <h3 class="field full">添加仓库</h3>
          <label class="field">仓库类型<select class="input"><option>阿里云 ACR</option><option>腾讯云 TCR</option><option>火山云</option><option>华为云 SWR</option><option>自建 Harbor</option><option>通用 Docker Registry</option></select></label>
          <label class="field">Registry 地址<input class="input" value="registry.cn-hangzhou.aliyuncs.com" /></label>
          <label class="field">Namespace / Project<input class="input" value="ops" /></label>
          <label class="field">用户名 / Robot Account<input class="input" value="robot$imgpull" /></label>
          <label class="field full">密码 / Token<input class="input" value="******" type="password" /></label>
          <div class="actions field full"><button class="btn" onclick="showToast('测试成功：login 成功，具备 push 权限')">测试连接</button><button class="btn primary">保存仓库</button></div>
        </div>
        ${registryPanel()}
      </div>
      ${table(["仓库", "测试结果", "说明"], tests.map((row, index) => `<tr><td>${row[0]}</td><td>${index === 0 ? statusPill("normal") : statusPill("degraded")} ${row[1]}</td><td>${row[2]}</td></tr>`))}`);
  }

  function points() {
    return shell(`${pageTitle("积分中心", "展示充值包、人工充值说明、支付渠道状态和积分流水。")}
      <div class="grid cols-3">${metric("可用积分", state.pointsBalance)}${metric("冻结积分", state.frozenBalance)}${metric("本月赠送", "300")}</div>
      <div class="section split">
        <div class="panel">
          <h3>充值包</h3>
          <div class="grid cols-3">${rechargePackages.map((pkg) => `<div class="card"><strong>${pkg[0]}</strong><p>¥${pkg[1]} · ${pkg[2]} 积分</p><p>${pkg[3]}</p><button class="btn primary" onclick="setPage('orders')">创建人工充值订单</button></div>`).join("")}</div>
        </div>
        <div class="panel">
          <h3>人工充值说明</h3>
          <p>P0 只支持人工充值。用户线下付款或联系管理员后，管理员在后台确认金额和积分，系统写入订单、支付记录、积分流水、审计日志和到账消息。</p>
          <div class="board-row"><div><strong>人工充值：可用</strong><span>manual</span></div>${statusPill("normal")}</div>
          <div class="board-row"><div><strong>支付宝：暂未开通</strong><span>alipay，后续预留，不生成真实支付二维码</span></div>${statusPill("reserved")}</div>
          <div class="board-row"><div><strong>微信支付：暂未开通</strong><span>wechat，后续预留，不接真实支付 SDK</span></div>${statusPill("reserved")}</div>
        </div>
      </div>
      ${table(["类型", "关联单号", "balance_delta", "frozen_delta", "说明"], pointRows.map((row) => `<tr><td>${row[0]}</td><td>${row[1]}</td><td>${row[2]}</td><td>${row[3]}</td><td>${row[4]}</td></tr>`))}
      <div class="panel"><h3>到账通知</h3>${userMessages.slice(0, 3).map((msg) => `<div class="board-row"><div><strong>${msg.title}</strong><span>${msg.content}</span></div>${statusPill("normal")}</div>`).join("")}</div>`);
  }

  function ordersPage() {
    return shell(`${pageTitle("订单记录", "展示人工充值待确认、已到账、关闭订单，以及支付宝 / 微信支付预留状态。")}${table(["订单号", "项目", "金额", "积分", "支付渠道", "状态", "说明"], orders.map((o) => `<tr><td>${o.no}</td><td>${o.item}</td><td>¥${o.amount}</td><td>${o.points}</td><td>${channelName(o.channel)}</td><td>${statusPill(o.status)}</td><td>${o.note}</td></tr>`))}`);
  }

  function activitiesPage() {
    return shell(`${pageTitle("活动中心", "用户领取活动积分，P0 用静态状态展示闭环。")}<div class="grid cols-3">${activities.map((a) => `<div class="panel"><h3>${a[0]}</h3><p>${a[1]}</p><p>${a[3]}</p><button class="btn primary" onclick="showToast('活动积分已模拟领取')">领取积分</button></div>`).join("")}</div>`);
  }

  function messagesPage() {
    return shell(`${pageTitle("消息中心", "展示任务、订单、积分、活动和系统公告消息。")}
      ${table(["状态", "类型", "标题", "时间", "内容", "跳转目标"], userMessages.map((msg) => `<tr><td>${msg.status}</td><td>${msg.type}</td><td>${msg.title}</td><td>${msg.time}</td><td>${msg.content}</td><td><button class="btn">${msg.target}</button></td></tr>`))}`);
  }

  function accountPage() {
    return shell(`${pageTitle("账号设置", "维护基础资料、安全设置和默认仓库。")}
      <div class="split"><div class="panel form-grid">
        <label class="field">邮箱<input class="input" value="ops@demo.com" /></label>
        <label class="field">昵称<input class="input" value="运维用户" /></label>
        <label class="field">默认仓库<select class="input"><option>阿里云生产仓库</option><option>Harbor 运维项目</option></select></label>
        <label class="field">消息通知<select class="input"><option>站内消息</option><option>关闭</option></select></label>
        <button class="btn primary">保存设置</button>
      </div><div class="panel"><h3>安全提示</h3><p>仓库凭据加密保存，管理员不可见。后续支持凭据轮换提醒。</p></div></div>`);
  }

  function workerMiniPanel() {
    return `<div class="panel"><h3>Worker 状态</h3>${workers.slice(0, 4).map((w) => `<div class="board-row"><div><strong>${w[0]}</strong><span>${w[2]} · ${w[3]} 个任务</span></div>${statusPill(w[1])}</div>`).join("")}</div>`;
  }

  function adminDashboard() {
    return shell(`${pageTitle("管理员仪表盘", "查看任务、积分、订单和 Worker 健康概况。")}
      <div class="grid cols-4">${metric("今日任务", "126", "成功 98 / 失败 7")}${metric("冻结积分", "1,842")}${metric("待确认订单", "3")}${metric("在线节点", "1 / 6")}</div>
      <div class="section split">${workerMiniPanel()}${adminTaskTable(true)}</div>`);
  }

  function adminTaskTable(compact = false) {
    const rows = tasks.map((task) => `<tr><td>${task.id}</td><td>${task.source}</td><td>${task.worker}</td><td>${statusPill(task.taskStatus)}</td><td>${statusPill(task.billingStatus)}</td><td><button class="btn" onclick="selectTask('${task.id}')">查看</button></td></tr>`);
    return table(["任务", "源镜像", "Worker", "任务状态", "结算", "操作"], compact ? rows.slice(0, 3) : rows);
  }

  function adminTasks() {
    return shell(`${pageTitle("管理员任务管理", "按任务状态、结算状态和 Worker 状态排障。")}${adminTaskTable()}`);
  }

  function adminWorkers() {
    return shell(`${pageTitle("管理员 Worker 节点管理", "覆盖在线、维护、排空、离线、禁用、退役状态。", `<button class="btn primary" onclick="showToast('已创建 pending 节点')">${icon("plus")}新增节点</button>`)}
      ${table(["节点", "状态", "执行器", "任务数", "CPU", "磁盘", "成功率", "操作"], workers.map((w) => `<tr class="${w[1] === "deleted" ? "row-muted" : ""}"><td>${w[0]}${w[1] === "deleted" ? "<br><small>不参与调度，可恢复或最终清理</small>" : ""}</td><td>${statusPill(w[1])}</td><td>${w[2]}</td><td>${w[3]}</td><td>${w[4]}</td><td>${w[5]}</td><td>${w[6]}</td><td><div class="row-actions"><button class="btn" onclick="showToast('上线：节点恢复接收新任务')">上线</button><button class="btn" onclick="showToast('进入维护：停止分配新任务，保留现有状态')">进入维护</button><button class="btn" onclick="showToast('排空：不接新任务，等待运行任务结束')">排空</button><button class="btn" onclick="showToast('禁用：立即从调度池移除，需谨慎')">禁用</button><button class="btn" onclick="showToast('退役：长期下线，历史任务保留快照')">退役</button><button class="btn danger" onclick="showToast('软删除：不参与调度，可恢复或最终清理')">软删除</button></div></td></tr>`))}
      <div class="panel"><h3>生命周期操作说明</h3><div class="grid cols-3">
        ${["上线：允许节点接收新任务", "进入维护：停止新任务分配，适合升级", "排空：等待运行任务结束后下线", "禁用：从调度池移除，处理异常节点", "退役：长期下线，保留历史任务快照", "软删除：不参与调度，可恢复或最终清理"].map((item) => `<div class="card"><strong>${item.split("：")[0]}</strong><p>${item.split("：")[1]}</p></div>`).join("")}
      </div></div>`);
  }

  function adminUsers() {
    return shell(`${pageTitle("管理员用户 / 积分管理", "管理员人工充值、会员调整和积分审计入口。")}
      ${table(["用户", "会员", "可用积分", "冻结积分", "操作"], [
        `<tr><td>ops@demo.com</td><td>普通会员</td><td>${state.pointsBalance}</td><td>${state.frozenBalance}</td><td><button class="btn primary" onclick="applyManualRecharge()">人工充值</button></td></tr>`,
        `<tr><td>dev@demo.com</td><td>专业会员</td><td>1580</td><td>0</td><td><button class="btn">调整会员</button></td></tr>`
      ])}`);
  }

  function adminOrders() {
    return shell(`${pageTitle("订单管理", "P0 支持人工确认订单和积分发放记录，支付宝 / 微信只做预留。")}
      <div class="split">
        <div>
          ${table(["订单号", "用户", "商品", "金额", "积分", "支付渠道", "状态"], orders.map((o) => `<tr><td>${o.no}</td><td>${o.user}</td><td>${o.item}</td><td>¥${o.amount}</td><td>${o.points}</td><td>${channelName(o.channel)}</td><td>${statusPill(o.status)}</td></tr>`))}
        </div>
        <div class="panel form-grid">
          <h3 class="field full">人工充值</h3>
          <label class="field full">用户<input class="input" value="ops@demo.com" /></label>
          <label class="field">金额<input class="input" value="10.00" /></label>
          <label class="field">到账积分<input class="input" value="100" /></label>
          <label class="field full">支付渠道<select class="input"><option>manual</option></select></label>
          <label class="field full">备注<input class="input" value="线下收款，管理员确认到账" /></label>
          <button class="btn primary full" onclick="applyManualRecharge()">确认人工充值</button>
          <p class="field full">提交后静态模拟：订单状态 paid，用户积分增加，积分流水增加，操作日志增加，用户消息增加。重复点击使用同一幂等键，不重复加积分。</p>
        </div>
      </div>`);
  }

  function adminActivities() {
    return shell(`${pageTitle("活动管理", "创建、发布、下线基础积分活动。")}<div class="grid cols-3">${activities.map((a) => `<div class="panel"><h3>${a[0]}</h3><p>${a[1]}</p><p>${a[3]}</p><div class="actions"><button class="btn">编辑</button><button class="btn primary">发布</button></div></div>`).join("")}</div>`);
  }

  function adminAnnouncements() {
    const rows = [["系统维护公告", "已发布", "2026-05-03"], ["计费规则说明", "草稿", "2026-05-02"], ["Worker 节点扩容", "已下线", "2026-04-30"]];
    return shell(`${pageTitle("公告管理", "P0 基础公告创建、编辑、发布、下线。")}${table(["标题", "状态", "更新时间", "操作"], rows.map((r) => `<tr><td>${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td><td><button class="btn">编辑</button></td></tr>`))}`);
  }

  function adminHelp() {
    const rows = [["阿里云 ACR 配置", "仓库配置", "已发布"], ["Harbor Robot Account", "仓库配置", "已发布"], ["错误码说明", "故障处理", "草稿"]];
    return shell(`${pageTitle("帮助文档管理", "P0 基础帮助文档，不做高级 CMS。")}${table(["标题", "分类", "状态", "操作"], rows.map((r) => `<tr><td>${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td><td><button class="btn">编辑</button></td></tr>`))}`);
  }

  function adminErrorCodes() {
    return shell(`${pageTitle("错误码管理", "维护用户可见文案和处理建议。")}${table(["错误码", "用户文案", "处理建议", "操作"], errorCodes.map((e) => `<tr><td><code>${e[0]}</code></td><td>${e[1]}</td><td>${e[2]}</td><td><button class="btn">编辑</button></td></tr>`))}`);
  }

  function adminSettings() {
    const groups = [
      ["基础配置", [["站点名称", "镜像推送平台"], ["注册开关", "开启"], ["注册送积分", "30"]]],
      ["任务配置", [["单任务大小限制", "20GB"], ["默认架构策略", "all"], ["最大重试次数", "1"]]],
      ["计费配置", [["积分单价", "1 元 = 10 积分"], ["冻结倍率", "1.0"], ["失败返还策略", "全额返还"]]],
      ["Worker 配置", [["lease TTL", "300 秒"], ["心跳超时", "90 秒"], ["最大并发", "按节点配置"]]],
      ["支付配置", [["人工充值", "启用"], ["支付宝", "暂未开通"], ["微信支付", "暂未开通"]]],
      ["通知配置", [["站内消息", "开启"], ["任务结果通知", "开启"], ["充值到账通知", "开启"]]]
    ];
    return shell(`${pageTitle("系统配置", "P0 只展示基础配置分组和假保存按钮，不接真实接口。", `<button class="btn primary" onclick="showToast('系统配置已模拟保存')">保存配置</button>`)}
      <div class="grid cols-3">${groups.map((group) => `<div class="panel"><h3>${group[0]}</h3>${group[1].map((item) => `<div class="board-row"><div><strong>${item[0]}</strong><span>${item[1]}</span></div></div>`).join("")}</div>`).join("")}</div>`);
  }

  function auditLogs() {
    return shell(`${pageTitle("操作日志", "管理员和系统关键动作必须留痕。")}${table(["时间", "操作者", "动作", "内容"], auditRows.map((r) => `<tr><td>${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td><td>${r[3]}</td></tr>`))}`);
  }

  function health() {
    return shell(`${pageTitle("系统健康", "展示 API、数据库、队列、Worker 和存储健康状态。")}
      <div class="grid cols-4">${metric("API", "正常", "P95 86ms")}${metric("MySQL", "正常", "连接池 18%")}${metric("队列", "注意", "排队 14")}${metric("对象存储", "正常", "日志保留 30 天")}</div>
      ${table(["组件", "状态", "说明"], [
        `<tr><td>任务调度器</td><td>${statusPill("normal")}</td><td>claim / lease 正常</td></tr>`,
        `<tr><td>Worker harbor-04</td><td>${statusPill("offline")}</td><td>心跳超时，任务不会继续分配</td></tr>`,
        `<tr><td>失败返还任务</td><td>${statusPill("normal")}</td><td>最近一次执行成功</td></tr>`
      ])}`);
  }

  const routes = {
    home,
    product,
    supportRegistries,
    login,
    register,
    pricing,
    help,
    errorCenter,
    userDashboard,
    newTask,
    tasks: tasksPage,
    taskDetail: taskDetailPage,
    registries,
    points,
    orders: ordersPage,
    activities: activitiesPage,
    messages: messagesPage,
    account: accountPage,
    adminDashboard,
    adminTasks,
    adminWorkers,
    adminUsers,
    adminOrders,
    adminActivities,
    adminAnnouncements,
    adminHelp,
    adminErrorCodes,
    adminSettings,
    auditLogs,
    health
  };

  function areaForPage(page) {
    return Object.keys(nav).find((area) => nav[area].some(([key]) => key === page)) || "site";
  }

  function setArea(area) {
    state.area = area;
    state.page = nav[area][0][0];
    render();
  }

  function setPage(page) {
    state.area = areaForPage(page);
    state.page = page;
    render();
  }

  function selectTask(id) {
    state.selectedTaskId = id;
    setPage("taskDetail");
  }

  function copyText(text) {
    if (global.navigator && global.navigator.clipboard) {
      global.navigator.clipboard.writeText(text);
    }
    showToast("已复制命令");
  }

  function showToast(message) {
    if (!global.document) return;
    const toast = global.document.getElementById("toast");
    if (!toast) return;
    toast.textContent = message;
    toast.className = "toast show";
    global.clearTimeout(state.toastTimer);
    state.toastTimer = global.setTimeout(() => {
      toast.className = "toast";
    }, 2200);
  }

  function renderPage(page) {
    const fn = routes[page] || routes.home;
    return fn();
  }

  function render() {
    if (!global.document) return "";
    const app = global.document.getElementById("app");
    if (!app) return "";
    const html = renderPage(state.page);
    app.innerHTML = html;
    return html;
  }

  Object.assign(global, {
    setArea,
    setPage,
    selectTask,
    applyManualRecharge,
    copyText,
    showToast,
    ImgPullPrototype: {
      nav,
      routes,
      state,
      tasks,
      workers,
      orders,
      pointRows,
      renderPage
    }
  });

  if (global.document) {
    if (global.document.readyState === "loading") {
      global.document.addEventListener("DOMContentLoaded", render);
    } else {
      render();
    }
  }
})(typeof window !== "undefined" ? window : globalThis);
