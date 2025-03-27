"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { MoodboardCanvas } from "./moodboard-canvas"
import { MoodboardToolbar } from "./moodboard-toolbar"
import type { MoodboardType, TextItem, TextStyle } from "@/types/moodboard"
import { useState } from "react"

interface CanvasExpandProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  moodboard: MoodboardType
  onChange: (moodboard: MoodboardType) => void
  onTextSelect: (item: TextItem | null) => void
  selectedTextItem: TextItem | null
  onTextStyleChange: (style: TextStyle) => void
}

export function CanvasExpand({
  open,
  onOpenChange,
  moodboard,
  onChange,
  onTextSelect,
  selectedTextItem,
  onTextStyleChange,
}: CanvasExpandProps) {
  const [isSaving, setIsSaving] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  // Update hasUnsavedChanges when moodboard changes
  const handleMoodboardChange = (updatedMoodboard: MoodboardType) => {
    setHasUnsavedChanges(true)
    onChange(updatedMoodboard)
  }

  const handleSave = async (updatedMoodboard: MoodboardType) => {
    setIsSaving(true)
    try {
      // In a real implementation, this would save to the database
      onChange(updatedMoodboard)
      setHasUnsavedChanges(false)
    } catch (error) {
      console.error("Error saving moodboard:", error)
    } finally {
      setIsSaving(false)
    }
    return Promise.resolve()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[90vw] h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 py-4">
          <DialogTitle>Edit Moodboard</DialogTitle>
        </DialogHeader>

        <div className="flex-1 flex flex-col min-h-0 px-6">
          <MoodboardToolbar
            moodboard={moodboard}
            onSave={handleSave}
            isSaving={isSaving}
            hasUnsavedChanges={hasUnsavedChanges}
            selectedTextItem={selectedTextItem}
            onTextStyleChange={onTextStyleChange}
          />

          <div className="flex-1 min-h-0 overflow-auto mb-6">
            <MoodboardCanvas
              moodboard={moodboard}
              onChange={handleMoodboardChange}
              onSave={handleSave}
              onTextSelect={onTextSelect}
              selectedTextItem={selectedTextItem}
              isExpanded={open}
              onExpandChange={onOpenChange}
              hideExpandButton={true}
              onTextStyleChange={onTextStyleChange}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

