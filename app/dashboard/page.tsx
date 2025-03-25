"use client"

import { MoodboardApp } from "@/components/moodboard/moodboard-app"

export default function Dashboard() {
  return (
    <main className="min-h-screen flex flex-col">
      <div className="flex-1 container py-4" style={{ height: "calc(100vh - 5rem)" }}>
        <MoodboardApp />
      </div>
    </main>
  )
}

