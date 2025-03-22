'use client'

import { motion } from "framer-motion"
import { AuthForm } from "@/components/auth/auth-form"

export function WelcomeSection() {
  return (
    <div className="flex-1 container flex flex-col items-center justify-center py-8 md:py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md text-center mb-8"
      >
        <h1 className="font-clash text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Create Beautiful Moodboards
        </h1>
        <p className="text-muted-foreground">
          Organize your ideas, inspiration, and creative projects with our intuitive moodboard tool.
        </p>
      </motion.div>

      <AuthForm />
    </div>
  )
}