"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSupabase } from "@/components/supabase-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Save, Share, Download, Edit2 } from "lucide-react"
import type { MoodboardType } from "@/types/moodboard"
import { toPng } from "html-to-image"

interface MoodboardToolbarProps {
  moodboard: MoodboardType | null
  onSave: (moodboard: MoodboardType) => void
}

export function MoodboardToolbar({ moodboard, onSave }: MoodboardToolbarProps) {
  const { supabase } = useSupabase()
  const router = useRouter()
  const { toast } = useToast()
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false)
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [title, setTitle] = useState(moodboard?.title || "")
  const [isSaving, setIsSaving] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  const handleSave = async () => {
    if (!moodboard) return

    setIsSaving(true)
    try {
      await onSave(moodboard)
      toast({
        title: "Moodboard saved",
        description: "Your moodboard has been saved successfully.",
      })
    } catch (error) {
      console.error("Error saving moodboard:", error)
      toast({
        variant: "destructive",
        title: "Error saving moodboard",
        description: "Please try again later.",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleTitleChange = () => {
    if (!moodboard) return

    const updatedMoodboard = {
      ...moodboard,
      title,
    }
    onSave(updatedMoodboard)
    setIsEditingTitle(false)
  }

  const handleExport = async () => {
    if (!moodboard) return

    setIsExporting(true)
    try {
      const canvas = document.getElementById("moodboard-canvas")
      if (!canvas) throw new Error("Canvas not found")

      const dataUrl = await toPng(canvas, {
        quality: 0.95,
        pixelRatio: 2,
      })

      // Create a download link
      const link = document.createElement("a")
      link.download = `${moodboard.title.replace(/\s+/g, "-").toLowerCase()}.png`
      link.href = dataUrl
      link.click()

      toast({
        title: "Export successful",
        description: "Your moodboard has been exported as a PNG image.",
      })
    } catch (error) {
      console.error("Error exporting moodboard:", error)
      toast({
        variant: "destructive",
        title: "Export failed",
        description: "Please try again later.",
      })
    } finally {
      setIsExporting(false)
    }
  }

  const handleShare = async () => {
    if (!moodboard) return

    // Generate share URL
    const shareUrl = `${window.location.origin}/share/${moodboard.id}`

    // Copy to clipboard
    await navigator.clipboard.writeText(shareUrl)

    toast({
      title: "Share link copied",
      description: "The share link has been copied to your clipboard.",
    })
  }

  if (!moodboard) return null

  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center">
        {isEditingTitle ? (
          <div className="flex items-center gap-2">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-64"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleTitleChange()
                } else if (e.key === "Escape") {
                  setIsEditingTitle(false)
                  setTitle(moodboard.title)
                }
              }}
            />
            <Button size="sm" onClick={handleTitleChange}>
              Save
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setIsEditingTitle(false)
                setTitle(moodboard.title)
              }}
            >
              Cancel
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-medium">{moodboard.title}</h2>
            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6"
              onClick={() => {
                setIsEditingTitle(true)
                setTitle(moodboard.title)
              }}
            >
              <Edit2 className="h-3 w-3" />
              <span className="sr-only">Edit title</span>
            </Button>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Button size="sm" variant="outline" onClick={handleSave} disabled={isSaving}>
          <Save className="mr-2 h-4 w-4" />
          {isSaving ? "Saving..." : "Save"}
        </Button>
        <Button size="sm" variant="outline" onClick={handleShare}>
          <Share className="mr-2 h-4 w-4" />
          Share
        </Button>
        <Button size="sm" variant="outline" onClick={handleExport} disabled={isExporting}>
          <Download className="mr-2 h-4 w-4" />
          {isExporting ? "Exporting..." : "Export"}
        </Button>
      </div>

      <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share Moodboard</DialogTitle>
            <DialogDescription>Share your moodboard with others using the link below.</DialogDescription>
          </DialogHeader>
          <div className="flex items-center space-x-2">
            <Input
              value={`${window.location.origin}/share/${moodboard.id}`}
              readOnly
              onClick={(e) => e.currentTarget.select()}
            />
            <Button
              onClick={async () => {
                await navigator.clipboard.writeText(`${window.location.origin}/share/${moodboard.id}`)
                toast({
                  title: "Link copied",
                  description: "The share link has been copied to your clipboard.",
                })
              }}
            >
              Copy
            </Button>
          </div>
          <DialogFooter>
            <Button onClick={() => setIsShareDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

