import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter, Geist_Mono, DM_Serif_Display } from "next/font/google"
import { ClerkProvider } from "@clerk/nextjs"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

const _inter = Inter({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })
const _dmSerifDisplay = DM_Serif_Display({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
})

export const metadata: Metadata = {
  title: "Kokoro - Thoughtful Reminders for What Matters",
  description:
    "Kokoro sends beautifully crafted email reminders at the perfect moment. Never forget birthdays, deadlines, or important moments again.",
  generator: "v0.app",
  keywords: ["email reminders", "task management", "productivity", "scheduling", "notifications"],
  authors: [{ name: "Kokoro" }],
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
  openGraph: {
    title: "Kokoro - Thoughtful Reminders for What Matters",
    description: "Beautifully crafted email reminders at the perfect moment.",
    type: "website",
  },
}

export const viewport: Viewport = {
  themeColor: "#2D2926",
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className="font-sans antialiased">
          {children}
          <Analytics />
        </body>
      </html>
    </ClerkProvider>
  )
}
