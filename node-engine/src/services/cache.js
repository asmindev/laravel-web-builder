let NodeCache = null;
try {
    NodeCache = require('node-cache');
} catch {}

/**
 * Wraps node-cache with a domain-specific interface.
 * Falls back to in-memory Map if node-cache is not loaded.
 */
class CacheService {
    constructor(ttlSeconds = 300) {
        if (NodeCache) {
            this.cache = new NodeCache({ stdTTL: ttlSeconds, checkperiod: 60 });
        } else {
            this.map = new Map();
        }
    }

    get(key) {
        if (this.cache) return this.cache.get(key);
        return this.map ? this.map.get(key) : undefined;
    }

    set(key, value) {
        if (this.cache) return this.cache.set(key, value);
        if (this.map) this.map.set(key, value);
    }

    del(key) {
        if (this.cache) return this.cache.del(key);
        if (this.map) this.map.delete(key);
    }

    flush() {
        if (this.cache) return this.cache.flushAll();
        if (this.map) this.map.clear();
    }
}

module.exports = { CacheService };
