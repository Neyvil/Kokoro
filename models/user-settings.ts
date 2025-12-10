import mongoose, { Schema, type Document, type Model } from "mongoose"

export interface IUserSettings extends Document {
  userId: string
  timezone: string
  emailNotifications: boolean
  reminderLeadTime: number // minutes before to send reminder
  createdAt: Date
  updatedAt: Date
}

const UserSettingsSchema = new Schema<IUserSettings>(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    timezone: {
      type: String,
      default: "UTC",
    },
    emailNotifications: {
      type: Boolean,
      default: true,
    },
    reminderLeadTime: {
      type: Number,
      default: 15,
      min: 0,
      max: 1440, // max 24 hours
    },
  },
  {
    timestamps: true,
  },
)

export const UserSettings: Model<IUserSettings> =
  mongoose.models.UserSettings || mongoose.model<IUserSettings>("UserSettings", UserSettingsSchema)
