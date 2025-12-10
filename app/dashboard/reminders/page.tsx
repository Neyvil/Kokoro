import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { AllRemindersContent } from "@/components/dashboard/all-reminders-content"

export default async function AllRemindersPage() {
  const { userId } = await auth()

  if (!userId) {
    redirect("/sign-in")
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">All Reminders</h1>
        <p className="text-muted-foreground mt-1">View and manage all your reminders</p>
      </div>

      <AllRemindersContent />
    </div>
  )
}
