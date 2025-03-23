"use client"

import { useState } from "react"
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
import { Save, Share, Download, Edit2, Check, X, Link, Loader2 } from "lucide-react"
import type { MoodboardType } from "@/types/moodboard"
import { toPng } from "html-to-image"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface MoodboardToolbarProps {
  moodboard: MoodboardType | null
  onSave: (moodboard: MoodboardType) => Promise<void>
  isSaving: boolean
  hasUnsavedChanges: boolean
}

export function MoodboardToolbar({ 
  moodboard, 
  onSave, 
  isSaving, 
  hasUnsavedChanges 
}: MoodboardToolbarProps) {
  const { toast } = useToast()
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false)
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [title, setTitle] = useState(moodboard?.title || "")
  const [isExporting, setIsExporting] = useState(false)

  const handleSave = async () => {
    if (!moodboard) return
    await onSave(moodboard)
  }

  const handleTitleChange = async () => {
    if (!moodboard) return
    
    try {
      const updatedMoodboard = {
        ...moodboard,
        title: title.trim(), // Ensure title is trimmed
      }
      
      await onSave(updatedMoodboard)
      setIsEditingTitle(false)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error updating title",
        description: "Failed to update moodboard title. Please try again."
      })
    }
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
    setIsShareDialogOpen(true)
  }

  const copyShareLink = async () => {
    if (!moodboard) return

    const shareUrl = `${window.location.origin}/share/${moodboard.id}`
    await navigator.clipboard.writeText(shareUrl)

    toast({
      title: "Share link copied",
      description: "The share link has been copied to your clipboard.",
    })
  }

  if (!moodboard) return null

  return (
    <div className="flex items-center justify-between mb-4 bg-background/30 backdrop-blur-sm p-2 rounded-lg border border-border/20">
      <div className="flex items-center">
        {isEditingTitle ? (
          <div className="flex items-center gap-2">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-64 h-9"
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
            <Button size="sm" variant="ghost" onClick={handleTitleChange}>
              <Check className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setIsEditingTitle(false)
                setTitle(moodboard.title)
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              className="h-9"
              onClick={() => {
                setIsEditingTitle(true)
                setTitle(moodboard.title)
              }}
            >
              <Edit2 className="h-4 w-4 mr-2" />
              <span className="font-medium">{moodboard.title}</span>
            </Button>
          </div>
        )}
      </div>

      <TooltipProvider>
        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                onClick={handleSave} 
                disabled={!hasUnsavedChanges || isSaving}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>Save moodboard</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="sm" variant="outline" onClick={handleShare}>
                <Share className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Share</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Share moodboard</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={handleExport} 
                disabled={isExporting}
              >
                <Download className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">
                  {isExporting ? "Exporting..." : "Export"}
                </span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Export as image</TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>

      <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share Moodboard</DialogTitle>
            <DialogDescription>
              Share your moodboard with others using the link below.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center space-x-2">
            <Input
              value={`${window.location.origin}/share/${moodboard.id}`}
              readOnly
              onClick={(e) => e.currentTarget.select()}
            />
            <Button onClick={copyShareLink}>
              <Link className="h-4 w-4 mr-2" />
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

