"use client"

import { MoodboardApp } from "@/components/moodboard/moodboard-app"
import { ThemeToggle } from "@/components/theme-toggle"
import { Logo } from "@/components/logo"

export default function Dashboard() {
  return (
    <main className="min-h-screen flex flex-col">
      <header className="container flex items-center justify-between py-4">
        <Logo />
        <ThemeToggle />
      </header>

      <div className="flex-1 container py-4" style={{ height: "calc(100vh - 5rem)" }}>
        <MoodboardApp />
      </div>
    </main>
  )
}

