"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { motion } from "framer-motion"
import { useDropzone } from "react-dropzone"
import { extractColors } from "@/lib/color-extractor"
import { useSupabase } from "@/components/supabase-provider"
import { useToast } from "@/components/ui/use-toast"
import type { MoodboardType, ImageItem, TextItem, ItemType, TextStyle } from "@/types/moodboard"
import { ImageItemComponent } from "@/components/moodboard/image-item"
import { TextItemComponent } from "@/components/moodboard/text-item"
import { ColorPalette } from "@/components/moodboard/color-palette"
import { Type, Upload, Maximize2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { v4 as uuidv4 } from "uuid"

// IMPORTANT: Remove the import of CanvasExpand to break the circular dependency
// import { CanvasExpand } from "./canvas-expand"

interface MoodboardCanvasProps {
  moodboard: MoodboardType
  onChange: (moodboard: MoodboardType) => void
  onSave: (moodboard: MoodboardType) => Promise<void>
  // Add the missing props
  onTextSelect?: (item: TextItem | null) => void
  selectedTextItem?: TextItem | null
  isExpanded?: boolean
  onExpandChange?: (open: boolean) => void
  hideExpandButton?: boolean
  onTextStyleChange?: (style: TextStyle) => void
}

export function MoodboardCanvas({
  moodboard,
  onChange,
  onSave,
  onTextSelect,
  selectedTextItem,
  isExpanded = false,
  onExpandChange,
  hideExpandButton = false,
  onTextStyleChange,
}: MoodboardCanvasProps) {
  const { supabase, user } = useSupabase()
  const { toast } = useToast()
  const [isDragging, setIsDragging] = useState(false)
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null)
  const canvasRef = useRef<HTMLDivElement>(null)
  const [isUploading, setIsUploading] = useState(false)

  // Sync the selected item with the selectedTextItem prop
  useEffect(() => {
    if (selectedTextItem) {
      setSelectedItemId(selectedTextItem.id)
    }
  }, [selectedTextItem])

  const handleItemSelect = (id: string) => {
    setSelectedItemId(id === selectedItemId ? null : id)

    // Find the selected item
    const selectedItem = moodboard.items.find((item) => item.id === id)

    // If it's a text item, call onTextSelect
    if (selectedItem && selectedItem.type === "text" && onTextSelect) {
      onTextSelect(selectedItem as TextItem)
    } else if (onTextSelect) {
      onTextSelect(null)
    }
  }

  const handleItemDelete = (id: string) => {
    const updatedItems = moodboard.items.filter((item) => item.id !== id)
    onChange({ ...moodboard, items: updatedItems })

    // If the deleted item was selected, clear selection
    if (id === selectedItemId) {
      setSelectedItemId(null)
      if (onTextSelect) {
        onTextSelect(null)
      }
    }
  }

  const handleItemUpdate = (updatedItem: ItemType) => {
    const updatedItems = moodboard.items.map((item) => (item.id === updatedItem.id ? updatedItem : item))
    onChange({ ...moodboard, items: updatedItems })

    // If the updated item is the selected text item, update it
    if (updatedItem.id === selectedItemId && updatedItem.type === "text" && onTextSelect) {
      onTextSelect(updatedItem as TextItem)
    }
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

    // Select the new text item
    if (onTextSelect) {
      onTextSelect(newTextItem)
    }
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

    // If it's a text item, select it
    if (newItem.type === "text" && onTextSelect) {
      onTextSelect(newItem as TextItem)
    }
  }

  // Handle expand button click
  const handleExpandClick = () => {
    if (onExpandChange) {
      onExpandChange(true)
    }
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

        {/* Expand button */}
        {!hideExpandButton && onExpandChange && (
          <Button
            size="icon"
            variant="ghost"
            className="absolute top-2 right-2 z-10 h-8 w-8 bg-background/80 backdrop-blur-sm"
            onClick={handleExpandClick}
          >
            <Maximize2 className="h-4 w-4" />
            <span className="sr-only">Expand canvas</span>
          </Button>
        )}

        <div
          ref={canvasRef}
          id="moodboard-canvas"
          className="h-full w-full relative paper-texture moodboard-canvas"
          style={{ backgroundColor: moodboard.background_color }}
          onClick={() => {
            setSelectedItemId(null)
            if (onTextSelect) {
              onTextSelect(null)
            }
          }} // Deselect when clicking on empty canvas
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
                transform: `rotate(${item.rotation || Math.random() * 6 - 3}deg)`,
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
              // Create a hidden file input and trigger it
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

      {/* IMPORTANT: Remove the CanvasExpand component from here */}
    </div>
  )
}

