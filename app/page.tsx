import { createServerSupabaseClient } from "@/lib/supabase-server"
import { redirect } from "next/navigation"
import { ThemeToggle } from "@/components/theme-toggle"
import { Logo } from "@/components/logo"
import { WelcomeSection } from "@/components/home/welcome-section"

export default async function Home() {
  const supabase = await createServerSupabaseClient()
  
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (session) {
    redirect("/dashboard")
  }

  return (
    <main className="min-h-screen flex flex-col">
      <header className="container flex items-center justify-between py-4 md:py-6">
        <Logo />
        <ThemeToggle />
      </header>
      <WelcomeSection />
    </main>
  )
}

