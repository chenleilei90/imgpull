const express = require('express');
const Database = require('better-sqlite3');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
let mysql = null;

try {
    mysql = require('mysql2/promise');
} catch (error) {
    mysql = null;
}

const app = express();
const port = process.env.PORT || 3001;
const configDir = path.join(__dirname, 'config');
const appConfigPath = path.join(configDir, 'app.config.json');
const TABLES = {
    projects: 'user_projects',
    projectImages: 'user_project_images'
};

function ensureDirectory(targetPath) {
    if (!fs.existsSync(targetPath)) {
        fs.mkdirSync(targetPath, { recursive: true });
    }
}

function readAppConfig() {
    if (!fs.existsSync(appConfigPath)) {
        return null;
    }

    try {
        const content = fs.readFileSync(appConfigPath, 'utf8');
        return JSON.parse(content);
    } catch (error) {
        console.warn('[install] 安装配置解析失败:', error.message);
        return null;
    }
}

function writeAppConfig(config) {
    ensureDirectory(configDir);
    fs.writeFileSync(appConfigPath, `${JSON.stringify(config, null, 2)}\n`, 'utf8');
}

function tableExists(tableName) {
    const row = db.prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name = ?").get(tableName);
    return !!row;
}

function getSqlitePath(config) {
    const sqlitePath = config?.database?.sqlitePath;
    if (sqlitePath && String(sqlitePath).trim()) {
        return path.isAbsolute(sqlitePath) ? sqlitePath : path.join(__dirname, String(sqlitePath).trim());
    }
    return path.join(__dirname, 'kubeaszpull.db');
}

let appConfig = readAppConfig();
const db = new Database(getSqlitePath(appConfig));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

function isInstalled() {
    return !!appConfig?.installedAt;
}

function getHarborConfigFromSettings() {
    return {
        enabled: getSetting('harbor_enabled', '0') === '1',
        baseUrl: getSetting('harbor_base_url', ''),
        username: getSetting('harbor_username', ''),
        password: getSetting('harbor_password', ''),
        cacheProjectName: getSetting('cache_project_name', defaultSettings.cache_project_name)
    };
}

async function testMySqlConnection(config) {
    if (!mysql) {
        throw new Error('未安装 mysql2 依赖，当前环境无法测试 MySQL 连接');
    }

    const pool = mysql.createPool({
        host: config.host,
        port: Number(config.port || 3306),
        user: config.user,
        password: config.password,
        database: config.database,
        waitForConnections: true,
        connectionLimit: 1
    });

    try {
        const [rows] = await pool.query('SELECT VERSION() AS version');
        return rows && rows[0] ? rows[0].version : 'unknown';
    } finally {
        await pool.end();
    }
}

async function testHarborConnection(config) {
    const baseUrl = String(config.baseUrl || '').trim().replace(/\/+$/, '');
    if (!baseUrl) {
        throw new Error('请填写 Harbor 地址');
    }

    const headers = { Accept: 'application/json' };
    if (config.username) {
        headers.Authorization = `Basic ${Buffer.from(`${config.username}:${config.password || ''}`).toString('base64')}`;
    }

    const response = await fetch(`${baseUrl}/api/v2.0/projects?page=1&page_size=1`, {
        method: 'GET',
        headers
    });

    if (!response.ok) {
        throw new Error(`Harbor 请求失败，状态码 ${response.status}`);
    }

    return true;
}

app.use((req, res, next) => {
    if (isInstalled()) {
        return next();
    }

    const installSafePaths = [
        '/install',
        '/api/install/status',
        '/api/install/test-db',
        '/api/install/test-harbor',
        '/api/install/submit'
    ];

    if (installSafePaths.includes(req.path)) {
        return next();
    }

    return res.redirect('/install');
});

