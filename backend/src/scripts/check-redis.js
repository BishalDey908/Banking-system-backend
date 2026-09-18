const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
if (!process.env.REDIS_URL) {
    require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });
}

const Redis = require('ioredis');

const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

async function checkRedis() {
    console.log('\n====================================================');
    console.log('       🔍 FINCHECK REDIS DIAGNOSTIC TOOL            ');
    console.log('====================================================');
    console.log(`Target Redis URL: ${REDIS_URL.replace(/\/\/.*@/, '//***@')}\n`);

    const client = new Redis(REDIS_URL, {
        connectTimeout: 4000,
        maxRetriesPerRequest: 1,
        lazyConnect: true
    });
    client.on('error', () => {});

    try {
        console.log('1. Connecting to Redis server...');
        const startConnect = Date.now();
        await client.connect();
        const connectTime = Date.now() - startConnect;
        console.log(`   ✅ Connected successfully in ${connectTime}ms!`);

        console.log('\n2. Testing round-trip PING...');
        const startPing = Date.now();
        const pong = await client.ping();
        const pingTime = Date.now() - startPing;
        console.log(`   ✅ Response: "${pong}" (Latency: ${pingTime}ms)`);

        console.log('\n3. Testing Write & Read (Cache Simulation)...');
        const testKey = 'cache:test:healthcheck';
        const testPayload = JSON.stringify({ status: 'healthy', timestamp: Date.now() });
        
        await client.set(testKey, testPayload, 'EX', 60);
        const readBack = await client.get(testKey);
        const parsed = JSON.parse(readBack);

        if (parsed.status === 'healthy') {
            console.log('   ✅ Write & Read test passed! Data serialized and deserialized accurately.');
        } else {
            console.log('   ⚠️ Data mismatch on read-back.');
        }
        await client.del(testKey);

        console.log('\n4. Inspecting Active Banking Cache Keys...');
        let cursor = '0';
        const activeKeys = [];
        do {
            const [nextCursor, keys] = await client.scan(cursor, 'MATCH', 'cache:*', 'COUNT', 50);
            cursor = nextCursor;
            activeKeys.push(...keys);
        } while (cursor !== '0');

        if (activeKeys.length === 0) {
            console.log('   ℹ️  No active banking keys found currently. (They will appear when users load accounts or activity).');
        } else {
            console.log(`   ✅ Found ${activeKeys.length} active cached key(s):`);
            activeKeys.slice(0, 10).forEach(k => console.log(`      - ${k}`));
            if (activeKeys.length > 10) {
                console.log(`      ... and ${activeKeys.length - 10} more.`);
            }
        }

        console.log('\n====================================================');
        console.log('  🎉 STATUS: REDIS IS FULLY WORKING AND ACTIVE!     ');
        console.log('====================================================\n');
        client.disconnect();
        process.exit(0);

    } catch (err) {
        console.log(`\n❌ Could not connect to Redis server: ${err.message}`);
        console.log('\n----------------------------------------------------');
        console.log('Troubleshooting Guide:');
        console.log('1. If running locally, ensure Redis is started:');
        console.log('   - Via WSL: wsl sudo service redis-server start');
        console.log('   - Via Docker: docker run -d -p 6379:6379 redis');
        console.log('2. If using Cloud Redis (e.g. Upstash / Redis Cloud):');
        console.log('   - Verify REDIS_URL in backend/.env');
        console.log('   - Example: REDIS_URL=rediss://default:pwd@host.upstash.io:6379');
        console.log('3. Note: The backend has graceful degradation enabled,');
        console.log('   so your API and banking transactions will continue');
        console.log('   functioning normally via MongoDB even when Redis is offline.');
        console.log('----------------------------------------------------\n');
        client.disconnect();
        process.exit(1);
    }
}

checkRedis();
