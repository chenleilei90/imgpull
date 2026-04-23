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
        throw new Error('未安装 mysql2，当前环境无法测试 MySQL 连接');
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
        throw new Error(`Harbor 连接失败，状态码 ${response.status}`);
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

Object.entries(defaultSettings).forEach(([