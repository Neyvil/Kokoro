import { getRedisConnection } from "./redis"

interface RateLimitResult {
  success: boolean
  remaining: number
  reset: number
}

export async function rateLimit(identifier: string, limit = 10, windowMs = 60000): Promise<RateLimitResult> {
  const redis = getRedisConnection()
  const key = `ratelimit:${identifier}`
  const now = Date.now()
  const windowStart = now - windowMs

  // Use Redis transaction for atomic operations
  const multi = redis.multi()

  // Remove old entries outside the window
  multi.zremrangebyscore(key, 0, windowStart)

  // Count current requests in window
  multi.zcard(key)

  // Add current request
  multi.zadd(key, now, `${now}-${Math.random()}`)

  // Set expiry on the key
  multi.pexpire(key, windowMs)

  const results = await multi.exec()

  if (!results) {
    return { success: false, remaining: 0, reset: windowMs }
  }

  const count = (results[1]?.[1] as number) || 0
  const remaining = Math.max(0, limit - count - 1)
  const reset = windowMs

  return {
    success: count < limit,
    remaining,
    reset,
  }
}

// Simple fixed window rate limiter (more efficient for high traffic)
export async function rateLimitFixed(identifier: string, limit = 100, windowSeconds = 60): Promise<RateLimitResult> {
  const redis = getRedisConnection()
  const window = Math.floor(Date.now() / 1000 / windowSeconds)
  const key = `ratelimit:fixed:${identifier}:${window}`

  const current = await redis.incr(key)

  if (current === 1) {
    await redis.expire(key, windowSeconds)
  }

  const remaining = Math.max(0, limit - current)
  const reset = (window + 1) * windowSeconds * 1000 - Date.now()

  return {
    success: current <= limit,
    remaining,
    reset,
  }
}
