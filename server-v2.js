const express = require('express');
const Database = require('better-sqlite3');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const port = process.env.PORT || 3001;
const db = new Database(path.join(__dirname, 'kubeaszpull.db'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

db.pragma('foreign_keys = ON');

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

CREATE TABLE IF NOT EXISTS user_projects_v2 (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    access_code_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(access_code_id, slug),
    FOREIGN KEY(access_code_id) REFERENCES access_codes(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS user_project_images_v2 (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL,
    catalog_image_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(project_id, catalog_image_id),
    FOREIGN KEY(project_id) REFERENCES user_projects_v2(id) ON DELETE CASCADE,
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
    FOREIGN KEY(user_project_id) REFERENCES user_projects_v2(id) ON DELETE SET NULL,
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
    harbor_domain: 'harbor.wh02.com',
    cache_project_name: 'cache',
    cache_retention_days: '-1',
    default_user_repo_visibility: 'private',
    dockerhub_search_enabled: '1'
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
        return { status: 400, payload: { error: '需要提供访问串码' } };
    }

    const codeRow = db.prepare('SELECT * FROM access_codes WHERE code = ?').get(code);
    if (!codeRow) {
        return { status: 401, payload: { error: '无效的串码' } };
    }

    if (codeRow.status === 'deleted') {
        return {
            status: 403,
            payload: {
                error: '这个串码对应的用户已删除，仍在保留期内',
                purge_after: codeRow.purge_after || null
            }
        };
    }

    if (codeRow.status !== 'active') {
        return { status: 401, payload: { error: '串码未激活或已失效' } };
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

function markImageAsCached(catalogImage) {
    const cacheFullName = buildLocalCacheName(catalogImage);
    const cacheProject = getCacheProjectName();
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
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
    `).run(
        getDefaultHarborDomain(),
        cacheProject,
        catalogImage.repository,
        catalogImage.tag,
        cacheFullName,
        computeCacheExpiresAt(),
        catalogImage.id
    );
    return db.prepare('SELECT * FROM catalog_images WHERE id = ?').get(catalogImage.id);
}

function runDistributionTask(taskId) {
    const task = db.prepare('SELECT * FROM distribution_tasks WHERE id = ?').get(taskId);
    if (!task) {
        return { success: false, error: '任务不存在' };
    }

    if (task.status === 'completed') {
        return { success: true, task };
    }

    const catalogImage = db.prepare('SELECT * FROM catalog_images WHERE id = ?').get(task.catalog_image_id);
    const accessCode = db.prepare('SELECT * FROM access_codes WHERE id = ?').get(task.access_code_id);

    if (!catalogImage || !accessCode) {
        db.prepare(`
            UPDATE distribution_tasks
            SET status = 'failed', finished_at = CURRENT_TIMESTAMP, last_error = ?
            WHERE id = ?
        `).run('镜像或用户不存在，无法执行任务', task.id);
        return { success: false, error: '镜像或用户不存在，无法执行任务' };
    }

    db.prepare(`
        UPDATE distribution_tasks
        SET status = 'running', started_at = COALESCE(started_at, CURRENT_TIMESTAMP), last_error = NULL
        WHERE id = ?
    `).run(task.id);

    let refreshedImage = catalogImage;
    if (!catalogImage.local_available) {
        refreshedImage = markImageAsCached(catalogImage);
    } else {
        db.prepare(`
            UPDATE catalog_images
            SET cache_last_seen_at = CURRENT_TIMESTAMP,
                cache_expires_at = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `).run(computeCacheExpiresAt(), catalogImage.id);
        refreshedImage = db.prepare('SELECT * FROM catalog_images WHERE id = ?').get(catalogImage.id);
    }

    const targetFullName = buildUserImageName(refreshedImage, accessCode);
    db.prepare(`
        UPDATE distribution_tasks
        SET status = 'completed',
            cache_hit = ?,
            cache_full_name = ?,
            target_full_name = ?,
            finished_at = CURRENT_TIMESTAMP,
            last_error = NULL
        WHERE id = ?
    `).run(
        refreshedImage.local_available ? 1 : 0,
        refreshedImage.local_full_name || buildLocalCacheName(refreshedImage),
        targetFullName,
        task.id
    );

    return {
        success: true,
        task: db.prepare('SELECT * FROM distribution_tasks WHERE id = ?').get(task.id),
        image: refreshedImage
    };
}

function runQueuedTasks(limit) {
    const rows = db.prepare(`
        SELECT id
        FROM distribution_tasks
        WHERE status = 'queued'
        ORDER BY requested_at ASC, id ASC
        LIMIT ?
    `).all(limit);

    const executed = [];
    rows.forEach((row) => {
        executed.push(runDistributionTask(row.id));
    });
    return executed;
}

function cleanupExpiredCache() {
    const retentionDays = getCacheRetentionDays();
    if (retentionDays < 0) {
        return { removed: 0, retentionDays, rows: [] };
    }

    const now = getNowSql();
    const rows = db.prepare(`
        SELECT c.*
        FROM catalog_images c
        LEFT JOIN distribution_tasks t
            ON t.catalog_image_id = c.id
           AND t.status IN ('queued', 'running')
        WHERE c.local_available = 1
          AND c.cache_expires_at IS NOT NULL
          AND c.cache_expires_at <= ?
          AND t.id IS NULL
        ORDER BY c.cache_expires_at ASC, c.id ASC
    `).all(now);

    rows.forEach((row) => {
        db.prepare(`
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
        `).run(row.id);
    });

    return { removed: rows.length, retentionDays, rows };
}

function seedCatalogFromLegacy() {
    const legacyTable = db.prepare(`
        SELECT name FROM sqlite_master
        WHERE type = 'table' AND name IN ('projects', 'versions', 'images')
    `).all();

    if (legacyTable.length < 3) {
        return;
    }

    const legacyRows = db.prepare(`
        SELECT
            i.name AS image_name,
            COALESCE(i.description, '') AS image_description,
            p.harbor_domain,
            p.harbor_project,
            v.version
        FROM images i
        JOIN versions v ON i.version_id = v.id
        JOIN projects p ON v.project_id = p.id
        WHERE i.status = 'active'
    `).all();

    legacyRows.forEach((row) => {
        const registry = row.harbor_domain || getDefaultHarborDomain();
        const namespace = row.harbor_project || getCacheProjectName();
        const repository = row.image_name;
        const tag = row.version || 'latest';
        const localAvailable = registry === getDefaultHarborDomain();
        const sourceFullName = `${registry}/${namespace}/${repository}:${tag}`;
        const cacheExpiresAt = localAvailable ? computeCacheExpiresAt() : null;

        upsertCatalogImage({
            source_type: localAvailable ? 'local' : 'mirror',
            registry,
            namespace,
            repository,
            tag,
            display_name: `${namespace}/${repository}:${tag}`,
            description: row.image_description || '',
            local_available: localAvailable,
            local_registry: localAvailable ? registry : null,
            local_namespace: localAvailable ? namespace : null,
            local_repository: localAvailable ? repository : null,
            local_tag: localAvailable ? tag : null,
            source_full_name: sourceFullName,
            local_full_name: localAvailable ? `${registry}/${namespace}/${repository}:${tag}` : null,
            cache_last_seen_at: localAvailable ? getNowSql() : null,
            cache_expires_at: cacheExpiresAt
        });
    });
}

seedCatalogFromLegacy();

async function searchDockerHub(query) {
    if (!query || query.trim().length < 2 || typeof fetch !== 'function') {
        return [];
    }

    if (getSetting('dockerhub_search_enabled', '1') !== '1') {
        return [];
    }

    try {
        const url = `https://hub.docker.com/v2/search/repositories/?page_size=10&query=${encodeURIComponent(query)}`;
        const response = await fetch(url, { headers: { accept: 'application/json' } });
        if (!response.ok) {
            return [];
        }

        const data = await response.json();
        return (data.results || []).map((item) => {
            const namespace = item.repo_name.includes('/') ? item.repo_name.split('/')[0] : 'library';
            const repository = item.repo_name.includes('/') ? item.repo_name.split('/').slice(1).join('/') : item.repo_name;
            const tag = 'latest';
            return {
                source_type: 'dockerhub',
                registry: 'docker.io',
                namespace,
                repository,
                tag,
                display_name: `${namespace}/${repository}:${tag}`,
                description: item.short_description || '',
                local_available: 0,
                local_registry: null,
                local_namespace: null,
                local_repository: null,
                local_tag: null,
                source_full_name: `docker.io/${namespace}/${repository}:${tag}`,
                local_full_name: null,
                cache_expires_at: null
            };
        });
    } catch (error) {
        return [];
    }
}

function queryLocalCatalog(query) {
    const like = `%${String(query || '').trim()}%`;
    return db.prepare(`
        SELECT *
        FROM catalog_images
        WHERE local_available = 1 AND (
            source_full_name LIKE @like OR
            display_name LIKE @like OR
            repository LIKE @like OR
            namespace LIKE @like OR
            COALESCE(local_full_name, '') LIKE @like
        )
        ORDER BY updated_at DESC, display_name ASC
        LIMIT 20
    `).all({ like });
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

function getLatestTasksMap(accessCodeId, imageIds) {
    const result = new Map();
    if (!imageIds || !imageIds.length) {
        return result;
    }

    const placeholders = imageIds.map(() => '?').join(',');
    const rows = db.prepare(`
        SELECT *
        FROM distribution_tasks
        WHERE access_code_id = ?
          AND catalog_image_id IN (${placeholders})
        ORDER BY requested_at DESC, id DESC
    `).all(accessCodeId, ...imageIds);

    rows.forEach((row) => {
        if (!result.has(row.catalog_image_id)) {
            result.set(row.catalog_image_id, row);
        }
    });

    return result;
}

function serializeTask(task) {
    if (!task) {
        return null;
    }

    return {
        id: task.id,
        status: task.status,
        triggerSource: task.trigger_source,
        cacheHit: !!task.cache_hit,
        retentionDays: task.retention_days_snapshot,
        targetNamespace: task.target_namespace,
        targetFullName: task.target_full_name,
        upstreamFullName: task.upstream_full_name,
        cacheFullName: task.cache_full_name,
        requestedAt: task.requested_at,
        startedAt: task.started_at,
        finishedAt: task.finished_at,
        lastError: task.last_error
    };
}

function serializeCatalogImage(row, accessCode, latestTask) {
    return {
        id: row.id,
        sourceType: row.source_type,
        source: {
            registry: row.registry,
            namespace: row.namespace,
            repository: row.repository,
            tag: row.tag,
            fullName: row.source_full_name,
            digest: row.digest || null
        },
        local: {
            available: !!row.local_available,
            registry: row.local_registry,
            namespace: row.local_namespace,
            repository: row.local_repository,
            tag: row.local_tag,
            fullName: row.local_full_name,
            cacheExpiresAt: row.cache_expires_at || null,
            cacheLastSeenAt: row.cache_last_seen_at || null
        },
        userTarget: accessCode
            ? {
                  namespace: accessCode.harbor_project_name,
                  fullName: buildUserImageName(row, accessCode)
              }
            : null,
        latestTask: serializeTask(latestTask || null),
        displayName: row.display_name,
        description: row.description
    };
}

function listProjectsForCode(accessCodeId) {
    return db.prepare(`
        SELECT p.*, COUNT(pi.id) AS image_count
        FROM user_projects_v2 p
        LEFT JOIN user_project_images_v2 pi ON pi.project_id = p.id
        WHERE p.access_code_id = ?
        GROUP BY p.id
        ORDER BY p.created_at DESC
    `).all(accessCodeId);
}

app.get('/v2', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index-v2.html'));
});

app.get('/v2/console', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'search-v2.html'));
});

app.get('/v2/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin-v2.html'));
});

