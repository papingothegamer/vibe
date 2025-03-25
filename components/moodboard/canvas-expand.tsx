"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { MoodboardCanvas } from "./moodboard-canvas"
import { MoodboardToolbar } from "./moodboard-toolbar"
import type { MoodboardType, TextItem } from "@/types/moodboard"
import { Button } from "@/components/ui/button"

interface CanvasExpandProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  moodboard: MoodboardType
  onChange: (moodboard: MoodboardType) => void
  onTextSelect: (item: TextItem | null) => void
  selectedTextItem: TextItem | null
}

export function CanvasExpand({
  open,
  onOpenChange,
  moodboard,
  onChange,
  onTextSelect,
  selectedTextItem,
}: CanvasExpandProps) {
  const handleSave = async (updatedMoodboard: MoodboardType) => {
    onChange(updatedMoodboard)
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
            isSaving={false}
            hasUnsavedChanges={false}
            selectedTextItem={selectedTextItem}
          />
          
          <div className="flex-1 min-h-0 overflow-auto mb-6">
            <MoodboardCanvas
              moodboard={moodboard}
              onChange={onChange}
              onTextSelect={onTextSelect}
              selectedTextItem={selectedTextItem}
              isExpanded={open}
              onExpandChange={onOpenChange}
              hideExpandButton={true} // Hide the button in expanded view
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}