"use client"

import type React from "react"

import { useEffect, useState, useRef, useCallback } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, X, Check, ChevronDown, AlertCircle, ArrowUpDown } from "lucide-react"
import { getGoogleFonts, getFontUrl } from "@/lib/utils/fonts"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface FontPickerProps {
  value?: string
  onChange?: (font: string) => void
  expanded?: boolean
}

export function FontPicker({ value, onChange, expanded = false }: FontPickerProps) {
  const [fonts, setFonts] = useState<Array<{ family: string; variants: string[]; category: string }>>([])
  const [filteredFonts, setFilteredFonts] = useState<Array<{ family: string; variants: string[]; category: string }>>(
    [],
  )
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [loadedFonts, setLoadedFonts] = useState<Set<string>>(new Set())
  const searchInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  // Load fonts on component mount
  useEffect(() => {
    async function loadFonts() {
      try {
        setLoading(true)
        setError(null)

        // Check if API key is available
        if (!process.env.NEXT_PUBLIC_GOOGLE_FONTS_API_KEY) {
          console.warn("Google Fonts API key is not set. Using fallback fonts.")
          setError("API key missing")
          // Use fallback fonts if API key is missing
          const fallbackFonts = [
            { family: "Arial", variants: ["regular", "700"], category: "sans-serif" },
            { family: "Verdana", variants: ["regular", "700"], category: "sans-serif" },
            { family: "Helvetica", variants: ["regular", "700"], category: "sans-serif" },
            { family: "Times New Roman", variants: ["regular", "700"], category: "serif" },
            { family: "Georgia", variants: ["regular", "700"], category: "serif" },
          ]
          setFonts(fallbackFonts)
          setFilteredFonts(fallbackFonts)
          return
        }

        const googleFonts = await getGoogleFonts()

        if (googleFonts.length === 0) {
          setError("No fonts returned from API")
        }

        // Limit to first 100 fonts for performance
        const limitedFonts = googleFonts.slice(0, 100)
        setFonts(limitedFonts)
        setFilteredFonts(limitedFonts)
      } catch (err) {
        console.error("Error loading fonts:", err)
        setError("Failed to load fonts")
        toast({
          variant: "destructive",
          title: "Error loading fonts",
          description: "Please check your API key and try again.",
        })
      } finally {
        setLoading(false)
      }
    }

    loadFonts()
  }, [toast])

  // Load font stylesheets for visible fonts
  useEffect(() => {
    // Only load fonts that are filtered and visible
    const fontsToLoad = filteredFonts.slice(0, 20).map((font) => font.family)

    // Load fonts that haven't been loaded yet
    fontsToLoad.forEach((fontFamily) => {
      if (!loadedFonts.has(fontFamily)) {
        const link = document.createElement("link")
        link.href = getFontUrl(fontFamily)
        link.rel = "stylesheet"
        document.head.appendChild(link)

        // Update loaded fonts set
        setLoadedFonts((prev) => new Set(prev).add(fontFamily))
      }
    })
  }, [filteredFonts, loadedFonts])

  // Add effect to load the selected font when it changes
  useEffect(() => {
    if (value && !loadedFonts.has(value)) {
      const link = document.createElement("link")
      link.href = getFontUrl(value)
      link.rel = "stylesheet"
      document.head.appendChild(link)
      setLoadedFonts((prev) => new Set(prev).add(value))
    }
  }, [value, loadedFonts])

  // Filter fonts based on search query
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredFonts(fonts)
    } else {
      const filtered = fonts.filter((font) => font.family.toLowerCase().includes(searchQuery.toLowerCase()))
      setFilteredFonts(filtered)
    }
  }, [searchQuery, fonts])

  // Focus search input when dialog opens
  useEffect(() => {
    if (isDialogOpen && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus()
      }, 100)
    }
  }, [isDialogOpen])

  // Handle font selection
  const handleSelectFont = (fontFamily: string) => {
    onChange?.(fontFamily)
    if (isDialogOpen) {
      setIsDialogOpen(false)
    }
  }

  // Compact view (button that opens dialog)
  if (!expanded) {
    return (
      <>
        <Button 
          variant="outline" 
          className="w-full justify-between" 
          onClick={() => setIsDialogOpen(true)}
        >
          <span 
            className="truncate flex items-center gap-2"
            style={{ 
              fontFamily: value || 'inherit',
              fontWeight: 'normal'
            }}
          >
            <span>Aa</span>
            <span>{value || "Select a font"}</span>
          </span>
          <ChevronDown className="h-4 w-4 opacity-50 flex-shrink-0" />
        </Button>

        <FontPickerDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          fonts={filteredFonts}
          selectedFont={value}
          onSelectFont={handleSelectFont}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          searchInputRef={searchInputRef}
          loading={loading}
          error={error}
        />
      </>
    )
  }

  // Expanded view (inline)
  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          ref={searchInputRef}
          placeholder="Search fonts..."
          className="pl-9"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="p-8 text-center">
          <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading fonts...</p>
        </div>
      ) : error ? (
        <div className="p-4 text-center text-amber-500 flex flex-col items-center">
          <AlertCircle className="h-6 w-6 mb-2" />
          <p>Could not load Google Fonts</p>
          <p className="text-xs text-muted-foreground mt-1">Using system fonts instead</p>
        </div>
      ) : (
        <ScrollArea className="h-72 rounded-md border">
          <div className="p-2 grid grid-cols-1 gap-1">
            {filteredFonts.length > 0 ? (
              filteredFonts.map((font) => (
                <Button
                  key={font.family}
                  variant={value === font.family ? "secondary" : "ghost"}
                  className="justify-between h-10"
                  style={{ fontFamily: font.family }}
                  onClick={() => handleSelectFont(font.family)}
                >
                  <span>{font.family}</span>
                  {value === font.family && <Check className="h-4 w-4 ml-2" />}
                </Button>
              ))
            ) : (
              <div className="p-8 text-center text-muted-foreground">No fonts match your search</div>
            )}
          </div>
        </ScrollArea>
      )}
    </div>
  )
}

