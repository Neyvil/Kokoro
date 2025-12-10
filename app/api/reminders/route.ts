import { type NextRequest, NextResponse } from "next/server"
import { auth, currentUser } from "@clerk/nextjs/server"
import { connectToDatabase } from "@/lib/db"
import { Reminder } from "@/models/reminder"
import { scheduleReminderJob } from "@/lib/queue"

// GET all reminders for the current user
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectToDatabase()

    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get("status")
    const limit = Number.parseInt(searchParams.get("limit") || "50")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const skip = (page - 1) * limit

    const query: Record<string, unknown> = { userId }
    if (status && status !== "all") {
      query.status = status
    }

    const [reminders, total] = await Promise.all([
      Reminder.find(query).sort({ scheduledAt: 1 }).skip(skip).limit(limit).lean(),
      Reminder.countDocuments(query),
    ])

    return NextResponse.json({
      reminders,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching reminders:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST create a new reminder
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    const user = await currentUser()
    console.log(user?.emailAddresses[0])

    if (!userId || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectToDatabase()

    const body = await request.json()
    const { title, description, scheduledAt, recurrence, priority } = body

    if (!title || !scheduledAt) {
      return NextResponse.json({ error: "Title and scheduled date are required" }, { status: 400 })
    }

    const scheduledDate = new Date(scheduledAt)
    if (scheduledDate <= new Date()) {
      return NextResponse.json({ error: "Scheduled date must be in the future" }, { status: 400 })
    }

    const email = user.emailAddresses[0]?.emailAddress
    if (!email) {
      return NextResponse.json({ error: "No email address found for user" }, { status: 400 })
    }

    const reminder = await Reminder.create({
      userId,
      title,
      description,
      scheduledAt: scheduledDate,
      recurrence: recurrence || "none",
      priority: priority || "medium",
      email,
      status: "pending",
    })

    try {
      await scheduleReminderJob({
        reminderId: reminder._id.toString(),
        userId,
        email,
        title,
        description,
        priority: priority || "medium",
        scheduledAt: scheduledDate.toISOString(),
        recurrence: recurrence || "none",
      })
    } catch (queueError) {
      console.error("Failed to schedule job, reminder created but not queued:", queueError)
      // Reminder is still created, can be picked up by fallback cron
    }

    return NextResponse.json({ reminder }, { status: 201 })
  } catch (error) {
    console.error("Error creating reminder:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
