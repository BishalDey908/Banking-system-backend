const { rateLimit } = require('express-rate-limit');
const { ResilientRedisStore } = require('../middleware/rateLimit.middleware');
const { isRedisReady } = require('../config/redis');

async function runTests() {
    console.log('====================================================');
    console.log('TESTING RATE LIMITER & RESILIENT STORE');
    console.log('====================================================');
    console.log('Redis status:', isRedisReady() ? 'CONNECTED' : 'OFFLINE (Memory Fallback Active)');

    // 1. Create a test limiter with max 3 requests
    const testStore = new ResilientRedisStore('test_rl:');
    const limiter = rateLimit({
        windowMs: 10 * 1000, // 10 seconds
        max: 3,
        store: testStore,
        standardHeaders: 'draft-7',
        legacyHeaders: false,
        message: {
            status: 429,
            error: 'Too Many Requests',
            message: 'Rate limit test exceeded.'
        }
    });

    // Helper to simulate request through express middleware
    function simulateRequest(ip = '127.0.0.1') {
        return new Promise((resolve) => {
            const req = {
                ip,
                headers: {},
                path: '/api/test',
                app: {
                    get: (key) => (key === 'trust proxy' ? 1 : undefined)
                }
            };
            const headersSet = {};
            const res = {
                setHeader(name, val) {
                    headersSet[name] = val;
                },
                getHeader(name) {
                    return headersSet[name];
                },
                status(code) {
                    this.statusCode = code;
                    return this;
                },
                json(payload) {
                    this.body = payload;
                    resolve({ statusCode: this.statusCode || 200, headers: headersSet, body: this.body });
                },
                send(payload) {
                    this.body = payload;
                    resolve({ statusCode: this.statusCode || 200, headers: headersSet, body: this.body });
                }
            };
            const next = () => {
                resolve({ statusCode: 200, headers: headersSet, body: 'OK' });
            };

            limiter(req, res, next);
        });
    }

    console.log('\n--- Test 1: Requests within limit (Max 3) ---');
    for (let i = 1; i <= 3; i++) {
        const res = await simulateRequest('192.168.1.100');
        console.log(`Request ${i}: Status = ${res.statusCode}, Remaining = ${res.headers['ratelimit-remaining'] || res.headers['RateLimit-Remaining']}`);
        if (res.statusCode !== 200) {
            throw new Error(`Expected status 200 on request ${i}, got ${res.statusCode}`);
        }
    }

    console.log('\n--- Test 2: Request exceeding limit (4th request) ---');
    const blockedRes = await simulateRequest('192.168.1.100');
    console.log(`Request 4: Status = ${blockedRes.statusCode}, Body =`, blockedRes.body);
    if (blockedRes.statusCode !== 429) {
        throw new Error(`Expected status 429 on 4th request, got ${blockedRes.statusCode}`);
    }

    console.log('\n--- Test 3: Different IP should have independent quota ---');
    const diffIpRes = await simulateRequest('192.168.1.200');
    console.log(`Different IP Request: Status = ${diffIpRes.statusCode}, Remaining = ${diffIpRes.headers['ratelimit-remaining'] || diffIpRes.headers['RateLimit-Remaining']}`);
    if (diffIpRes.statusCode !== 200) {
        throw new Error(`Expected status 200 for new IP, got ${diffIpRes.statusCode}`);
    }

    console.log('\n====================================================');
    console.log('ALL RATE LIMIT TESTS PASSED SUCCESSFULLY!');
    console.log('====================================================');
    process.exit(0);
}

runTests().catch((err) => {
    console.error('Rate limit test failed:', err);
    process.exit(1);
});