// Dialog version of the font picker
type SortOption = 'popularity' | 'alphabetical'

interface FontPickerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  fonts: Array<{ family: string; variants: string[]; category: string }>
  selectedFont?: string
  onSelectFont: (font: string) => void
  searchQuery: string
  onSearchChange: (query: string) => void
  searchInputRef: React.RefObject<HTMLInputElement | null>
  loading: boolean
  error: string | null
}

function FontPickerDialog({
  open,
  onOpenChange,
  fonts,
  selectedFont,
  onSelectFont,
  searchQuery,
  onSearchChange,
  searchInputRef,
  loading,
  error,
}: FontPickerDialogProps) {
  const [sortBy, setSortBy] = useState<SortOption>('popularity')
  const [tempSelectedFont, setTempSelectedFont] = useState<string | undefined>(selectedFont)

  const getSortedFonts = useCallback(() => {
    return [...fonts].sort((a, b) => {
      if (sortBy === 'alphabetical') {
        return a.family.localeCompare(b.family)
      }
      return 0
    })
  }, [fonts, sortBy])

  const sortedFonts = getSortedFonts()

  // Reset temp selection when dialog opens
  useEffect(() => {
    if (open) {
      setTempSelectedFont(selectedFont)
    }
  }, [open, selectedFont])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Select Font</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                ref={searchInputRef}
                placeholder="Search fonts..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
              />
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="h-10 w-10">
                  <ArrowUpDown className="h-4 w-4" />
                  <span className="sr-only">Sort fonts</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem 
                  onClick={() => setSortBy('popularity')}
                  className={sortBy === 'popularity' ? 'bg-muted' : ''}
                >
                  Sort by popularity
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setSortBy('alphabetical')}
                  className={sortBy === 'alphabetical' ? 'bg-muted' : ''}
                >
                  Sort alphabetically
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Sorted by {sortBy === 'popularity' ? 'popularity' : 'alphabetical order'}
            </p>
            {tempSelectedFont && tempSelectedFont !== selectedFont && (
              <p className="text-sm text-muted-foreground">
                Selected: {tempSelectedFont}
              </p>
            )}
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
              <p className="mt-2 text-sm text-muted-foreground">Loading fonts...</p>
            </div>
          ) : error ? (
            <div className="p-4 text-center text-amber-500 flex flex-col items-center">
              <AlertCircle className="h-6 w-6 mb-2" />
              <p>Could not load Google Fonts</p>
              <p className="text-xs text-muted-foreground mt-1">Using system fonts instead</p>
            </div>
          ) : (
            <ScrollArea className="h-[40vh] rounded-md border">
              <div className="p-2 grid grid-cols-1 gap-1">
                {sortedFonts.length > 0 ? (
                  sortedFonts.map((font) => (
                    <Button
                      key={font.family}
                      variant={tempSelectedFont === font.family ? "secondary" : "ghost"}
                      className="justify-between h-10"
                      style={{ fontFamily: font.family }}
                      onClick={() => setTempSelectedFont(font.family)}
                    >
                      <span>{font.family}</span>
                      {tempSelectedFont === font.family && <Check className="h-4 w-4 ml-2" />}
                    </Button>
                  ))
                ) : (
                  <div className="p-8 text-center text-muted-foreground">
                    No fonts match your search
                  </div>
                )}
              </div>
            </ScrollArea>
          )}
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button
            variant="outline"
            onClick={() => {
              setTempSelectedFont(selectedFont)
              onOpenChange(false)
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              if (tempSelectedFont) {
                onSelectFont(tempSelectedFont)
                onOpenChange(false)
              }
            }}
            disabled={!tempSelectedFont || tempSelectedFont === selectedFont}
          >
            Confirm Selection
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

