const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const dbInstances = new Map();

function getDbForSlug(slug = 'default') {
    if (!dbInstances.has(slug)) {
        const storageDir = path.join(__dirname, '../../storage');
        if (!fs.existsSync(storageDir)) {
            fs.mkdirSync(storageDir, { recursive: true });
        }
        const dbPath = path.join(storageDir, `${slug}.db`);
        const db = new Database(dbPath);
        try {
            db.pragma('journal_mode = WAL');
        } catch {}
        dbInstances.set(slug, db);
    }
    return dbInstances.get(slug);
}

class MySQLToSQLiteAdapter {
    constructor(slug = 'default') {
        this.slug = slug;
    }

    get db() {
        return getDbForSlug(this.slug);
    }

    /**
     * Translates standard MySQL queries to SQLite syntax
     */
    translateQuery(sql) {
        if (!sql) return '';
        let translated = sql;

        // 1. Data type & DDL replacements
        translated = translated
            .replace(/INT\(\d+\)/gi, 'INTEGER')
            .replace(/DECIMAL\s*\(\s*\d+\s*,\s*\d+\s*\)/gi, 'REAL')
            .replace(/FLOAT\s*\(\s*\d+\s*,\s*\d+\s*\)/gi, 'REAL')
            .replace(/DOUBLE/gi, 'REAL')
            .replace(/VARCHAR\s*\(\s*\d+\s*\)/gi, 'TEXT')
            .replace(/ENUM\s*\([^)]+\)/gi, 'TEXT')
            .replace(/\s+FOR\s+UPDATE/gi, '')
            .replace(/INT\s+AUTO_INCREMENT\s+PRIMARY\s+KEY/gi, 'INTEGER PRIMARY KEY AUTOINCREMENT')
            .replace(/INT\s+PRIMARY\s+KEY\s+AUTO_INCREMENT/gi, 'INTEGER PRIMARY KEY AUTOINCREMENT')
            .replace(/AUTO_INCREMENT/gi, 'AUTOINCREMENT')
            .replace(/DEFAULT\s+NOW\(\)/gi, "DEFAULT (datetime('now'))")
            .replace(/DEFAULT\s+CURRENT_TIMESTAMP/gi, "DEFAULT (datetime('now'))")
            .replace(/ENGINE\s*=\s*\w+/gi, '')
            .replace(/DEFAULT\s+CHARSET\s*=\s*[\w\d\-_]+/gi, '')
            .replace(/CHARACTER\s+SET\s+[\w\d\-_]+/gi, '')
            .replace(/COLLATE\s*=\s*[\w\d\-_]+/gi, '');

        // 2. MySQL DATE_SUB(expr, INTERVAL n unit)
        translated = translated.replace(
            /DATE_SUB\s*\(\s*(CURDATE\(\)|NOW\(\)|CURRENT_DATE|CURRENT_TIMESTAMP|date\('now'\)|datetime\('now'\)|'now'|[^,]+?)\s*,\s*INTERVAL\s+([0-9\?]+|\w+)\s+(DAY|MONTH|YEAR|HOUR|MINUTE|SECOND)S?\s*\)/gi,
            (match, expr, num, unit) => {
                const cleanExpr = expr.trim();
                const isNow = /^(CURDATE\(\)|NOW\(\)|CURRENT_DATE|CURRENT_TIMESTAMP|date\('now'\)|datetime\('now'\)|'now')$/i.test(cleanExpr);
                const base = isNow ? "'now'" : cleanExpr;
                return `date(${base}, '-${num} ${unit.toLowerCase()}s')`;
            }
        );

        // 3. MySQL DATE_ADD(expr, INTERVAL n unit)
        translated = translated.replace(
            /DATE_ADD\s*\(\s*(CURDATE\(\)|NOW\(\)|CURRENT_DATE|CURRENT_TIMESTAMP|date\('now'\)|datetime\('now'\)|'now'|[^,]+?)\s*,\s*INTERVAL\s+([0-9\?]+|\w+)\s+(DAY|MONTH|YEAR|HOUR|MINUTE|SECOND)S?\s*\)/gi,
            (match, expr, num, unit) => {
                const cleanExpr = expr.trim();
                const isNow = /^(CURDATE\(\)|NOW\(\)|CURRENT_DATE|CURRENT_TIMESTAMP|date\('now'\)|datetime\('now'\)|'now')$/i.test(cleanExpr);
                const base = isNow ? "'now'" : cleanExpr;
                return `date(${base}, '+${num} ${unit.toLowerCase()}s')`;
            }
        );

