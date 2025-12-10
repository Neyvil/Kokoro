import { Heart } from "lucide-react"

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-xl bg-primary flex items-center justify-center animate-pulse">
            <Heart className="w-8 h-8 text-primary-foreground" />
          </div>
          <div className="absolute inset-0 w-16 h-16 rounded-xl border-4 border-primary/30 animate-ping" />
        </div>
        <p className="text-muted-foreground animate-pulse">Loading...</p>
      </div>
    </div>
  )
}