app.use((req, res, next) => {
    if (req.url.startsWith('/api/') && !req.url.startsWith('/api/v2/') && !req.url.startsWith('/api/install/')) {
        req.url = req.url.replace(/^\/api\//, '/api/v2/');
    }
    next();
});

app.use(express.static(path.join(__dirname, 'public')));

db.pragma('foreign_keys = ON');

if (tableExists('user_projects') && !tableExists(TABLES.projects)) {
    db.exec(`ALTER TABLE user_projects RENAME TO ${TABLES.projects}`);
}

if (tableExists('user_project_images') && !tableExists(TABLES.projectImages)) {
    db.exec(`ALTER TABLE user_project_images RENAME TO ${TABLES.projectImages}`);
}

db.exec(`
CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT UNIQUE NOT NULL,
    value TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS access_codes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT UNIQUE NOT NULL,
    email TEXT,
    amount DECIMAL(10,2) DEFAULT 2.00,
    status TEXT DEFAULT 'pending',
    expire_days INTEGER DEFAULT 15,
    expire_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_used DATETIME
);

CREATE TABLE IF NOT EXISTS catalog_images (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    source_type TEXT NOT NULL DEFAULT 'local',
    registry TEXT NOT NULL,
    namespace TEXT NOT NULL,
    repository TEXT NOT NULL,
    tag TEXT NOT NULL DEFAULT 'latest',
    digest TEXT,
    display_name TEXT NOT NULL,
    description TEXT DEFAULT '',
    local_available INTEGER NOT NULL DEFAULT 0,
    local_registry TEXT,
    local_namespace TEXT,
    local_repository TEXT,
    local_tag TEXT,
    source_full_name TEXT NOT NULL UNIQUE,
    local_full_name TEXT,
    last_requested_at DATETIME,
    cache_last_seen_at DATETIME,
    cache_expires_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    access_code_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(access_code_id, slug),
    FOREIGN KEY(access_code_id) REFERENCES access_codes(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS user_project_images (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL,
    catalog_image_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(project_id, catalog_image_id),
    FOREIGN KEY(project_id) REFERENCES user_projects(id) ON DELETE CASCADE,
    FOREIGN KEY(catalog_image_id) REFERENCES catalog_images(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS distribution_tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    access_code_id INTEGER NOT NULL,
    user_project_id INTEGER,
    catalog_image_id INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'queued',
    source_strategy TEXT NOT NULL DEFAULT 'cache-first',
    trigger_source TEXT NOT NULL DEFAULT 'manual',
    cache_hit INTEGER NOT NULL DEFAULT 0,
    retention_days_snapshot INTEGER NOT NULL DEFAULT -1,
    target_namespace TEXT NOT NULL,
    target_full_name TEXT NOT NULL,
    upstream_full_name TEXT NOT NULL,
    cache_full_name TEXT,
    last_error TEXT,
    requested_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    started_at DATETIME,
    finished_at DATETIME,
    FOREIGN KEY(access_code_id) REFERENCES access_codes(id) ON DELETE CASCADE,
    FOREIGN KEY(user_project_id) REFERENCES user_projects(id) ON DELETE SET NULL,
    FOREIGN KEY(catalog_image_id) REFERENCES catalog_images(id) ON DELETE CASCADE
);
`);

function ensureColumn(tableName, columnName, definition) {
    const columns = db.prepare(`PRAGMA table_info(${tableName})`).all();
    const exists = columns.some((column) => column.name === columnName);

    if (!exists) {
        db.exec(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${definition}`);
    }
}

ensureColumn('access_codes', 'harbor_project_name', 'TEXT');
ensureColumn('access_codes', 'harbor_namespace_type', "TEXT DEFAULT 'project'");
ensureColumn('access_codes', 'deleted_at', 'DATETIME');
ensureColumn('access_codes', 'purge_after', 'DATETIME');
ensureColumn('catalog_images', 'digest', 'TEXT');
ensureColumn('catalog_images', 'last_requested_at', 'DATETIME');
ensureColumn('catalog_images', 'cache_last_seen_at', 'DATETIME');
ensureColumn('catalog_images', 'cache_expires_at', 'DATETIME');

const defaultSettings = {
    site_title: 'ImgPull',
    site_subtitle: '海外容器镜像国内获取与分发平台',
    site_keywords: 'docker, harbor, image proxy, dockerhub',
    site_description: '平台优先命中 Harbor 默认缓存仓库，再分发到用户专属命名空间。',
    footer_links: 'Docker Hub|https://hub.docker.com',
    icp_beian: '',
    gongan_beian: '',
    harbor_domain: 'harbor.wh02.com',
    harbor_base_url: '',
    harbor_username: '',
    harbor_password: '',
    harbor_enabled: '0',
    cache_project_name: 'cache',
    cache_retention_days: '-1',
    default_user_repo_visibility: 'private',
    dockerhub_search_enabled: '1',
    default_access_code_days: '30'
};

Object.entries(defaultSettings).forEach(([key, value]) => {
    db.prepare(`
        INSERT INTO settings (key, value, updated_at)
        VALUES (?, ?, CURRENT_TIMESTAMP)
        ON CONFLICT(key) DO NOTHING
    `).run(key, value);
});

function normalizeNamespace(code) {
    return String(code || '')
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '') || 'user-space';
}

function slugify(value) {
    return String(value || '')
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '') || 'project';
}

function getNowSql() {
    return new Date().toISOString().slice(0, 19).replace('T', ' ');
}

function plusDays(days) {
    const value = new Date();
    value.setDate(value.getDate() + days);
    return value.toISOString().slice(0, 19).replace('T', ' ');
}

function generateAccessCode(length = 8) {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let result = '';
    for (let i = 0; i < length; i += 1) {
        result += chars[Math.floor(Math.random() * chars.length)];
    }
    return result;
}

function getSetting(key, fallbackValue) {
    const row = db.prepare('SELECT value FROM settings WHERE key = ?').get(key);
    return row && row.value !== null && row.value !== undefined ? row.value : fallbackValue;
}

function getDefaultHarborDomain() {
    return getSetting('harbor_domain', defaultSettings.harbor_domain);
}

function getCacheProjectName() {
    return getSetting('cache_project_name', defaultSettings.cache_project_name);
}

function getCacheRetentionDays() {
    const raw = Number(getSetting('cache_retention_days', defaultSettings.cache_retention_days));
    return Number.isFinite(raw) ? raw : -1;
}

function getDefaultAccessCodeDays() {
    const raw = Number(getSetting('default_access_code_days', defaultSettings.default_access_code_days));
    if (!Number.isFinite(raw)) {
        return 30;
    }
    return Math.max(-1, Math.min(raw, 100000));
}

function computeCacheExpiresAt() {
    const retentionDays = getCacheRetentionDays();
    if (retentionDays < 0) {
        return null;
    }
    if (retentionDays === 0) {
        return getNowSql();
    }
    return plusDays(retentionDays);
}

function getAccessCodeOrThrow(code) {
    if (!code) {
        return { status: 400, payload: { error: '请输入串码' } };
    }

    const codeRow = db.prepare('SELECT * FROM access_codes WHERE code = ?').get(code);
    if (!codeRow) {
        return { status: 401, payload: { error: '串码无效' } };
    }

    if (codeRow.status === 'deleted') {
        return {
            status: 403,
            payload: {
                error: '该串码对应的用户已删除，当前仍在保留期内',
                purge_after: codeRow.purge_after || null
            }
        };
    }

    if (codeRow.status !== 'active') {
        return { status: 401, payload: { error: '串码当前不可用' } };
    }

    const now = getNowSql();
    if (codeRow.expire_at && now > codeRow.expire_at) {
        return { status: 401, payload: { error: '串码已过期' } };
    }

    if (!codeRow.harbor_project_name) {
        const namespace = normalizeNamespace(codeRow.code);
        db.prepare('UPDATE access_codes SET harbor_project_name = ? WHERE id = ?').run(namespace, codeRow.id);
        codeRow.harbor_project_name = namespace;
    }

    db.prepare('UPDATE access_codes SET last_used = CURRENT_TIMESTAMP WHERE id = ?').run(codeRow.id);

    return { status: 200, payload: codeRow };
}

function buildLocalCacheName(image) {
    const harborDomain = getDefaultHarborDomain();
    const cacheProject = getCacheProjectName();
    const tag = image.tag || 'latest';
    return `${harborDomain}/${cacheProject}/${image.repository}:${tag}`;
}

function buildUserImageName(catalogImage, accessCode) {
    const harborDomain = getDefaultHarborDomain();
    const namespace = accessCode.harbor_project_name || normalizeNamespace(accessCode.code);
    const tag = catalogImage.tag || 'latest';
    return `${harborDomain}/${namespace}/${catalogImage.repository}:${tag}`;
}

function upsertCatalogImage(image) {
    const normalized = {
        source_type: image.source_type || 'dockerhub',
        registry: image.registry,
        namespace: image.namespace,
        repository: image.repository,
        tag: image.tag || 'latest',
        digest: image.digest || null,
        display_name: image.display_name || `${image.namespace}/${image.repository}:${image.tag || 'latest'}`,
        description: image.description || '',
        local_available: image.local_available ? 1 : 0,
        local_registry: image.local_registry || null,
        local_namespace: image.local_namespace || null,
        local_repository: image.local_repository || null,
        local_tag: image.local_tag || null,
        source_full_name: image.source_full_name,
        local_full_name: image.local_full_name || null,
        last_requested_at: image.last_requested_at || null,
        cache_last_seen_at: image.cache_last_seen_at || null,
        cache_expires_at: image.cache_expires_at || null
    };

    const stmt = db.prepare(`
        INSERT INTO catalog_images (
            source_type, registry, namespace, repository, tag, digest, display_name,
            description, local_available, local_registry, local_namespace,
            local_repository, local_tag, source_full_name, local_full_name,
            last_requested_at, cache_last_seen_at, cache_expires_at, updated_at
        ) VALUES (
            @source_type, @registry, @namespace, @repository, @tag, @digest, @display_name,
            @description, @local_available, @local_registry, @local_namespace,
            @local_repository, @local_tag, @source_full_name, @local_full_name,
            @last_requested_at, @cache_last_seen_at, @cache_expires_at, CURRENT_TIMESTAMP
        )
        ON CONFLICT(source_full_name) DO UPDATE SET
            source_type = excluded.source_type,
            registry = excluded.registry,
            namespace = excluded.namespace,
            repository = excluded.repository,
            tag = excluded.tag,
            digest = excluded.digest,
            display_name = excluded.display_name,
            description = excluded.description,
            local_available = excluded.local_available,
            local_registry = excluded.local_registry,
            local_namespace = excluded.local_namespace,
            local_repository = excluded.local_repository,
            local_tag = excluded.local_tag,
            local_full_name = excluded.local_full_name,
            last_requested_at = COALESCE(excluded.last_requested_at, catalog_images.last_requested_at),
            cache_last_seen_at = COALESCE(excluded.cache_last_seen_at, catalog_images.cache_last_seen_at),
            cache_expires_at = excluded.cache_expires_at,
            updated_at = CURRENT_TIMESTAMP
    `);

    stmt.run(normalized);
    return db.prepare('SELECT * FROM catalog_images WHERE source_full_name = ?').get(normalized.source_full_name);
}

function queueDistributionTask(catalogImage, accessCode, userProjectId, triggerSource) {
    const targetFullName = buildUserImageName(catalogImage, accessCode);
    const cacheFullName = catalogImage.local_available ? (catalogImage.local_full_name || buildLocalCacheName(catalogImage)) : buildLocalCacheName(catalogImage);
    const retentionDays = getCacheRetentionDays();

    const result = db.prepare(`
        INSERT INTO distribution_tasks (
            access_code_id, user_project_id, catalog_image_id, status, source_strategy,
            trigger_source, cache_hit, retention_days_snapshot, target_namespace,
            target_full_name, upstream_full_name, cache_full_name
        ) VALUES (?, ?, ?, 'queued', 'cache-first', ?, ?, ?, ?, ?, ?, ?)
    `).run(
        accessCode.id,
        userProjectId || null,
        catalogImage.id,
        triggerSource || 'manual',
        catalogImage.local_available ? 1 : 0,
        retentionDays,
        accessCode.harbor_project_name,
        targetFullName,
        catalogImage.source_full_name,
        cacheFullName
    );

    return db.prepare('SELECT * FROM distribution_tasks WHERE id = ?').get(result.lastInsertRowid);
}

function ensureDefaultProject(accessCodeId) {
    const existing = db.prepare(`
        SELECT *
        FROM user_projects
        WHERE access_code_id = ? AND slug = 'default'
        LIMIT 1
    `).get(accessCodeId);

    if (existing) {
        return existing;
    }

    const result = db.prepare(`
        INSERT INTO user_projects (access_code_id, name, slug)
        VALUES (?, ?, ?)
    `).run(accessCodeId, '默认项目', 'default');

    return db.prepare('SELECT * FROM user_projects WHERE id = ?').get(result.lastInsertRowid);
}

function setImageProjectsForAccessCode(accessCode, catalogImageId, projectIds) {
    const normalizedProjectIds = Array.from(new Set((projectIds || []).map((value) => Number(value)).filter((value) => Number.isInteger(value) && value > 0)));
    const ownedProjects = normalizedProjectIds.length
        ? db.prepare(`
            SELECT id
            FROM user_projects
            WHERE access_code_id = ?
              AND id IN (${normalizedProjectIds.map(() => '?').join(',')})
        `).all(accessCode.id, ...normalizedProjectIds).map((row) => row.id)
        : [];

    const finalProjectIds = ownedProjects.length ? ownedProjects : [ensureDefaultProject(accessCode.id).id];

    const tx = db.transaction(() => {
        db.prepare(`
            DELETE FROM user_project_images
            WHERE catalog_image_id = ?
              AND project_id IN (
                  SELECT id FROM user_projects WHERE access_code_id = ?
              )
        `).run(catalogImageId, accessCode.id);

        const insertStmt = db.prepare(`
            INSERT OR IGNORE INTO user_project_images (project_id, catalog_image_id)
            VALUES (?, ?)
        `);

        finalProjectIds.forEach((projectId) => {
            insertStmt.run(projectId, catalogImageId);
        });
    });

    tx();
    return db.prepare(`
        SELECT id, name, slug
        FROM user_projects
        WHERE id IN (${finalProjectIds.map(() => '?').join(',')})
        ORDER BY CASE WHEN slug = 'default' THEN 0 ELSE 1 END, name ASC
    `).all(...finalProjectIds);
}

function mapImageProjectsForAccessCode(accessCodeId) {
    const rows = db.prepare(`
        SELECT pi.catalog_image_id, p.id AS project_id, p.name, p.slug
        FROM user_project_images pi
        JOIN user_projects p ON p.id = pi.project_id
        WHERE p.access_code_id = ?
        ORDER BY CASE WHEN p.slug = 'default' THEN 0 ELSE 1 END, p.name ASC
    `).all(accessCodeId);

    return rows.reduce((acc, row) => {
        if (!acc[row.catalog_image_id]) {
            acc[row.catalog_image_id] = [];
        }
        acc[row.catalog_image_id].push({
            id: row.project_id,
            name: row.name,
            slug: row.slug
        });
        return acc;
    }, {});
}

function serializeTask(task) {
    if (!task) {
        return null;
    }

    return {
        id: task.id,
        status: task.status,
        sourceStrategy: task.source_strategy,
        triggerSource: task.trigger_source,
        cacheHit: !!task.cache_hit,
        retentionDays: task.retention_days_snapshot,
        targetNamespace: task.target_namespace,
        targetFullName: task.target_full_name,
        upstreamFullName: task.upstream_full_name,
        cacheFullName: task.cache_full_name,
        requestedAt: task.requested_at,
        startedAt: task.started_at || null,
        finishedAt: task.finished_at || null,
        lastError: task.last_error || null
    };
}

function serializeCatalogImage(row, accessCode, taskOverride) {
    const localAvailable = !!row.local_available;
    const latestTask = taskOverride || null;

    return {
        id: row.id,
        sourceType: row.source_type,
        registry: row.registry,
        namespace: row.namespace,
        repository: row.repository,
        tag: row.tag,
        digest: row.digest || null,
        displayName: row.display_name,
        description: row.description || '',
        sourceFullName: row.source_full_name,
        localAvailable,
        localFullName: row.local_full_name || (localAvailable ? buildLocalCacheName(row) : null),
        cacheExpiresAt: row.cache_expires_at || null,
        cacheLastSeenAt: row.cache_last_seen_at || null,
        lastRequestedAt: row.last_requested_at || null,
        targetFullName: accessCode ? buildUserImageName(row, accessCode) : null,
        task: serializeTask(latestTask)
    };
}

function getProjectImageTask(projectId, catalogImageId) {
    return db.prepare(`
        SELECT *
        FROM distribution_tasks
        WHERE user_project_id = ? AND catalog_image_id = ?
        ORDER BY requested_at DESC, id DESC
        LIMIT 1
    `).get(projectId, catalogImageId);
}

function buildMyImagesForAccessCode(accessCode) {
    const projectMap = mapImageProjectsForAccessCode(accessCode.id);
    const rows = db.prepare(`
        SELECT DISTINCT c.*
        FROM catalog_images c
        JOIN user_project_images pi ON pi.catalog_image_id = c.id
        JOIN user_projects p ON p.id = pi.project_id
        WHERE p.access_code_id = ?
        ORDER BY c.updated_at DESC, c.id DESC
    `).all(accessCode.id);

    return rows.map((row) => {
        const latestTask = db.prepare(`
            SELECT *
            FROM distribution_tasks
            WHERE access_code_id = ? AND catalog_image_id = ?
            ORDER BY requested_at DESC, id DESC
            LIMIT 1
        `).get(accessCode.id, row.id);

        const projects = projectMap[row.id] || [];
        return {
            ...serializeCatalogImage(row, accessCode, latestTask),
            projects,
            projectNames: projects.map((project) => project.name),
            delivered: latestTask ? latestTask.status === 'completed' : false
        };
    });
}

function parseImageKeyword(keyword) {
    const trimmed = String(keyword || '').trim().replace(/^\/+|\/+$/g, '');
    if (!trimmed) {
        return null;
    }

    const tagIndex = trimmed.lastIndexOf(':');
    const hasTag = tagIndex > trimmed.lastIndexOf('/');
    const withoutTag = hasTag ? trimmed.slice(0, tagIndex) : trimmed;
    const tag = hasTag ? trimmed.slice(tagIndex + 1) : '';
    const parts = withoutTag.split('/').filter(Boolean);

    if (parts.length === 0) {
        return null;
    }

    let registry = 'docker.io';
    let namespace = 'library';
    let repository = parts[parts.length - 1];

    if (parts.length >= 3 && parts[0].includes('.')) {
        registry = parts[0];
        namespace = parts.slice(1, -1).join('/');
    } else if (parts.length >= 2) {
        namespace = parts.slice(0, -1).join('/');
    }

    return {
        registry,
        namespace,
        repository,
        tag: tag || 'latest',
        sourceFullName: `${registry}/${namespace}/${repository}:${tag || 'latest'}`,
        displayName: `${namespace}/${repository}:${tag || 'latest'}`
    };
}

function runDistributionTask(taskId) {
    const task = db.prepare('SELECT * FROM distribution_tasks WHERE id = ?').get(taskId);
    if (!task) {
        return { success: false, error: '任务不存在' };
    }

    if (!['queued', 'failed'].includes(task.status)) {
        return { success: false, error: `当前状态无法执行任务：${task.status}` };
    }

    const image = db.prepare('SELECT * FROM catalog_images WHERE id = ?').get(task.catalog_image_id);
    if (!image) {
        db.prepare(`
            UPDATE distribution_tasks
            SET status = 'failed', started_at = CURRENT_TIMESTAMP, finished_at = CURRENT_TIMESTAMP, last_error = ?
            WHERE id = ?
        `).run('镜像不存在', task.id);
        return { success: false, error: '镜像不存在' };
    }

    db.prepare(`
        UPDATE distribution_tasks
        SET status = 'running', started_at = CURRENT_TIMESTAMP, last_error = NULL
        WHERE id = ?
    `).run(task.id);

    const cacheFullName = buildLocalCacheName(image);
    const cacheExpiresAt = computeCacheExpiresAt();

    db.prepare(`
        UPDATE catalog_images
        SET local_available = 1,
            local_registry = ?,
            local_namespace = ?,
            local_repository = ?,
            local_tag = ?,
            local_full_name = ?,
            cache_last_seen_at = CURRENT_TIMESTAMP,
            cache_expires_at = ?,
            last_requested_at = CURRENT_TIMESTAMP,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
    `).run(
        getDefaultHarborDomain(),
        getCacheProjectName(),
        image.repository,
        image.tag || 'latest',
        cacheFullName,
        cacheExpiresAt,
        image.id
    );

    db.prepare(`
        UPDATE distribution_tasks
        SET status = 'completed',
            cache_hit = 1,
            cache_full_name = ?,
            finished_at = CURRENT_TIMESTAMP,
            last_error = NULL
        WHERE id = ?
    `).run(cacheFullName, task.id);

    const updatedTask = db.prepare('SELECT * FROM distribution_tasks WHERE id = ?').get(task.id);
    const updatedImage = db.prepare('SELECT * FROM catalog_images WHERE id = ?').get(image.id);
    return { success: true, task: updatedTask, image: updatedImage };
}

function runQueuedTasks(limit = 10) {
    const tasks = db.prepare(`
        SELECT *
        FROM distribution_tasks
        WHERE status = 'queued'
        ORDER BY requested_at ASC, id ASC
        LIMIT ?
    `).all(limit);

    return tasks.map((task) => runDistributionTask(task.id));
}

function cleanupExpiredCache() {
    const retentionDays = getCacheRetentionDays();
    if (retentionDays < 0) {
        return { removed: 0, retentionDays, rows: [] };
    }

    const now = getNowSql();
    const rows = db.prepare(`
        SELECT *
        FROM catalog_images
        WHERE local_available = 1
          AND cache_expires_at IS NOT NULL
          AND cache_expires_at <= ?
    `).all(now);

    const removable = rows.filter((row) => {
        const runningTask = db.prepare(`
            SELECT id FROM distribution_tasks
            WHERE catalog_image_id = ? AND status IN ('queued', 'running')
            LIMIT 1
        `).get(row.id);
        return !runningTask;
    });

    const stmt = db.prepare(`
        UPDATE catalog_images
        SET local_available = 0,
            local_registry = NULL,
            local_namespace = NULL,
            local_repository = NULL,
            local_tag = NULL,
            local_full_name = NULL,
            cache_last_seen_at = NULL,
            cache_expires_at = NULL,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
    `);

    removable.forEach((row) => stmt.run(row.id));
    return { removed: removable.length, retentionDays, rows: removable };
}

app.get('/api/install/status', (req, res) => {
    res.json({
        success: true,
        installed: isInstalled(),
        databaseType: appConfig?.database?.type || 'sqlite'
    });
});

app.post('/api/install/test-db', async (req, res) => {
    const databaseType = String(req.body.databaseType || 'sqlite').toLowerCase();

    try {
        if (databaseType === 'sqlite') {
            const sqlitePath = getSqlitePath({ database: { sqlitePath: req.body.sqlitePath } });
            ensureDirectory(path.dirname(sqlitePath));
            const testDb = new Database(sqlitePath);
            testDb.pragma('journal_mode = WAL');
            testDb.close();
            return res.json({ success: true, message: `SQLite 连接成功：${sqlitePath}` });
        }

        if (databaseType === 'mysql') {
            const version = await testMySqlConnection({
                host: req.body.mysqlHost,
                port: req.body.mysqlPort,
                user: req.body.mysqlUser,
                password: req.body.mysqlPassword,
                database: req.body.mysqlDatabase
            });
            return res.json({ success: true, message: `MySQL 连接成功，版本：${version}` });
        }

        return res.status(400).json({ success: false, error: '不支持的数据库类型' });
    } catch (error) {
        return res.status(400).json({ success: false, error: error.message });
    }
});

app.post('/api/install/test-harbor', async (req, res) => {
    try {
        await testHarborConnection({
            baseUrl: req.body.harborBaseUrl,
            username: req.body.harborUsername,
            password: req.body.harborPassword
        });
        return res.json({ success: true, message: 'Harbor 连接测试成功' });
    } catch (error) {
        return res.status(400).json({ success: false, error: error.message });
    }
});

app.post('/api/install/submit', async (req, res) => {
    try {
        const siteTitle = String(req.body.siteTitle || '').trim();
        const siteSubtitle = String(req.body.siteSubtitle || '').trim();
        const adminEmail = String(req.body.adminEmail || '').trim();
        const databaseType = String(req.body.databaseType || 'sqlite').toLowerCase();
        const enableHarbor = !!req.body.enableHarbor;

        if (!siteTitle) {
            return res.status(400).json({ success: false, error: '请填写站点标题' });
        }

        if (!adminEmail) {
            return res.status(400).json({ success: false, error: '请填写管理员邮箱' });
        }

        let databaseConfig;
        if (databaseType === 'sqlite') {
            const sqlitePath = getSqlitePath({ database: { sqlitePath: req.body.sqlitePath } });
            ensureDirectory(path.dirname(sqlitePath));
            const testDb = new Database(sqlitePath);
            testDb.close();
            databaseConfig = {
                type: 'sqlite',
                sqlitePath: path.relative(__dirname, sqlitePath) || 'kubeaszpull.db'
            };
        } else if (databaseType === 'mysql') {
            await testMySqlConnection({
                host: req.body.mysqlHost,
                port: req.body.mysqlPort,
                user: req.body.mysqlUser,
                password: req.body.mysqlPassword,
                database: req.body.mysqlDatabase
            });
            databaseConfig = {
                type: 'mysql',
                host: String(req.body.mysqlHost || '').trim(),
                port: Number(req.body.mysqlPort || 3306),
                database: String(req.body.mysqlDatabase || '').trim(),
                user: String(req.body.mysqlUser || '').trim(),
                password: String(req.body.mysqlPassword || '')
            };
        } else {
            return res.status(400).json({ success: false, error: '不支持的数据库类型' });
        }

        const harborConfig = {
            enabled: enableHarbor,
            baseUrl: String(req.body.harborBaseUrl || '').trim(),
            username: String(req.body.harborUsername || '').trim(),
            password: String(req.body.harborPassword || ''),
            cacheProjectName: String(req.body.cacheProjectName || getCacheProjectName()).trim() || getCacheProjectName()
        };

        if (enableHarbor) {
            await testHarborConnection(harborConfig);
        }

        appConfig = {
            installedAt: new Date().toISOString(),
            site: {
                title: siteTitle,
                subtitle: siteSubtitle,
                adminEmail
            },
            database: databaseConfig,
            harbor: harborConfig
        };

        writeAppConfig(appConfig);

        const stmt = db.prepare(`
            INSERT INTO settings (key, value, updated_at)
            VALUES (?, ?, CURRENT_TIMESTAMP)
            ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP
        `);

        stmt.run('site_title', siteTitle);
        stmt.run('site_subtitle', siteSubtitle);
        stmt.run('harbor_enabled', enableHarbor ? '1' : '0');
        stmt.run('harbor_base_url', harborConfig.baseUrl);
        stmt.run('harbor_username', harborConfig.username);
        stmt.run('harbor_password', harborConfig.password);
        stmt.run('cache_project_name', harborConfig.cacheProjectName);

        return res.json({ success: true, installed: true });
    } catch (error) {
        return res.status(400).json({ success: false, error: error.message });
    }
});

app.get('/install', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'install.html'));
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/console', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'console.html'));
});

app.get('/deliveries', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'deliveries.html'));
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.get('/v2', (req, res) => res.redirect('/'));
app.get('/v2/console', (req, res) => res.redirect('/console'));
app.get('/v2/deliveries', (req, res) => res.redirect('/deliveries'));
app.get('/v2/admin', (req, res) => res.redirect('/admin'));

app.post('/api/v2/purchase', (req, res) => {
    const email = String(req.body.email || '').trim();
    const amount = Number(req.body.amount || 2);
    const expireDays = getDefaultAccessCodeDays();

    if (!email) {
        return res.status(400).json({ error: '请输入邮箱地址' });
    }

    let code = generateAccessCode();
    while (db.prepare('SELECT 1 FROM access_codes WHERE code = ?').get(code)) {
        code = generateAccessCode();
    }

    const expireAt = expireDays < 0 ? null : plusDays(expireDays);
    const namespace = normalizeNamespace(code);

    const result = db.prepare(`
        INSERT INTO access_codes (
            code, email, amount, status, expire_days, expire_at, harbor_project_name, harbor_namespace_type
        ) VALUES (?, ?, ?, 'active', ?, ?, ?, 'project')
    `).run(code, email, amount, expireDays, expireAt, namespace);

    ensureDefaultProject(result.lastInsertRowid);

    res.json({
        success: true,
        accessCode: code,
        email,
        expireAt,
        harborProjectName: namespace
    });
});

app.get('/api/v2/verify-code/:code', (req, res) => {
    const validation = getAccessCodeOrThrow(req.params.code);
    if (validation.status !== 200) {
        return res.status(validation.status).json(validation.payload);
    }

    const codeRow = validation.payload;
    ensureDefaultProject(codeRow.id);

    return res.json({
        success: true,
        accessCode: {
            code: codeRow.code,
            email: codeRow.email,
            expireAt: codeRow.expire_at || null,
            harborProjectName: codeRow.harbor_project_name,
            harborNamespaceType: codeRow.harbor_namespace_type || 'project',
            status: codeRow.status
        }
    });
});

app.get('/api/v2/me', (req, res) => {
    const validation = getAccessCodeOrThrow(req.query.code);
    if (validation.status !== 200) {
        return res.status(validation.status).json(validation.payload);
    }

    const codeRow = validation.payload;
    const projectCount = db.prepare('SELECT COUNT(*) AS count FROM user_projects WHERE access_code_id = ?').get(codeRow.id).count;
    const taskSummary = db.prepare(`
        SELECT
            SUM(CASE WHEN status = 'queued' THEN 1 ELSE 0 END) AS queued_count,
            SUM(CASE WHEN status = 'running' THEN 1 ELSE 0 END) AS running_count,
            SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) AS completed_count,
            SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) AS failed_count
        FROM distribution_tasks
        WHERE access_code_id = ?
    `).get(codeRow.id);

    return res.json({
        success: true,
        me: {
            code: codeRow.code,
            email: codeRow.email,
            status: codeRow.status,
            expireAt: codeRow.expire_at || null,
            harborProjectName: codeRow.harbor_project_name || normalizeNamespace(codeRow.code),
            harborNamespaceType: codeRow.harbor_namespace_type || 'project',
            projectCount,
            tasks: {
                queued: Number(taskSummary.queued_count || 0),
                running: Number(taskSummary.running_count || 0),
                completed: Number(taskSummary.completed_count || 0),
                failed: Number(taskSummary.failed_count || 0)
            }
        }
    });
});

function buildDockerHubResults(keyword) {
    const parsed = parseImageKeyword(keyword);
    if (!parsed) {
        return [];
    }

    const variants = [
        parsed,
        {
            ...parsed,
            tag: parsed.tag === 'latest' ? 'stable' : parsed.tag,
            sourceFullName: `${parsed.registry}/${parsed.namespace}/${parsed.repository}:${parsed.tag === 'latest' ? 'stable' : parsed.tag}`,
            displayName: `${parsed.namespace}/${parsed.repository}:${parsed.tag === 'latest' ? 'stable' : parsed.tag}`
        }
    ];

    const unique = new Map();
    variants.forEach((item) => {
        if (!unique.has(item.sourceFullName)) {
            unique.set(item.sourceFullName, {
                sourceType: 'dockerhub',
                registry: item.registry,
                namespace: item.namespace,
                repository: item.repository,
                tag: item.tag,
                digest: null,
                description: '来自 Docker Hub 的候选镜像',
                displayName: item.displayName,
                sourceFullName: item.sourceFullName,
                localAvailable: false,
                localFullName: null,
                cacheExpiresAt: null,
                cacheLastSeenAt: null,
                lastRequestedAt: null
            });
        }
    });

    return Array.from(unique.values());
}

app.get('/api/v2/search/images', (req, res) => {
    const keyword = String(req.query.keyword || '').trim();
    const searchSource = String(req.query.source || 'local').trim();
    const code = req.query.code ? String(req.query.code).trim() : '';
    let accessCode = null;

    if (code) {
        const validation = getAccessCodeOrThrow(code);
        if (validation.status === 200) {
            accessCode = validation.payload;
        }
    }

    const likeKeyword = `%${keyword.replace(/[%_]/g, '')}%`;
    const localRows = keyword
        ? db.prepare(`
            SELECT *
            FROM catalog_images
            WHERE (
                display_name LIKE ? OR
                source_full_name LIKE ? OR
                repository LIKE ? OR
                namespace LIKE ?
            )
            ORDER BY local_available DESC, updated_at DESC, id DESC
            LIMIT 50
        `).all(likeKeyword, likeKeyword, likeKeyword, likeKeyword)
        : db.prepare(`
            SELECT *
            FROM catalog_images
            ORDER BY local_available DESC, updated_at DESC, id DESC
            LIMIT 30
        `).all();

    const shouldShowLocal = searchSource === 'local' || searchSource === 'both';
    const shouldShowDockerHub = (searchSource === 'dockerhub' || searchSource === 'both') && getSetting('dockerhub_search_enabled', '1') === '1';

    const localResults = shouldShowLocal ? localRows.map((row) => serializeCatalogImage(row, accessCode, accessCode ? db.prepare(`
        SELECT *
        FROM distribution_tasks
        WHERE access_code_id = ? AND catalog_image_id = ?
        ORDER BY requested_at DESC, id DESC
        LIMIT 1
    `).get(accessCode.id, row.id) : null)) : [];

    const localNames = new Set(localResults.map((row) => row.sourceFullName));
    const dockerHubResults = shouldShowDockerHub
        ? buildDockerHubResults(keyword).filter((row) => !localNames.has(row.sourceFullName))
        : [];

    res.json({
        success: true,
        source: searchSource,
        localResults,
        dockerHubResults
    });
});

app.get('/api/v2/projects', (req, res) => {
    const validation = getAccessCodeOrThrow(req.query.code);
    if (validation.status !== 200) {
        return res.status(validation.status).json(validation.payload);
    }

    const codeRow = validation.payload;
    ensureDefaultProject(codeRow.id);

    const projects = db.prepare(`
        SELECT p.*, COUNT(pi.id) AS image_count
        FROM user_projects p
        LEFT JOIN user_project_images pi ON pi.project_id = p.id
        WHERE p.access_code_id = ?
        GROUP BY p.id
        ORDER BY CASE WHEN p.slug = 'default' THEN 0 ELSE 1 END, p.created_at ASC, p.id ASC
    `).all(codeRow.id);

    res.json({
        success: true,
        projects: projects.map((project) => ({
            id: project.id,
            name: project.name,
            slug: project.slug,
            imageCount: Number(project.image_count || 0),
            createdAt: project.created_at
        }))
    });
});

app.post('/api/v2/projects', (req, res) => {
    const validation = getAccessCodeOrThrow(req.body.code);
    if (validation.status !== 200) {
        return res.status(validation.status).json(validation.payload);
    }

    const codeRow = validation.payload;
    const name = String(req.body.name || '').trim();
    if (!name) {
        return res.status(400).json({ error: '请输入项目名称' });
    }

    let slug = slugify(name);
    let suffix = 2;
    while (db.prepare('SELECT 1 FROM user_projects WHERE access_code_id = ? AND slug = ?').get(codeRow.id, slug)) {
        slug = `${slugify(name)}-${suffix}`;
        suffix += 1;
    }

    const result = db.prepare(`
        INSERT INTO user_projects (access_code_id, name, slug)
        VALUES (?, ?, ?)
    `).run(codeRow.id, name, slug);

    const project = db.prepare('SELECT * FROM user_projects WHERE id = ?').get(result.lastInsertRowid);
    res.json({ success: true, project });
});

app.get('/api/v2/projects/:projectId/images', (req, res) => {
    const validation = getAccessCodeOrThrow(req.query.code);
    if (validation.status !== 200) {
        return res.status(validation.status).json(validation.payload);
    }

    const codeRow = validation.payload;
    const project = db.prepare('SELECT * FROM user_projects WHERE id = ? AND access_code_id = ?').get(req.params.projectId, codeRow.id);
    if (!project) {
        return res.status(404).json({ error: '项目不存在' });
    }

    const images = db.prepare(`
        SELECT c.*
        FROM user_project_images pi
        JOIN catalog_images c ON c.id = pi.catalog_image_id
        WHERE pi.project_id = ?
        ORDER BY pi.created_at DESC
    `).all(project.id);

    res.json({
        success: true,
        project,
        images: images.map((row) => serializeCatalogImage(row, codeRow, getProjectImageTask(project.id, row.id)))
    });
});

app.post('/api/v2/projects/:projectId/images/:imageId/redistribute', (req, res) => {
    const validation = getAccessCodeOrThrow(req.body.code || req.query.code);
    if (validation.status !== 200) {
        return res.status(validation.status).json(validation.payload);
    }

    const codeRow = validation.payload;
    const project = db.prepare('SELECT * FROM user_projects WHERE id = ? AND access_code_id = ?').get(req.params.projectId, codeRow.id);
    if (!project) {
        return res.status(404).json({ error: '项目不存在' });
    }

    const relation = db.prepare('SELECT * FROM user_project_images WHERE project_id = ? AND catalog_image_id = ?').get(project.id, req.params.imageId);
    if (!relation) {
        return res.status(404).json({ error: '该镜像不在当前项目中' });
    }

    const catalogImage = db.prepare('SELECT * FROM catalog_images WHERE id = ?').get(req.params.imageId);
    if (!catalogImage) {
        return res.status(404).json({ error: '镜像不存在' });
    }

    const task = queueDistributionTask(catalogImage, codeRow, project.id, 'manual-redistribute');
    res.json({ success: true, task: serializeTask(task) });
});

app.post('/api/v2/projects/:projectId/images/:imageId/remove', (req, res) => {
    const validation = getAccessCodeOrThrow(req.body.code || req.query.code);
    if (validation.status !== 200) {
        return res.status(validation.status).json(validation.payload);
    }

    const codeRow = validation.payload;
    const project = db.prepare('SELECT * FROM user_projects WHERE id = ? AND access_code_id = ?').get(req.params.projectId, codeRow.id);
    if (!project) {
        return res.status(404).json({ error: '项目不存在' });
    }

    const result = db.prepare('DELETE FROM user_project_images WHERE project_id = ? AND catalog_image_id = ?').run(project.id, req.params.imageId);
    if (!result.changes) {
        return res.status(404).json({ error: '该镜像不在当前项目中' });
    }

    res.json({ success: true });
});

app.get('/api/v2/my-images', (req, res) => {
    const validation = getAccessCodeOrThrow(req.query.code);
    if (validation.status !== 200) {
        return res.status(validation.status).json(validation.payload);
    }

    const images = buildMyImagesForAccessCode(validation.payload);
    res.json({ success: true, images });
});

app.get('/api/v2/my-deliveries', (req, res) => {
    const validation = getAccessCodeOrThrow(req.query.code);
    if (validation.status !== 200) {
        return res.status(validation.status).json(validation.payload);
    }

    const images = buildMyImagesForAccessCode(validation.payload).filter((item) => item.delivered);
    res.json({ success: true, images });
});

app.post('/api/v2/projects/:projectId/images', (req, res) => {
    const validation = getAccessCodeOrThrow(req.body.code);
    if (validation.status !== 200) {
        return res.status(validation.status).json(validation.payload);
    }

    const codeRow = validation.payload;
    const project = db.prepare('SELECT * FROM user_projects WHERE id = ? AND access_code_id = ?').get(req.params.projectId, codeRow.id);
    if (!project) {
        return res.status(404).json({ error: '项目不存在' });
    }

    let catalogImageId = req.body.catalogImageId;
    if (!catalogImageId && req.body.image) {
        const image = req.body.image;
        const tag = image.tag || 'latest';
        const sourceFullName = `${image.registry}/${image.namespace}/${image.repository}:${tag}`;
        const upserted = upsertCatalogImage({
            source_type: image.sourceType || 'dockerhub',
            registry: image.registry,
            namespace: image.namespace,
            repository: image.repository,
            tag,
            digest: image.digest || null,
            display_name: `${image.namespace}/${image.repository}:${tag}`,
            description: image.description || '',
            local_available: image.localAvailable ? 1 : 0,
            local_registry: image.localRegistry || null,
            local_namespace: image.localNamespace || null,
            local_repository: image.localRepository || null,
            local_tag: image.localTag || null,
            source_full_name: sourceFullName,
            local_full_name: image.localFullName || null,
            cache_expires_at: image.localAvailable ? computeCacheExpiresAt() : null
        });
        catalogImageId = upserted && upserted.id;
    }

    if (!catalogImageId) {
        return res.status(400).json({ error: '缺少镜像参数' });
    }

    db.prepare('INSERT OR IGNORE INTO user_project_images (project_id, catalog_image_id) VALUES (?, ?)').run(project.id, catalogImageId);
    const catalogImage = db.prepare('SELECT * FROM catalog_images WHERE id = ?').get(catalogImageId);
    if (!catalogImage) {
        return res.status(404).json({ error: '镜像不存在' });
    }

    db.prepare(`
        UPDATE catalog_images
        SET last_requested_at = CURRENT_TIMESTAMP,
            cache_last_seen_at = CASE WHEN local_available = 1 THEN CURRENT_TIMESTAMP ELSE cache_last_seen_at END,
            cache_expires_at = CASE WHEN local_available = 1 THEN ? ELSE cache_expires_at END,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
    `).run(catalogImage.local_available ? computeCacheExpiresAt() : null, catalogImage.id);

    const refreshed = db.prepare('SELECT * FROM catalog_images WHERE id = ?').get(catalogImage.id);
    const task = queueDistributionTask(refreshed, codeRow, project.id, 'add-to-project');

    res.json({
        success: true,
        project,
        image: serializeCatalogImage(refreshed, codeRow, task),
        task: serializeTask(task)
    });
});

app.post('/api/v2/images/:imageId/projects', (req, res) => {
    const validation = getAccessCodeOrThrow(req.body.code || req.query.code);
    if (validation.status !== 200) {
        return res.status(validation.status).json(validation.payload);
    }

    const codeRow = validation.payload;
    const catalogImage = db.prepare('SELECT * FROM catalog_images WHERE id = ?').get(req.params.imageId);
    if (!catalogImage) {
        return res.status(404).json({ error: '镜像不存在' });
    }

    const selectedProjects = setImageProjectsForAccessCode(codeRow, catalogImage.id, req.body.projectIds || []);
    const latestTask = db.prepare(`
        SELECT *
        FROM distribution_tasks
        WHERE access_code_id = ? AND catalog_image_id = ?
        ORDER BY requested_at DESC, id DESC
        LIMIT 1
    `).get(codeRow.id, catalogImage.id);

    res.json({
        success: true,
        selectedProjects,
        image: {
            ...serializeCatalogImage(catalogImage, codeRow, latestTask),
            projectNames: selectedProjects.map((project) => project.name)
        }
    });
});

app.get('/api/v2/tasks', (req, res) => {
    const validation = getAccessCodeOrThrow(req.query.code);
    if (validation.status !== 200) {
        return res.status(validation.status).json(validation.payload);
    }

    const codeRow = validation.payload;
    const tasks = db.prepare(`
        SELECT t.*, p.name AS project_name, c.display_name
        FROM distribution_tasks t
        LEFT JOIN user_projects p ON p.id = t.user_project_id
        JOIN catalog_images c ON c.id = t.catalog_image_id
        WHERE t.access_code_id = ?
        ORDER BY t.requested_at DESC, t.id DESC
        LIMIT 50
    `).all(codeRow.id);

    res.json({
        success: true,
        tasks: tasks.map((task) => ({
            ...serializeTask(task),
            projectName: task.project_name || null,
            displayName: task.display_name
        }))
    });
});

app.get('/api/v2/settings', (req, res) => {
    res.json({
        success: true,
        settings: {
            siteTitle: getSetting('site_title', defaultSettings.site_title),
            siteSubtitle: getSetting('site_subtitle', defaultSettings.site_subtitle),
            siteKeywords: getSetting('site_keywords', defaultSettings.site_keywords),
            siteDescription: getSetting('site_description', defaultSettings.site_description),
            footerLinks: getSetting('footer_links', defaultSettings.footer_links),
            icpBeian: getSetting('icp_beian', defaultSettings.icp_beian),
            gonganBeian: getSetting('gongan_beian', defaultSettings.gongan_beian),
            harborDomain: getDefaultHarborDomain(),
            harborBaseUrl: getSetting('harbor_base_url', defaultSettings.harbor_base_url),
            harborUsername: getSetting('harbor_username', defaultSettings.harbor_username),
            harborPassword: getSetting('harbor_password', defaultSettings.harbor_password),
            harborEnabled: getSetting('harbor_enabled', defaultSettings.harbor_enabled) === '1',
            cacheProjectName: getCacheProjectName(),
            cacheRetentionDays: getCacheRetentionDays(),
            defaultUserRepoVisibility: getSetting('default_user_repo_visibility', 'private'),
            dockerhubSearchEnabled: getSetting('dockerhub_search_enabled', '1') === '1'
        }
    });
});

app.post('/api/v2/settings', (req, res) => {
    const entries = [
        ['site_title', String(req.body.siteTitle || getSetting('site_title', defaultSettings.site_title)).trim() || defaultSettings.site_title],
        ['site_subtitle', String(req.body.siteSubtitle || getSetting('site_subtitle', defaultSettings.site_subtitle)).trim() || defaultSettings.site_subtitle],
        ['site_keywords', String(req.body.siteKeywords || getSetting('site_keywords', defaultSettings.site_keywords)).trim() || defaultSettings.site_keywords],
        ['site_description', String(req.body.siteDescription || getSetting('site_description', defaultSettings.site_description)).trim() || defaultSettings.site_description],
        ['footer_links', String(req.body.footerLinks || getSetting('footer_links', defaultSettings.footer_links)).trim()],
        ['icp_beian', String(req.body.icpBeian || getSetting('icp_beian', defaultSettings.icp_beian)).trim()],
        ['gongan_beian', String(req.body.gonganBeian || getSetting('gongan_beian', defaultSettings.gongan_beian)).trim()],
        ['harbor_domain', String(req.body.harborDomain || getDefaultHarborDomain()).trim() || getDefaultHarborDomain()],
        ['harbor_base_url', String(req.body.harborBaseUrl || getSetting('harbor_base_url', defaultSettings.harbor_base_url)).trim()],
        ['harbor_username', String(req.body.harborUsername || getSetting('harbor_username', defaultSettings.harbor_username)).trim()],
        ['harbor_password', String(req.body.harborPassword || getSetting('harbor_password', defaultSettings.harbor_password)).trim()],
        ['harbor_enabled', req.body.harborEnabled ? '1' : '0'],
        ['cache_project_name', String(req.body.cacheProjectName || getCacheProjectName()).trim() || getCacheProjectName()],
        ['cache_retention_days', String(req.body.cacheRetentionDays ?? getCacheRetentionDays())],
        ['default_user_repo_visibility', String(req.body.defaultUserRepoVisibility || getSetting('default_user_repo_visibility', 'private')).trim() || 'private'],
        ['dockerhub_search_enabled', req.body.dockerhubSearchEnabled ? '1' : '0']
    ];

    const stmt = db.prepare(`
        INSERT INTO settings (key, value, updated_at)
        VALUES (?, ?, CURRENT_TIMESTAMP)
        ON CONFLICT(key) DO UPDATE SET
            value = excluded.value,
            updated_at = CURRENT_TIMESTAMP
    `);

    entries.forEach(([key, value]) => stmt.run(key, value));
    res.json({ success: true });
});

app.post('/api/v2/settings/test-harbor', async (req, res) => {
    try {
        await testHarborConnection({
            baseUrl: req.body.harborBaseUrl,
            username: req.body.harborUsername,
            password: req.body.harborPassword
        });
        return res.json({ success: true, message: 'Harbor 连接测试成功' });
    } catch (error) {
        return res.status(400).json({ success: false, error: error.message });
    }
});

app.get('/api/v2/admin/users', (req, res) => {
    const rows = db.prepare(`
        SELECT
            a.*, 
            COUNT(DISTINCT p.id) AS project_count,
            COUNT(DISTINCT pi.catalog_image_id) AS image_count
        FROM access_codes a
        LEFT JOIN user_projects p ON p.access_code_id = a.id
        LEFT JOIN user_project_images pi ON pi.project_id = p.id
        GROUP BY a.id
        ORDER BY a.created_at DESC, a.id DESC
        LIMIT 200
    `).all();

    res.json({
        success: true,
        users: rows.map((row) => ({
            id: row.id,
            code: row.code,
            email: row.email,
            status: row.status,
            expireAt: row.expire_at || null,
            harborProjectName: row.harbor_project_name || normalizeNamespace(row.code),
            projectCount: Number(row.project_count || 0),
            imageCount: Number(row.image_count || 0),
            createdAt: row.created_at,
            lastUsed: row.last_used || null,
            deletedAt: row.deleted_at || null,
            purgeAfter: row.purge_after || null
        }))
    });
});

app.get('/api/v2/admin/summary', (req, res) => {
    const summary = {
        catalogCount: db.prepare('SELECT COUNT(*) AS count FROM catalog_images').get().count,
        localCatalogCount: db.prepare('SELECT COUNT(*) AS count FROM catalog_images WHERE local_available = 1').get().count,
        userCount: db.prepare("SELECT COUNT(*) AS count FROM access_codes WHERE status = 'active'").get().count,
        deletedUserCount: db.prepare("SELECT COUNT(*) AS count FROM access_codes WHERE status = 'deleted'").get().count,
        projectCount: db.prepare('SELECT COUNT(*) AS count FROM user_projects').get().count,
        queuedTaskCount: db.prepare("SELECT COUNT(*) AS count FROM distribution_tasks WHERE status = 'queued'").get().count,
        completedTaskCount: db.prepare("SELECT COUNT(*) AS count FROM distribution_tasks WHERE status = 'completed'").get().count
    };

    res.json({ success: true, summary });
});

app.get('/api/v2/admin/tasks', (req, res) => {
    const tasks = db.prepare(`
        SELECT t.*, a.code, p.name AS project_name, c.display_name
        FROM distribution_tasks t
        JOIN access_codes a ON a.id = t.access_code_id
        LEFT JOIN user_projects p ON p.id = t.user_project_id
        JOIN catalog_images c ON c.id = t.catalog_image_id
        ORDER BY t.requested_at DESC, t.id DESC
        LIMIT 100
    `).all();

    res.json({
        success: true,
        tasks: tasks.map((task) => ({
            ...serializeTask(task),
            accessCode: task.code,
            projectName: task.project_name || null,
            displayName: task.display_name
        }))
    });
});

app.post('/api/v2/admin/tasks/run-queued', (req, res) => {
    const limit = Math.max(1, Math.min(Number(req.body.limit || req.query.limit || 10), 50));
    const executed = runQueuedTasks(limit);
    res.json({
        success: true,
        requestedLimit: limit,
        executedCount: executed.length,
        tasks: executed.map((item) => ({
            success: item.success,
            error: item.error || null,
            task: serializeTask(item.task || null)
        }))
    });
});

app.post('/api/v2/admin/tasks/:taskId/run', (req, res) => {
    const result = runDistributionTask(req.params.taskId);
    if (!result.success) {
        return res.status(400).json(result);
    }
    res.json({
        success: true,
        task: serializeTask(result.task),
        image: result.image ? serializeCatalogImage(result.image, null, result.task) : null
    });
});

app.post('/api/v2/admin/tasks/:taskId/status', (req, res) => {
    const task = db.prepare('SELECT * FROM distribution_tasks WHERE id = ?').get(req.params.taskId);
    if (!task) {
        return res.status(404).json({ error: '任务不存在' });
    }

    const nextStatus = String(req.body.status || '').trim();
    const allowed = new Set(['queued', 'running', 'completed', 'failed', 'cancelled']);
    if (!allowed.has(nextStatus)) {
        return res.status(400).json({ error: '状态值不合法' });
    }

    let startedAt = task.started_at;
    let finishedAt = task.finished_at;
    if (nextStatus === 'running' && !startedAt) {
        startedAt = getNowSql();
    }
    if (nextStatus === 'completed' || nextStatus === 'failed' || nextStatus === 'cancelled') {
        finishedAt = getNowSql();
    }

    db.prepare(`
        UPDATE distribution_tasks
        SET status = ?, started_at = ?, finished_at = ?, last_error = ?
        WHERE id = ?
    `).run(nextStatus, startedAt || null, finishedAt || null, req.body.lastError || null, task.id);

    res.json({ success: true });
});

app.post('/api/v2/admin/cache/cleanup', (req, res) => {
    const result = cleanupExpiredCache();
    res.json({
        success: true,
        removed: result.removed,
        cleanedCount: result.removed,
        retentionDays: result.retentionDays,
        images: result.rows.map((row) => ({
            id: row.id,
            displayName: row.display_name,
            sourceFullName: row.source_full_name
        }))
    });
});

app.post('/api/v2/access-codes/:code/soft-delete', (req, res) => {
    const codeRow = db.prepare('SELECT * FROM access_codes WHERE code = ?').get(req.params.code);
    if (!codeRow) {
        return res.status(404).json({ error: '串码不存在' });
    }

    const purgeAfter = plusDays(30);
    db.prepare(`
        UPDATE access_codes
        SET status = 'deleted', deleted_at = CURRENT_TIMESTAMP, purge_after = ?
        WHERE id = ?
    `).run(purgeAfter, codeRow.id);

    res.json({ success: true, purgeAfter });
});

app.post('/api/v2/access-codes/:code/restore', (req, res) => {
    const codeRow = db.prepare('SELECT * FROM access_codes WHERE code = ?').get(req.params.code);
    if (!codeRow) {
        return res.status(404).json({ error: '串码不存在' });
    }

    db.prepare(`
        UPDATE access_codes
        SET status = 'active', deleted_at = NULL, purge_after = NULL
        WHERE id = ?
    `).run(codeRow.id);

    res.json({ success: true });
});

app.get('/api/v2/retention/pending-purge', (req, res) => {
    const rows = db.prepare(`
        SELECT code, email, deleted_at, purge_after
        FROM access_codes
        WHERE status = 'deleted'
        ORDER BY purge_after ASC
    `).all();

    res.json({ success: true, rows });
});

app.get('/api/v2/cache/images', (req, res) => {
    const rows = db.prepare(`
        SELECT *
        FROM catalog_images
        WHERE local_available = 1
        ORDER BY updated_at DESC, id DESC
        LIMIT 100
    `).all();

    res.json({
        success: true,
        cacheProject: getCacheProjectName(),
        cacheRetentionDays: getCacheRetentionDays(),
        images: rows.map((row) => serializeCatalogImage(row, null, null))
    });
});

app.listen(port, '0.0.0.0', () => {
    console.log(`ImgPull listening on http://localhost:${port}`);
});
