"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSupabase } from "@/components/supabase-provider"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Settings, ChevronLeft, Save } from "lucide-react"
import { motion } from "framer-motion"
import { Separator } from "@/components/ui/separator"

// Update the Profile interface to include created_at
interface Profile {
  id: string
  full_name: string | null
  avatar_url: string | null
  updated_at: string | null
  created_at: string
  account_type?: 'free' | 'pro'
}

export function ProfileSettings() {
  const { supabase, user } = useSupabase()
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [accountType, setAccountType] = useState<'free' | 'pro'>('free')

  // Load profile data
  useEffect(() => {
    async function loadProfile() {
      if (!user) return

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (error) throw error

        setProfile(data)
        setFullName(data.full_name || user.user_metadata?.full_name || '')
        setEmail(user.email || '')
        setAccountType(data.account_type || 'free')
      } catch (error) {
        console.error('Error loading profile:', error)
        toast({
          variant: "destructive",
          title: "Error loading profile",
          description: "Please refresh the page to try again.",
        })
      }
    }

    loadProfile()
  }, [user, supabase, toast])

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Update auth metadata
      const { error: authError } = await supabase.auth.updateUser({
        email,
        data: { full_name: fullName }
      })

      if (authError) throw authError

      // Update profile data
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          updated_at: new Date().toISOString(),
          account_type: accountType
        })
        .eq('id', user?.id)

      if (profileError) throw profileError

      toast({
        title: "Profile updated",
        description: "Your changes have been saved successfully.",
      })
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Could not update profile",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Show loading state while fetching profile
  if (!profile) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-2">
          <Settings className="h-8 w-8 animate-spin" />
          <p className="text-sm text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex-1 container py-4"
    >
      <div className="flex items-center justify-between mb-4 bg-background/70 backdrop-blur-md p-3 rounded-lg border border-border/30 shadow-sm">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard")} className="h-9 w-9">
            <ChevronLeft className="h-5 w-5" />
            <span className="sr-only">Back to Dashboard</span>
          </Button>
          <h1 className="font-clash text-xl md:text-2xl font-medium">Profile Settings</h1>
        </div>

        <Button type="submit" form="profile-form" disabled={isLoading} className="gap-2">
          {isLoading ? (
            <>
              <Settings className="h-4 w-4 animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              <span>Save Changes</span>
            </>
          )}
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-[250px_1fr] lg:grid-cols-[300px_1fr]">
        <div>
          <Card className="border-border/50 backdrop-blur-sm bg-background/30">
            <CardContent className="p-6 flex flex-col items-center text-center">
              <Avatar className="h-24 w-24 mb-4">
                <AvatarImage src={profile?.avatar_url || undefined} />
                <AvatarFallback className="bg-primary/10 text-primary">
                  {getUserInitials(profile?.full_name || user?.email || "")}
                </AvatarFallback>
              </Avatar>

              <h3 className="font-clash text-lg font-medium">{fullName || "Your Name"}</h3>
              <p className="text-sm text-muted-foreground mt-1">{email || "email@example.com"}</p>

              <Separator className="my-4" />

              <div className="w-full text-left">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Account Type</span>
                  <span className="font-medium">{accountType}</span>
                </div>
                <div className="flex items-center justify-between text-sm mt-2">
                  <span className="text-muted-foreground">Member Since</span>
                  <span className="font-medium">
                    {formatDate(profile.created_at)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="border-border/50 backdrop-blur-sm bg-background/30">
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Update your personal information and email address</CardDescription>
            </CardHeader>
            <CardContent>
              <form id="profile-form" onSubmit={handleUpdateProfile} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                    className="bg-background"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="bg-background"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Changing your email will require verification of the new address
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card className="border-border/50 backdrop-blur-sm bg-background/30 mt-6">
            <CardHeader>
              <CardTitle>Account Preferences</CardTitle>
              <CardDescription>Manage your account settings and preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Additional account settings will be available in future updates.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  )
}

// Helper function to get user initials
function getUserInitials(name: string): string {
  if (!name) return "U"

  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

// Update the formatDate function to be more specific
function formatDate(dateString: string): string {
  if (!dateString) return "N/A"

  const date = new Date(dateString)
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric"
  })
}

