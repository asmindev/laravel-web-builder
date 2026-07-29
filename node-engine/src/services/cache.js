const NodeCache = require('node-cache');

/**
 * Wraps node-cache with a domain-specific interface.
 * TTL: 5 minutes per the architecture spec.
 */
class CacheService {
    constructor(ttlSeconds = 300) {
        this.cache = new NodeCache({ stdTTL: ttlSeconds, checkperiod: 60 });
    }

    get(key) {
        return this.cache.get(key);
    }

    set(key, value) {
        this.cache.set(key, value);
    }

    del(key) {
        this.cache.del(key);
    }

    flush() {
        this.cache.flushAll();
    }
}

module.exports = { CacheService };
