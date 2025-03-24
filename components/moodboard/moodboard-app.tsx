"use client"

import { useState, useEffect } from "react"
import { useSupabase } from "@/components/supabase-provider"
import { MoodboardCanvas } from "@/components/moodboard/moodboard-canvas"
import { MoodboardToolbar } from "@/components/moodboard/moodboard-toolbar"
import { MoodboardSidebar } from "@/components/moodboard/moodboard-sidebar"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { LogOut, Menu, X, User, ChevronDown, Save, Loader2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import type { MoodboardType } from "@/types/moodboard"
import type { TextItem, TextStyle } from "@/types/moodboard"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function MoodboardApp() {
  const { supabase, user } = useSupabase()
  const [moodboards, setMoodboards] = useState<MoodboardType[]>([])
  const [currentMoodboard, setCurrentMoodboard] = useState<MoodboardType | null>(null)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [selectedTextItem, setSelectedTextItem] = useState<TextItem | null>(null)
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

  // Set up real-time subscription for moodboard deletions
  useEffect(() => {
    const channel = supabase
      .channel('moodboards')
      .on('postgres_changes', 
        { 
          event: 'DELETE', 
          schema: 'public', 
          table: 'moodboards' 
        },
        (payload) => {
          // Remove the deleted moodboard from state
          setMoodboards(prev => 
            prev.filter(board => board.id !== payload.old.id)
          )
          // If the deleted moodboard was selected, clear selection
          if (currentMoodboard?.id === payload.old.id) {
            setCurrentMoodboard(null)
          }
          toast({
            title: "Moodboard deleted",
            description: "The moodboard has been removed"
          })
        }
      )
      .subscribe()
    
    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, currentMoodboard, toast])

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

  // Add unsaved changes warning
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault()
        e.returnValue = ''
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [hasUnsavedChanges])

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
    if (!updatedMoodboard || !user) return
    setIsSaving(true)

    try {
      // Log the update payload for debugging
      console.log('Saving moodboard:', {
        id: updatedMoodboard.id,
        title: updatedMoodboard.title,
        user_id: user.id
      })

      const { error } = await supabase
        .from('moodboards')
        .update({
          title: updatedMoodboard.title,
          background_color: updatedMoodboard.background_color,
          items: updatedMoodboard.items,
          updated_at: new Date().toISOString()
        })
        .eq('id', updatedMoodboard.id)
        .eq('user_id', user.id)
        .single()

      if (error) throw error

      // Update local state
      setCurrentMoodboard(updatedMoodboard)
      setHasUnsavedChanges(false)

      toast({
        title: "Changes saved",
        description: "Your moodboard has been updated successfully."
      })
    } catch (error: any) {
      console.error("Error saving moodboard:", {
        message: error.message,
        details: error.details,
        hint: error.hint
      })
      
      toast({
        variant: "destructive",
        title: "Error saving moodboard",
        description: error.message || "Please try again later."
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleTextStyleChange = (newStyle: TextStyle) => {
    if (!selectedTextItem || !currentMoodboard) return

    const updatedItems = currentMoodboard.items.map(item => 
      item.id === selectedTextItem.id 
        ? { ...item, style: newStyle } 
        : item
    )

    const updatedMoodboard = {
      ...currentMoodboard,
      items: updatedItems
    }

    setCurrentMoodboard(updatedMoodboard)
    setHasUnsavedChanges(true)
  }

  const handleMoodboardChange = (updatedMoodboard: MoodboardType) => {
    setCurrentMoodboard(updatedMoodboard)
    setHasUnsavedChanges(true)
    setSelectedTextItem(null)
  }

  const handleTextSelect = (item: TextItem | null) => {
    setSelectedTextItem(item)
  }

  const deleteMoodboard = async (id: string) => {
    try {
      const { error } = await supabase
        .from("moodboards")
        .delete()
        .match({ id, user_id: user?.id })

      if (error) throw error
      
      // The real-time subscription will handle UI updates
    } catch (error: any) {
      console.error("Error deleting moodboard:", error)
      toast({
        variant: "destructive",
        title: "Delete failed",
        description: error.message
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

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user) return "U"
    const name = user.user_metadata?.full_name || user.email || ""
    return name
      .split(" ")
      .map((part: string) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col h-full w-full"
      style={{ height: "calc(100vh - 8rem)" }}
    >
      <div className="flex justify-between items-center mb-4 bg-background/50 backdrop-blur-sm py-3 px-4 rounded-lg border border-border/30 shadow-sm">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
          <h1 className="font-clash text-xl md:text-2xl font-medium truncate select-none">
            {currentMoodboard?.title || "Untitled Moodboard"}
          </h1>
        </div>

        <div className="flex items-center gap-2">
           <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.user_metadata?.avatar_url} />
                  <AvatarFallback>{getUserInitials()}</AvatarFallback>
                </Avatar>
                <span className="hidden md:inline-block">{user?.user_metadata?.full_name || user?.email}</span>
                <ChevronDown className="h-4 w-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sign out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="flex flex-1 gap-4 moodboard-layout">
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="moodboard-sidebar w-64 h-full"
            >
              <MoodboardSidebar
                moodboards={moodboards}
                currentMoodboard={currentMoodboard}
                onSelectMoodboard={(board) => {
                  if (hasUnsavedChanges) {
                    if (window.confirm("You have unsaved changes. Do you want to discard them?")) {
                      setCurrentMoodboard(board)
                      setHasUnsavedChanges(false)
                    }
                  } else {
                    setCurrentMoodboard(board)
                  }
                }}
                onCreateMoodboard={createNewMoodboard}
                onDeleteMoodboard={deleteMoodboard}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex-1 flex flex-col">
      <MoodboardToolbar 
        moodboard={currentMoodboard} 
        onSave={saveMoodboard} 
        isSaving={isSaving}
        hasUnsavedChanges={hasUnsavedChanges}
        selectedTextItem={selectedTextItem}
        onTextStyleChange={handleTextStyleChange}
      />

      <div className="flex-1 moodboard-canvas-container">
        {currentMoodboard && (
          <MoodboardCanvas
            moodboard={currentMoodboard}
            onChange={handleMoodboardChange}
            onTextSelect={handleTextSelect}
            selectedTextItem={selectedTextItem}
          />
        )}
      </div>
    </div>
      </div>
    </motion.div>
  )
}