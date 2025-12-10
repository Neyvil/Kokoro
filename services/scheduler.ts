import { Worker, type Job } from "bullmq"
import { getRedisConnection } from "@/lib/redis"
import { REMINDER_QUEUE_NAME, type ReminderJobData, scheduleReminderJob } from "@/lib/queue"
import { connectToDatabase } from "@/lib/db"
import { Reminder } from "@/models/reminder"
import { sendReminderEmail } from "./email"

// Worker instance (singleton)
let worker: Worker | null = null

// Start the BullMQ worker
export function startReminderWorker(): Worker {
  if (worker) {
    return worker
  }

  const connection = getRedisConnection()
  const concurrency = Number.parseInt(process.env.BULLMQ_CONCURRENCY || "5")

  worker = new Worker<ReminderJobData>(
    REMINDER_QUEUE_NAME,
    async (job: Job<ReminderJobData>) => {
      console.log(`Processing reminder job ${job.id}`)
      return processReminderJob(job)
    },
    {
      connection,
      concurrency,
      limiter: {
        max: 10, // Max 10 jobs per second (rate limiting)
        duration: 1000,
      },
    },
  )

  // Event handlers for monitoring
  worker.on("completed", (job) => {
    console.log(`Job ${job.id} completed successfully`)
  })

  worker.on("failed", (job, err) => {
    console.error(`Job ${job?.id} failed:`, err.message)
  })

  worker.on("stalled", (jobId) => {
    console.warn(`Job ${jobId} stalled`)
  })

  worker.on("error", (err) => {
    console.error("Worker error:", err)
  })

  console.log(`Reminder worker started with concurrency: ${concurrency}`)
  return worker
}

// Stop the worker gracefully
export async function stopReminderWorker(): Promise<void> {
  if (worker) {
    await worker.close()
    worker = null
    console.log("Reminder worker stopped")
  }
}

// Process a single reminder job
async function processReminderJob(job: Job<ReminderJobData>): Promise<{ success: boolean; message: string }> {
  const { reminderId, email, title, description, priority, scheduledAt, recurrence, userId } = job.data

  await connectToDatabase()

  // Find the reminder in the database
  const reminder = await Reminder.findById(reminderId)

  if (!reminder) {
    return { success: false, message: "Reminder not found" }
  }

  if (reminder.status === "sent" || reminder.status === "cancelled") {
    return { success: false, message: `Reminder already ${reminder.status}` }
  }

  try {
    // Send the email
    await sendReminderEmail({
      to: email,
      title,
      description: description || "",
      scheduledAt: new Date(scheduledAt),
      priority,
    })

    // Update reminder status
    reminder.status = "sent"
    await reminder.save()

    // Handle recurring reminders
    if (recurrence !== "none") {
      const nextDate = calculateNextDate(new Date(scheduledAt), recurrence)

      // Create next reminder in database
      const newReminder = await Reminder.create({
        userId,
        title,
        description,
        scheduledAt: nextDate,
        recurrence,
        priority,
        email,
        status: "pending",
      })

      // Schedule next job
      await scheduleReminderJob({
        reminderId: newReminder._id.toString(),
        userId,
        email,
        title,
        description,
        priority,
        scheduledAt: nextDate.toISOString(),
        recurrence,
      })

      console.log(`Created recurring reminder ${newReminder._id} for ${nextDate}`)
    }

    return { success: true, message: "Reminder sent successfully" }
  } catch (error) {
    // Update status to failed
    reminder.status = "failed"
    await reminder.save()

    throw error // Let BullMQ handle retries
  }
}

// Calculate next occurrence date
function calculateNextDate(currentDate: Date, recurrence: "daily" | "weekly" | "monthly" | "yearly"): Date {
  const next = new Date(currentDate)

  switch (recurrence) {
    case "daily":
      next.setDate(next.getDate() + 1)
      break
    case "weekly":
      next.setDate(next.getDate() + 7)
      break
    case "monthly":
      next.setMonth(next.getMonth() + 1)
      break
    case "yearly":
      next.setFullYear(next.getFullYear() + 1)
      break
  }

  return next
}

// Legacy function for backward compatibility with cron
export async function processDueReminders() {
  await connectToDatabase()

  const now = new Date()

  // Find all pending reminders that are due but not in queue
  const dueReminders = await Reminder.find({
    status: "pending",
    scheduledAt: { $lte: now },
  }).limit(100)

  console.log(`Found ${dueReminders.length} due reminders to process`)

  for (const reminder of dueReminders) {
    await scheduleReminderJob({
      reminderId: reminder._id.toString(),
      userId: reminder.userId,
      email: reminder.email,
      title: reminder.title,
      description: reminder.description,
      priority: reminder.priority,
      scheduledAt: reminder.scheduledAt.toISOString(),
      recurrence: reminder.recurrence,
    })
  }

  return { queued: dueReminders.length }
}
