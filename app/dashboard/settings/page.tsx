import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { SettingsForm } from "@/components/dashboard/settings-form"

export default async function SettingsPage() {
  const { userId } = await auth()

  if (!userId) {
    redirect("/sign-in")
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your notification preferences</p>
      </div>

      <SettingsForm />
    </div>
  )
}
