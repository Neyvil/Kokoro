import mongoose, { Schema, type Document, type Model } from "mongoose"

export interface IReminder extends Document {
  userId: string
  title: string
  description?: string
  scheduledAt: Date
  recurrence?: "none" | "daily" | "weekly" | "monthly" | "yearly"
  priority: "low" | "medium" | "high"
  status: "pending" | "sent" | "failed" | "cancelled"
  email: string
  createdAt: Date
  updatedAt: Date
}

const ReminderSchema = new Schema<IReminder>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    scheduledAt: {
      type: Date,
      required: true,
      index: true,
    },
    recurrence: {
      type: String,
      enum: ["none", "daily", "weekly", "monthly", "yearly"],
      default: "none",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    status: {
      type: String,
      enum: ["pending", "sent", "failed", "cancelled"],
      default: "pending",
      index: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
  },
  {
    timestamps: true,
  },
)

// Compound index for efficient queries
ReminderSchema.index({ userId: 1, status: 1, scheduledAt: 1 })

export const Reminder: Model<IReminder> =
  mongoose.models.Reminder || mongoose.model<IReminder>("Reminder", ReminderSchema)
