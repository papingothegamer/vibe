"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Rnd } from "react-rnd"
import { Button } from "@/components/ui/button"
import { Trash2, Copy, RotateCcw, RotateCw } from "lucide-react"
import type { TextItem } from "@/types/moodboard"

interface TextItemComponentProps {
  item: TextItem
  isSelected: boolean
  onSelect: () => void
  onDelete: () => void
  onChange: (item: TextItem) => void
}

export function TextItemComponent({ item, isSelected, onSelect, onDelete, onChange }: TextItemComponentProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [rotation, setRotation] = useState(item.rotation || 0)
  const textRef = useRef<HTMLDivElement>(null)

  // Apply style changes to the text element
  useEffect(() => {
    if (textRef.current) {
      // Create a style object to track all applied styles
      const styles: Record<string, string> = {}

      // Apply font family - ensure this is applied first and preserved
      if (item.style.fontFamily) {
        styles.fontFamily = item.style.fontFamily
        textRef.current.style.fontFamily = item.style.fontFamily
      }

      // Apply font size
      if (item.style.fontSize) {
        styles.fontSize = `${item.style.fontSize}px`
        textRef.current.style.fontSize = `${item.style.fontSize}px`
      }

      // Apply font weight
      styles.fontWeight = item.style.fontWeight || "normal"
      textRef.current.style.fontWeight = styles.fontWeight

      // Apply text color
      styles.color = item.style.color || "#000000"
      textRef.current.style.color = styles.color

      // Apply text alignment
      styles.textAlign = item.style.textAlign || "left"
      textRef.current.style.textAlign = styles.textAlign
    }
  }, [item.style.fontFamily, item.style.fontSize, item.style.fontWeight, item.style.color, item.style.textAlign])

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

  const handleRotate = (direction: "clockwise" | "counterclockwise") => {
    const delta = direction === "clockwise" ? 15 : -15
    const newRotation = (rotation + delta) % 360
    setRotation(newRotation)
    onChange({
      ...item,
      rotation: newRotation,
    })
  }

  const handleDuplicate = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (item.onDuplicate) {
      item.onDuplicate(item)
    }
  }

  return (
    <Rnd
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
      style={{
        transform: `rotate(${rotation}deg)`,
        transformOrigin: "center center",
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
            fontSize: `${item.style.fontSize || 16}px`,
            fontWeight: item.style.fontWeight || "normal",
            color: item.style.color || "#000000",
            textAlign: item.style.textAlign || "left",
            fontFamily: item.style.fontFamily || "var(--font-inter)",
          }}
          onClick={(e) => {
            e.stopPropagation()
            onSelect()
          }}
        >
          {item.content}
        </div>

        {isSelected && (
          <div className="absolute -top-10 right-0 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              size="icon"
              variant="secondary"
              className="h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm"
              onClick={(e) => {
                e.stopPropagation()
                handleRotate("counterclockwise")
              }}
            >
              <RotateCcw className="h-4 w-4" />
              <span className="sr-only">Rotate Left</span>
            </Button>
            <Button
              size="icon"
              variant="secondary"
              className="h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm"
              onClick={(e) => {
                e.stopPropagation()
                handleRotate("clockwise")
              }}
            >
              <RotateCw className="h-4 w-4" />
              <span className="sr-only">Rotate Right</span>
            </Button>
            <Button
              size="icon"
              variant="secondary"
              className="h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm"
              onClick={handleDuplicate}
            >
              <Copy className="h-4 w-4" />
              <span className="sr-only">Duplicate</span>
            </Button>
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
          </div>
        )}

        <div className="drag-handle absolute top-0 left-0 w-full h-8 cursor-move opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </Rnd>
  )
}

