"use client"

import Link from "next/link"
import { motion } from "framer-motion"

export function Logo() {
  return (
    <Link href="/" className="flex items-center">
      <motion.span
        className="font-clash text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Vibe
      </motion.span>
    </Link>
  )
}

