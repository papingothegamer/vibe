"use client"

import { useState, useRef, useCallback } from "react"
import { motion } from "framer-motion"
import { useDropzone } from "react-dropzone"
import { extractColors } from "@/lib/color-extractor"
import { useSupabase } from "@/components/supabase-provider"
import { useToast } from "@/components/ui/use-toast"
import type { MoodboardType, ImageItem, TextItem, ItemType } from "@/types/moodboard"
import { ImageItemComponent } from "@/components/moodboard/image-item"
import { TextItemComponent } from "@/components/moodboard/text-item"
import { ColorPalette } from "@/components/moodboard/color-palette"
import { Type, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { v4 as uuidv4 } from "uuid"

interface MoodboardCanvasProps {
  moodboard: MoodboardType
  onChange: (moodboard: MoodboardType) => void
  onSave: (moodboard: MoodboardType) => void
}

export function MoodboardCanvas({ moodboard, onChange, onSave }: MoodboardCanvasProps) {
  const { supabase, user } = useSupabase()
  const { toast } = useToast()
  const [isDragging, setIsDragging] = useState(false)
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null)
  const canvasRef = useRef<HTMLDivElement>(null)
  const [isUploading, setIsUploading] = useState(false)

  const handleItemSelect = (id: string) => {
    setSelectedItemId(id === selectedItemId ? null : id)
  }

  const handleItemDelete = (id: string) => {
    const updatedItems = moodboard.items.filter((item) => item.id !== id)
    onChange({ ...moodboard, items: updatedItems })
  }

  const handleItemUpdate = (updatedItem: ItemType) => {
    const updatedItems = moodboard.items.map((item) => (item.id === updatedItem.id ? updatedItem : item))
    onChange({ ...moodboard, items: updatedItems })
  }

  const handleAddText = () => {
    const newTextItem: TextItem = {
      id: uuidv4(),
      type: "text",
      content: "Add your text here",
      position: { x: Math.random() * 100 + 50, y: Math.random() * 100 + 50 },
      size: { width: 200, height: 100 },
      style: {
        fontSize: 16,
        fontWeight: "normal",
        color: "#000000",
        backgroundColor: "transparent",
        textAlign: "left",
      },
      zIndex: moodboard.items.length + 1,
    }

    onChange({
      ...moodboard,
      items: [...moodboard.items, newTextItem],
    })

    setSelectedItemId(newTextItem.id)
  }

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (!user) return

      // Process only image files
      const imageFiles = acceptedFiles.filter((file) => file.type.startsWith("image/"))

      if (imageFiles.length === 0) {
        toast({
          variant: "destructive",
          title: "Invalid files",
          description: "Please upload image files only.",
        })
        return
      }

      setIsUploading(true)

      // Upload images to Supabase Storage
      for (const file of imageFiles) {
        try {
          const fileExt = file.name.split(".").pop()
          const fileName = `${uuidv4()}.${fileExt}`
          const filePath = `${user.id}/${fileName}`

          // Upload file
          const { data, error } = await supabase.storage.from("moodboard-images").upload(filePath, file)

          if (error) throw error

          // Get public URL
          const {
            data: { publicUrl },
          } = supabase.storage.from("moodboard-images").getPublicUrl(filePath)

          // Extract colors from image
          const colors = await extractColors(file)

          // Create new image item with a slight random rotation
          const rotation = Math.random() * 10 - 5 // Random rotation between -5 and 5 degrees

          const newImageItem: ImageItem = {
            id: uuidv4(),
            type: "image",
            src: publicUrl,
            position: { x: Math.random() * 200 + 50, y: Math.random() * 200 + 50 },
            size: { width: 250, height: 250 },
            colors,
            zIndex: moodboard.items.length + 1,
          }

          // Add to moodboard
          onChange({
            ...moodboard,
            items: [...moodboard.items, newImageItem],
          })

          toast({
            title: "Image uploaded",
            description: "Your image has been added to the moodboard.",
          })
        } catch (error) {
          console.error("Error uploading image:", error)
          toast({
            variant: "destructive",
            title: "Upload failed",
            description: "There was an error uploading your image.",
          })
        }
      }

      setIsUploading(false)
    },
    [moodboard, supabase, onChange, toast, user],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [],
    },
  })

  return (
    <div className="flex-1 flex flex-col">
      <div className="flex-1 relative overflow-hidden rounded-lg border border-border/50 shadow-lg">
        <div
          {...getRootProps()}
          className={`absolute inset-0 z-10 ${
            isDragActive ? "bg-primary/10 border-2 border-dashed border-primary" : ""
          }`}
        >
          {isDragActive && (
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-xl font-medium text-primary">Drop images here</p>
            </div>
          )}
          <input {...getInputProps()} />
        </div>

        <div
          ref={canvasRef}
          id="moodboard-canvas"
          className="h-full w-full relative paper-texture moodboard-canvas"
          style={{ backgroundColor: moodboard.background_color }}
        >
          {moodboard.items.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="absolute pin-effect pin-shadow"
              style={{
                left: item.position.x,
                top: item.position.y,
                zIndex: item.zIndex,
                transform: `rotate(${Math.random() * 6 - 3}deg)`,
              }}
            >
              {item.type === "image" ? (
                <ImageItemComponent
                  item={item as ImageItem}
                  isSelected={selectedItemId === item.id}
                  onSelect={() => handleItemSelect(item.id)}
                  onDelete={() => handleItemDelete(item.id)}
                  onChange={(updatedItem) => handleItemUpdate(updatedItem)}
                />
              ) : (
                <TextItemComponent
                  item={item as TextItem}
                  isSelected={selectedItemId === item.id}
                  onSelect={() => handleItemSelect(item.id)}
                  onDelete={() => handleItemDelete(item.id)}
                  onChange={(updatedItem) => handleItemUpdate(updatedItem)}
                />
              )}
            </motion.div>
          ))}
        </div>
      </div>

      <div className="flex justify-between items-center mt-4">
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={handleAddText} className="flex items-center gap-1">
            <Type className="h-4 w-4" />
            <span className="hidden sm:inline">Add Text</span>
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="flex items-center gap-1"
            {...getRootProps()}
            disabled={isUploading}
          >
            {isUploading ? (
              <div className="h-4 w-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            <span className="hidden sm:inline">Add Image</span>
            <input {...getInputProps()} />
          </Button>
        </div>

        <ColorPalette moodboard={moodboard} onChange={onChange} />
      </div>
    </div>
  )
}

