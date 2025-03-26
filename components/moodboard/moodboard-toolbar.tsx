"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Save,
  Share,
  Download,
  Edit2,
  Check,
  X,
  Link,
  Loader2,
  Type,
  MoreHorizontal,
  Copy,
  Trash,
  Settings,
  FileType,
  Image,
} from "lucide-react"
import type { MoodboardType } from "@/types/moodboard"
import type { TextItem, TextStyle } from "@/types/moodboard"
import { toPng } from "html-to-image"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { TextControls } from "./text-controls"
import { Separator } from "@/components/ui/separator"
import { jsPDF } from "jspdf"
import html2canvas from "html2canvas"
import type { Options as Html2CanvasOptions } from "html2canvas"

interface MoodboardToolbarProps {
  moodboard: MoodboardType | null
  onSave: (moodboard: MoodboardType) => Promise<void>
  isSaving: boolean
  hasUnsavedChanges: boolean
  selectedTextItem: TextItem | null
  onTextStyleChange?: (style: TextStyle) => void
  onDeleteMoodboard?: () => void
}

export function MoodboardToolbar({
  moodboard,
  onSave,
  isSaving,
  hasUnsavedChanges,
  selectedTextItem,
  onTextStyleChange,
  onDeleteMoodboard,
}: MoodboardToolbarProps) {
  const { toast } = useToast()
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false)
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [title, setTitle] = useState(moodboard?.title || "")
  const [isExporting, setIsExporting] = useState(false)
  const [isTextControlsOpen, setIsTextControlsOpen] = useState(false)
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false)
  const titleInputRef = useRef<HTMLInputElement>(null)

  const handleSave = async () => {
    if (!moodboard) return
    await onSave(moodboard)
  }

  const handleTitleChange = async () => {
    if (!moodboard) return

    try {
      const updatedMoodboard = {
        ...moodboard,
        title: title.trim() || "Untitled Moodboard", // Fallback to "Untitled" if empty
      }

      await onSave(updatedMoodboard)
      setIsEditingTitle(false)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error updating title",
        description: "Failed to update moodboard title. Please try again.",
      })
    }
  }

  const handleExport = async (format: "png" | "pdf") => {
    if (!moodboard) return

    setIsExporting(true)
    try {
      const canvas = document.getElementById("moodboard-canvas")
      if (!canvas) throw new Error("Canvas not found")

      if (format === "png") {
        // Export as PNG (high resolution)
        const dataUrl = await toPng(canvas, {
          quality: 0.95,
          pixelRatio: 3, // Higher resolution
          cacheBust: true, // Avoid caching issues
        })

        const link = document.createElement("a")
        link.download = `${moodboard.title.replace(/\s+/g, "-").toLowerCase() || "moodboard"}.png`
        link.href = dataUrl
        link.click()

        toast({
          title: "Export successful",
          description: "Your moodboard has been exported as a high-resolution PNG image.",
        })
      } else {
        // Export as PDF
        try {
          const options: Html2CanvasOptions = {
            scale: 2, // Higher quality
            useCORS: true,
            allowTaint: true,
            backgroundColor: moodboard.background_color || "#ffffff",
            logging: false,
            // Ensure we capture the entire canvas
            windowWidth: canvas.scrollWidth,
            windowHeight: canvas.scrollHeight,
          }

          const renderedCanvas = await html2canvas(canvas, options)

          // Create PDF with proper dimensions
          const imgWidth = renderedCanvas.width
          const imgHeight = renderedCanvas.height

          // Determine orientation based on aspect ratio
          const orientation = imgWidth > imgHeight ? "landscape" : "portrait"

          const pdf = new jsPDF({
            orientation,
            unit: "px",
            format: [imgWidth, imgHeight],
          })

          // Add the image to the PDF
          const imgData = renderedCanvas.toDataURL("image/jpeg", 1.0)
          pdf.addImage(imgData, "JPEG", 0, 0, imgWidth, imgHeight)

          // Save the PDF
          pdf.save(`${moodboard.title.replace(/\s+/g, "-").toLowerCase() || "moodboard"}.pdf`)

          toast({
            title: "Export successful",
            description: "Your moodboard has been exported as a PDF document.",
          })
        } catch (pdfError) {
          console.error("PDF export error:", pdfError)
          throw new Error("Failed to generate PDF")
        }
      }
    } catch (error) {
      console.error("Error exporting moodboard:", error)
      toast({
        variant: "destructive",
        title: "Export failed",
        description: "Please try again later.",
      })
    } finally {
      setIsExporting(false)
      setIsExportDialogOpen(false)
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

  const handleTextStyleChange = (newStyle: TextStyle) => {
    if (selectedTextItem && onTextStyleChange) {
      // Ensure we preserve the fontFamily when updating other style properties
      onTextStyleChange({
        ...newStyle,
        fontFamily: newStyle.fontFamily || selectedTextItem.style.fontFamily,
      })
    }
  }

  if (!moodboard) return null

  return (
    <div className="flex items-center justify-between mb-4 bg-background/70 backdrop-blur-md p-3 rounded-lg border border-border/30 shadow-sm">
      <div className="flex items-center">
        {isEditingTitle ? (
          <div className="flex items-center gap-2">
            <Input
              ref={titleInputRef}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-64 h-9 bg-background"
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
              className="h-9 font-medium"
              onClick={() => {
                setIsEditingTitle(true)
                setTitle(moodboard.title)
                // Focus the input after a short delay to ensure it's rendered
                setTimeout(() => titleInputRef.current?.focus(), 10)
              }}
            >
              <Edit2 className="h-4 w-4 mr-2 text-muted-foreground" />
              <span className="truncate max-w-[200px]">{moodboard.title || "Untitled Moodboard"}</span>
            </Button>

            {hasUnsavedChanges && (
              <div className="h-2 w-2 rounded-full bg-secondary animate-pulse" title="Unsaved changes" />
            )}
          </div>
        )}
      </div>

      <TooltipProvider>
        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={handleSave}
                  disabled={!hasUnsavedChanges || isSaving}
                  variant={hasUnsavedChanges ? "default" : "outline"}
                  size="sm"
                  className="gap-2"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      <span>Save</span>
                    </>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>Save moodboard</TooltipContent>
            </Tooltip>

            <Separator orientation="vertical" className="mx-2 h-6" />
          </div>

          <Tooltip>
            <TooltipTrigger asChild>
              <Popover open={isTextControlsOpen} onOpenChange={setIsTextControlsOpen}>
                <PopoverTrigger asChild>
                  <Button
                    size="sm"
                    variant={selectedTextItem ? "secondary" : "outline"}
                    disabled={!selectedTextItem}
                    className="gap-2"
                  >
                    <Type className="h-4 w-4" />
                    <span className="hidden sm:inline">Text</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-4" align="end">
                  {selectedTextItem ? (
                    <TextControls style={selectedTextItem.style} onChange={handleTextStyleChange} />
                  ) : (
                    <div className="p-4 text-center text-muted-foreground">Select a text element to edit its style</div>
                  )}
                </PopoverContent>
              </Popover>
            </TooltipTrigger>
            <TooltipContent>{selectedTextItem ? "Edit text style" : "Select text to edit"}</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="sm" variant="outline" onClick={handleShare} className="gap-2">
                <Share className="h-4 w-4" />
                <span className="hidden sm:inline">Share</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Share moodboard</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm" variant="outline" disabled={isExporting} className="gap-2">
                    <Download className="h-4 w-4" />
                    <span className="hidden sm:inline">{isExporting ? "Exporting..." : "Export"}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => handleExport("png")} disabled={isExporting} className="gap-2">
                    <Image className="h-4 w-4" />
                    <span>High-Res PNG</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExport("pdf")} disabled={isExporting} className="gap-2">
                    <FileType className="h-4 w-4" />
                    <span>PDF Document</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TooltipTrigger>
            <TooltipContent>Export moodboard</TooltipContent>
          </Tooltip>

          {/* Mobile save button */}
          <div className="md:hidden">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant={hasUnsavedChanges ? "default" : "outline"}
                  onClick={handleSave}
                  disabled={!hasUnsavedChanges || isSaving}
                >
                  {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>Save moodboard</TooltipContent>
            </Tooltip>
          </div>

          {/* More options menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="h-9 w-9">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">More options</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => {
                  const updatedMoodboard = {
                    ...moodboard,
                    title: `Copy of ${moodboard.title}`,
                    id: `copy-${moodboard.id}`, // This would be handled properly on the backend
                  }
                  // This would need to be implemented in the parent component
                  toast({
                    title: "Feature coming soon",
                    description: "Duplicate functionality will be available soon.",
                  })
                }}
              >
                <Copy className="mr-2 h-4 w-4" />
                <span>Duplicate</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  toast({
                    title: "Feature coming soon",
                    description: "Settings functionality will be available soon.",
                  })
                }}
              >
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={onDeleteMoodboard}>
                <Trash className="mr-2 h-4 w-4" />
                <span>Delete</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </TooltipProvider>

      <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
        <DialogContent className="sm:max-w-md">
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

