"use client"

import { useState, useRef } from "react"
import { Rnd } from "react-rnd"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import type { ImageItem } from "@/types/moodboard"

interface ImageItemComponentProps {
  item: ImageItem
  isSelected: boolean
  onSelect: () => void
  onDelete: () => void
  onChange: (item: ImageItem) => void
}

export function ImageItemComponent({ item, isSelected, onSelect, onDelete, onChange }: ImageItemComponentProps) {
  const [isDragging, setIsDragging] = useState(false)
  const imageRef = useRef<HTMLImageElement>(null)

  const handleDragStart = () => {
    setIsDragging(true)
    onSelect()
  }

  const handleDragStop = (e: any, d: any) => {
    setIsDragging(false)
    onChange({
      ...item,
      position: { x: d.x, y: d.y },
    })
  }

  const handleResize = (e: any, direction: any, ref: any, delta: any, position: any) => {
    onChange({
      ...item,
      position: { x: position.x, y: position.y },
      size: { width: ref.offsetWidth, height: ref.offsetHeight },
    })
  }

  return (
    <Rnd
      default={{
        x: item.position.x,
        y: item.position.y,
        width: item.size.width,
        height: item.size.height,
      }}
      position={{ x: item.position.x, y: item.position.y }}
      size={{ width: item.size.width, height: item.size.height }}
      onDragStart={handleDragStart}
      onDragStop={handleDragStop}
      onResize={handleResize}
      bounds="parent"
      className={`group ${isSelected ? "ring-2 ring-primary" : ""}`}
      dragHandleClassName="drag-handle"
    >
      <div className="relative w-full h-full overflow-hidden bg-white p-1 shadow-md">
        <img
          ref={imageRef}
          src={item.src || "/placeholder.svg"}
          alt="Moodboard item"
          className="w-full h-full object-cover"
        />

        {isSelected && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute top-2 right-2 flex gap-1">
            <Button
              size="icon"
              variant="secondary"
              className="h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm"
              onClick={(e) => {
                e.stopPropagation()
                onDelete()
              }}
            >
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Delete</span>
            </Button>
          </motion.div>
        )}

        <div className="drag-handle absolute top-0 left-0 w-full h-8 cursor-move opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </Rnd>
  )
}

