"use client"

import { useEffect } from "react"
import useSWR from "swr"
import { Button } from "@/components/ui/button"
import { RemindersList } from "./reminders-list"
import { useRemindersStore, type Reminder } from "@/store/reminders-store"
import { cn } from "@/lib/utils"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function AllRemindersContent() {
  const { filter, setFilter, setReminders, setLoading, setError } = useRemindersStore()

  const { data, error, isLoading } = useSWR<{ reminders: Reminder[] }>(
    `/api/reminders?status=${filter}&limit=50`,
    fetcher,
  )

  useEffect(() => {
    setLoading(isLoading)
    if (error) setError(error.message)
    if (data?.reminders) setReminders(data.reminders)
  }, [data, error, isLoading, setReminders, setLoading, setError])

  const filters: Array<{ value: typeof filter; label: string }> = [
    { value: "all", label: "All" },
    { value: "pending", label: "Pending" },
    { value: "sent", label: "Sent" },
    { value: "cancelled", label: "Cancelled" },
  ]

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        {filters.map((f) => (
          <Button
            key={f.value}
            variant="outline"
            size="sm"
            onClick={() => setFilter(f.value)}
            className={cn(filter === f.value && "bg-primary text-primary-foreground hover:bg-primary/90")}
          >
            {f.label}
          </Button>
        ))}
      </div>

      <RemindersList showActions />
    </div>
  )
}
