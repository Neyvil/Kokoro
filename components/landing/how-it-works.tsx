"use client"

import { useEffect, useRef } from "react"

const steps = [
  {
    number: "01",
    title: "Create your reminder",
    description:
      "Tell us what you need to remember and when. Add notes, set priority, and choose notification preferences.",
  },
  {
    number: "02",
    title: "We handle the scheduling",
    description: "Our smart system queues up your reminders and ensures they arrive exactly when you need them.",
  },
  {
    number: "03",
    title: "Get notified on time",
    description: "Receive a beautifully designed email reminder that helps you take action right away.",
  },
]

export function HowItWorks() {
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const steps = entry.target.querySelectorAll(".step-item")
            steps.forEach((step, index) => {
              setTimeout(() => {
                step.classList.add("animate-in", "fade-in", "slide-in-from-left-8")
                step.classList.remove("opacity-0")
              }, index * 200)
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
    <section id="how-it-works" ref={sectionRef} className="py-20 lg:py-32">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 text-balance">How Kokoro works</h2>
          <p className="text-lg text-muted-foreground text-balance">
            Three simple steps to never forget anything important again.
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          {steps.map((step, index) => (
            <div key={index} className="step-item opacity-0 flex gap-6 md:gap-8 mb-12 last:mb-0">
              <div className="flex flex-col items-center">
                <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg shrink-0">
                  {step.number}
                </div>
                {index < steps.length - 1 && <div className="w-0.5 h-full bg-border mt-4" />}
              </div>
              <div className="pb-12 last:pb-0">
                <h3 className="text-xl md:text-2xl font-semibold text-foreground mb-2">{step.title}</h3>
                <p className="text-muted-foreground text-lg">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
