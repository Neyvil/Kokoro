import { create } from "zustand"

export interface Reminder {
  _id: string
  userId: string
  title: string
  description?: string
  scheduledAt: string
  recurrence: "none" | "daily" | "weekly" | "monthly" | "yearly"
  priority: "low" | "medium" | "high"
  status: "pending" | "sent" | "failed" | "cancelled"
  email: string
  createdAt: string
  updatedAt: string
}

interface RemindersState {
  reminders: Reminder[]
  isLoading: boolean
  error: string | null
  filter: "all" | "pending" | "sent" | "cancelled"
  setReminders: (reminders: Reminder[]) => void
  addReminder: (reminder: Reminder) => void
  updateReminder: (id: string, updates: Partial<Reminder>) => void
  removeReminder: (id: string) => void
  setFilter: (filter: "all" | "pending" | "sent" | "cancelled") => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

export const useRemindersStore = create<RemindersState>((set) => ({
  reminders: [],
  isLoading: false,
  error: null,
  filter: "all",
  setReminders: (reminders) => set({ reminders }),
  addReminder: (reminder) => set((state) => ({ reminders: [reminder, ...state.reminders] })),
  updateReminder: (id, updates) =>
    set((state) => ({
      reminders: state.reminders.map((r) => (r._id === id ? { ...r, ...updates } : r)),
    })),
  removeReminder: (id) =>
    set((state) => ({
      reminders: state.reminders.filter((r) => r._id !== id),
    })),
  setFilter: (filter) => set({ filter }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}))
