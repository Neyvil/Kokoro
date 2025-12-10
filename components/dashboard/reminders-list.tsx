"use client"

import { useState } from "react"
import { mutate } from "swr"
import { format } from "date-fns"
import { Bell, Calendar, Clock, MoreVertical, Pencil, Trash2, AlertCircle, CheckCircle, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { useRemindersStore, type Reminder } from "@/store/reminders-store"
import { cn } from "@/lib/utils"
import { EditReminderDialog } from "./edit-reminder-dialog"

interface RemindersListProps {
  showActions?: boolean
}

const priorityColors = {
  low: "bg-secondary text-secondary-foreground",
  medium: "bg-primary/20 text-primary",
  high: "bg-destructive/20 text-destructive",
}

const statusIcons = {
  pending: Clock,
  sent: CheckCircle,
  failed: AlertCircle,
  cancelled: XCircle,
}

export function RemindersList({ showActions = false }: RemindersListProps) {
  const { reminders, isLoading, removeReminder } = useRemindersStore()
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null)

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/reminders/${id}`, { method: "DELETE" })
      
      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || "Failed to delete reminder")
      }
      
      removeReminder(id)
      mutate("/api/reminders?limit=10")
      console.log("Reminder deleted successfully")
    } catch (error) {
      console.error("Error deleting reminder:", error)
    }
  }

  const handleCancel = async (id: string) => {
    try {
      const res = await fetch(`/api/reminders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "cancelled" }),
      })
      if (res.ok) {
        mutate("/api/reminders?limit=10")
      }
    } catch (error) {
      console.error("Error cancelling reminder:", error)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="h-6 bg-secondary rounded w-1/3 mb-2" />
              <div className="h-4 bg-secondary rounded w-1/2" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (reminders.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Bell className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No reminders yet</h3>
          <p className="text-muted-foreground">Create your first reminder to get started!</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <div className="space-y-3">
        {reminders.map((reminder) => {
          const StatusIcon = statusIcons[reminder.status]
          const isPast = new Date(reminder.scheduledAt) < new Date()

          return (
            <Card
              key={reminder._id}
              className={cn("transition-all hover:shadow-md", reminder.status === "cancelled" && "opacity-60")}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-foreground truncate">{reminder.title}</h3>
                      <Badge className={priorityColors[reminder.priority]}>{reminder.priority}</Badge>
                    </div>
                    {reminder.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{reminder.description}</p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {format(new Date(reminder.scheduledAt), "MMM d, yyyy")}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {format(new Date(reminder.scheduledAt), "h:mm a")}
                      </span>
                      <span className="flex items-center gap-1">
                        <StatusIcon className="w-4 h-4" />
                        {reminder.status}
                      </span>
                    </div>
                  </div>

                  {showActions && reminder.status === "pending" && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="shrink-0">
                          <MoreVertical className="w-4 h-4" />
                          <span className="sr-only">Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setEditingReminder(reminder)}>
                          <Pencil className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleCancel(reminder._id)}>
                          <XCircle className="w-4 h-4 mr-2" />
                          Cancel
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(reminder._id)} className="text-destructive">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {editingReminder && (
        <EditReminderDialog
          reminder={editingReminder}
          open={!!editingReminder}
          onOpenChange={(open) => !open && setEditingReminder(null)}
        />
      )}
    </>
  )
}
