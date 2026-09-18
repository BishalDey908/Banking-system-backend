const Redis = require('ioredis');

/**
 * ============================================================================
 * REDIS CONFIGURATION & CONNECTION POOL
 * ============================================================================
 * Redis is an in-memory key-value data store used here for high-speed caching.
 * 
 * Key Resilience Features:
 * 1. Non-Blocking Startup: Uses lazyConnect / graceful retry so the backend
 *    starts up and functions normally even if Redis is temporarily offline.
 * 2. Automatic Reconnection: Automatically retries with exponential backoff.
 * 3. Graceful Fallback: If Redis is unavailable, requests seamlessly bypass
 *    the cache and query MongoDB directly with zero 500 errors.
 */

const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

let isConnected = false;
let hasLoggedWarning = false;

const redisClient = new Redis(REDIS_URL, {
    // Retry strategy with capped exponential backoff
    retryStrategy(times) {
        if (times > 10 && !hasLoggedWarning) {
            console.warn('[Redis] Redis server unreachable after 10 attempts. Caching disabled; using direct database fallback.');
            hasLoggedWarning = true;
        }
        // Reconnect after delay (min 500ms, max 3000ms)
        return Math.min(times * 200, 3000);
    },
    maxRetriesPerRequest: 1, // Don't hold up HTTP requests if Redis is unresponsive
    enableReadyCheck: true,
    connectTimeout: 5000,
    lazyConnect: false // Connect automatically in background
});

redisClient.on('connect', () => {
    // Socket connected
});

redisClient.on('ready', () => {
    isConnected = true;
    hasLoggedWarning = false;
    console.log(`[Redis] Connected and ready at ${REDIS_URL.replace(/\/\/.*@/, '//***@')}`);
});

redisClient.on('error', (err) => {
    isConnected = false;
    if (!hasLoggedWarning) {
        console.warn(`[Redis] Connection warning: ${err.message}. Backend will fall back to MongoDB.`);
        hasLoggedWarning = true;
    }
});

redisClient.on('close', () => {
    isConnected = false;
});

redisClient.on('reconnecting', () => {
    // Attempting to reconnect
});

/**
 * Check if Redis is actively connected and ready to process commands
 * @returns {boolean}
 */
function isRedisReady() {
    return isConnected && redisClient.status === 'ready';
}

module.exports = {
    redisClient,
    isRedisReady
};

