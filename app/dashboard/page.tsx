import { createServerSupabaseClient } from "@/lib/supabase-server"
import { redirect } from "next/navigation"
import { MoodboardApp } from "@/components/moodboard/moodboard-app"
import { ThemeToggle } from "@/components/theme-toggle"
import { Logo } from "@/components/logo"

export default async function Dashboard() {
  const supabase = await createServerSupabaseClient()
  
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/")
  }

  return (
    <main className="min-h-screen flex flex-col">
      <header className="container flex items-center justify-between py-4 md:py-6">
        <Logo />
        <ThemeToggle />
      </header>

      <div className="flex-1 container py-4 md:py-8">
        <MoodboardApp />
      </div>
    </main>
  )
}

