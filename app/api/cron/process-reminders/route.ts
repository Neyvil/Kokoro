import { type NextRequest, NextResponse } from "next/server"
import { processDueReminders } from "@/services/scheduler"
import { getQueueStats } from "@/lib/queue"

// This endpoint is called by Vercel Cron as a fallback
// Primary scheduling is handled by BullMQ delayed jobs
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization")

  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Process any reminders that might have been missed
    const result = await processDueReminders()

    // Get queue stats for monitoring
    const queueStats = await getQueueStats()

    return NextResponse.json({
      ...result,
      queueStats,
      message: "Fallback cron executed - primary scheduling via BullMQ",
    })
  } catch (error) {
    console.error("Error processing reminders:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization")

  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const result = await processDueReminders()
    const queueStats = await getQueueStats()

    return NextResponse.json({ ...result, queueStats })
  } catch (error) {
    console.error("Error processing reminders:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
