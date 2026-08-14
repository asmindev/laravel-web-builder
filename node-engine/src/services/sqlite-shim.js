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

    exec(sql) {
        return this.raw.exec(sql);
    }

    prepare(sql) {
        const stmt = this.raw.prepare(sql);
        return {
            run: (params = []) => {
                if (sqliteDriverType === 'node:sqlite') {
                    const p = Array.isArray(params) ? params : (params !== undefined ? [params] : []);
                    const info = stmt.run(...p);
                    return {
                        lastInsertRowid: Number(info.lastInsertRowid),
                        changes: Number(info.changes || 0),
                    };
                } else {
                    const p = Array.isArray(params) ? params : (params !== undefined ? [params] : []);
                    const info = stmt.run(p);
                    return {
                        lastInsertRowid: Number(info.lastInsertRowid),
                        changes: Number(info.changes || 0),
                    };
                }
            },
            get: (params = []) => {
                if (sqliteDriverType === 'node:sqlite') {
                    const p = Array.isArray(params) ? params : (params !== undefined ? [params] : []);
                    return stmt.get(...p);
                } else {
                    const p = Array.isArray(params) ? params : (params !== undefined ? [params] : []);
                    return stmt.get(p);
                }
            },
            all: (params = []) => {
                if (sqliteDriverType === 'node:sqlite') {
                    const p = Array.isArray(params) ? params : (params !== undefined ? [params] : []);
                    return stmt.all(...p) || [];
                } else {
                    const p = Array.isArray(params) ? params : (params !== undefined ? [params] : []);
                    return stmt.all(p) || [];
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
                process.nextTick(() => callback(null));
            }
        } catch (err) {
            console.error('[SQLite3 Shim Error]', err);
            if (callback) {
                process.nextTick(() => callback(err));
            }
        }
    }

    _normalizeParams(params) {
        if (!params) return [];
        if (!Array.isArray(params)) {
            if (typeof params === 'object') return params;
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
            console.error('[SQLite3 Shim run Error]', err.message, 'SQL:', sql);
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
            console.error('[SQLite3 Shim get Error]', err.message, 'SQL:', sql);
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
            console.error('[SQLite3 Shim all Error]', err.message, 'SQL:', sql);
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

module.exports = {
    getDbPathForSlug,
    getBetterSqliteForSlug,
    getSQLite3ShimForSlug,
    getBetterSqliteShimForSlug,
};