app.get('/api/v2/me', (req, res) => {
    const validation = getAccessCodeOrThrow(req.query.code);
    if (validation.status !== 200) {
        return res.status(validation.status).json(validation.payload);
    }

    const codeRow = validation.payload;
    res.json({
        success: true,
        accessCode: {
            code: codeRow.code,
            email: codeRow.email,
            harborProjectName: codeRow.harbor_project_name,
            purgeAfter: codeRow.purge_after || null,
            expireAt: codeRow.expire_at || null,
            visibility: getSetting('default_user_repo_visibility', 'private')
        }
    });
});

app.get('/api/v2/search/images', async (req, res) => {
    const validation = getAccessCodeOrThrow(req.query.code);
    if (validation.status !== 200) {
        return res.status(validation.status).json(validation.payload);
    }

    const query = String(req.query.q || '').trim();
    if (!query) {
        return res.status(400).json({ error: '搜索词不能为空' });
    }

    const codeRow = validation.payload;
    const localResults = queryLocalCatalog(query);
    const remoteResults = localResults.length === 0 ? await searchDockerHub(query) : [];
    const upsertedRemoteResults = remoteResults.map((image) => upsertCatalogImage(image));

    const merged = [...localResults, ...upsertedRemoteResults];
    const results = merged.map((row) => serializeCatalogImage(row, codeRow, null));

    res.json({
        success: true,
        query,
        searchMode: localResults.length > 0 ? 'cache-only-hit' : 'cache-miss-then-dockerhub',
        cacheProject: getCacheProjectName(),
        defaultNamespace: codeRow.harbor_project_name,
        results
    });
});

