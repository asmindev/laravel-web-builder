const fs = require('fs');
const path = require('path');

let NativeSQLite = null;
let sqliteDriverType = null; // 'node:sqlite' | 'better-sqlite3' | 'sqlite3'

// 1. Try built-in node:sqlite (available natively in Node.js 22+ and 26+ without any compilation)
try {
    const { DatabaseSync } = require('node:sqlite');
    if (typeof DatabaseSync === 'function') {
        NativeSQLite = DatabaseSync;
        sqliteDriverType = 'node:sqlite';
    }
} catch {}

// 2. Fallback to better-sqlite3 (e.g. Node 21 on production server)
if (!NativeSQLite) {
    try {
        const BS3 = require('better-sqlite3');
        if (typeof BS3 === 'function') {
            NativeSQLite = BS3;
            sqliteDriverType = 'better-sqlite3';
        }
    } catch {}
}

const dbInstances = new Map();

function getDbPathForSlug(slug = 'default') {
    const storageDir = path.join(__dirname, '../../storage');
    if (!fs.existsSync(storageDir)) {
        fs.mkdirSync(storageDir, { recursive: true });
    }
    return path.join(storageDir, `${slug}.db`);
}

/**
 * Universal synchronous SQLite wrapper that works uniformly whether
 * using node:sqlite or better-sqlite3.
 */
class UniversalSQLite {
    constructor(dbPath) {
        this.dbPath = dbPath;
        if (sqliteDriverType === 'node:sqlite') {
            this.raw = new NativeSQLite(dbPath);
            try {
                this.raw.exec('PRAGMA journal_mode = WAL;');
            } catch {}
        } else if (sqliteDriverType === 'better-sqlite3') {
            this.raw = new NativeSQLite(dbPath);
            try {
                this.raw.pragma('journal_mode = WAL');
            } catch {}
        } else {
            throw new Error('No SQLite driver available (requires node:sqlite or better-sqlite3)');
        }
    }

