"use client"

import { useState } from "react"
import { HexColorPicker } from "react-colorful"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import type { MoodboardType } from "@/types/moodboard"

interface ColorPaletteProps {
  moodboard: MoodboardType
  onChange: (moodboard: MoodboardType) => void
}

export function ColorPalette({ moodboard, onChange }: ColorPaletteProps) {
  const [color, setColor] = useState(moodboard.background_color)

  // Get all unique colors from image items
  const imageColors = moodboard.items
    .filter((item) => item.type === "image")
    .flatMap((item) => (item.type === "image" ? item.colors : []))
    .filter((color, index, self) => self.indexOf(color) === index)
    .slice(0, 10)

  // Get text colors
  const textColors = moodboard.items
    .filter((item) => item.type === "text")
    .map((item) => (item.type === "text" ? item.style.color : ""))
    .filter((color, index, self) => self.indexOf(color) === index && color !== "transparent")
    .slice(0, 5)

  // Combine colors
  const allColors = [...new Set([...imageColors, ...textColors])].slice(0, 10)

  const handleColorChange = (newColor: string) => {
    setColor(newColor)
    onChange({
      ...moodboard,
      background_color: newColor,
    })
  }

  const handleColorClick = (selectedColor: string) => {
    setColor(selectedColor)
    onChange({
      ...moodboard,
      background_color: selectedColor,
    })
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1">
        {allColors.map((color) => (
          <button
            key={color}
            className="w-6 h-6 rounded-full border border-border/50 transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary"
            style={{ backgroundColor: color }}
            onClick={() => handleColorClick(color)}
            aria-label={`Select color ${color}`}
          />
        ))}
      </div>

      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="rounded-full"
            style={{ backgroundColor: moodboard.background_color }}
          >
            <span className="sr-only">Pick background color</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-3">
          <HexColorPicker color={color} onChange={handleColorChange} />
        </PopoverContent>
      </Popover>
    </div>
  )
}

