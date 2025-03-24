"use client"

import { useState, useRef } from "react"
import { Rnd } from "react-rnd"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import type { TextItem } from "@/types/moodboard"

interface TextItemComponentProps {
  item: TextItem
  isSelected: boolean
  onSelect: () => void
  onDelete: () => void
  onChange: (item: TextItem) => void
}

export function TextItemComponent({ 
  item, 
  isSelected, 
  onSelect,
  onDelete, 
  onChange 
}: TextItemComponentProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const textRef = useRef<HTMLDivElement>(null)

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

  const handleTextChange = (e: React.FormEvent<HTMLDivElement>) => {
    const content = e.currentTarget.innerText
    onChange({
      ...item,
      content,
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
      onClick={(e: React.MouseEvent) => {
        e.stopPropagation() // Prevent canvas deselection
        onSelect()
      }}
    >
      <div
        className="relative w-full h-full shadow-md"
        style={{
          backgroundColor: item.style.backgroundColor || "transparent",
          backgroundImage: "linear-gradient(rgba(0,0,0,0.02) 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      >
        <div
          ref={textRef}
          contentEditable={isSelected}
          suppressContentEditableWarning
          onInput={handleTextChange}
          onFocus={() => setIsEditing(true)}
          onBlur={() => setIsEditing(false)}
          className="w-full h-full p-3 outline-none overflow-auto"
          style={{
            fontSize: `${item.style.fontSize}px`,
            fontWeight: item.style.fontWeight,
            color: item.style.color,
            textAlign: item.style.textAlign || "left",
            fontFamily: item.style.fontFamily || "var(--font-inter)",
          }}
          onClick={onSelect}
        >
          {item.content}
        </div>

        {isSelected && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute top-2 right-2">
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