    _normalizeSql(sql) {
        if (!sql || typeof sql !== 'string') return sql;
        // Replace double-quoted string literals in comparisons: = "Active", != "Inactive", LIKE "foo", IN ("A", "B")
        return sql.replace(/([=><!]\s*|LIKE\s+|IN\s*\(\s*)"([^"]+)"/gi, (_match, prefix, val) => {
            return `${prefix}'${val.replace(/'/g, "''")}'`;
        });
    }

    _tryAutoHeal(sql, errMessage) {
        if (!errMessage || typeof errMessage !== 'string') return false;

        // 1. Auto-heal double-quoted string literals (e.g. no such column: "Active" - should this be a string literal in single-quotes?)
        if (errMessage.includes('should this be a string literal in single-quotes') || errMessage.includes('no such column: "')) {
            return true;
        }

        // 2. Auto-heal missing table (e.g. "no such table: users")
        const tableErrMatch = errMessage.match(/no such table:\s*([a-zA-Z0-9_]+)/i);
        if (tableErrMatch) {
            const missingTable = tableErrMatch[1];
            const lowerTable = missingTable.toLowerCase();
            try {
                if (lowerTable === 'users') {
                    this.raw.exec(`
                        CREATE TABLE IF NOT EXISTS users (
                            id INTEGER PRIMARY KEY AUTOINCREMENT,
                            username TEXT UNIQUE,
                            email TEXT UNIQUE,
                            password TEXT,
                            password_hash TEXT,
                            full_name TEXT,
                            name TEXT,
                            role TEXT DEFAULT 'admin',
                            branch TEXT,
                            department TEXT,
                            status TEXT DEFAULT 'Active',
                            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                        );
                    `);
                    // Ensure admin user exists
                    try {
                        const existingAdmin = this.raw.prepare("SELECT id FROM users WHERE username = 'admin'").get();
                        if (!existingAdmin) {
                            this.raw.exec(`
                                INSERT INTO users (username, email, password, password_hash, full_name, name, role, department, status)
                                VALUES ('admin', 'admin@app.local', 'admin123', '$2b$10$abcdefghijklmnopqrstuu', 'Administrator', 'Administrator', 'admin', 'Management', 'Active');
                            `);
                        }
                    } catch {}
                    console.log(`[SQLite3 Shim Auto-Heal] 🛠️ Auto-healed: Initialized 'users' table and default administrator.`);
                    return true;
                } else {
                    this.raw.exec(`
                        CREATE TABLE IF NOT EXISTS \`${missingTable}\` (
                            id INTEGER PRIMARY KEY AUTOINCREMENT,
                            code TEXT,
                            name TEXT,
                            title TEXT,
                            description TEXT,
                            status TEXT DEFAULT 'Active',
                            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                        );
                    `);
                    console.log(`[SQLite3 Shim Auto-Heal] 🛠️ Auto-healed: Initialized missing table '${missingTable}'.`);
                    return true;
                }
            } catch (healErr) {
                console.error(`[SQLite3 Shim Auto-Heal Error] Failed to create table '${missingTable}':`, healErr.message);
                return false;
            }
        }

        // 3. Auto-heal missing column (e.g. "no such column: email")
        const colErrMatch = errMessage.match(/no such column:\s*([a-zA-Z0-9_]+)/i);
        if (colErrMatch) {
            const missingCol = colErrMatch[1];
            const tableMatch = sql.match(/(?:from|into|update|join)\s+[`"']?([a-zA-Z0-9_]+)[`"']?/i);
            if (tableMatch) {
                const tableName = tableMatch[1];
                try {
                    this.raw.exec(`ALTER TABLE \`${tableName}\` ADD COLUMN \`${missingCol}\` TEXT;`);
                    console.log(`[SQLite3 Shim Auto-Heal] 🛠️ Auto-healed: Added missing column '${missingCol}' to table '${tableName}'.`);
                    return true;
                } catch (colHealErr) {
                    console.error(`[SQLite3 Shim Auto-Heal Error] Failed to add column '${missingCol}':`, colHealErr.message);
                    return false;
                }
            }
        }

        return false;
    }

    exec(sql) {
        const normalized = this._normalizeSql(sql);
        return this.raw.exec(normalized);
    }

    transaction(fn) {
        return (...args) => {
            this.exec('BEGIN');
            try {
                const result = fn(...args);
                this.exec('COMMIT');
                return result;
            } catch (err) {
                this.exec('ROLLBACK');
                throw err;
            }
        };
    }

    prepare(rawSql) {
        const sql = this._normalizeSql(rawSql);
        let stmt;
        try {
            stmt = this.raw.prepare(sql);
        } catch (err) {
            if (this._tryAutoHeal(sql, err.message)) {
                stmt = this.raw.prepare(this._normalizeSql(sql));
            } else {
                throw err;
            }
        }

        const normalizeArgs = (args) => {
            if (args.length === 0) return [];
            if (args.length === 1 && Array.isArray(args[0])) return args[0];
            return args;
        };

        const formatRow = (row) => {
            if (!row || typeof row !== 'object') return row;
            if (row.password && !row.password_hash) row.password_hash = row.password;
            if (row.password_hash && !row.password) row.password = row.password_hash;
            return row;
        };

        return {
            run: (...args) => {
                const p = normalizeArgs(args);
                try {
                    const info = stmt.run(...p);
                    return {
                        lastInsertRowid: Number(info.lastInsertRowid),
                        changes: Number(info.changes || 0),
                    };
                } catch (err) {
                    if (this._tryAutoHeal(sql, err.message)) {
                        const newStmt = this.raw.prepare(this._normalizeSql(sql));
                        const info = newStmt.run(...p);
                        return {
                            lastInsertRowid: Number(info.lastInsertRowid),
                            changes: Number(info.changes || 0),
                        };
                    }
                    throw err;
                }
            },
            get: (...args) => {
                const p = normalizeArgs(args);
                try {
                    return formatRow(stmt.get(...p));
                } catch (err) {
                    if (this._tryAutoHeal(sql, err.message)) {
                        const newStmt = this.raw.prepare(this._normalizeSql(sql));
                        return formatRow(newStmt.get(...p));
                    }
                    throw err;
                }
            },
            all: (...args) => {
                const p = normalizeArgs(args);
                try {
                    const res = stmt.all(...p) || [];
                    return res.map(formatRow);
                } catch (err) {
                    if (this._tryAutoHeal(sql, err.message)) {
                        const newStmt = this.raw.prepare(this._normalizeSql(sql));
                        const res = newStmt.all(...p) || [];
                        return res.map(formatRow);
                    }
                    throw err;
                }
            },
        };
    }

    pragma(cmd) {
        if (sqliteDriverType === 'node:sqlite') {
            return this.raw.exec(`PRAGMA ${cmd};`);
        } else {
            return this.raw.pragma(cmd);
        }
    }

    close() {
        if (this.raw && typeof this.raw.close === 'function') {
            this.raw.close();
        }
    }
}

function getBetterSqliteForSlug(slug = 'default', customPath = null) {
    let dbPath = getDbPathForSlug(slug);

    if (customPath === ':memory:') {
        dbPath = ':memory:';
    }

    const key = `${slug}:${dbPath}`;
    if (!dbInstances.has(key)) {
        const db = new UniversalSQLite(dbPath);
        dbInstances.set(key, db);
    }
    return dbInstances.get(key);
}

/**
 * SQLite3 (sqlite3 package) Compatible Adapter over Universal SQLite
 */
class SQLite3DatabaseShim {
    constructor(filename, mode, callback) {
        if (typeof mode === 'function') {
            callback = mode;
            mode = undefined;
        }

        this.slug = this._slug || 'default';
        this.filename = filename || getDbPathForSlug(this.slug);
        
        try {
            this.db = getBetterSqliteForSlug(this.slug, this.filename);
            if (callback) {
                process.nextTick(() => {
                    try {
                        callback.call(this, null);
                    } catch (cbErr) {
                        console.error('[SQLite3 Open Callback Error]', cbErr?.stack || cbErr?.message || cbErr);
                    }
                });
            }
        } catch (err) {
            if (callback) {
                process.nextTick(() => {
                    try { callback.call(this, err); } catch {}
                });
            }
        }
    }

    _normalizeParams(params) {
        if (!params) return [];
        if (!Array.isArray(params)) {
            if (typeof params === 'object') {
                return params;
            }
            return [params];
        }
        return params.map(p => {
            if (typeof p === 'boolean') return p ? 1 : 0;
            if (p === undefined) return null;
            if (p instanceof Date) return p.toISOString().slice(0, 19).replace('T', ' ');
            return p;
        });
    }

    run(sql, params, callback) {
        if (typeof params === 'function') {
            callback = params;
            params = [];
        }
        params = this._normalizeParams(params);

        try {
            const stmt = this.db.prepare(sql);
            const info = stmt.run(params);
            const context = {
                lastID: Number(info.lastInsertRowid),
                changes: info.changes,
            };
            if (callback) {
                process.nextTick(() => callback.call(context, null));
            }
            return this;
        } catch (err) {
            console.error('[SQLite3 Shim Error]', err.message, '| SQL:', sql);
            if (callback) {
                process.nextTick(() => callback(err));
            }
            return this;
        }
    }

    get(sql, params, callback) {
        if (typeof params === 'function') {
            callback = params;
            params = [];
        }
        params = this._normalizeParams(params);

        try {
            const stmt = this.db.prepare(sql);
            const row = stmt.get(params);
            if (callback) {
                process.nextTick(() => callback(null, row));
            }
            return this;
        } catch (err) {
            console.error('[SQLite3 Shim Error]', err.message, '| SQL:', sql);
            if (callback) {
                process.nextTick(() => callback(err, null));
            }
            return this;
        }
    }

    all(sql, params, callback) {
        if (typeof params === 'function') {
            callback = params;
            params = [];
        }
        params = this._normalizeParams(params);

        try {
            const stmt = this.db.prepare(sql);
            const rows = stmt.all(params);
            if (callback) {
                process.nextTick(() => callback(null, rows || []));
            }
            return this;
        } catch (err) {
            console.error('[SQLite3 Shim Error]', err.message, '| SQL:', sql);
            if (callback) {
                process.nextTick(() => callback(err, []));
            }
            return this;
        }
    }

    each(sql, params, callback, completeCallback) {
        if (typeof params === 'function') {
            completeCallback = callback;
            callback = params;
            params = [];
        }
        params = this._normalizeParams(params);

        try {
            const stmt = this.db.prepare(sql);
            const rows = stmt.all(params) || [];
            if (callback) {
                rows.forEach((row) => {
                    callback(null, row);
                });
            }
            if (completeCallback) {
                process.nextTick(() => completeCallback(null, rows.length));
            }
            return this;
        } catch (err) {
            console.error('[SQLite3 Shim each Error]', err.message, 'SQL:', sql);
            if (callback) callback(err, null);
            if (completeCallback) process.nextTick(() => completeCallback(err, 0));
            return this;
        }
    }

    exec(sql, callback) {
        try {
            this.db.exec(sql);
            if (callback) {
                process.nextTick(() => callback(null));
            }
            return this;
        } catch (err) {
            console.error('[SQLite3 Shim exec Error]', err.message, 'SQL:', sql);
            if (callback) {
                process.nextTick(() => callback(err));
            }
            return this;
        }
    }

    prepare(sql, params, callback) {
        if (typeof params === 'function') {
            callback = params;
            params = [];
        }
        
        try {
            const stmt = this.db.prepare(sql);
            const self = this;
            const stmtWrapper = {
                run(...args) {
                    return self.run(sql, ...args);
                },
                get(...args) {
                    return self.get(sql, ...args);
                },
                all(...args) {
                    return self.all(sql, ...args);
                },
                finalize(cb) {
                    if (cb) process.nextTick(cb);
                }
            };
            if (callback) {
                process.nextTick(() => callback(null));
            }
            return stmtWrapper;
        } catch (err) {
            if (callback) process.nextTick(() => callback(err));
            throw err;
        }
    }

    serialize(callback) {
        if (typeof callback === 'function') {
            callback();
        }
        return this;
    }

    parallelize(callback) {
        if (typeof callback === 'function') {
            callback();
        }
        return this;
    }

    close(callback) {
        if (callback) {
            process.nextTick(() => callback(null));
        }
        return this;
    }
}

function getSQLite3ShimForSlug(slug = 'default') {
    class ScopedSQLite3Database extends SQLite3DatabaseShim {
        constructor(filename, mode, callback) {
            super(filename, mode, callback);
            this.slug = slug;
            this.db = getBetterSqliteForSlug(slug, filename);
        }
    }

    const sqlite3Module = {
        Database: ScopedSQLite3Database,
        verbose: function() {
            return sqlite3Module;
        },
        OPEN_READONLY: 1,
        OPEN_READWRITE: 2,
        OPEN_CREATE: 4,
        OPEN_FULLMUTEX: 0x00010000,
        OPEN_URI: 0x00000040,
        OPEN_SHAREDCACHE: 0x00020000,
        OPEN_PRIVATECACHE: 0x00040000,
    };

    return sqlite3Module;
}

function getBetterSqliteShimForSlug(slug = 'default') {
    return function ScopedBetterSqlite3(filename) {
        const actualPath = (!filename || filename === ':memory:' || filename.endsWith('.db') || filename.endsWith('.sqlite'))
            ? getDbPathForSlug(slug)
            : filename;
        return getBetterSqliteForSlug(slug, actualPath);
    };
}

function resetDbKeepAdmin(slug = 'default') {
    const dbPath = getDbPathForSlug(slug);
    if (!fs.existsSync(dbPath)) {
        return { success: true, message: 'Database belum diinisialisasi.' };
    }

    try {
        const db = getBetterSqliteForSlug(slug);
        
        // Temporarily disable foreign key constraints
        db.pragma('foreign_keys = OFF');

        // Query all user tables
        const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").all();
        
        for (const row of tables) {
            const tableName = row.name;
            const lowerName = tableName.toLowerCase();
            
            if (lowerName === 'users') {
                // Keep administrator user (id = 1 or username = 'admin' or role = 'admin')
                db.exec(`DELETE FROM \`${tableName}\` WHERE id > 1 AND LOWER(username) NOT IN ('admin', 'administrator') AND LOWER(role) NOT IN ('admin', 'administrator')`);
            } else {
                // Truncate all records from table
                db.exec(`DELETE FROM \`${tableName}\``);
                try {
                    db.exec(`DELETE FROM sqlite_sequence WHERE name = '${tableName}'`);
                } catch {}
            }
        }

        db.pragma('foreign_keys = ON');

        return {
            success: true,
            message: 'Database berhasil dikosongkan! Seluruh data seed demo telah dibersihkan dan akun admin tetap aktif.'
        };
    } catch (err) {
        console.error(`[resetDbKeepAdmin] Error resetting DB for ${slug}:`, err);
        return {
            success: false,
            message: 'Gagal mengosongkan database: ' + err.message
        };
    }
}

/**
 * Exports complete SQLite database dump (all tables & data rows) as SQL string
 */
function exportDatabaseDump(slug) {
    try {
        const db = getBetterSqliteForSlug(slug);
        try {
            if (typeof db.exec === 'function') db.exec('PRAGMA wal_checkpoint(TRUNCATE);');
            else if (typeof db.pragma === 'function') db.pragma('wal_checkpoint(TRUNCATE)');
        } catch {}

        const tables = db.prepare("SELECT name, sql FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").all();
        let dump = '';
        for (const t of tables) {
            dump += 'DROP TABLE IF EXISTS `' + t.name + '`;\n';
            dump += t.sql + ';\n\n';
            const rows = db.prepare('SELECT * FROM "' + t.name + '"').all();
            if (rows && rows.length > 0) {
                const cols = Object.keys(rows[0]).map(c => '`' + c + '`').join(', ');
                for (const r of rows) {
                    const vals = Object.values(r).map(v => {
                        if (v === null) return 'NULL';
                        if (typeof v === 'number') return v;
                        return "'" + String(v).replace(/\\/g, '\\\\').replace(/'/g, "''") + "'";
                    }).join(', ');
                    dump += 'INSERT INTO `' + t.name + '` (' + cols + ') VALUES (' + vals + ');\n';
                }
                dump += '\n';
            }
        }
        return { success: true, dump, tablesCount: tables.length };
    } catch (err) {
        console.error(`[exportDatabaseDump] Error exporting DB for ${slug}:`, err);
        return { success: false, error: err.message, dump: '' };
    }
}

module.exports = {
    getDbPathForSlug,
    getBetterSqliteForSlug,
    getSQLite3ShimForSlug,
    getBetterSqliteShimForSlug,
    resetDbKeepAdmin,
    exportDatabaseDump,
};