app.get('/api/v2/projects', (req, res) => {
    const validation = getAccessCodeOrThrow(req.query.code);
    if (validation.status !== 200) {
        return res.status(validation.status).json(validation.payload);
    }

    const codeRow = validation.payload;
    const projects = listProjectsForCode(codeRow.id);
    res.json({ success: true, projects });
});

app.post('/api/v2/projects', (req, res) => {
    const validation = getAccessCodeOrThrow(req.body.code);
    if (validation.status !== 200) {
        return res.status(validation.status).json(validation.payload);
    }

    const codeRow = validation.payload;
    const name = String(req.body.name || '').trim();
    if (!name) {
        return res.status(400).json({ error: '项目名称不能为空' });
    }

    const slug = slugify(req.body.slug || name);
    const stmt = db.prepare('INSERT INTO user_projects_v2 (access_code_id, name, slug) VALUES (?, ?, ?)');

    try {
        const result = stmt.run(codeRow.id, name, slug);
        res.json({ success: true, project: { id: result.lastInsertRowid, name, slug } });
    } catch (error) {
        if (String(error.message).includes('UNIQUE')) {
            return res.status(409).json({ error: '这个项目名已经存在' });
        }
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/v2/projects/:projectId/images', (req, res) => {
    const validation = getAccessCodeOrThrow(req.query.code);
    if (validation.status !== 200) {
        return res.status(validation.status).json(validation.payload);
    }

    const codeRow = validation.payload;
    const project = db.prepare('SELECT * FROM user_projects_v2 WHERE id = ? AND access_code_id = ?').get(req.params.projectId, codeRow.id);
    if (!project) {
        return res.status(404).json({ error: '项目不存在' });
    }

    const images = db.prepare(`
        SELECT c.*
        FROM user_project_images_v2 pi
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

app.get('/api/v2/my-images', (req, res) => {
    const validation = getAccessCodeOrThrow(req.query.code);
    if (validation.status !== 200) {
        return res.status(validation.status).json(validation.payload);
    }

    const codeRow = validation.payload;
    const rows = db.prepare(`
        SELECT
            c.*, 
            GROUP_CONCAT(DISTINCT p.name) AS project_names,
            COUNT(DISTINCT p.id) AS project_count,
            MAX(pi.created_at) AS latest_project_add_at
        FROM user_project_images_v2 pi
        JOIN user_projects_v2 p ON p.id = pi.project_id
        JOIN catalog_images c ON c.id = pi.catalog_image_id
        WHERE p.access_code_id = ?
        GROUP BY c.id
        ORDER BY latest_project_add_at DESC, c.updated_at DESC
    `).all(codeRow.id);

    const taskMap = getLatestTasksMap(codeRow.id, rows.map((row) => row.id));
    const images = rows.map((row) => {
        const task = taskMap.get(row.id) || null;
        return {
            ...serializeCatalogImage(row, codeRow, task),
            projectNames: row.project_names ? row.project_names.split(',') : [],
            projectCount: Number(row.project_count || 0),
            delivered: !!task && task.status === 'completed'
        };
    });

    res.json({ success: true, images });
});

app.post('/api/v2/projects/:projectId/images', (req, res) => {
    const validation = getAccessCodeOrThrow(req.body.code);
    if (validation.status !== 200) {
        return res.status(validation.status).json(validation.payload);
    }

    const codeRow = validation.payload;
    const project = db.prepare('SELECT * FROM user_projects_v2 WHERE id = ? AND access_code_id = ?').get(req.params.projectId, codeRow.id);
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
        return res.status(400).json({ error: '缺少镜像信息' });
    }

    db.prepare('INSERT OR IGNORE INTO user_project_images_v2 (project_id, catalog_image_id) VALUES (?, ?)').run(project.id, catalogImageId);
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

app.get('/api/v2/tasks', (req, res) => {
    const validation = getAccessCodeOrThrow(req.query.code);
    if (validation.status !== 200) {
        return res.status(validation.status).json(validation.payload);
    }

    const codeRow = validation.payload;
    const tasks = db.prepare(`
        SELECT t.*, p.name AS project_name, c.display_name
        FROM distribution_tasks t
        LEFT JOIN user_projects_v2 p ON p.id = t.user_project_id
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
            harborDomain: getDefaultHarborDomain(),
            cacheProjectName: getCacheProjectName(),
            cacheRetentionDays: getCacheRetentionDays(),
            defaultUserRepoVisibility: getSetting('default_user_repo_visibility', 'private'),
            dockerhubSearchEnabled: getSetting('dockerhub_search_enabled', '1') === '1'
        }
    });
});

app.post('/api/v2/settings', (req, res) => {
    const entries = [
        ['harbor_domain', String(req.body.harborDomain || getDefaultHarborDomain()).trim() || getDefaultHarborDomain()],
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

app.get('/api/v2/admin/summary', (req, res) => {
    const summary = {
        catalogCount: db.prepare('SELECT COUNT(*) AS count FROM catalog_images').get().count,
        localCatalogCount: db.prepare('SELECT COUNT(*) AS count FROM catalog_images WHERE local_available = 1').get().count,
        userCount: db.prepare("SELECT COUNT(*) AS count FROM access_codes WHERE status = 'active'").get().count,
        deletedUserCount: db.prepare("SELECT COUNT(*) AS count FROM access_codes WHERE status = 'deleted'").get().count,
        projectCount: db.prepare('SELECT COUNT(*) AS count FROM user_projects_v2').get().count,
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
        LEFT JOIN user_projects_v2 p ON p.id = t.user_project_id
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
        return res.status(400).json({ error: '状态不合法' });
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
    console.log(`ImgPull v2 listening on http://localhost:${port}`);
});
