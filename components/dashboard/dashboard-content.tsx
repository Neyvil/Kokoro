"use client"

import { useEffect } from "react"
import useSWR from "swr"
import { Calendar, Clock, Bell, CheckCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RemindersList } from "./reminders-list"
import { useRemindersStore, type Reminder } from "@/store/reminders-store"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function DashboardContent() {
  const { setReminders, setLoading, setError, reminders } = useRemindersStore()

  const { data, error, isLoading } = useSWR<{ reminders: Reminder[] }>("/api/reminders?limit=10", fetcher)

  useEffect(() => {
    setLoading(isLoading)
    if (error) setError(error.message)
    if (data?.reminders) setReminders(data.reminders)
  }, [data, error, isLoading, setReminders, setLoading, setError])

  const stats = {
    total: reminders.length,
    pending: reminders.filter((r) => r.status === "pending").length,
    sent: reminders.filter((r) => r.status === "sent").length,
    today: reminders.filter((r) => {
      const scheduledDate = new Date(r.scheduledAt)
      const today = new Date()
      return scheduledDate.toDateString() === today.toDateString() && r.status === "pending"
    }).length,
  }

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Reminders</CardTitle>
            <Bell className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
            <Clock className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Sent</CardTitle>
            <CheckCircle className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.sent}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Due Today</CardTitle>
            <Calendar className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.today}</div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Reminders */}
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-4">Upcoming Reminders</h2>
        <RemindersList showActions />
      </div>
    </div>
  )
}
