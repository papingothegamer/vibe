"use client"

import type React from "react"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Plus, Trash2, Edit, Check, X } from "lucide-react"
import type { MoodboardType } from "@/types/moodboard"
import { format } from "date-fns"

interface MoodboardSidebarProps {
  moodboards: MoodboardType[]
  currentMoodboard: MoodboardType | null
  onSelectMoodboard: (moodboard: MoodboardType) => void
  onCreateMoodboard: () => void
  onDeleteMoodboard: (id: string) => void
}

export function MoodboardSidebar({
  moodboards,
  currentMoodboard,
  onSelectMoodboard,
  onCreateMoodboard,
  onDeleteMoodboard,
}: MoodboardSidebarProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [moodboardToDelete, setMoodboardToDelete] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState("")

  const handleDeleteClick = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setMoodboardToDelete(id)
    setIsDeleteDialogOpen(true)
  }

  const handleDelete = () => {
    if (moodboardToDelete) {
      onDeleteMoodboard(moodboardToDelete)
      setIsDeleteDialogOpen(false)
      setMoodboardToDelete(null)
    }
  }

  const handleEditClick = (moodboard: MoodboardType, e: React.MouseEvent) => {
    e.stopPropagation()
    setEditingId(moodboard.id)
    setEditTitle(moodboard.title)
  }

  const handleEditSave = (moodboard: MoodboardType) => {
    // Update the moodboard title
    const updatedMoodboard = { ...moodboard, title: editTitle }
    onSelectMoodboard(updatedMoodboard)
    setEditingId(null)
  }

  const handleEditCancel = () => {
    setEditingId(null)
  }

  return (
    <div className="w-full md:w-64 h-full flex flex-col border-r border-border/50 pr-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium font-clash">Your Moodboards</h2>
        <Button size="icon" variant="ghost" onClick={onCreateMoodboard}>
          <Plus className="h-4 w-4" />
          <span className="sr-only">Create new moodboard</span>
        </Button>
      </div>

      <ScrollArea className="flex-1 pr-3">
        <div className="space-y-2">
          <AnimatePresence>
            {moodboards.map((moodboard) => (
              <motion.div
                key={moodboard.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className={`group relative rounded-md p-3 cursor-pointer hover:bg-muted/50 ${
                  currentMoodboard?.id === moodboard.id ? "bg-muted" : ""
                }`}
                onClick={() => onSelectMoodboard(moodboard)}
              >
                {editingId === moodboard.id ? (
                  <div className="flex items-center gap-2">
                    <Input
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="h-8"
                      autoFocus
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div className="flex gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleEditSave(moodboard)
                        }}
                      >
                        <Check className="h-3 w-3" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleEditCancel()
                        }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="font-medium truncate">{moodboard.title}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {format(new Date(moodboard.updated_at), "MMM d, yyyy")}
                    </div>
                    <div className="absolute right-2 top-2 flex opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6"
                        onClick={(e) => handleEditClick(moodboard, e)}
                      >
                        <Edit className="h-3 w-3" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6 text-destructive"
                        onClick={(e) => handleDeleteClick(moodboard.id, e)}
                      >
                        <Trash2 className="h-3 w-3" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {moodboards.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p>No moodboards yet</p>
              <Button variant="link" onClick={onCreateMoodboard}>
                Create your first moodboard
              </Button>
            </div>
          )}
        </div>
      </ScrollArea>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Moodboard</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this moodboard? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

