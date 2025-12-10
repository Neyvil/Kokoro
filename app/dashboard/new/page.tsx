import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { NewReminderForm } from "@/components/dashboard/new-reminder-form"

export default async function NewReminderPage() {
  const { userId } = await auth()

  if (!userId) {
    redirect("/sign-in")
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Create Reminder</h1>
        <p className="text-muted-foreground mt-1">Set up a new reminder to receive via email</p>
      </div>

      <NewReminderForm />
    </div>
  )
}
