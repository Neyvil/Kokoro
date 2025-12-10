import { Queue, QueueEvents } from "bullmq"
import { getRedisConnection } from "./redis"

// Queue names
export const REMINDER_QUEUE_NAME = process.env.BULLMQ_QUEUE_NAME || "kokoro-reminders"

// Singleton pattern for queue instances
let reminderQueue: Queue | null = null
let queueEvents: QueueEvents | null = null

// Queue configuration with optimized settings
const defaultJobOptions = {
  attempts: Number.parseInt(process.env.BULLMQ_MAX_RETRIES || "3"),
  backoff: {
    type: "exponential" as const,
    delay: Number.parseInt(process.env.BULLMQ_RETRY_DELAY || "60000"),
  },
  removeOnComplete: {
    age: 24 * 3600, // Keep completed jobs for 24 hours
    count: 1000, // Keep last 1000 completed jobs
  },
  removeOnFail: {
    age: 7 * 24 * 3600, // Keep failed jobs for 7 days for debugging
  },
}

export function getReminderQueue(): Queue {
  if (!reminderQueue) {
    const connection = getRedisConnection()

    reminderQueue = new Queue(REMINDER_QUEUE_NAME, {
      connection,
      defaultJobOptions,
    })
  }

  return reminderQueue
}

export function getQueueEvents(): QueueEvents {
  if (!queueEvents) {
    const connection = getRedisConnection()
    queueEvents = new QueueEvents(REMINDER_QUEUE_NAME, { connection })
  }

  return queueEvents
}

// Job types
export interface ReminderJobData {
  reminderId: string
  userId: string
  email: string
  title: string
  description?: string
  priority: "low" | "medium" | "high" | "urgent"
  scheduledAt: string
  recurrence: "none" | "daily" | "weekly" | "monthly" | "yearly"
}

// Add a reminder job to the queue
export async function scheduleReminderJob(data: ReminderJobData): Promise<string> {
  const queue = getReminderQueue()
  const scheduledTime = new Date(data.scheduledAt).getTime()
  const now = Date.now()
  const delay = Math.max(0, scheduledTime - now)

  const job = await queue.add("send-reminder", data, {
    delay,
    jobId: `reminder-${data.reminderId}`,
    priority: getPriorityValue(data.priority),
  })

  console.log(`Scheduled reminder job ${job.id} for ${data.scheduledAt} (delay: ${delay}ms)`)
  return job.id!
}

// Remove a scheduled job
export async function removeReminderJob(reminderId: string): Promise<void> {
  const queue = getReminderQueue()
  const jobId = `reminder-${reminderId}`

  const job = await queue.getJob(jobId)
  if (job) {
    await job.remove()
    console.log(`Removed reminder job ${jobId}`)
  }
}

// Update a scheduled job (remove and re-add)
export async function updateReminderJob(data: ReminderJobData): Promise<string> {
  await removeReminderJob(data.reminderId)
  return scheduleReminderJob(data)
}

// Get queue statistics
export async function getQueueStats() {
  const queue = getReminderQueue()

  const [waiting, active, completed, failed, delayed] = await Promise.all([
    queue.getWaitingCount(),
    queue.getActiveCount(),
    queue.getCompletedCount(),
    queue.getFailedCount(),
    queue.getDelayedCount(),
  ])

  return { waiting, active, completed, failed, delayed }
}

// Helper to convert priority string to numeric value (lower = higher priority)
function getPriorityValue(priority: string): number {
  switch (priority) {
    case "urgent":
      return 1
    case "high":
      return 2
    case "medium":
      return 3
    case "low":
      return 4
    default:
      return 3
  }
}
