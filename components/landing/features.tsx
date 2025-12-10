"use client"

import { useEffect, useRef } from "react"
import { Bell, Calendar, Clock, Mail, Repeat, Shield } from "lucide-react"

const features = [
  {
    icon: Bell,
    title: "Smart Notifications",
    description: "Get reminded at the perfect time with intelligent scheduling that learns your preferences.",
  },
  {
    icon: Calendar,
    title: "Calendar Integration",
    description: "Sync seamlessly with your favorite calendar apps to keep everything in one place.",
  },
  {
    icon: Repeat,
    title: "Recurring Reminders",
    description: "Set up daily, weekly, or custom recurring reminders for habits and regular tasks.",
  },
  {
    icon: Mail,
    title: "Email Delivery",
    description: "Receive beautifully crafted reminder emails that stand out in your inbox.",
  },
  {
    icon: Clock,
    title: "Timezone Aware",
    description: "Travel freely knowing your reminders will arrive at the right local time.",
  },
  {
    icon: Shield,
    title: "Privacy First",
    description: "Your data is encrypted and never shared. We respect your privacy completely.",
  },
]

export function Features() {
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const cards = entry.target.querySelectorAll(".feature-card")
            cards.forEach((card, index) => {
              setTimeout(() => {
                card.classList.add("animate-in", "fade-in", "slide-in-from-bottom-4")
                card.classList.remove("opacity-0")
              }, index * 100)
            })
          }
        })
      },
      { threshold: 0.1 },
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <section id="features" ref={sectionRef} className="py-20 lg:py-32 bg-secondary/30">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 text-balance">
            Everything you need to stay organized
          </h2>
          <p className="text-lg text-muted-foreground text-balance">
            Powerful features designed to help you never miss an important moment again.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="feature-card opacity-0 group bg-card rounded-xl p-6 border border-border hover:border-primary/50 hover:shadow-lg transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
