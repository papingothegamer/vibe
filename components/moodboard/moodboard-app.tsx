"use client"

import { useState, useEffect } from "react"
import { useSupabase } from "@/components/supabase-provider"
import { MoodboardCanvas } from "@/components/moodboard/moodboard-canvas"
import { MoodboardToolbar } from "@/components/moodboard/moodboard-toolbar"
import { MoodboardSidebar } from "@/components/moodboard/moodboard-sidebar"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { LogOut, Menu, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import type { MoodboardType } from "@/types/moodboard"

export function MoodboardApp() {
  const { supabase, user } = useSupabase()
  const [moodboards, setMoodboards] = useState<MoodboardType[]>([])
  const [currentMoodboard, setCurrentMoodboard] = useState<MoodboardType | null>(null)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const { toast } = useToast()

  // Load user's moodboards
  useEffect(() => {
    const fetchMoodboards = async () => {
      if (!user) return

      try {
        const { data, error } = await supabase
          .from("moodboards")
          .select("*")
          .eq("user_id", user.id)
          .order("updated_at", { ascending: false })

        if (error) throw error

        setMoodboards(data || [])
        if (data && data.length > 0) {
          setCurrentMoodboard(data[0])
        } else {
          // Create a new moodboard if none exists
          createNewMoodboard()
        }
      } catch (error) {
        console.error("Error fetching moodboards:", error)
        toast({
          variant: "destructive",
          title: "Error loading moodboards",
          description: "Please try again later.",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchMoodboards()
  }, [user, supabase, toast])

  // Handle responsive sidebar
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setSidebarOpen(false)
      } else {
        setSidebarOpen(true)
      }
    }

    // Set initial state
    handleResize()

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const createNewMoodboard = async () => {
    if (!user) return

    const newMoodboard: Omit<MoodboardType, "id"> = {
      user_id: user.id,
      title: "Untitled Moodboard",
      items: [],
      background_color: "#f5f5f5",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    try {
      const { data, error } = await supabase.from("moodboards").insert([newMoodboard]).select()

      if (error) throw error

      if (data && data.length > 0) {
        setMoodboards([data[0], ...moodboards])
        setCurrentMoodboard(data[0])
        toast({
          title: "New moodboard created",
          description: "Start adding images and text to your moodboard.",
        })
      }
    } catch (error) {
      console.error("Error creating moodboard:", error)
      toast({
        variant: "destructive",
        title: "Error creating moodboard",
        description: "Please try again later.",
      })
    }
  }

  const saveMoodboard = async (updatedMoodboard: MoodboardType) => {
    try {
      const { error } = await supabase
        .from("moodboards")
        .update({
          title: updatedMoodboard.title,
          items: updatedMoodboard.items,
          background_color: updatedMoodboard.background_color,
          updated_at: new Date().toISOString(),
        })
        .eq("id", updatedMoodboard.id)

      if (error) throw error

      // Update local state
      setMoodboards(moodboards.map((mb) => (mb.id === updatedMoodboard.id ? updatedMoodboard : mb)))
      setCurrentMoodboard(updatedMoodboard)

      toast({
        title: "Moodboard saved",
        description: "Your changes have been saved successfully.",
      })
    } catch (error) {
      console.error("Error saving moodboard:", error)
      toast({
        variant: "destructive",
        title: "Error saving moodboard",
        description: "Please try again later.",
      })
    }
  }

  const deleteMoodboard = async (id: string) => {
    try {
      const { error } = await supabase.from("moodboards").delete().eq("id", id)

      if (error) throw error

      // Update local state
      const updatedMoodboards = moodboards.filter((mb) => mb.id !== id)
      setMoodboards(updatedMoodboards)

      // Set a new current moodboard if the deleted one was selected
      if (currentMoodboard?.id === id) {
        if (updatedMoodboards.length > 0) {
          setCurrentMoodboard(updatedMoodboards[0])
        } else {
          createNewMoodboard()
        }
      }

      toast({
        title: "Moodboard deleted",
        description: "Your moodboard has been deleted.",
      })
    } catch (error) {
      console.error("Error deleting moodboard:", error)
      toast({
        variant: "destructive",
        title: "Error deleting moodboard",
        description: "Please try again later.",
      })
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    toast({
      title: "Signed out",
      description: "You have been signed out successfully.",
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col h-full w-full">
      <div className="flex justify-between items-center mb-4 md:mb-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
          <h1 className="font-clash text-xl md:text-3xl truncate">{currentMoodboard?.title || "Untitled Moodboard"}</h1>
        </div>
        <Button variant="ghost" size="icon" onClick={handleSignOut}>
          <LogOut className="h-5 w-5" />
          <span className="sr-only">Sign out</span>
        </Button>
      </div>

      <div className="flex flex-1 gap-4 h-[calc(100vh-8rem)] moodboard-layout">
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="moodboard-sidebar"
            >
              <MoodboardSidebar
                moodboards={moodboards}
                currentMoodboard={currentMoodboard}
                onSelectMoodboard={setCurrentMoodboard}
                onCreateMoodboard={createNewMoodboard}
                onDeleteMoodboard={deleteMoodboard}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex-1 flex flex-col">
          <MoodboardToolbar moodboard={currentMoodboard} onSave={saveMoodboard} />

          <div className="flex-1 moodboard-canvas-container">
            {currentMoodboard && (
              <MoodboardCanvas
                moodboard={currentMoodboard}
                onChange={(updatedMoodboard) => setCurrentMoodboard(updatedMoodboard)}
                onSave={saveMoodboard}
              />
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

