import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { connectToDatabase } from "@/lib/db"
import { Reminder } from "@/models/reminder"
import { updateReminderJob, removeReminderJob } from "@/lib/queue"
import { Types } from "mongoose"

// GET a single reminder
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { userId } = await auth()
    const { id } = params

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectToDatabase()

    const reminder = await Reminder.findOne({ _id: id, userId }).lean()

    if (!reminder) {
      return NextResponse.json({ error: "Reminder not found" }, { status: 404 })
    }

    return NextResponse.json({ reminder })
  } catch (error) {
    console.error("Error fetching reminder:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// PATCH update a reminder
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { userId } = await auth()
    const { id } = params

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectToDatabase()

    const body = await request.json()
    const { title, description, scheduledAt, recurrence, priority, status } = body

    const updateData: Record<string, unknown> = {}
    if (title) updateData.title = title
    if (description !== undefined) updateData.description = description
    if (scheduledAt) updateData.scheduledAt = new Date(scheduledAt)
    if (recurrence) updateData.recurrence = recurrence
    if (priority) updateData.priority = priority
    if (status) updateData.status = status

    const reminder = await Reminder.findOneAndUpdate({ _id: id, userId }, updateData, { new: true }).lean()

    if (!reminder) {
      return NextResponse.json({ error: "Reminder not found" }, { status: 404 })
    }

    if (reminder.status === "pending") {
      try {
        await updateReminderJob({
          reminderId: id,
          userId,
          email: reminder.email,
          title: reminder.title,
          description: reminder.description,
          priority: reminder.priority,
          scheduledAt: reminder.scheduledAt.toISOString(),
          recurrence: reminder.recurrence,
        })
      } catch (queueError) {
        console.error("Failed to update job in queue:", queueError)
      }
    }

    return NextResponse.json({ reminder })
  } catch (error) {
    console.error("Error updating reminder:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// DELETE a reminder
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { userId } = await auth()
    const { id } = params

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Validate MongoDB ObjectId format
    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid reminder ID" }, { status: 400 })
    }

    await connectToDatabase()

    // Delete the reminder
    const reminder = await Reminder.findOneAndDelete(
      { _id: new Types.ObjectId(id), userId },
      { lean: true }
    )

    if (!reminder) {
      return NextResponse.json(
        { error: "Reminder not found or already deleted" },
        { status: 404 }
      )
    }

    // Remove the job from the queue
    try {
      await removeReminderJob(id)
      console.log(`Removed job for reminder ${id}`)
    } catch (queueError) {
      console.error("Failed to remove job from queue:", queueError)
      // Don't fail the delete if queue removal fails
    }

    return NextResponse.json({ 
      success: true,
      reminder: reminder 
    })
  } catch (error) {
    console.error("Error deleting reminder:", error)
    return NextResponse.json(
      { error: "Failed to delete reminder" },
      { status: 500 }
    )
  }
}
