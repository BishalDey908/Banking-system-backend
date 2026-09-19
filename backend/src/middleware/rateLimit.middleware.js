const { rateLimit, MemoryStore, ipKeyGenerator } = require('express-rate-limit');
const { redisClient, isRedisReady } = require('../config/redis');

/**
 * ============================================================================
 * RESILIENT REDIS / IN-MEMORY RATE LIMIT STORE
 * ============================================================================
 * Implements a dual-layer store that delegates to Redis when connected,
 * and automatically falls back to an in-memory store if Redis is unavailable.
 * 
 * Features:
 * - Atomic Redis INCR + EXPIRE via Redis pipeline for distributed deployments.
 * - Zero 500 errors: If Redis fails, seamlessly falls back to in-memory store.
 * - Standard RFC draft-7 RateLimit headers.
 */
class ResilientRedisStore {
    constructor(prefix = 'rl:') {
        this.prefix = prefix;
        this.memStore = new MemoryStore();
    }

    init(options) {
        this.windowMs = options.windowMs || 60000;
        this.memStore.init(options);
    }

    async increment(key) {
        if (isRedisReady()) {
            try {
                const redisKey = `${this.prefix}${key}`;
                const windowSec = Math.max(1, Math.ceil(this.windowMs / 1000));

                // Execute atomic INCR, set EXPIRE if first hit, and query TTL
                const results = await redisClient
                    .pipeline()
                    .incr(redisKey)
                    .expire(redisKey, windowSec, 'NX')
                    .ttl(redisKey)
                    .exec();

                const totalHits = results[0][1];
                let ttl = results[2][1];
                if (ttl < 0) ttl = windowSec;

                return {
                    totalHits,
                    resetTime: new Date(Date.now() + ttl * 1000)
                };
            } catch (err) {
                console.warn(`[RateLimit] Redis increment failed for ${key}, falling back to memory:`, err.message);
            }
        }

        return this.memStore.increment(key);
    }

    async get(key) {
        if (isRedisReady()) {
            try {
                const redisKey = `${this.prefix}${key}`;
                const [val, ttl] = await Promise.all([
                    redisClient.get(redisKey),
                    redisClient.ttl(redisKey)
                ]);

                if (val !== null) {
                    return {
                        totalHits: parseInt(val, 10),
                        resetTime: new Date(Date.now() + (ttl > 0 ? ttl : 0) * 1000)
                    };
                }
            } catch (err) {
                // Fall through to in-memory
            }
        }

        return this.memStore.get(key);
    }

    async decrement(key) {
        if (isRedisReady()) {
            try {
                const redisKey = `${this.prefix}${key}`;
                await redisClient.decr(redisKey);
                return;
            } catch (err) {
                // Fall through to in-memory
            }
        }

        return this.memStore.decrement(key);
    }

    async resetKey(key) {
        if (isRedisReady()) {
            try {
                const redisKey = `${this.prefix}${key}`;
                await redisClient.del(redisKey);
            } catch (err) {
                // Fall through
            }
        }

        return this.memStore.resetKey(key);
    }

    resetAll() {
        return this.memStore.resetAll();
    }
}

/**
 * Helper to generate consistent JSON error responses
 */
function createRateLimitHandler(message, retryAfterMinutes = null) {
    return (req, res, next, options) => {
        const retrySec = res.getHeader('Retry-After');
        const remainingMinutes = retrySec ? Math.ceil(retrySec / 60) : retryAfterMinutes;

        res.status(options.statusCode || 429).json({
            status: 429,
            error: 'Too Many Requests',
            message: message || 'You have exceeded the rate limit. Please try again later.',
            retryAfterSeconds: retrySec ? parseInt(retrySec, 10) : (retryAfterMinutes ? retryAfterMinutes * 60 : 60),
            retryAfter: remainingMinutes ? `${remainingMinutes} minute(s)` : undefined
        });
    };
}

/**
 * 1. Global API Rate Limiter
 * Protects entire API against volumetric scraping, DDoS, and runaway clients.
 * Default: 300 requests per 15 minutes per IP.
 * Configurable via: RATE_LIMIT_MAX and RATE_LIMIT_WINDOW_MS
 */
const apiLimiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX, 10) || 300, // Limit each IP to 300 requests per windowMs
    standardHeaders: 'draft-7', // Return standard `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    store: new ResilientRedisStore('rl:global:'),
    handler: createRateLimitHandler('Too many requests from this IP. Please try again after 15 minutes.', 15),
    skip: (req) => {
        // Skip health check endpoints
        return req.path === '/api/health/redis' || req.path === '/health';
    }
});

/**
 * 2. Strict Authentication Rate Limiter
 * Protects login, registration, and Google OAuth from credential stuffing and brute force.
 * Default: 10 requests per 15 minutes per IP.
 * Configurable via: AUTH_RATE_LIMIT_MAX and AUTH_RATE_LIMIT_WINDOW_MS
 */
const authLimiter = rateLimit({
    windowMs: parseInt(process.env.AUTH_RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.AUTH_RATE_LIMIT_MAX, 10) || 10, // Max 10 attempts per 15 minutes
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    store: new ResilientRedisStore('rl:auth:'),
    handler: createRateLimitHandler('Too many login/registration attempts. Please wait 15 minutes before trying again.', 15)
});

/**
 * 3. Financial Transaction Write Rate Limiter
 * Protects deposits and money transfers against race-condition spam, double-submit, and bot scripts.
 * Default: 20 transactions per minute per user/IP.
 * Configurable via: TX_RATE_LIMIT_MAX and TX_RATE_LIMIT_WINDOW_MS
 */
const transactionLimiter = rateLimit({
    windowMs: parseInt(process.env.TX_RATE_LIMIT_WINDOW_MS, 10) || 60 * 1000, // 1 minute
    max: parseInt(process.env.TX_RATE_LIMIT_MAX, 10) || 20, // Max 20 transfers/deposits per minute
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    store: new ResilientRedisStore('rl:tx:'),
    keyGenerator: (req) => {
        // Prefer authenticated user ID for accurate per-user rate limiting
        return req.user?._id ? req.user._id.toString() : ipKeyGenerator(req);
    },
    handler: createRateLimitHandler('Transaction rate limit reached. Please wait a moment before initiating another transaction.', 1)
});

/**
 * 4. Bank Account Creation Rate Limiter
 * Prevents account spamming and wallet flooding.
 * Default: 10 account creations per hour per user/IP.
 * Configurable via: ACC_RATE_LIMIT_MAX and ACC_RATE_LIMIT_WINDOW_MS
 */
const accountCreationLimiter = rateLimit({
    windowMs: parseInt(process.env.ACC_RATE_LIMIT_WINDOW_MS, 10) || 60 * 60 * 1000, // 1 hour
    max: parseInt(process.env.ACC_RATE_LIMIT_MAX, 10) || 10,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    store: new ResilientRedisStore('rl:acc_create:'),
    keyGenerator: (req) => {
        return req.user?._id ? req.user._id.toString() : ipKeyGenerator(req);
    },
    handler: createRateLimitHandler('Account creation limit reached. Please wait before opening more accounts.', 60)
});

module.exports = {
    apiLimiter,
    authLimiter,
    transactionLimiter,
    accountCreationLimiter,
    ResilientRedisStore
};
