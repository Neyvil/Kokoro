import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { connectToDatabase } from "@/lib/db"
import { UserSettings } from "@/models/user-settings"

// GET user settings
export async function GET() {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectToDatabase()

    let settings = await UserSettings.findOne({ userId }).lean()

    // Create default settings if none exist
    if (!settings) {
      settings = await UserSettings.create({
        userId,
        timezone: "UTC",
        emailNotifications: true,
        reminderLeadTime: 15,
      })
    }

    return NextResponse.json({ settings })
  } catch (error) {
    console.error("Error fetching settings:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// PATCH update user settings
export async function PATCH(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectToDatabase()

    const body = await request.json()
    const { timezone, emailNotifications, reminderLeadTime } = body

    const updateData: Record<string, unknown> = {}
    if (timezone) updateData.timezone = timezone
    if (emailNotifications !== undefined) updateData.emailNotifications = emailNotifications
    if (reminderLeadTime !== undefined) updateData.reminderLeadTime = reminderLeadTime

    const settings = await UserSettings.findOneAndUpdate({ userId }, updateData, { new: true, upsert: true }).lean()

    return NextResponse.json({ settings })
  } catch (error) {
    console.error("Error updating settings:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
