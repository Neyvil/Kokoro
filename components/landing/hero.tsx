"use client"

import { useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { ArrowRight, Bell, Calendar, Mail } from "lucide-react"
import Link from "next/link"

export function Hero() {
  const heroRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-in", "fade-in", "slide-in-from-bottom-8")
          }
        })
      },
      { threshold: 0.1 },
    )

    const elements = heroRef.current?.querySelectorAll(".animate-on-scroll")
    elements?.forEach((el) => observer.observe(el))

    return () => observer.disconnect()
  }, [])

  return (
    <section ref={heroRef} className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-20 left-1/4 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="container mx-auto px-4 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="animate-on-scroll opacity-0 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary border border-border mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
            </span>
            <span className="text-sm text-muted-foreground">Now with smart scheduling</span>
          </div>

          {/* Headline */}
          <h1 className="animate-on-scroll opacity-0 text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight tracking-tight text-balance mb-6">
            Never forget what
            <span className="text-primary"> matters most</span>
          </h1>

          {/* Subheadline */}
          <p className="animate-on-scroll opacity-0 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 text-balance">
            Kokoro sends you thoughtful email reminders exactly when you need them. Stay on top of important dates,
            tasks, and moments with ease.
          </p>

          {/* CTA Buttons */}
          <div className="animate-on-scroll opacity-0 flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Button size="lg" className="group" asChild>
              <Link href="/signup">
                Start for free
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="#how-it-works">See how it works</Link>
            </Button>
          </div>

          {/* Hero Visual */}
          <div className="animate-on-scroll opacity-0 relative">
            <div className="relative bg-card rounded-2xl shadow-2xl border border-border p-6 md:p-8 max-w-2xl mx-auto">
              {/* Floating notification cards */}
              <div className="absolute -top-4 -left-4 md:-left-8 bg-card rounded-xl shadow-lg border border-border p-4 animate-bounce-slow">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Bell className="w-5 h-5 text-primary" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-foreground">Reminder sent!</p>
                    <p className="text-xs text-muted-foreground">{"Mom's birthday tomorrow"}</p>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-4 -right-4 md:-right-8 bg-card rounded-xl shadow-lg border border-border p-4 animate-bounce-slow delay-500">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-primary" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-foreground">5 upcoming</p>
                    <p className="text-xs text-muted-foreground">This week</p>
                  </div>
                </div>
              </div>

              {/* Main dashboard preview */}
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-4 border-b border-border">
                  <h3 className="font-semibold text-foreground">Your Reminders</h3>
                  <Button size="sm" variant="secondary">
                    + New
                  </Button>
                </div>

                {[
                  { icon: Mail, title: "Send quarterly report", time: "Tomorrow, 9:00 AM", color: "bg-primary/10" },
                  { icon: Bell, title: "Call dentist", time: "Wed, 2:00 PM", color: "bg-accent/20" },
                  { icon: Calendar, title: "Team standup prep", time: "Fri, 8:30 AM", color: "bg-secondary" },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 p-3 rounded-lg hover:bg-secondary/50 transition-colors"
                  >
                    <div className={`w-10 h-10 rounded-lg ${item.color} flex items-center justify-center`}>
                      <item.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-medium text-foreground">{item.title}</p>
                      <p className="text-sm text-muted-foreground">{item.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 3s ease-in-out infinite;
        }
        .delay-500 {
          animation-delay: 0.5s;
        }
        .delay-1000 {
          animation-delay: 1s;
        }
      `}</style>
    </section>
  )
}
