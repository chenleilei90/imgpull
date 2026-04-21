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
    display_name TEXT NOT NULL,
    description TEXT DEFAULT '',
    local_available INTEGER NOT NULL DEFAULT 0,
    local_registry TEXT,
    local_namespace TEXT,
    local_repository TEXT,
    local_tag TEXT,
    source_full_name TEXT NOT NULL UNIQUE,
    local_full_name TEXT,
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

function getSetting(key, fallbackValue) {
    const row = db.prepare('SELECT value FROM settings WHERE key = ?').get(key);
    return row && row.value ? row.value : fallbackValue;
}

function getDefaultHarborDomain() {
    return getSetting('harbor_domain', 'harbor.wh02.com');
}

function plusDays(days) {
    const value = new Date();
    value.setDate(value.getDate() + days);
    return value.toISOString().slice(0, 19).replace('T', ' ');
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

    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
    if (codeRow.expire_at && now > codeRow.expire_at) {
        return { status: 401, payload: { error: '串码已过期' } };
    }

    if (!codeRow.harbor_project_name) {
        const namespace = normalizeNamespace(codeRow.code);
        db.prepare('UPDATE access_codes SET harbor_project_name = ? WHERE id = ?').run(namespace, codeRow.id);
        codeRow.harbor_project_name = namespace;
    }

    return { status: 200, payload: codeRow };
}

function buildUserImageName(catalogImage, accessCode) {
    const harborDomain = getDefaultHarborDomain();
    const namespace = accessCode.harbor_project_name || normalizeNamespace(accessCode.code);
    const tag = catalogImage.tag || 'latest';
    return `${harborDomain}/${namespace}/${catalogImage.repository}:${tag}`;
}

function upsertCatalogImage(image) {
    const stmt = db.prepare(`
        INSERT INTO catalog_images (
            source_type, registry, namespace, repository, tag, display_name,
            description, local_available, local_registry, local_namespace,
            local_repository, local_tag, source_full_name, local_full_name,
            updated_at
        ) VALUES (
            @source_type, @registry, @namespace, @repository, @tag, @display_name,
            @description, @local_available, @local_registry, @local_namespace,
            @local_repository, @local_tag, @source_full_name, @local_full_name,
            CURRENT_TIMESTAMP
        )
        ON CONFLICT(source_full_name) DO UPDATE SET
            source_type = excluded.source_type,
            display_name = excluded.display_name,
            description = excluded.description,
            local_available = excluded.local_available,
            local_registry = excluded.local_registry,
            local_namespace = excluded.local_namespace,
            local_repository = excluded.local_repository,
            local_tag = excluded.local_tag,
            local_full_name = excluded.local_full_name,
            updated_at = CURRENT_TIMESTAMP
    `);

    stmt.run(image);
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
        const namespace = row.harbor_project || 'library';
        const repository = row.image_name;
        const tag = row.version || 'latest';
        const localAvailable = registry === getDefaultHarborDomain() ? 1 : 0;

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
            source_full_name: `${registry}/${namespace}/${repository}:${tag}`,
            local_full_name: localAvailable ? `${registry}/${namespace}/${repository}:${tag}` : null
        });
    });
}

seedCatalogFromLegacy();

async function searchDockerHub(query) {
    if (!query || query.trim().length < 2 || typeof fetch !== 'function') {
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
                local_full_name: null
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
        WHERE
            source_full_name LIKE @like OR
            display_name LIKE @like OR
            repository LIKE @like OR
            namespace LIKE @like
        ORDER BY local_available DESC, updated_at DESC, display_name ASC
        LIMIT 20
    `).all({ like });
}

function serializeCatalogImage(row, accessCode) {
    return {
        id: row.id,
        sourceType: row.source_type,
        source: {
            registry: row.registry,
            namespace: row.namespace,
            repository: row.repository,
            tag: row.tag,
            fullName: row.source_full_name
        },
        local: {
            available: !!row.local_available,
            registry: row.local_registry,
            namespace: row.local_namespace,
            repository: row.local_repository,
            tag: row.local_tag,
            fullName: row.local_full_name
        },
        userTarget: accessCode
            ? {
                  namespace: accessCode.harbor_project_name,
                  fullName: buildUserImageName(row, accessCode)
              }
            : null,
        displayName: row.display_name,
        description: row.description
    };
}

app.get('/v2', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'search-v2.html'));
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
            purgeAfter: codeRow.purge_after || null
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
    const remoteResults = await searchDockerHub(query);
    remoteResults.forEach((image) => upsertCatalogImage(image));

    const merged = new Map();
    [...localResults, ...remoteResults].forEach((row) => {
        if (!merged.has(row.source_full_name)) {
            merged.set(row.source_full_name, row);
        }
    });

    const results = Array.from(merged.values())
        .sort((a, b) => Number(b.local_available) - Number(a.local_available) || a.display_name.localeCompare(b.display_name))
        .map((row) => serializeCatalogImage(row, codeRow));

    res.json({
        success: true,
        query,
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
    const projects = db.prepare(`
        SELECT p.*, COUNT(pi.id) AS image_count
        FROM user_projects_v2 p
        LEFT JOIN user_project_images_v2 pi ON pi.project_id = p.id
        WHERE p.access_code_id = ?
        GROUP BY p.id
        ORDER BY p.created_at DESC
    `).all(codeRow.id);

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
        images: images.map((row) => serializeCatalogImage(row, codeRow))
    });
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

        upsertCatalogImage({
            source_type: image.sourceType || 'dockerhub',
            registry: image.registry,
            namespace: image.namespace,
            repository: image.repository,
            tag,
            display_name: `${image.namespace}/${image.repository}:${tag}`,
            description: image.description || '',
            local_available: image.localAvailable ? 1 : 0,
            local_registry: image.localRegistry || null,
            local_namespace: image.localNamespace || null,
            local_repository: image.localRepository || null,
            local_tag: image.localTag || null,
            source_full_name: sourceFullName,
            local_full_name: image.localFullName || null
        });

        const row = db.prepare('SELECT id FROM catalog_images WHERE source_full_name = ?').get(sourceFullName);
        catalogImageId = row && row.id;
    }

    if (!catalogImageId) {
        return res.status(400).json({ error: '缺少镜像信息' });
    }

    db.prepare('INSERT OR IGNORE INTO user_project_images_v2 (project_id, catalog_image_id) VALUES (?, ?)').run(project.id, catalogImageId);
    const catalogImage = db.prepare('SELECT * FROM catalog_images WHERE id = ?').get(catalogImageId);

    res.json({
        success: true,
        project,
        image: serializeCatalogImage(catalogImage, codeRow)
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

app.listen(port, '0.0.0.0', () => {
    console.log(`ImgPull v2 listening on http://localhost:${port}`);
});
