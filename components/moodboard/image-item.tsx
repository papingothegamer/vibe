"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Rnd } from "react-rnd"
import { Button } from "@/components/ui/button"
import {
  Trash2,
  RotateCcw,
  RotateCw,
  Copy,
  ArrowUpRight,
  ArrowDownRight,
  ArrowDownLeft,
  ArrowUpLeft,
} from "lucide-react"
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
  const [rotation, setRotation] = useState(item.rotation || 0)
  const imageRef = useRef<HTMLImageElement>(null)
  const rndRef = useRef<Rnd>(null)

  const handleDragStart = () => {
    setIsDragging(true)
    onSelect()
  }

  const handleDragStop = (e: any, d: any) => {
    setIsDragging(false)
    // Ensure we're updating with the correct position values
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
    // This will be handled by the parent component
    // We just pass the current item to duplicate
    if (item.onDuplicate) {
      item.onDuplicate(item)
    }
  }

  return (
    <Rnd
      ref={rndRef}
      // Remove default prop - only use position and size props
      position={{ x: item.position.x, y: item.position.y }}
      size={{ width: item.size.width, height: item.size.height }}
      onDragStart={handleDragStart}
      onDragStop={handleDragStop}
      onResize={handleResize}
      bounds="parent"
      className={`group touch-none ${isSelected ? "z-10" : ""}`}
      style={{
        transform: `rotate(${rotation}deg)`,
        transformOrigin: "center center",
      }}
      onClick={onSelect}
      resizeHandleStyles={{
        topLeft: { display: isSelected ? "block" : "none" },
        topRight: { display: isSelected ? "block" : "none" },
        bottomLeft: { display: isSelected ? "block" : "none" },
        bottomRight: { display: isSelected ? "block" : "none" },
      }}
      enableResizing={isSelected}
    >
      <div className="relative w-full h-full overflow-hidden bg-white p-1 shadow-md">
        <img
          ref={imageRef}
          src={item.src || "/placeholder.svg"}
          alt="Moodboard item"
          className="w-full h-full object-cover"
        />

        {/* Selection outline and controls */}
        {isSelected && (
          <>
            {/* Selection border */}
            <div className="absolute inset-0 border-2 border-primary pointer-events-none"></div>

            {/* Control buttons */}
            <div className="absolute -top-10 right-0 flex gap-1">
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

            {/* Custom resize handles */}
            <div className="absolute -top-3 -left-3 h-6 w-6 bg-primary rounded-full cursor-nwse-resize flex items-center justify-center">
              <ArrowUpLeft className="h-3 w-3 text-white" />
            </div>
            <div className="absolute -top-3 -right-3 h-6 w-6 bg-primary rounded-full cursor-nesw-resize flex items-center justify-center">
              <ArrowUpRight className="h-3 w-3 text-white" />
            </div>
            <div className="absolute -bottom-3 -left-3 h-6 w-6 bg-primary rounded-full cursor-nesw-resize flex items-center justify-center">
              <ArrowDownLeft className="h-3 w-3 text-white" />
            </div>
            <div className="absolute -bottom-3 -right-3 h-6 w-6 bg-primary rounded-full cursor-nwse-resize flex items-center justify-center">
              <ArrowDownRight className="h-3 w-3 text-white" />
            </div>
          </>
        )}
      </div>
    </Rnd>
  )
}