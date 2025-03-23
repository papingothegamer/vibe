"use client"

import { useState } from "react"
import { AnimatePresence } from "framer-motion"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { FolderPlus, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import type { MoodboardType } from "@/types/moodboard"
import { MoodboardSidebarItem } from "./moodboard-sidebar-item"

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
  const [searchQuery, setSearchQuery] = useState("")

  const handleDeleteClick = (id: string) => {
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

  const handleEditMoodboard = (moodboard: MoodboardType, newTitle: string) => {
    // Update the moodboard title
    const updatedMoodboard = { ...moodboard, title: newTitle }
    onSelectMoodboard(updatedMoodboard)
  }

  // Filter moodboards based on search query
  const filteredMoodboards = moodboards.filter((moodboard) =>
    moodboard.title.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="w-full md:w-64 h-full flex flex-col border-r border-border/50 pr-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium font-clash">Your Moodboards</h2>
        <Button size="sm" variant="outline" onClick={onCreateMoodboard} className="flex items-center gap-1">
          <FolderPlus className="h-4 w-4" />
          <span className="sr-only md:not-sr-only">New</span>
        </Button>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search moodboards..."
          className="pl-8"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <ScrollArea className="flex-1 pr-3">
        <div className="grid gap-3">
          <AnimatePresence>
            {filteredMoodboards.map((moodboard) => (
              <MoodboardSidebarItem
                key={moodboard.id}
                moodboard={moodboard}
                isActive={currentMoodboard?.id === moodboard.id}
                onSelect={onSelectMoodboard}
                onDelete={handleDeleteClick}
                onEdit={handleEditMoodboard}
              />
            ))}
          </AnimatePresence>

          {filteredMoodboards.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              {searchQuery ? (
                <p>No moodboards match your search</p>
              ) : (
                <>
                  <p>No moodboards yet</p>
                  <Button variant="link" onClick={onCreateMoodboard}>
                    Create your first moodboard
                  </Button>
                </>
              )}
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

