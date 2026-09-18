const { redisClient, isRedisReady } = require('../config/redis');

/**
 * ============================================================================
 * CACHE SERVICE (Cache-Aside Pattern)
 * ============================================================================
 * Implements the standard Cache-Aside pattern with resilient error isolation:
 * - Read path: Check Redis -> return on HIT -> query DB on MISS -> set Redis -> return
 * - Write path: Mutate DB -> invalidate (delete) affected cache keys
 * - Resilient: Any Redis error or disconnection gracefully returns null / false
 *   without interrupting or failing financial transactions.
 */

const DEFAULT_TTL_SECONDS = 300; // 5 minutes default Time-To-Live

/**
 * Retrieve cached item by key
 * @param {string} key
 * @returns {Promise<any|null>} Parsed cached object or null if cache miss / offline
 */
async function get(key) {
    if (!isRedisReady()) return null;

    try {
        const raw = await redisClient.get(key);
        if (!raw) return null;
        return JSON.parse(raw);
    } catch (err) {
        console.warn(`[CacheService] Failed to read key "${key}":`, err.message);
        return null;
    }
}

/**
 * Store item in cache with Time-To-Live (TTL)
 * @param {string} key
 * @param {any} value - Serializable data object
 * @param {number} [ttlSeconds=300] - Expiration in seconds
 * @returns {Promise<boolean>} True if successfully cached
 */
async function set(key, value, ttlSeconds = DEFAULT_TTL_SECONDS) {
    if (!isRedisReady()) return false;

    try {
        const serialized = JSON.stringify(value);
        await redisClient.set(key, serialized, 'EX', ttlSeconds);
        return true;
    } catch (err) {
        console.warn(`[CacheService] Failed to set key "${key}":`, err.message);
        return false;
    }
}

/**
 * Delete a specific key from cache (Cache Invalidation)
 * @param {string} key
 * @returns {Promise<boolean>}
 */
async function del(key) {
    if (!isRedisReady()) return false;

    try {
        await redisClient.del(key);
        return true;
    } catch (err) {
        console.warn(`[CacheService] Failed to delete key "${key}":`, err.message);
        return false;
    }
}

/**
 * Delete multiple keys matching a glob pattern using non-blocking SCAN
 * Avoids using blocking KEYS * command in production Redis.
 * @param {string} pattern - e.g. "cache:user:12345:*"
 * @returns {Promise<number>} Number of keys deleted
 */
async function delByPattern(pattern) {
    if (!isRedisReady()) return 0;

    try {
        let cursor = '0';
        let totalDeleted = 0;

        do {
            const [nextCursor, keys] = await redisClient.scan(cursor, 'MATCH', pattern, 'COUNT', 50);
            cursor = nextCursor;

            if (keys.length > 0) {
                const deleted = await redisClient.del(...keys);
                totalDeleted += deleted;
            }
        } while (cursor !== '0');

        return totalDeleted;
    } catch (err) {
        console.warn(`[CacheService] Failed to delete pattern "${pattern}":`, err.message);
        return 0;
    }
}

/**
 * Invalidate all cached data for a given user and bank account.
 * Called immediately after every write operation (deposit, transfer, account creation).
 * 
 * @param {string} userId - ID of the user whose cache to purge
 * @param {string} [accountId] - Optional specific account ID to purge
 */
async function invalidateUserFinancials(userId, accountId = null) {
    if (!userId) return;

    const uId = userId.toString();
    const keysToDelete = [
        `cache:user:${uId}:accounts`,
        `cache:user:${uId}:transactions`,
        `cache:user:${uId}:profile`,
    ];

    if (accountId) {
        keysToDelete.push(`cache:account:${accountId.toString()}:transactions`);
    }

    try {
        await Promise.all(keysToDelete.map((k) => del(k)));
        // Also clean any wildcard keys for this user
        await delByPattern(`cache:user:${uId}:*`);
    } catch (err) {
        console.warn(`[CacheService] Failed to invalidate cache for user ${uId}:`, err.message);
    }
}

module.exports = {
    get,
    set,
    del,
    delByPattern,
    invalidateUserFinancials,
    DEFAULT_TTL_SECONDS
};

