(function () {
  const API_BASE = '/api/v1';
  const tokenKey = 'imgpull_token';

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

  function badge(status) {
    return `<span class="badge ${escapeHtml(status)}">${status || '-'}</span>`;
  }

  function toast(message) {
    const old = $('.toast');
    if (old) old.remove();
    const node = document.createElement('div');
    node.className = 'toast';
    node.textContent = message;
    document.body.appendChild(node);
    setTimeout(() => node.remove(), 2400);
  }

  async function copyText(text) {
    await navigator.clipboard.writeText(text);
    toast('已复制到剪贴板');
  }

  function pullCommand(targetRef, tool = 'docker') {
    return `${tool} pull ${targetRef}`;
  }

  function shell(active, title, subtitle) {
    document.body.innerHTML = `
      <div class="layout">
        <aside class="sidebar">
          <a class="brand" href="/dashboard">
            <span class="brand-mark">I</span>
            <span>ImgPull</span>
          </a>
          <nav class="nav">
            ${navItem('/dashboard', '控制台总览', active === 'dashboard')}
            ${navItem('/registries', '我的仓库', active === 'registries')}
            ${navItem('/sync', '镜像同步', active === 'sync')}
            ${navItem('/tasks', '同步记录', active === 'tasks')}
            ${navItem('/images', '我的镜像', active === 'images')}
          </nav>
        </aside>
        <main class="main">
          <div class="topbar">
            <div class="page-title">
              <h1>${escapeHtml(title)}</h1>
              <p>${escapeHtml(subtitle || '')}</p>
            </div>
            <div class="user-pill">
              <span class="avatar" id="userAvatar">U</span>
              <span id="userName">加载中</span>
              <button class="btn ghost" id="logoutBtn">退出</button>
            </div>
          </div>
          <div id="app"></div>
        </main>
      </div>
    `;
    $('#logoutBtn').addEventListener('click', () => {
      clearToken();
      location.href = '/login';
    });
    loadMe();
  }

  function navItem(href, label, active) {
    return `<a class="${active ? 'active' : ''}" href="${href}">${label}</a>`;
  }

  async function loadMe() {
    try {
      const me = await api('/me');
      $('#userName').textContent = me.username;
      $('#userAvatar').textContent = me.username.slice(0, 1).toUpperCase();
    } catch (error) {
      toast(error.message);
    }
  }

  async function initLogin() {
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
      } catch (error) {
        toast(error.message);
      }
    });
  }

  async function initDashboard() {
    shell('dashboard', '控制台总览', '快速查看仓库、任务、镜像与最近同步状态');
    const app = $('#app');
    app.innerHTML = `
      <div class="grid three">
        <div class="card metric"><span class="muted">已绑定仓库</span><strong id="registryCount">-</strong></div>
        <div class="card metric"><span class="muted">最近任务总数</span><strong id="taskCount">-</strong></div>
        <div class="card metric"><span class="muted">我的镜像</span><strong id="imageCount">-</strong></div>
      </div>
      <div class="grid two" style="margin-top:16px">
        <section class="card">
          <div class="toolbar"><h2>最近任务</h2><a class="btn ghost" href="/tasks">查看全部</a></div>
          <div class="table-wrap"><table><thead><tr><th>任务号</th><th>状态</th><th>成功/总数</th><th>创建时间</th></tr></thead><tbody id="recentTasks"></tbody></table></div>
        </section>
        <section class="card">
          <div class="toolbar"><h2>快捷入口</h2></div>
          <div class="grid">
            <a class="btn" href="/sync">开始同步镜像</a>
            <a class="btn green" href="/registries">添加目标仓库</a>
            <a class="btn ghost" href="/images">查看我的镜像</a>
          </div>
        </section>
      </div>
    `;
    const [registries, tasks, images] = await Promise.all([
      api('/registries'),
      api('/sync-tasks?page=1&page_size=5'),
      api('/my-images?page=1&page_size=5')
    ]);
    $('#registryCount').textContent = registries.length;
    $('#taskCount').textContent = tasks.pagination.total;
    $('#imageCount').textContent = images.pagination.total;
    $('#recentTasks').innerHTML = tasks.items.length
      ? tasks.items.map((item) => `
          <tr>
            <td><a href="/task-detail?id=${item.id}">${escapeHtml(item.task_no)}</a></td>
            <td>${badge(item.status)}</td>
            <td>${item.success_count}/${item.total_count}</td>
            <td>${formatDate(item.created_at)}</td>
          </tr>
        `).join('')
      : `<tr><td colspan="4" class="muted">暂无同步任务</td></tr>`;
  }

  async function initRegistries() {
    shell('registries', '我的仓库', '绑定 Harbor、阿里云 ACR 或腾讯云 TCR，并测试推送权限');
    $('#app').innerHTML = `
      <div class="grid two">
        <section class="card">
          <h2 id="registryFormTitle">新增仓库</h2>
          <form class="form" id="registryForm">
            <input type="hidden" name="id">
            <div class="row">
              <input name="name" placeholder="仓库名称" required>
              <select name="registry_type" required>
                <option value="harbor">Harbor</option>
                <option value="acr">阿里云 ACR</option>
                <option value="tcr">腾讯云 TCR</option>
              </select>
            </div>
            <input name="registry_host" placeholder="Registry 地址，例如 registry.cn-hangzhou.aliyuncs.com" required>
            <div class="row">
              <input name="region" placeholder="地域，例如 cn-hangzhou">
              <input name="namespace_name" placeholder="命名空间/项目" required>
            </div>
            <div class="row">
              <input name="username" placeholder="用户名 / Robot 账号" required>
              <input name="secret" type="password" placeholder="密码 / Token（编辑时可留空）">
            </div>
            <input name="remark" placeholder="备注">
            <label><input name="is_default" type="checkbox"> 设为默认仓库</label>
            <div class="actions">
              <button class="btn" type="submit">保存仓库</button>
              <button class="btn ghost" type="button" id="resetRegistryForm">清空</button>
            </div>
          </form>
        </section>
        <section class="card">
          <div class="toolbar"><h2>仓库列表</h2><button class="btn ghost" id="reloadRegistries">刷新</button></div>
          <div class="table-wrap"><table><thead><tr><th>名称</th><th>类型</th><th>地址</th><th>状态</th><th>操作</th></tr></thead><tbody id="registryRows"></tbody></table></div>
        </section>
      </div>
    `;
    $('#registryForm').addEventListener('submit', saveRegistry);
    $('#resetRegistryForm').addEventListener('click', resetRegistryForm);
    $('#reloadRegistries').addEventListener('click', loadRegistries);
    await loadRegistries();
  }

  async function loadRegistries() {
    const rows = await api('/registries');
    $('#registryRows').innerHTML = rows.length ? rows.map((item) => `
      <tr>
        <td>${escapeHtml(item.name)} ${item.is_default ? '<span class="badge success">默认</span>' : ''}</td>
        <td>${escapeHtml(item.registry_type)}</td>
        <td>${escapeHtml(item.registry_host)}/${escapeHtml(item.namespace_name)}</td>
        <td>${badge(item.last_test_status || item.status)}</td>
        <td>
          <div class="actions">
            <button class="btn ghost" data-edit="${item.id}">编辑</button>
            <button class="btn ghost" data-test="${item.id}">测试</button>
            <button class="btn danger" data-delete="${item.id}">删除</button>
          </div>
        </td>
      </tr>
    `).join('') : `<tr><td colspan="5" class="muted">暂无仓库，请先新增一个目标仓库</td></tr>`;

    document.querySelectorAll('[data-edit]').forEach((button) => {
      button.addEventListener('click', () => fillRegistryForm(rows.find((row) => row.id === Number(button.dataset.edit))));
    });
    document.querySelectorAll('[data-test]').forEach((button) => {
      button.addEventListener('click', async () => {
        try {
          const result = await api(`/registries/${button.dataset.test}/test`, { method: 'POST' });
          toast(`测试结果：${result.status} / ${result.code}`);
          await loadRegistries();
        } catch (error) {
          toast(error.message);
        }
      });
    });
    document.querySelectorAll('[data-delete]').forEach((button) => {
      button.addEventListener('click', async () => {
        if (!confirm('确定删除这个仓库配置吗？历史任务快照仍会保留。')) return;
        try {
          await api(`/registries/${button.dataset.delete}`, { method: 'DELETE' });
          toast('仓库已删除');
          await loadRegistries();
        } catch (error) {
          toast(error.message);
        }
      });
    });
  }

  function fillRegistryForm(item) {
    const form = $('#registryForm');
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
    $('#registryFormTitle').textContent = '编辑仓库';
  }

  function resetRegistryForm() {
    $('#registryForm').reset();
    $('#registryForm').elements.id.value = '';
    $('#registryFormTitle').textContent = '新增仓库';
  }

  async function saveRegistry(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    data.is_default = form.is_default.checked;
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
    shell('sync', '镜像同步', '输入 DockerHub 公开镜像，同步到你绑定的国内仓库');
    $('#app').innerHTML = `
      <div class="grid two">
        <section class="card">
          <h2>创建同步任务</h2>
          <form class="form" id="syncForm">
            <select name="registry_account_id" id="registrySelect" required></select>
            <textarea name="images" placeholder="每行一个镜像，例如：&#10;nginx:1.25&#10;redis:7&#10;mysql:8.0" required></textarea>
            <label><input type="checkbox" name="overwrite_on_exists" checked> 目标 Tag 已存在时覆盖</label>
            <div class="actions">
              <button class="btn" type="submit">同步到我的仓库</button>
              <button class="btn ghost" type="button" id="fillExamples">填充示例</button>
            </div>
          </form>
        </section>
        <section class="card">
          <div class="toolbar"><h2>最近同步</h2><a class="btn ghost" href="/tasks">查看记录</a></div>
          <div class="table-wrap"><table><thead><tr><th>任务号</th><th>状态</th><th>结果</th></tr></thead><tbody id="recentSyncRows"></tbody></table></div>
        </section>
      </div>
    `;
    const registries = await api('/registries');
    $('#registrySelect').innerHTML = registries.length
      ? registries.map((item) => `<option value="${item.id}" ${item.is_default ? 'selected' : ''}>${escapeHtml(item.name)} - ${escapeHtml(item.registry_host)}/${escapeHtml(item.namespace_name)}</option>`).join('')
      : '<option value="">请先添加仓库</option>';
    $('#fillExamples').addEventListener('click', () => {
      $('#syncForm').images.value = 'nginx:1.25\nredis:7\nmysql:8.0';
    });
    const initialImage = new URLSearchParams(location.search).get('image');
    if (initialImage) {
      $('#syncForm').images.value = decodeURIComponent(initialImage);
    }
    $('#syncForm').addEventListener('submit', async (event) => {
      event.preventDefault();
      const form = event.currentTarget;
      const images = form.images.value.split('\n').map((line) => line.trim()).filter(Boolean);
      try {
        const task = await api('/sync-tasks', {
          method: 'POST',
          body: {
            registry_account_id: Number(form.registry_account_id.value),
            overwrite_on_exists: form.overwrite_on_exists.checked,
            images
          }
        });
        toast('同步任务已创建');
        location.href = `/task-detail?id=${task.task_id}`;
      } catch (error) {
        toast(error.message);
      }
    });
    await loadRecentSync();
  }

  async function loadRecentSync() {
    const tasks = await api('/sync-tasks?page=1&page_size=8');
    $('#recentSyncRows').innerHTML = tasks.items.length ? tasks.items.map((item) => `
      <tr>
        <td><a href="/task-detail?id=${item.id}">${escapeHtml(item.task_no)}</a></td>
        <td>${badge(item.status)}</td>
        <td>${item.success_count}/${item.total_count}</td>
      </tr>
    `).join('') : `<tr><td colspan="3" class="muted">暂无任务</td></tr>`;
  }

  async function initTasks() {
    shell('tasks', '同步记录', '查询所有同步任务，支持取消、重试和查看详情');
    $('#app').innerHTML = `
      <section class="card">
        <div class="toolbar">
          <div class="actions">
            <input id="taskKeyword" placeholder="搜索任务号或镜像">
            <select id="taskStatus">
              <option value="">全部状态</option>
              <option value="queued">queued</option>
              <option value="running">running</option>
              <option value="success">success</option>
              <option value="failed">failed</option>
              <option value="canceled">canceled</option>
            </select>
          </div>
          <button class="btn ghost" id="searchTasks">搜索</button>
        </div>
        <div class="table-wrap"><table><thead><tr><th>任务号</th><th>仓库</th><th>状态</th><th>成功/失败/总数</th><th>时间</th><th>操作</th></tr></thead><tbody id="taskRows"></tbody></table></div>
      </section>
    `;
    $('#searchTasks').addEventListener('click', loadTasks);
    await loadTasks();
  }

  async function loadTasks() {
    const params = new URLSearchParams({ page: '1', page_size: '15' });
    if ($('#taskKeyword').value) params.set('keyword', $('#taskKeyword').value);
    if ($('#taskStatus').value) params.set('status', $('#taskStatus').value);
    const tasks = await api(`/sync-tasks?${params.toString()}`);
    $('#taskRows').innerHTML = tasks.items.length ? tasks.items.map((item) => `
      <tr>
        <td><a href="/task-detail?id=${item.id}">${escapeHtml(item.task_no)}</a></td>
        <td>${escapeHtml(item.registry_name || item.registry_host_snapshot || '-')}</td>
        <td>${badge(item.status)}</td>
        <td>${item.success_count}/${item.failed_count}/${item.total_count}</td>
        <td>${formatDate(item.created_at)}</td>
        <td>
          <div class="actions">
            <a class="btn ghost" href="/task-detail?id=${item.id}">详情</a>
            <button class="btn ghost" data-retry="${item.id}">重试</button>
            <button class="btn danger" data-cancel="${item.id}">取消</button>
          </div>
        </td>
      </tr>
    `).join('') : `<tr><td colspan="6" class="muted">暂无同步记录</td></tr>`;
    document.querySelectorAll('[data-retry]').forEach((button) => button.addEventListener('click', () => mutateTask(button.dataset.retry, 'retry')));
    document.querySelectorAll('[data-cancel]').forEach((button) => button.addEventListener('click', () => mutateTask(button.dataset.cancel, 'cancel')));
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
    shell('tasks', '任务详情', '查看任务生命周期、镜像明细和执行日志');
    const id = new URLSearchParams(location.search).get('id');
    $('#app').innerHTML = `<section class="card" id="taskDetailCard">加载中...</section>`;
    try {
      const detail = await api(`/sync-tasks/${id}`);
      const itemRows = detail.items.map((item) => `
        <tr>
          <td>${escapeHtml(item.resolved_source_ref)}</td>
          <td>${escapeHtml(item.resolved_target_ref)}</td>
          <td>${badge(item.status)}</td>
          <td>${escapeHtml(item.error_message || '-')}</td>
        </tr>
      `).join('');
      $('#taskDetailCard').innerHTML = `
        <div class="toolbar">
          <div>
            <h2>${escapeHtml(detail.task.task_no)}</h2>
            <p class="muted">${escapeHtml(detail.task.registry_host_snapshot)}/${escapeHtml(detail.task.namespace_snapshot)}</p>
          </div>
          <div class="actions">
            ${badge(detail.task.status)}
            <button class="btn ghost" id="refreshDetail">刷新</button>
          </div>
        </div>
        <div class="grid three">
          <div class="notice">总数：${detail.task.total_count}</div>
          <div class="notice">成功：${detail.task.success_count}</div>
          <div class="notice">失败：${detail.task.failed_count}</div>
        </div>
        <h3 style="margin-top:20px">镜像明细</h3>
        <div class="table-wrap"><table><thead><tr><th>源镜像</th><th>目标镜像</th><th>状态</th><th>错误</th></tr></thead><tbody>${itemRows}</tbody></table></div>
        <h3 style="margin-top:20px">执行日志</h3>
        <div id="taskLogs" class="notice">选择第一条明细加载日志...</div>
      `;
      $('#refreshDetail').addEventListener('click', () => location.reload());
      if (detail.items[0]) {
        await loadTaskLogs(detail.items[0].id);
      }
    } catch (error) {
      $('#taskDetailCard').innerHTML = `<div class="notice">${escapeHtml(error.message)}</div>`;
    }
  }

  async function loadTaskLogs(itemId) {
    try {
      const data = await api(`/sync-tasks/items/${itemId}/logs`);
      $('#taskLogs').innerHTML = data.logs.length
        ? data.logs.map((log) => `<div>[${formatDate(log.created_at)}] ${escapeHtml(log.stage)} ${escapeHtml(log.level)} - ${escapeHtml(log.message)}</div>`).join('')
        : '暂无日志';
    } catch (error) {
      $('#taskLogs').textContent = error.message;
    }
  }

  async function initImages() {
    shell('images', '我的镜像', '查看已成功同步到国内仓库的镜像，并复制拉取命令');
    $('#app').innerHTML = `
      <section class="card">
        <div class="toolbar">
          <input id="imageKeyword" placeholder="搜索镜像、来源或目标地址">
          <button class="btn ghost" id="searchImages">搜索</button>
        </div>
        <div class="table-wrap"><table><thead><tr><th>镜像</th><th>来源</th><th>目标地址</th><th>最近同步</th><th>操作</th></tr></thead><tbody id="imageRows"></tbody></table></div>
      </section>
    `;
    $('#searchImages').addEventListener('click', loadImages);
    await loadImages();
  }

  async function loadImages() {
    const params = new URLSearchParams({ page: '1', page_size: '15' });
    if ($('#imageKeyword').value) params.set('keyword', $('#imageKeyword').value);
    const images = await api(`/my-images?${params.toString()}`);
    $('#imageRows').innerHTML = images.items.length ? images.items.map((item) => `
      <tr>
        <td>${escapeHtml(item.target_repo)}:${escapeHtml(item.target_tag)}</td>
        <td>${escapeHtml(item.source_ref)}</td>
        <td>${escapeHtml(item.target_ref)}</td>
        <td>${formatDate(item.last_synced_at)}</td>
        <td>
          <div class="actions">
            <button class="btn ghost" data-copy="${escapeHtml(item.target_ref)}">复制 docker</button>
            <button class="btn ghost" data-tool="nerdctl" data-copy="${escapeHtml(item.target_ref)}">nerdctl</button>
            <button class="btn ghost" data-resync="${item.id}">重新同步</button>
          </div>
        </td>
      </tr>
    `).join('') : `<tr><td colspan="5" class="muted">暂无已成功同步的镜像</td></tr>`;
    document.querySelectorAll('[data-copy]').forEach((button) => {
      button.addEventListener('click', () => copyText(pullCommand(button.dataset.copy, button.dataset.tool || 'docker')));
    });
    document.querySelectorAll('[data-resync]').forEach((button) => {
      button.addEventListener('click', async () => {
        try {
          const task = await api(`/my-images/${button.dataset.resync}/resync`, { method: 'POST' });
          toast('已创建重新同步任务');
          location.href = `/task-detail?id=${task.task_id}`;
        } catch (error) {
          toast(error.message);
        }
      });
    });
  }

  function initLanding() {
    const input = $('#heroImage');
    $('#startSync').addEventListener('click', () => {
      const value = encodeURIComponent(input.value.trim());
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

      if (page === 'login') await initLogin();
      if (page === 'landing') initLanding();
      if (page === 'dashboard') await initDashboard();
      if (page === 'registries') await initRegistries();
      if (page === 'sync') await initSync();
      if (page === 'tasks') await initTasks();
      if (page === 'task-detail') await initTaskDetail();
      if (page === 'images') await initImages();
    } catch (error) {
      toast(error.message);
    }
  }

  document.addEventListener('DOMContentLoaded', bootstrap);
})();
