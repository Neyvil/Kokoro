import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { getQueueStats } from "@/lib/queue"

// GET queue statistics (admin only)
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // In production, add admin role check here
    const stats = await getQueueStats()

    return NextResponse.json({ stats })
  } catch (error) {
    console.error("Error fetching queue stats:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
