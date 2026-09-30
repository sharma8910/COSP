import Redis from 'ioredis'
import { config } from './config.js'

const redis = new Redis(config.redisUrl, {
  maxRetriesPerRequest: 2,
});

redis.on('connect', () => {
  console.log('[redis] connected');
});

redis.on('error', (err) => {
  console.error('[redis] connection error:', err.message);
});

export default redis;