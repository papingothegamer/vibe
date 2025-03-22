"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Rnd } from "react-rnd"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Trash2, Bold, AlignLeft, AlignCenter, AlignRight } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Slider } from "@/components/ui/slider"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { HexColorPicker } from "react-colorful"
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

  const handleFontSizeChange = (value: number[]) => {
    onChange({
      ...item,
      style: {
        ...item.style,
        fontSize: value[0],
      },
    })
  }

  const handleFontWeightChange = (weight: string) => {
    onChange({
      ...item,
      style: {
        ...item.style,
        fontWeight: weight === "bold" ? "bold" : "normal",
      },
    })
  }

  const handleTextAlignChange = (value: string | undefined) => {
    if (!value) return;
    onChange({
      ...item,
      style: {
        ...item.style,
        textAlign: value as "left" | "center" | "right",
      },
    });
  }

  const handleColorChange = (color: string) => {
    onChange({
      ...item,
      style: {
        ...item.style,
        color,
      },
    })
  }

  const handleBgColorChange = (color: string) => {
    onChange({
      ...item,
      style: {
        ...item.style,
        backgroundColor: color,
      },
    })
  }

  // Default to a sticky note yellow if background is transparent
  const bgColor = item.style.backgroundColor === "transparent" ? "#FFEB3B" : item.style.backgroundColor

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
      <div
        className="relative w-full h-full shadow-md"
        style={{
          backgroundColor: bgColor,
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
            fontFamily: "var(--font-inter)",
          }}
          onClick={onSelect}
        >
          {item.content}
        </div>

        {isSelected && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute top-2 right-2 flex gap-1">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  size="icon"
                  variant="secondary"
                  className="h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm"
                >
                  <span className="text-xs font-bold">A</span>
                  <span className="sr-only">Text options</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Font Size</span>
                      <span className="text-sm text-muted-foreground">{item.style.fontSize}px</span>
                    </div>
                    <Slider
                      defaultValue={[item.style.fontSize]}
                      min={8}
                      max={72}
                      step={1}
                      onValueChange={handleFontSizeChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <span className="text-sm font-medium">Style</span>
                    // Replace the existing ToggleGroup sections with:

<ToggleGroup type="single" variant="outline" className="justify-start">
  <ToggleGroupItem
    value="bold"
    aria-label="Toggle bold"
    onClick={() => handleFontWeightChange(item.style.fontWeight === "bold" ? "normal" : "bold")}
  >
    <Bold className="h-4 w-4" />
  </ToggleGroupItem>
</ToggleGroup>

{/* ... */}

<ToggleGroup 
  type="single" 
  variant="outline" 
  className="justify-start"
  value={item.style.textAlign || "left"}
  onValueChange={handleTextAlignChange}
>
  <ToggleGroupItem
    value="left"
    aria-label="Align left"
  >
    <AlignLeft className="h-4 w-4" />
  </ToggleGroupItem>
  <ToggleGroupItem
    value="center"
    aria-label="Align center"
  >
    <AlignCenter className="h-4 w-4" />
  </ToggleGroupItem>
  <ToggleGroupItem
    value="right"
    aria-label="Align right"
  >
    <AlignRight className="h-4 w-4" />
  </ToggleGroupItem>
</ToggleGroup>
                  </div>

                  <div className="space-y-2">
                    <span className="text-sm font-medium">Text Color</span>
                    <HexColorPicker color={item.style.color} onChange={handleColorChange} />
                  </div>

                  <div className="space-y-2">
                    <span className="text-sm font-medium">Note Color</span>
                    <HexColorPicker color={bgColor} onChange={handleBgColorChange} />
                  </div>
                </div>
              </PopoverContent>
            </Popover>

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

