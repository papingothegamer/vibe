"use client"

import { useState, useEffect } from "react"
import { useSupabase } from "@/components/supabase-provider"
import { MoodboardCanvas } from "@/components/moodboard/moodboard-canvas"
import { MoodboardToolbar } from "@/components/moodboard/moodboard-toolbar"
import { MoodboardSidebar } from "@/components/moodboard/moodboard-sidebar"
import { MoodboardHeader } from "@/components/moodboard/moodboard-header"
import { CanvasExpand } from "@/components/moodboard/canvas-expand"
import { useToast } from "@/components/ui/use-toast"
import { motion, AnimatePresence } from "framer-motion"
import type { MoodboardType } from "@/types/moodboard"
import type { TextItem, TextStyle } from "@/types/moodboard"

export function MoodboardApp() {
  const { supabase, user } = useSupabase()
  const [moodboards, setMoodboards] = useState<MoodboardType[]>([])
  const [currentMoodboard, setCurrentMoodboard] = useState<MoodboardType | null>(null)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [selectedTextItem, setSelectedTextItem] = useState<TextItem | null>(null)
  const [isExpanded, setIsExpanded] = useState(false)
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
      .channel("moodboards")
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "moodboards",
        },
        (payload) => {
          // Remove the deleted moodboard from state
          setMoodboards((prev) => prev.filter((board) => board.id !== payload.old.id))
          // If the deleted moodboard was selected, clear selection
          if (currentMoodboard?.id === payload.old.id) {
            setCurrentMoodboard(null)
          }
          toast({
            title: "Moodboard deleted",
            description: "The moodboard has been removed",
          })
        },
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
        e.returnValue = ""
      }
    }
    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => window.removeEventListener("beforeunload", handleBeforeUnload)
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
      console.log("Saving moodboard:", {
        id: updatedMoodboard.id,
        title: updatedMoodboard.title,
        user_id: user.id,
      })

      const { error } = await supabase
        .from("moodboards")
        .update({
          title: updatedMoodboard.title,
          background_color: updatedMoodboard.background_color,
          items: updatedMoodboard.items,
          updated_at: new Date().toISOString(),
        })
        .eq("id", updatedMoodboard.id)
        .eq("user_id", user.id)
        .single()

      if (error) throw error

      // Update local state
      setCurrentMoodboard(updatedMoodboard)
      setHasUnsavedChanges(false)

      toast({
        title: "Changes saved",
        description: "Your moodboard has been updated successfully.",
      })
    } catch (error: any) {
      console.error("Error saving moodboard:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
      })

      toast({
        variant: "destructive",
        title: "Error saving moodboard",
        description: error.message || "Please try again later.",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleTextStyleChange = (newStyle: TextStyle) => {
    if (!selectedTextItem || !currentMoodboard) return

    console.log("Applying text style change:", newStyle)

    const updatedItems = currentMoodboard.items.map((item) =>
      item.id === selectedTextItem.id && item.type === "text"
        ? {
            ...item,
            style: {
              ...selectedTextItem.style,
              ...newStyle,
            },
          }
        : item,
    )

    const updatedMoodboard = {
      ...currentMoodboard,
      items: updatedItems,
    }

    // Update the selected text item with the new style
    setSelectedTextItem({
      ...selectedTextItem,
      style: { ...selectedTextItem.style, ...newStyle },
    })

    setCurrentMoodboard(updatedMoodboard)
    setHasUnsavedChanges(true)
  }

  const handleMoodboardChange = (updatedMoodboard: MoodboardType) => {
    setCurrentMoodboard(updatedMoodboard)
    setHasUnsavedChanges(true)

    // Find the most recently added text item if no text is currently selected
    if (!selectedTextItem) {
      const textItems = updatedMoodboard.items.filter((item) => item.type === "text")
      if (textItems.length > 0) {
        // Select the last added text item
        const lastTextItem = textItems[textItems.length - 1] as TextItem
        setSelectedTextItem(lastTextItem)
      }
    } else {
      // Check if currently selected text item still exists
      const textItemStillExists = updatedMoodboard.items.some(
        (item) => item.type === "text" && item.id === selectedTextItem.id,
      )

      if (textItemStillExists) {
        // Update the selected text item with any changes
        const updatedTextItem = updatedMoodboard.items.find(
          (item) => item.type === "text" && item.id === selectedTextItem.id,
        ) as TextItem | undefined

        if (updatedTextItem) {
          setSelectedTextItem(updatedTextItem)
        }
      } else {
        setSelectedTextItem(null)
      }
    }
  }

  const handleTextSelect = (textItem: TextItem | null) => {
    console.log("Text item selected:", textItem)
    setSelectedTextItem(textItem)
  }

  const handleExpandChange = (expanded: boolean) => {
    setIsExpanded(expanded)
  }

  const deleteMoodboard = async (id: string) => {
    try {
      const { error } = await supabase.from("moodboards").delete().match({ id, user_id: user?.id })

      if (error) throw error

      // The real-time subscription will handle UI updates
    } catch (error: any) {
      console.error("Error deleting moodboard:", error)
      toast({
        variant: "destructive",
        title: "Delete failed",
        description: error.message,
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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col h-full w-full"
      style={{ height: "calc(100vh - 8rem)" }}
    >
      <MoodboardHeader
        moodboard={currentMoodboard}
        hasUnsavedChanges={hasUnsavedChanges}
        sidebarOpen={sidebarOpen}
        onSidebarToggle={() => setSidebarOpen(!sidebarOpen)}
        onTitleChange={(title) => {
          if (currentMoodboard) {
            const updatedMoodboard = {
              ...currentMoodboard,
              title,
            }
            setCurrentMoodboard(updatedMoodboard)
            setHasUnsavedChanges(true)
          }
        }}
      />

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
                onSave={saveMoodboard}
                onTextSelect={handleTextSelect}
                selectedTextItem={selectedTextItem}
                isExpanded={isExpanded}
                onExpandChange={handleExpandChange}
                onTextStyleChange={handleTextStyleChange}
              />
            )}
          </div>
        </div>
      </div>

      {/* Add CanvasExpand component here, outside of MoodboardCanvas */}
      {currentMoodboard && (
        <CanvasExpand
          open={isExpanded}
          onOpenChange={handleExpandChange}
          moodboard={currentMoodboard}
          onChange={handleMoodboardChange}
          onTextSelect={handleTextSelect}
          selectedTextItem={selectedTextItem}
          onTextStyleChange={handleTextStyleChange}
        />
      )}
    </motion.div>
  )
}

