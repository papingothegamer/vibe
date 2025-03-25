"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { Home, AlertCircle } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { Logo } from "@/components/logo"

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col">
      <header className="container flex items-center justify-between py-4 md:py-6">
        <Logo />
        <ThemeToggle />
      </header>

      <div className="flex-1 container flex items-center justify-center">
        <motion.div
          className="max-w-md w-full p-8 rounded-lg border border-border/50 backdrop-blur-sm bg-background/30 shadow-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-col items-center text-center">
            <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center mb-6">
              <AlertCircle className="h-12 w-12 text-primary" />
            </div>

            <h1 className="font-clash text-4xl font-bold mb-3 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              404 - Not Found
            </h1>

            <p className="text-muted-foreground mb-8 max-w-sm">
              The page you're looking for doesn't exist or has been moved. Let's get you back on track.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" className="gap-2">
                <Link href="/">
                  <Home className="h-4 w-4" />
                  Go Home
                </Link>
              </Button>

              <Button asChild variant="outline" size="lg">
                <Link href="/dashboard">Go to Dashboard</Link>
              </Button>
            </div>
          </div>
        </motion.div>
      </div>

      <footer className="container py-4 text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} Vibe Moodboard. All rights reserved.</p>
      </footer>
    </main>
  )
}

