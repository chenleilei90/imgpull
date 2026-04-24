(function () {
  const API_BASE = '/api/v1';
  const tokenKey = 'imgpull_token';
  let currentUser = null;

  const pageMeta = {
    dashboard: ['控制台总览', '全面掌握镜像同步状态与使用情况'],
    sync: ['镜像同步', '将海外公开镜像同步到你的国内私有仓库'],
    registries: ['我的仓库', '管理你的国内目标仓库连接与默认同步位置'],
    images: ['我的镜像', '查看已成功进入你私有仓库的镜像资产'],
    tasks: ['同步记录', '查看全部同步任务历史、状态与结果'],
    'task-detail': ['任务详情', '查看任务进度、执行日志与镜像明细'],
    account: ['账户设置 / API', '管理个人信息、安全设置与接口访问能力']
  };

  function token() {
    return localStorage.getItem(tokenKey);
  }

  function setToken(value) {
    localStorage.setItem(tokenKey, value);
  }

  function clearToken() {
    localStorage.removeItem(tokenKey);
  }

  async function api(path, options = {}) {
    const headers = {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(token() ? { Authorization: `Bearer ${token()}` } : {}),
      ...(options.headers || {})
    };
    const response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined
    });
    const data = await response.json();
    if (response.status === 401 && location.pathname !== '/login') {
      clearToken();
      location.href = '/login';
      return data;
    }
    if (!response.ok || data.code !== 0) {
      throw new Error(data.message || `请求失败：${response.status}`);
    }
    return data.data;
  }

  function $(selector) {
    return document.querySelector(selector);
  }

  function $$(selector) {
    return Array.from(document.querySelectorAll(selector));
  }

  function escapeHtml(value) {
    return String(value ?? '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  function formatDate(value) {
    if (!value) return '-';
    return new Date(value).toLocaleString('zh-CN', { hour12: false });
  }

  function statusLabel(status) {
    const map = {
      queued: '排队中',
      running: '进行中',
      pulling: '拉取中',
      tagging: '打标中',
      pushing: '推送中',
      success: '成功',
      failed: '失败',
      canceled: '已取消',
      partial_success: '部分成功',
      untested: '未测试',
      active: '正常'
    };
    return map[status] || status || '-';
  }

  function badge(status) {
    return `<span class="badge ${escapeHtml(status)}">${statusLabel(status)}</span>`;
  }

  function toast(message) {
    const old = $('.toast');
    if (old) old.remove();
    const node = document.createElement('div');
    node.className = 'toast';
    node.textContent = message;
    document.body.appendChild(node);
    setTimeout(() => node.remove(), 2600);
  }

  async function copyText(text) {
    await navigator.clipboard.writeText(text);
    toast('复制成功');
  }

  function pullCommand(targetRef, tool = 'docker') {
    return `${tool} pull ${targetRef}`;
  }

  function logo() {
    return `<span class="logo-mark">◇</span><span>海外镜像同步平台</span>`;
  }

  function navItem(href, key, label, icon, active) {
    return `<a class="${active === key ? 'active' : ''}" href="${href}"><span class="side-icon">${icon}</span>${label}</a>`;
  }

  function shell(active) {
    const [title, subtitle] = pageMeta[active] || pageMeta.dashboard;
    document.body.innerHTML = `
      <div class="layout">
        <aside class="sidebar">
          <a class="brand" href="/dashboard">${logo()}</a>
          <nav class="nav">
            ${navItem('/dashboard', 'dashboard', '控制台总览', '⌂', active)}
            ${navItem('/sync', 'sync', '镜像同步', '↻', active)}
            ${navItem('/registries', 'registries', '我的仓库', '▣', active)}
            ${navItem('/images', 'images', '我的镜像', '◈', active)}
            ${navItem('/tasks', 'tasks', '同步记录', '▤', active)}
            ${navItem('/task-detail', 'task-detail', '任务详情', '▧', active)}
            ${navItem('/account', 'account', '账户设置/API', '⚙', active)}
          </nav>
          <div class="plan-card">
            <strong>专业版</strong>
            <span class="badge">当前套餐</span>
            <p class="muted">有效期至 2025-07-15</p>
            <div class="summary-row"><span>配额使用</span><strong>68%</strong></div>
            <div class="progress"><span style="width:68%"></span></div>
            <p class="muted">已用 136.0 GB / 200 GB</p>
            <a class="btn ghost" href="/account" style="width:100%">升级套餐</a>
          </div>
        </aside>
        <section class="app">
          <header class="topbar">
            <div class="crumb">⌂ / ${escapeHtml(title)}</div>
            <div class="top-actions">
              <label class="global-search">
                <span>⌕</span>
                <input id="globalSearch" placeholder="搜索镜像、仓库、任务...">
                <small class="muted">⌘ K</small>
              </label>
              <button class="bell" title="通知"></button>
              <div class="user-chip">
                <span class="avatar" id="userAvatar">U</span>
                <span id="userName">加载中</span>
                <button class="btn ghost" id="logoutBtn">退出</button>
              </div>
            </div>
          </header>
          <main class="content">
            <div class="page-head">
              <div class="page-title">
                <h1>${escapeHtml(title)}</h1>
                <p>${escapeHtml(subtitle)}</p>
              </div>
              <span class="subtle-action">数据更新时间：刚刚</span>
            </div>
            <div id="app"></div>
            <footer class="footer">
              <span>© 2026 海外镜像同步平台</span>
              <span>文档中心　帮助支持　服务条款　隐私政策　<span class="status-dot"></span> 系统状态 正常</span>
            </footer>
          </main>
        </section>
      </div>
    `;
    $('#logoutBtn').addEventListener('click', () => {
      clearToken();
      location.href = '/login';
    });
    $('#globalSearch').addEventListener('keydown', (event) => {
      if (event.key === 'Enter' && event.currentTarget.value.trim()) {
        location.href = `/images?keyword=${encodeURIComponent(event.currentTarget.value.trim())}`;
      }
    });
    loadMe();
  }

  async function loadMe() {
    try {
      currentUser = await api('/me');
      $('#userName').textContent = currentUser.username;
      $('#userAvatar').textContent = currentUser.username.slice(0, 1).toUpperCase();
    } catch (error) {
      toast(error.message);
    }
  }

  function metricCard(label, value, icon, tone = '', hint = '较昨日 ↑ 0') {
    return `
      <div class="card metric-card">
        <div class="metric-icon ${tone}">${icon}</div>
        <div>
          <span>${label}</span>
          <strong>${value}</strong>
          <small class="muted">${hint}</small>
        </div>
      </div>
    `;
  }

  async function initLogin() {
    $$('.auth-tab').forEach((button) => {
      button.addEventListener('click', () => {
        $$('.auth-tab').forEach((tab) => tab.classList.remove('active'));
        $$('.auth-form-panel').forEach((panel) => panel.classList.remove('active'));
        button.classList.add('active');
        $(`#${button.dataset.target}`).classList.add('active');
      });
    });

    $('#loginForm').addEventListener('submit', async (event) => {
      event.preventDefault();
      const form = new FormData(event.currentTarget);
      try {
        const data = await api('/auth/login', {
          method: 'POST',
          body: {
            account: form.get('account'),
            password: form.get('password')
          }
        });
        setToken(data.token);
        location.href = '/dashboard';
      } catch (error) {
        toast(error.message);
      }
    });

    $('#registerForm').addEventListener('submit', async (event) => {
      event.preventDefault();
      const form = new FormData(event.currentTarget);
      try {
        await api('/auth/register', {
          method: 'POST',
          body: {
            username: form.get('username'),
            email: form.get('email'),
            password: form.get('password')
          }
        });
        toast('注册成功，请登录');
        $('#loginAccount').value = form.get('username');
        $('[data-target="loginForm"]').click();
      } catch (error) {
        toast(error.message);
      }
    });
  }

  async function initDashboard() {
    shell('dashboard');
    const app = $('#app');
    app.innerHTML = `
      <div class="grid five" id="metricGrid"></div>
      <div class="grid main-right" style="margin-top:16px">
        <div class="grid">
          <section class="card card-pad chart-card">
            <div class="toolbar">
              <h2>7 天同步任务趋势</h2>
              <button class="btn ghost">近 7 天</button>
            </div>
            <div class="line-chart"></div>
          </section>
          <section class="card card-pad">
            <div class="toolbar"><h2>最近任务</h2><a class="btn ghost" href="/tasks">查看全部任务</a></div>
            <div class="table-wrap"><table><thead><tr><th>任务名称</th><th>源仓库 → 目标仓库</th><th>状态</th><th>镜像数量</th><th>开始时间</th><th>操作</th></tr></thead><tbody id="recentTasks"></tbody></table></div>
          </section>
        </div>
        <div class="grid">
          <section class="card card-pad">
            <h2>任务状态分布</h2>
            <div style="display:flex;align-items:center;gap:22px;margin-top:18px">
              <div class="donut"><div class="donut-inner"><strong id="donutTotal">0</strong><small class="muted">近 7 天</small></div></div>
              <div class="grid" id="statusSummary"></div>
            </div>
          </section>
          <section class="card card-pad">
            <div class="toolbar"><h2>热门镜像 TOP 5</h2><a class="muted" href="/images">更多 ></a></div>
            <div class="rank-list" id="topImages"></div>
          </section>
          <section class="card card-pad">
            <h2>快捷操作</h2>
            <div class="grid" style="margin-top:14px">
              <a class="btn" href="/registries">添加仓库</a>
              <a class="btn green" href="/sync">创建同步任务</a>
              <a class="btn ghost" href="/tasks">查看同步记录</a>
              <a class="btn ghost" href="/images">我的镜像</a>
            </div>
          </section>
        </div>
      </div>
    `;
    const [registries, tasks, images] = await Promise.all([
      api('/registries'),
      api('/sync-tasks?page=1&page_size=8'),
      api('/my-images?page=1&page_size=8')
    ]);
    const success = tasks.items.filter((item) => item.status === 'success').length;
    const failed = tasks.items.filter((item) => item.status === 'failed').length;
    const running = tasks.items.filter((item) => ['running', 'queued'].includes(item.status)).length;
    $('#metricGrid').innerHTML = [
      metricCard('今日同步任务', tasks.pagination.total, '▣', '', '较昨日 ↑ 28%'),
      metricCard('成功率', tasks.pagination.total ? `${Math.round((success / tasks.items.length) * 100)}%` : '0%', '↗', 'green', '较昨日 ↑ 1.2%'),
      metricCard('仓库数量', registries.length, '◆', 'purple', '较昨日 ↑ 2'),
      metricCard('我的镜像数', images.pagination.total, '◈', '', '较昨日 ↑ 56'),
      metricCard('配额使用', '68%', '●', 'orange', '136.0 GB / 200 GB')
    ].join('');
    $('#donutTotal').textContent = tasks.pagination.total;
    $('#statusSummary').innerHTML = `
      <div class="summary-row"><span>${badge('success')} 成功</span><strong>${success}</strong></div>
      <div class="summary-row"><span>${badge('failed')} 失败</span><strong>${failed}</strong></div>
      <div class="summary-row"><span>${badge('running')} 进行中</span><strong>${running}</strong></div>
    `;
    $('#recentTasks').innerHTML = tasks.items.length ? tasks.items.map((item) => `
      <tr>
        <td>同步 ${escapeHtml(item.task_no)}</td>
        <td>${escapeHtml(item.registry_host_snapshot || 'docker.io')} → ${escapeHtml(item.registry_name || item.namespace_snapshot || '-')}</td>
        <td>${badge(item.status)}</td>
        <td>${item.total_count}</td>
        <td>${formatDate(item.created_at)}</td>
        <td><a class="muted" href="/task-detail?id=${item.id}">查看详情</a></td>
      </tr>
    `).join('') : `<tr><td colspan="6" class="muted">暂无同步任务</td></tr>`;
    $('#topImages').innerHTML = images.items.length ? images.items.slice(0, 5).map((item, index) => `
      <div class="rank-item">
        <span class="rank-num">${index + 1}</span>
        <strong>${escapeHtml(item.target_repo)}:${escapeHtml(item.target_tag)}</strong>
        <span class="muted">${128 - index * 11}</span>
      </div>
    `).join('') : `<div class="notice">暂无镜像数据</div>`;
  }

  async function initRegistries() {
    shell('registries');
    $('#app').innerHTML = `
      <div class="toolbar">
        <div class="actions">
          <button class="btn" id="showRegistryForm">＋ 新增仓库</button>
          <button class="btn ghost" id="reloadRegistries">批量检测</button>
          <input id="registryKeyword" placeholder="搜索仓库名称或域名..." style="width:330px">
        </div>
        <span class="muted">使用帮助</span>
      </div>
      <div class="grid main-right">
        <section class="card card-pad">
          <form class="form-grid" id="registryForm" style="display:none;margin-bottom:18px">
            <input type="hidden" name="id">
            <div class="form-row">
              <input name="name" placeholder="仓库名称" required>
              <select name="registry_type" required>
                <option value="harbor">Harbor</option>
                <option value="acr">阿里云 ACR</option>
                <option value="tcr">腾讯云 TCR</option>
              </select>
            </div>
            <input name="registry_host" placeholder="Registry 地址，例如 registry.cn-hangzhou.aliyuncs.com" required>
            <div class="form-row">
              <input name="region" placeholder="地域">
              <input name="namespace_name" placeholder="命名空间 / 项目" required>
            </div>
            <div class="form-row">
              <input name="username" placeholder="用户名 / Robot 账号" required>
              <input name="secret" type="password" placeholder="密码 / Token（编辑时可留空）">
            </div>
            <input name="remark" placeholder="备注">
            <label><input name="is_default" type="checkbox"> 设为默认仓库</label>
            <div class="actions">
              <button class="btn" type="submit">保存仓库</button>
              <button class="btn ghost" type="button" id="resetRegistryForm">取消</button>
            </div>
          </form>
          <div class="table-wrap"><table><thead><tr><th>仓库信息</th><th>仓库类型</th><th>仓库地址</th><th>命名空间/项目</th><th>连接状态</th><th>默认</th><th>最后检测</th><th>操作</th></tr></thead><tbody id="registryRows"></tbody></table></div>
        </section>
        <aside class="grid">
          <section class="card card-pad summary-card">
            <h2>仓库概览</h2>
            <div class="summary-row"><span>已绑定仓库数</span><strong id="registryTotal">0</strong></div>
            <div class="summary-row"><span>正常连接</span><strong id="registryOk">0</strong></div>
            <div class="summary-row"><span>默认仓库</span><strong id="registryDefault">0</strong></div>
          </section>
          <section class="card card-pad">
            <h3>最近异常</h3>
            <div id="registryIssues" class="muted">暂无异常</div>
          </section>
        </aside>
      </div>
    `;
    $('#showRegistryForm').addEventListener('click', () => {
      $('#registryForm').style.display = 'grid';
    });
    $('#registryForm').addEventListener('submit', saveRegistry);
    $('#resetRegistryForm').addEventListener('click', resetRegistryForm);
    $('#reloadRegistries').addEventListener('click', loadRegistries);
    $('#registryKeyword').addEventListener('input', loadRegistries);
    await loadRegistries();
  }

  async function loadRegistries() {
    const rows = await api('/registries');
    const keyword = ($('#registryKeyword')?.value || '').trim().toLowerCase();
    const filtered = keyword ? rows.filter((item) => `${item.name} ${item.registry_host}`.toLowerCase().includes(keyword)) : rows;
    $('#registryTotal').textContent = rows.length;
    $('#registryOk').textContent = rows.filter((item) => ['success', 'active'].includes(item.last_test_status || item.status)).length;
    $('#registryDefault').textContent = rows.filter((item) => Number(item.is_default) === 1).length;
    $('#registryRows').innerHTML = filtered.length ? filtered.map((item) => `
      <tr>
        <td><strong>${escapeHtml(item.name)}</strong><br><small class="muted">ID: ${item.id}</small></td>
        <td>${escapeHtml(item.registry_type)}</td>
        <td class="wide-cell">${escapeHtml(item.registry_host)}</td>
        <td>${escapeHtml(item.namespace_name || '-')}</td>
        <td><span class="status-dot"></span> ${statusLabel(item.last_test_status || item.status)}</td>
        <td>${item.is_default ? badge('success') : '<span class="muted">-</span>'}</td>
        <td>${formatDate(item.last_tested_at)}</td>
        <td>
          <div class="actions">
            <button class="btn ghost" data-test="${item.id}">测试连接</button>
            <button class="btn ghost" data-edit="${item.id}">编辑</button>
            <button class="btn danger" data-delete="${item.id}">删除</button>
          </div>
        </td>
      </tr>
    `).join('') : `<tr><td colspan="8" class="muted">暂无仓库，请点击新增仓库</td></tr>`;
    $('#registryIssues').innerHTML = rows.some((item) => item.last_test_status === 'failed') ? '存在连接异常仓库，请重新测试。' : '暂无异常';
    $$('[data-edit]').forEach((button) => button.addEventListener('click', () => fillRegistryForm(rows.find((row) => row.id === Number(button.dataset.edit)))));
    $$('[data-test]').forEach((button) => button.addEventListener('click', async () => {
      try {
        const result = await api(`/registries/${button.dataset.test}/test`, { method: 'POST' });
        toast(`测试完成：${result.status}`);
        await loadRegistries();
      } catch (error) {
        toast(error.message);
      }
    }));
    $$('[data-delete]').forEach((button) => button.addEventListener('click', async () => {
      if (!confirm('确定删除这个仓库配置吗？历史任务快照仍会保留。')) return;
      try {
        await api(`/registries/${button.dataset.delete}`, { method: 'DELETE' });
        toast('仓库已删除');
        await loadRegistries();
      } catch (error) {
        toast(error.message);
      }
    }));
  }

  function fillRegistryForm(item) {
    const form = $('#registryForm');
    form.style.display = 'grid';
    form.elements.id.value = item.id;
    form.elements.name.value = item.name || '';
    form.elements.registry_type.value = item.registry_type || 'harbor';
    form.elements.registry_host.value = item.registry_host || '';
    form.elements.region.value = item.region || '';
    form.elements.namespace_name.value = item.namespace_name || '';
    form.elements.username.value = item.username || '';
    form.elements.secret.value = '';
    form.elements.remark.value = item.remark || '';
    form.elements.is_default.checked = Number(item.is_default) === 1;
  }

  function resetRegistryForm() {
    $('#registryForm').reset();
    $('#registryForm').elements.id.value = '';
    $('#registryForm').style.display = 'none';
  }

  async function saveRegistry(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    data.is_default = form.elements.is_default.checked;
    if (!data.secret) delete data.secret;
    try {
      if (data.id) {
        const id = data.id;
        delete data.id;
        await api(`/registries/${id}`, { method: 'PUT', body: data });
      } else {
        delete data.id;
        await api('/registries', { method: 'POST', body: data });
      }
      toast('仓库保存成功');
      resetRegistryForm();
      await loadRegistries();
    } catch (error) {
      toast(error.message);
    }
  }

  async function initSync() {
    shell('sync');
    $('#app').innerHTML = `
      <section class="card card-pad">
        <div class="split-sync">
          <label class="form-label">源镜像（支持多个，换行分隔）
            <textarea id="syncImages" placeholder="例如：&#10;nginx:latest&#10;redis:7-alpine&#10;mysql:8.0"></textarea>
          </label>
          <div class="form-grid">
            <label class="form-label">目标镜像仓库<select id="syncRegistry"></select></label>
            <label class="form-label">命名空间 / 项目<input id="syncNamespace" disabled></label>
            <label><input id="syncOverwrite" type="checkbox" checked> 目标 Tag 已存在时覆盖</label>
            <button class="btn" id="createSyncTask">获取专属同步地址</button>
            <small class="muted">系统将为你生成专属任务，并在成功后提供目标仓库拉取命令。</small>
          </div>
          <div class="orbit-panel">
            <span class="orbit-chip one">nginx</span>
            <span class="orbit-chip two">mysql</span>
            <span class="orbit-chip three">php</span>
            <span class="orbit-chip four">redis</span>
          </div>
        </div>
      </section>
      <section class="card card-pad" style="margin-top:16px">
        <div class="toolbar">
          <input id="syncedKeyword" placeholder="搜索源镜像或目标镜像..." style="max-width:360px">
          <div class="actions">
            <label><input id="autoCopyDocker" type="checkbox" checked> 复制时自动带 pull 命令</label>
            <button class="btn" id="copySelected">复制选中命令</button>
            <select id="copyTool" style="width:130px"><option>docker</option><option>nerdctl</option><option>crictl</option></select>
          </div>
        </div>
        <div class="table-wrap"><table><thead><tr><th><input id="checkAllImages" type="checkbox"></th><th>源镜像</th><th>目标镜像</th><th>目标仓库 / 项目</th><th>状态</th><th>更新时间</th><th>操作</th></tr></thead><tbody id="syncImageRows"></tbody></table></div>
      </section>
    `;
    const registries = await api('/registries');
    $('#syncRegistry').innerHTML = registries.length ? registries.map((item) => `<option value="${item.id}" data-namespace="${escapeHtml(item.namespace_name || '')}" ${item.is_default ? 'selected' : ''}>${escapeHtml(item.name)} - ${escapeHtml(item.registry_host)}</option>`).join('') : '<option value="">请先添加仓库</option>';
    function updateNamespace() {
      const selected = $('#syncRegistry').selectedOptions[0];
      $('#syncNamespace').value = selected?.dataset.namespace || '';
    }
    $('#syncRegistry').addEventListener('change', updateNamespace);
    updateNamespace();
    const initialImage = new URLSearchParams(location.search).get('image');
    if (initialImage) $('#syncImages').value = decodeURIComponent(initialImage);
    $('#createSyncTask').addEventListener('click', createSyncTask);
    $('#syncedKeyword').addEventListener('input', loadSyncImages);
    $('#copySelected').addEventListener('click', copySelectedImages);
    $('#checkAllImages').addEventListener('change', () => {
      $$('.image-check').forEach((box) => { box.checked = $('#checkAllImages').checked; });
    });
    await loadSyncImages();
  }

  async function createSyncTask() {
    const images = $('#syncImages').value.split('\n').map((line) => line.trim()).filter(Boolean);
    if (!images.length) {
      toast('请至少输入一个镜像');
      return;
    }
    try {
      const task = await api('/sync-tasks', {
        method: 'POST',
        body: {
          registry_account_id: Number($('#syncRegistry').value),
          overwrite_on_exists: $('#syncOverwrite').checked,
          images
        }
      });
      toast('同步任务已创建');
      location.href = `/task-detail?id=${task.task_id}`;
    } catch (error) {
      toast(error.message);
    }
  }

  async function loadSyncImages() {
    const params = new URLSearchParams({ page: '1', page_size: '15' });
    if ($('#syncedKeyword')?.value) params.set('keyword', $('#syncedKeyword').value);
    const images = await api(`/my-images?${params.toString()}`);
    $('#syncImageRows').innerHTML = images.items.length ? images.items.map((item) => `
      <tr>
        <td><input class="image-check" type="checkbox" value="${escapeHtml(item.target_ref)}"></td>
        <td>${escapeHtml(item.source_ref)}</td>
        <td class="wide-cell">${escapeHtml(item.target_ref)}</td>
        <td>${escapeHtml(item.target_registry)} / ${escapeHtml(item.target_namespace)}</td>
        <td>${badge('success')}</td>
        <td>${formatDate(item.last_synced_at)}</td>
        <td><button class="btn ghost" data-copy="${escapeHtml(item.target_ref)}">复制地址</button></td>
      </tr>
    `).join('') : `<tr><td colspan="7" class="muted">暂无已同步镜像，创建任务成功后会出现在这里。</td></tr>`;
    $$('[data-copy]').forEach((button) => button.addEventListener('click', () => copyText(pullCommand(button.dataset.copy, $('#copyTool').value))));
  }

  async function copySelectedImages() {
    const refs = $$('.image-check:checked').map((box) => box.value);
    if (!refs.length) {
      toast('请先选择镜像');
      return;
    }
    await copyText(refs.map((ref) => pullCommand(ref, $('#copyTool').value)).join('\n'));
  }

  async function initImages() {
    shell('images');
    $('#app').innerHTML = `
      <div class="grid main-right">
        <section class="card card-pad">
          <div class="toolbar">
            <input id="imageKeyword" placeholder="搜索镜像名称或地址..." style="max-width:360px">
            <div class="actions">
              <button class="btn ghost" id="copyAllVisible">复制拉取地址</button>
              <button class="btn danger">删除记录</button>
              <button class="btn ghost">导出</button>
            </div>
          </div>
          <div class="table-wrap"><table><thead><tr><th><input id="imageCheckAll" type="checkbox"></th><th>镜像名称</th><th>标签</th><th>目标完整地址</th><th>源仓库</th><th>同步时间</th><th>拉取命令（预览）</th><th>操作</th></tr></thead><tbody id="imageRows"></tbody></table></div>
        </section>
        <aside class="grid">
          <section class="card card-pad summary-card">
            <h2>镜像总数</h2><strong id="imageTotal" style="font-size:30px">0</strong>
            <div class="summary-row"><span>今日新增</span><strong class="up">18</strong></div>
            <div class="summary-row"><span>最近同步成功</span><strong class="up">156</strong></div>
          </section>
          <section class="card card-pad">
            <h3>常用镜像 TOP 5</h3>
            <div id="imageRanks" class="rank-list" style="margin-top:14px"></div>
          </section>
        </aside>
      </div>
    `;
    $('#imageKeyword').addEventListener('input', loadImages);
    $('#copyAllVisible').addEventListener('click', async () => {
      const refs = $$('.image-check:checked').map((box) => box.value);
      await copyText(refs.map((ref) => pullCommand(ref)).join('\n'));
    });
    $('#imageCheckAll').addEventListener('change', () => {
      $$('.image-check').forEach((box) => { box.checked = $('#imageCheckAll').checked; });
    });
    await loadImages();
  }

  async function loadImages() {
    const params = new URLSearchParams({ page: '1', page_size: '15' });
    if ($('#imageKeyword')?.value) params.set('keyword', $('#imageKeyword').value);
    const images = await api(`/my-images?${params.toString()}`);
    $('#imageTotal').textContent = images.pagination.total;
    $('#imageRows').innerHTML = images.items.length ? images.items.map((item) => `
      <tr>
        <td><input class="image-check" type="checkbox" value="${escapeHtml(item.target_ref)}"></td>
        <td><strong>${escapeHtml(item.target_repo)}</strong><br><small class="muted">${escapeHtml(item.target_namespace)}</small></td>
        <td><span class="badge">${escapeHtml(item.target_tag)}</span></td>
        <td class="wide-cell">${escapeHtml(item.target_ref)}</td>
        <td>${escapeHtml(item.source_ref.split('/')[0] || 'docker.io')}</td>
        <td>${formatDate(item.last_synced_at)}</td>
        <td class="wide-cell"><code>${escapeHtml(pullCommand(item.target_ref))}</code></td>
        <td>
          <div class="actions">
            <button class="btn ghost" data-copy="${escapeHtml(item.target_ref)}">复制</button>
            <button class="btn ghost" data-resync="${item.id}">重新同步</button>
          </div>
        </td>
      </tr>
    `).join('') : `<tr><td colspan="8" class="muted">暂无已成功同步的镜像</td></tr>`;
    $('#imageRanks').innerHTML = images.items.slice(0, 5).map((item, index) => `
      <div class="rank-item"><span class="rank-num">${index + 1}</span><strong>${escapeHtml(item.target_repo)}:${escapeHtml(item.target_tag)}</strong><span class="muted">同步 ${128 - index * 8} 次</span></div>
    `).join('') || '<div class="notice">暂无排行</div>';
    $$('[data-copy]').forEach((button) => button.addEventListener('click', () => copyText(pullCommand(button.dataset.copy))));
    $$('[data-resync]').forEach((button) => button.addEventListener('click', async () => {
      try {
        const task = await api(`/my-images/${button.dataset.resync}/resync`, { method: 'POST' });
        toast('已创建重新同步任务');
        location.href = `/task-detail?id=${task.task_id}`;
      } catch (error) {
        toast(error.message);
      }
    }));
  }

  async function initTasks() {
    shell('tasks');
    $('#app').innerHTML = `
      <section class="card card-pad">
        <div class="toolbar">
          <div class="actions">
            <input id="taskKeyword" placeholder="任务名 / 任务ID / 镜像名" style="width:300px">
            <select id="taskStatus"><option value="">全部状态</option><option value="success">成功</option><option value="failed">失败</option><option value="running">进行中</option><option value="queued">排队中</option><option value="canceled">已取消</option></select>
          </div>
          <button class="btn ghost" id="searchTasks">重置/搜索</button>
        </div>
      </section>
      <div class="grid four-stats" style="display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-top:14px">
        ${metricCard('全部任务', '<span id="taskTotal">0</span>', '▣')}
        ${metricCard('成功率', '98.6%', '↗', 'green')}
        ${metricCard('进行中', '<span id="taskRunning">0</span>', '↻')}
        ${metricCard('失败任务', '<span id="taskFailed">0</span>', '×', 'orange')}
      </div>
      <section class="card card-pad" style="margin-top:14px">
        <div class="table-wrap"><table><thead><tr><th>任务ID</th><th>任务名称</th><th>源镜像数</th><th>目标仓库</th><th>状态</th><th>创建时间</th><th>完成时间</th><th>耗时</th><th>操作</th></tr></thead><tbody id="taskRows"></tbody></table></div>
      </section>
    `;
    $('#searchTasks').addEventListener('click', loadTasks);
    await loadTasks();
  }

  async function loadTasks() {
    const params = new URLSearchParams({ page: '1', page_size: '15' });
    if ($('#taskKeyword')?.value) params.set('keyword', $('#taskKeyword').value);
    if ($('#taskStatus')?.value) params.set('status', $('#taskStatus').value);
    const tasks = await api(`/sync-tasks?${params.toString()}`);
    $('#taskTotal').textContent = tasks.pagination.total;
    $('#taskRunning').textContent = tasks.items.filter((item) => ['running', 'queued'].includes(item.status)).length;
    $('#taskFailed').textContent = tasks.items.filter((item) => item.status === 'failed').length;
    $('#taskRows').innerHTML = tasks.items.length ? tasks.items.map((item) => `
      <tr>
        <td>${escapeHtml(item.task_no)}</td>
        <td>同步镜像任务</td>
        <td>${item.total_count}</td>
        <td>${escapeHtml(item.registry_host_snapshot || item.registry_name || '-')}</td>
        <td>${badge(item.status)}</td>
        <td>${formatDate(item.created_at)}</td>
        <td>${formatDate(item.finished_at)}</td>
        <td>-</td>
        <td>
          <div class="actions">
            <a class="btn ghost" href="/task-detail?id=${item.id}">查看详情</a>
            <button class="btn ghost" data-retry="${item.id}">重试</button>
            <button class="btn danger" data-cancel="${item.id}">取消</button>
          </div>
        </td>
      </tr>
    `).join('') : `<tr><td colspan="9" class="muted">暂无同步记录</td></tr>`;
    $$('[data-retry]').forEach((button) => button.addEventListener('click', () => mutateTask(button.dataset.retry, 'retry')));
    $$('[data-cancel]').forEach((button) => button.addEventListener('click', () => mutateTask(button.dataset.cancel, 'cancel')));
  }

  async function mutateTask(id, action) {
    try {
      await api(`/sync-tasks/${id}/${action}`, { method: 'POST' });
      toast(action === 'retry' ? '任务已重新入队' : '已提交取消请求');
      await loadTasks();
    } catch (error) {
      toast(error.message);
    }
  }

  async function initTaskDetail() {
    shell('task-detail');
    const id = new URLSearchParams(location.search).get('id');
    $('#app').innerHTML = `<section class="card card-pad">加载中...</section>`;
    try {
      const detail = await api(`/sync-tasks/${id}`);
      $('#app').innerHTML = `
        <section class="card card-pad">
          <div class="toolbar">
            <div>
              <h2>同步任务 ${escapeHtml(detail.task.task_no)}</h2>
              <p class="muted">目标仓库：${escapeHtml(detail.task.registry_host_snapshot)}/${escapeHtml(detail.task.namespace_snapshot)}</p>
            </div>
            <div class="actions">
              ${badge(detail.task.status)}
              <button class="btn danger" id="cancelDetail">取消任务</button>
              <button class="btn" id="retryDetail">重试任务</button>
            </div>
          </div>
          <div class="grid three">
            <div class="notice">任务 ID：${escapeHtml(detail.task.task_no)}</div>
            <div class="notice">创建时间：${formatDate(detail.task.created_at)}</div>
            <div class="notice">总体进度：${detail.task.success_count + detail.task.failed_count + detail.task.canceled_count} / ${detail.task.total_count}</div>
          </div>
        </section>
        <div class="grid two" style="margin-top:16px">
          <section class="card card-pad">
            <h2>镜像明细</h2>
            <div class="table-wrap"><table><thead><tr><th>镜像名称</th><th>源仓库 → 目标仓库</th><th>状态</th><th>重试次数</th><th>操作</th></tr></thead><tbody id="detailItems"></tbody></table></div>
          </section>
          <section class="card card-pad">
            <div class="toolbar"><h2>执行日志</h2><button class="btn ghost" id="refreshDetail">刷新</button></div>
            <div id="taskLogs" class="notice" style="max-height:360px;overflow:auto">加载日志中...</div>
          </section>
        </div>
      `;
      $('#detailItems').innerHTML = detail.items.map((item) => `
        <tr>
          <td><strong>${escapeHtml(item.target_repo)}:${escapeHtml(item.target_tag)}</strong></td>
          <td class="wide-cell">${escapeHtml(item.resolved_source_ref)} →<br>${escapeHtml(item.resolved_target_ref)}</td>
          <td>${badge(item.status)}</td>
          <td>${item.auto_retry_count + item.manual_retry_count}</td>
          <td><button class="btn ghost" data-logs="${item.id}">查看日志</button></td>
        </tr>
      `).join('');
      $('#cancelDetail').addEventListener('click', () => mutateTask(detail.task.id, 'cancel'));
      $('#retryDetail').addEventListener('click', () => mutateTask(detail.task.id, 'retry'));
      $('#refreshDetail').addEventListener('click', () => location.reload());
      $$('[data-logs]').forEach((button) => button.addEventListener('click', () => loadTaskLogs(button.dataset.logs)));
      if (detail.items[0]) await loadTaskLogs(detail.items[0].id);
    } catch (error) {
      $('#app').innerHTML = `<section class="card card-pad"><div class="notice">${escapeHtml(error.message)}</div></section>`;
    }
  }

  async function loadTaskLogs(itemId) {
    try {
      const data = await api(`/sync-tasks/items/${itemId}/logs`);
      $('#taskLogs').innerHTML = data.logs.length ? data.logs.map((log) => `<div>[${formatDate(log.created_at)}] ${escapeHtml(log.stage)} ${escapeHtml(log.level)} - ${escapeHtml(log.message)}</div>`).join('') : '暂无日志';
    } catch (error) {
      $('#taskLogs').textContent = error.message;
    }
  }

  async function initAccount() {
    shell('account');
    $('#app').innerHTML = `
      <div class="tabs">
        <div class="tab">个人资料</div>
        <div class="tab">安全设置</div>
        <div class="tab active">API Key</div>
        <div class="tab">套餐与用量</div>
      </div>
      <div class="grid main-right" style="margin-top:18px">
        <section class="card card-pad">
          <div class="toolbar"><h2>API Key 列表</h2><button class="btn" disabled>创建新的 API Key</button></div>
          <div class="notice">后端 P0 暂未开放 API Key 创建、禁用、删除接口。这里按参考图保留 UI 位置，等接口落地后接入真实数据。</div>
          <div class="table-wrap" style="margin-top:14px"><table><thead><tr><th>名称</th><th>Key（预览）</th><th>作用范围</th><th>创建时间</th><th>操作</th></tr></thead><tbody><tr><td>CI/CD 自动化同步</td><td>sk_live_••••••••••••ab12</td><td>${badge('queued')} 预留</td><td>-</td><td><button class="btn ghost" disabled>复制</button></td></tr></tbody></table></div>
        </section>
        <aside class="grid">
          <section class="card card-pad">
            <h2>套餐与用量</h2>
            <div class="summary-row"><span>每日请求配额</span><strong>68%</strong></div>
            <div class="progress"><span style="width:68%"></span></div>
            <div class="summary-row"><span>月度请求配额</span><strong>42%</strong></div>
            <div class="progress"><span style="width:42%"></span></div>
          </section>
          <section class="card card-pad">
            <h3>当前账户</h3>
            <p class="muted">用户：${escapeHtml(currentUser?.username || '-')}</p>
            <p class="muted">邮箱：${escapeHtml(currentUser?.email || '-')}</p>
          </section>
        </aside>
      </div>
    `;
  }

  function initLanding() {
    $('#startSync').addEventListener('click', () => {
      const value = encodeURIComponent($('#heroImage').value.trim());
      location.href = token() ? `/sync?image=${value}` : `/login?image=${value}`;
    });
  }

  async function bootstrap() {
    const page = document.body.dataset.page;
    try {
      if (page !== 'login' && page !== 'landing' && !token()) {
        location.href = '/login';
        return;
      }
      if (page === 'landing') initLanding();
      if (page === 'login') await initLogin();
      if (page === 'dashboard') await initDashboard();
      if (page === 'registries') await initRegistries();
      if (page === 'sync') await initSync();
      if (page === 'images') await initImages();
      if (page === 'tasks') await initTasks();
      if (page === 'task-detail') await initTaskDetail();
      if (page === 'account') await initAccount();
    } catch (error) {
      toast(error.message);
    }
  }

  document.addEventListener('DOMContentLoaded', bootstrap);
})();
