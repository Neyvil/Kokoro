import { NextResponse } from "next/server"
import { checkRedisHealth, getRedisInfo } from "@/lib/redis"

export async function GET() {
  try {
    const health = await checkRedisHealth()
    const info = await getRedisInfo()

    const response = {
      status: health.connected ? "healthy" : "unhealthy",
      timestamp: new Date().toISOString(),
      redis: {
        connected: health.connected,
        latencyMs: health.latency,
        error: health.error,
        version: info?.redis_version || null,
        usedMemory: info?.used_memory_human || null,
        connectedClients: info?.connected_clients || null,
        uptimeSeconds: info?.uptime_in_seconds || null,
      },
    }

    return NextResponse.json(response, {
      status: health.connected ? 200 : 503,
    })
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