        // 4. Standalone INTERVAL arithmetic: expr - INTERVAL n unit
        translated = translated.replace(
            /(CURDATE\(\)|NOW\(\)|CURRENT_DATE|CURRENT_TIMESTAMP|\w+)\s*([\+\-])\s*INTERVAL\s+([0-9\?]+|\w+)\s+(DAY|MONTH|YEAR|HOUR|MINUTE|SECOND)S?/gi,
            (match, expr, op, num, unit) => {
                const cleanExpr = expr.trim();
                const isNow = /^(CURDATE\(\)|NOW\(\)|CURRENT_DATE|CURRENT_TIMESTAMP)$/i.test(cleanExpr);
                const base = isNow ? "'now'" : cleanExpr;
                const sign = op === '-' ? '-' : '+';
                return `date(${base}, '${sign}${num} ${unit.toLowerCase()}s')`;
            }
        );

        // 5. Functions & Keywords
        translated = translated
            .replace(/NOW\(\)/gi, "datetime('now')")
            .replace(/CURDATE\(\)/gi, "date('now')")
            .replace(/CURTIME\(\)/gi, "time('now')")
            .replace(/IFNULL\s*\(/gi, 'COALESCE(')
            .replace(/DATEDIFF\s*\(\s*([^,]+)\s*,\s*([^)]+)\s*\)/gi, "(julianday($1) - julianday($2))")
            .replace(/DATE_FORMAT\s*\(\s*([^,]+)\s*,\s*('[^']+')\s*\)/gi, "strftime($2, $1)");

        return translated;
    }

    query(sql, params, callback) {
        if (typeof params === 'function') {
            callback = params;
            params = [];
        }

        try {
            const cleanSql = this.translateQuery(sql);
            
            // Dukungan multiple statements (e.g. CREATE TABLE 1; CREATE TABLE 2;)
            const statements = cleanSql
                .split(';')
                .map(s => s.trim())
                .filter(s => s.length > 0);

            if (statements.length === 0) {
                if (callback) callback(null, [], []);
                return Promise.resolve([[], []]);
            }

            const normalizedParams = (params || []).map(p => {
                if (typeof p === 'boolean') return p ? 1 : 0;
                if (p === undefined) return null;
                if (p instanceof Date) return p.toISOString().slice(0, 19).replace('T', ' ');
                if (typeof p === 'object' && p !== null && !Buffer.isBuffer(p)) return JSON.stringify(p);
                return p;
            });

            let lastResults = [];
            for (const stmt of statements) {
                const trimmed = stmt.toUpperCase();
                if (trimmed.startsWith('SELECT') || trimmed.startsWith('PRAGMA') || trimmed.startsWith('EXPLAIN')) {
                    lastResults = this.db.prepare(stmt).all(normalizedParams);
                } else {
                    const info = this.db.prepare(stmt).run(normalizedParams);
                    lastResults = {
                        insertId: Number(info.lastInsertRowid),
                        affectedRows: info.changes,
                        changedRows: info.changes,
                    };
                }
            }

            if (callback) callback(null, lastResults, []);
            return Promise.resolve([lastResults, []]);
        } catch (err) {
            console.error('[MySQL Shim Error]', err.message, 'SQL:', sql);
            if (callback) callback(err);
            return Promise.reject(err);
        }
    }

    execute(sql, params, callback) {
        return this.query(sql, params, callback);
    }

    end(callback) {
        if (callback) callback(null);
        return Promise.resolve();
    }

    release() {
        // No-op for SQLite connection release
        return;
    }

    destroy() {
        // No-op for SQLite connection destroy
        return;
    }

    beginTransaction(callback) {
        return this.query('BEGIN TRANSACTION', callback);
    }

    commit(callback) {
        return this.query('COMMIT', callback);
    }

    rollback(callback) {
        return this.query('ROLLBACK', callback);
    }
}

function getShimForSlug(slug = 'default') {
    const createConnection = (_config) => new MySQLToSQLiteAdapter(slug);

    const createPool = (_config) => {
        const adapter = new MySQLToSQLiteAdapter(slug);
        adapter.getConnection = (cb) => {
            if (cb) cb(null, adapter);
            return Promise.resolve(adapter);
        };
        adapter.promise = () => ({
            query: (sql, params) => adapter.query(sql, params),
            execute: (sql, params) => adapter.execute(sql, params),
            beginTransaction: () => adapter.beginTransaction(),
            commit: () => adapter.commit(),
            rollback: () => adapter.rollback(),
            getConnection: () => Promise.resolve({
                query: (sql, params) => adapter.query(sql, params),
                execute: (sql, params) => adapter.execute(sql, params),
                beginTransaction: () => adapter.beginTransaction(),
                commit: () => adapter.commit(),
                rollback: () => adapter.rollback(),
                release: () => {},
                destroy: () => {},
            }),
            end: () => adapter.end(),
        });
        return adapter;
    };

    return {
        createConnection,
        createPool,
        createPoolCluster: createPool,
        promise: {
            createConnection: (_config) => Promise.resolve(createPool(_config).promise()),
            createPool: (_config) => createPool(_config).promise(),
        },
    };
}

module.exports = { getShimForSlug };
