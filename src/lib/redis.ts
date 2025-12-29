import Redis from "ioredis";

const globalForRedis = globalThis as unknown as {
  redis: Redis | null | undefined;
};

function createRedisClient(): Redis | null {
  // Skip Redis connection during build time or in browser
  if (
    process.env.NEXT_PHASE === 'phase-production-build' ||
    typeof window !== 'undefined'
  ) {
    return null;
  }

  const redisUrl = process.env.REDIS_URL;

  // Skip if no Redis URL is provided
  if (!redisUrl) {
    console.warn("REDIS_URL not provided, Redis features will be disabled");
    return null;
  }

  try {
    const client = new Redis(redisUrl, {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
      lazyConnect: true, // Don't connect immediately
      retryStrategy: () => null, // Don't retry on connection failure
    });

    // Suppress connection errors during build
    client.on('error', (err) => {
      if (process.env.NODE_ENV === 'production') {
        console.warn('Redis connection error (non-fatal):', err.message);
      }
    });

    return client;
  } catch (error) {
    console.error("Failed to create Redis client:", error);
    return null;
  }
}

export const redis = globalForRedis.redis ?? createRedisClient();

if (process.env.NODE_ENV !== "production") {
  globalForRedis.redis = redis;
}

export default redis;
