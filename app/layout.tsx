import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import localFont from "next/font/local"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { SupabaseProvider } from "@/components/supabase-provider"
import { Toaster } from "@/components/ui/toaster"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer" // Add this import

// Load Inter from Google Fonts
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

// Load Clash Display locally
const clashDisplay = localFont({
  src: [
    {
      path: "../public/fonts/Clash Display/fonts/ClashDisplay-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/Clash Display/fonts/ClashDisplay-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../public/fonts/Clash Display/fonts/ClashDisplay-Bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-clash",
})

export const metadata: Metadata = {
  title: "Vibe Moodboard",
  description: "Create beautiful moodboards with Vibe",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className={`${inter.variable} ${clashDisplay.variable} font-sans`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <SupabaseProvider>
              <main className="flex-1">{children}</main>
              <Toaster />
            </SupabaseProvider>
            <Footer />
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}

