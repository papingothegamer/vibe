"use client"

import { useState, useRef, useCallback, useEffect } from "react"
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
}

export function MoodboardCanvas({ moodboard, onChange }: MoodboardCanvasProps) {
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
    // Make sure we're creating a new array to trigger re-renders properly
    const updatedItems = moodboard.items.map((item) => 
      item.id === updatedItem.id ? { ...updatedItem } : item
    )
    
    // Create a new moodboard object to ensure state updates
    const updatedMoodboard = {
      ...moodboard,
      items: updatedItems,
    }
    
    onChange(updatedMoodboard)
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
            rotation, // Add rotation property
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

  useEffect(() => {
    // Setup global drag and drop listeners
    const handleDragOver = (e: DragEvent) => {
      e.preventDefault()
      setIsDragging(true)
    }

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
    }

    const handleDrop = (e: DragEvent) => {
      e.preventDefault()
      setIsDragging(false)

      if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
        onDrop(Array.from(e.dataTransfer.files))
      }
    }

    // Add listeners to the document
    document.addEventListener("dragover", handleDragOver)
    document.addEventListener("dragleave", handleDragLeave)
    document.addEventListener("drop", handleDrop)

    return () => {
      // Clean up
      document.removeEventListener("dragover", handleDragOver)
      document.removeEventListener("dragleave", handleDragLeave)
      document.removeEventListener("drop", handleDrop)
    }
  }, [onDrop])

  // Add this function inside the MoodboardCanvas component
  const handleDuplicateItem = (item: ItemType) => {
    const newItem = {
      ...item,
      id: uuidv4(),
      position: {
        x: item.position.x + 20,
        y: item.position.y + 20,
      },
      zIndex: moodboard.items.length + 1,
    }

    onChange({
      ...moodboard,
      items: [...moodboard.items, newItem],
    })

    setSelectedItemId(newItem.id)
  }

  return (
    <div className="flex-1 flex flex-col h-full">
      <div className="flex-1 relative overflow-hidden rounded-lg border border-border/50 shadow-lg h-full">
        {/* Only show the dropzone overlay when actively dragging files */}
        {isDragActive && (
          <div
            {...getRootProps()}
            className="absolute inset-0 z-20 bg-primary/10 border-2 border-dashed border-primary flex items-center justify-center"
          >
            <p className="text-xl font-medium text-primary">Drop images here</p>
            <input {...getInputProps()} />
          </div>
        )}

<div
        ref={canvasRef}
        id="moodboard-canvas"
        className="h-full w-full relative paper-texture moodboard-canvas"
        style={{ backgroundColor: moodboard.background_color }}
        onClick={() => setSelectedItemId(null)}
      >
          {moodboard.items.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="absolute pin-effect pin-shadow"
              style={{
                left: 0, // Set to 0 and let the Rnd component handle positioning
                top: 0,  // Set to 0 and let the Rnd component handle positioning
                zIndex: item.zIndex,
                // Remove transform here - let the Rnd component handle rotation
              }}
            >
              {item.type === "image" ? (
                <ImageItemComponent
                  item={{
                    ...(item as ImageItem),
                    onDuplicate: handleDuplicateItem,
                  }}
                  isSelected={selectedItemId === item.id}
                  onSelect={() => handleItemSelect(item.id)}
                  onDelete={() => handleItemDelete(item.id)}
                  onChange={(updatedItem) => handleItemUpdate(updatedItem)}
                />
              ) : (
                <TextItemComponent
                  item={{
                    ...(item as TextItem),
                    onDuplicate: handleDuplicateItem,
                  }}
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
          onClick={() => {
            const fileInput = document.createElement("input")
            fileInput.type = "file"
            fileInput.multiple = true
            fileInput.accept = "image/*"
            fileInput.onchange = (e) => {
              const files = (e.target as HTMLInputElement).files
              if (files && files.length > 0) {
                onDrop(Array.from(files))
              }
            }
            fileInput.click()
          }}
          disabled={isUploading}
        >
          {isUploading ? (
               <div className="h-4 w-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
              <span className="hidden sm:inline">Add Image</span>
            </Button>
          </div>
    
          <ColorPalette moodboard={moodboard} onChange={onChange} />
        </div>
      </div>
    )
}