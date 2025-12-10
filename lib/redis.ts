import { Redis } from "ioredis"

// Singleton pattern for Redis connection
let redis: Redis | null = null

export function getRedisConnection(): Redis {
  if (!redis) {
    const redisUrl = process.env.REDIS_URL || process.env.KV_URL

    if (redisUrl) {
      // Upstash Redis configuration (optimized for serverless)
      redis = new Redis(redisUrl, {
        // Required for BullMQ compatibility
        maxRetriesPerRequest: null,
        enableReadyCheck: false,

        // Upstash-specific optimizations
        tls: redisUrl.startsWith("rediss://") ? { rejectUnauthorized: false } : undefined,

        // Connection pooling settings
        family: 4, // IPv4
        connectTimeout: 30000, // Increased to 30 seconds for Upstash
        commandTimeout: 30000, // Increased to 30 seconds per command

        // Keepalive for persistent connections
        keepAlive: 30000, // 30 seconds

        // Retry strategy with exponential backoff
        retryStrategy: (times) => {
          if (times > 10) {
            console.error("[Redis] Connection failed after 10 retries")
            return null
          }
          const delay = Math.min(times * 1000, 10000)
          console.log(`[Redis] Retrying connection in ${delay}ms (attempt ${times})`)
          return delay
        },

        // Reconnect on error
        reconnectOnError: (err) => {
          const targetErrors = ["READONLY", "ECONNRESET", "ETIMEDOUT"]
          return targetErrors.some((e) => err.message.includes(e))
        },
      })
    } else {
      // Local Redis fallback
      redis = new Redis({
        host: process.env.REDIS_HOST || "localhost",
        port: Number.parseInt(process.env.REDIS_PORT || "6379"),
        password: process.env.REDIS_PASSWORD,
        maxRetriesPerRequest: null,
        enableReadyCheck: false,
      })
    }

    redis.on("error", (error) => {
      console.error("[Redis] Connection error:", error.message)
      console.error("[Redis] Error code:", error.code)
    })

    redis.on("connect", () => {
      console.log("[Redis] Connected successfully")
    })

    redis.on("ready", () => {
      console.log("[Redis] Ready to accept commands")
    })

    redis.on("close", () => {
      console.log("[Redis] Connection closed")
    })

    redis.on("reconnecting", () => {
      console.log("[Redis] Attempting to reconnect...")
    })
  }

  return redis
}

export async function checkRedisHealth(): Promise<{
  connected: boolean
  latency: number | null
  error: string | null
}> {
  try {
    const client = getRedisConnection()
    const start = Date.now()
    await client.ping()
    const latency = Date.now() - start

    return {
      connected: true,
      latency,
      error: null,
    }
  } catch (error) {
    return {
      connected: false,
      latency: null,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

export async function getRedisInfo(): Promise<Record<string, string> | null> {
  try {
    const client = getRedisConnection()
    const info = await client.info()

    const parsed: Record<string, string> = {}
    info.split("\n").forEach((line) => {
      const [key, value] = line.split(":")
      if (key && value) {
        parsed[key.trim()] = value.trim()
      }
    })

    return parsed
  } catch {
    return null
  }
}

export async function closeRedisConnection(): Promise<void> {
  if (redis) {
    await redis.quit()
    redis = null
  }
}
