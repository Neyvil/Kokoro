/**
 * BullMQ Worker Script
 *
 * This script runs the BullMQ worker process that handles reminder jobs.
 * In production, run this as a separate process:
 *
 * npx tsx scripts/worker.ts
 *
 * For development, you can also import and start the worker from your app.
 */

// MUST load environment variables FIRST, before any other imports
import dotenv from "dotenv"
import path from "path"

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") })

// Now import scheduler (which imports email service)
import { startReminderWorker, stopReminderWorker } from "../services/scheduler"

console.log("Starting Kokoro reminder worker...")
console.log("REDIS_URL:", process.env.REDIS_URL ? "✅ Configured" : "❌ Missing")
console.log("MONGODB_URI:", process.env.MONGODB_URI ? "✅ Configured" : "❌ Missing")
console.log("RESEND_API_KEY:", process.env.RESEND_API_KEY ? "✅ Configured" : "❌ Missing")

const worker = startReminderWorker()

// Graceful shutdown handlers
process.on("SIGTERM", async () => {
  console.log("SIGTERM received, shutting down gracefully...")
  await stopReminderWorker()
  process.exit(0)
})

process.on("SIGINT", async () => {
  console.log("SIGINT received, shutting down gracefully...")
  await stopReminderWorker()
  process.exit(0)
})

// Keep the process running
process.on("uncaughtException", (error) => {
  console.error("Uncaught exception:", error)
})

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled rejection at:", promise, "reason:", reason)
})

console.log("Worker is running. Press Ctrl+C to stop.")
