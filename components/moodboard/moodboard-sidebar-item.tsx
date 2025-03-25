"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Trash2, Edit, Check, X, LayoutGrid, Clock } from "lucide-react"
import type { MoodboardType } from "@/types/moodboard"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

interface MoodboardSidebarItemProps {
  moodboard: MoodboardType
  isActive: boolean
  onSelect: (moodboard: MoodboardType) => void
  onDelete: (id: string) => void
  onEdit: (moodboard: MoodboardType, newTitle: string) => void
}

export function MoodboardSidebarItem({ moodboard, isActive, onSelect, onDelete, onEdit }: MoodboardSidebarItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(moodboard.title)

  // Add effect to sync local title state with moodboard prop
  useEffect(() => {
    setEditTitle(moodboard.title)
  }, [moodboard.title])

  const isSaved = moodboard.is_saved !== false

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsEditing(true)
    setEditTitle(moodboard.title)
  }

  const handleEditSave = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (editTitle.trim() !== "") {
      onEdit(moodboard, editTitle.trim())
      setIsEditing(false)
    }
  }

  const handleEditCancel = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsEditing(false)
  }

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onDelete(moodboard.id)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ 
        duration: 0.2,
        ease: "easeInOut"
      }}
      className={cn(
        "group relative rounded-md p-3 cursor-pointer",
        "hover:bg-muted/50 transition-all duration-200",
        "ring-offset-background",
        isActive && "bg-muted/50 ring-2 ring-primary ring-offset-2",
        !isActive && "hover:ring-1 hover:ring-primary/20 hover:ring-offset-1"
      )}
      onClick={() => onSelect(moodboard)}
    >
      {isEditing ? (
        <div className="flex items-center gap-2">
          <Input
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            className="h-8"
            autoFocus
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleEditSave(e as unknown as React.MouseEvent)
              if (e.key === "Escape") handleEditCancel(e as unknown as React.MouseEvent)
            }}
          />
          <div className="flex gap-1">
            <Button size="icon" variant="ghost" className="h-6 w-6" onClick={handleEditSave}>
              <Check className="h-3 w-3" />
            </Button>
            <Button size="icon" variant="ghost" className="h-6 w-6" onClick={handleEditCancel}>
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-2">
            <div className="relative">
              <LayoutGrid className="h-4 w-4 text-muted-foreground" />
              {!isSaved && <div className="absolute -top-1 -right-1 h-2 w-2 bg-secondary rounded-full"></div>}
            </div>
            <div className="font-medium truncate">{moodboard.title}</div>
            {!isSaved && (
              <Badge variant="outline" className="ml-auto text-xs py-0 h-5 px-1.5 bg-background/50">
                <Clock className="h-3 w-3 mr-1" />
                Unsaved
              </Badge>
            )}
          </div>
          <div className="flex items-center justify-between mt-1">
            <div className="text-xs text-muted-foreground">
              {format(new Date(moodboard.updated_at), "MMM d, yyyy")}
            </div>
            <div className="flex opacity-0 group-hover:opacity-100 transition-opacity">
              <Button size="icon" variant="ghost" className="h-6 w-6" onClick={handleEditClick}>
                <Edit className="h-3 w-3" />
                <span className="sr-only">Edit</span>
              </Button>
              <Button size="icon" variant="ghost" className="h-6 w-6 text-destructive" onClick={handleDeleteClick}>
                <Trash2 className="h-3 w-3" />
                <span className="sr-only">Delete</span>
              </Button>
            </div>
          </div>
        </>
      )}
    </motion.div>
  )
}