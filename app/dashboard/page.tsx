import { auth, currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { DashboardContent } from "@/components/dashboard/dashboard-content"

export default async function DashboardPage() {
  const { userId } = await auth()
  const user = await currentUser()

  if (!userId) {
    redirect("/sign-in")
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Welcome back, {user?.firstName || "there"}!</h1>
        <p className="text-muted-foreground mt-1">{"Here's an overview of your reminders"}</p>
      </div>

      <DashboardContent />
    </div>
  )
}
