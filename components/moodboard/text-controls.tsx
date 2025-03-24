"use client"
import { useState, useEffect, useRef } from "react"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Bold, AlignLeft, AlignCenter, AlignRight, ChevronUp, ChevronDown, EyeOff, Check } from "lucide-react"
import { RgbaColorPicker, type RgbaColor } from "react-colorful"
import { FontPicker } from "./font-picker"
import type { TextStyle } from "@/types/moodboard"
import { cn } from "@/lib/utils"

interface TextControlsProps {
  style: TextStyle
  onChange: (style: TextStyle) => void
}

export function TextControls({ style, onChange }: TextControlsProps) {
  const [fontSize, setFontSize] = useState(style.fontSize || 16)
  const [activeTab, setActiveTab] = useState("text")

  // Color state with alpha
  const [textColor, setTextColor] = useState<RgbaColor>(() => hexToRgba(style.color || "#000000"))
  const [bgColor, setBgColor] = useState<RgbaColor>(() => hexToRgba(style.backgroundColor || "#ffffff"))

  // Input state
  const [textHexInput, setTextHexInput] = useState(rgbaToHex(textColor))
  const [bgHexInput, setBgHexInput] = useState(rgbaToHex(bgColor))

  // Toggle state for transparent background
  const [isTransparent, setIsTransparent] = useState(bgColor.a === 0)

  // Sync fontSize with props
  useEffect(() => {
    setFontSize(style.fontSize || 16)
  }, [style.fontSize])

  // Sync colors with props
  useEffect(() => {
    const newColor = hexToRgba(style.color || "#000000")
    setTextColor(newColor)
    setTextHexInput(rgbaToHex(newColor))
  }, [style.color])

  useEffect(() => {
    const newColor = hexToRgba(style.backgroundColor || "#ffffff")
    setBgColor(newColor)
    setBgHexInput(rgbaToHex(newColor))
    setIsTransparent(newColor.a === 0)
  }, [style.backgroundColor])

  // Calculate and store both tab heights to ensure consistent container size
  const textTabRef = useRef<HTMLDivElement>(null)
  const colorsTabRef = useRef<HTMLDivElement>(null)
  const [maxTabHeight, setMaxTabHeight] = useState<number | null>(null)

  // Update max height when tabs change or component mounts
  useEffect(() => {
    const updateMaxHeight = () => {
      const textHeight = textTabRef.current?.scrollHeight || 0
      const colorsHeight = colorsTabRef.current?.scrollHeight || 0
      const newMaxHeight = Math.max(textHeight, colorsHeight)

      if (newMaxHeight > 0 && newMaxHeight !== maxTabHeight) {
        setMaxTabHeight(newMaxHeight)
      }
    }

    // Run once on mount and when tab content might change
    updateMaxHeight()

    // Also set up a resize observer to handle dynamic content changes
    const resizeObserver = new ResizeObserver(updateMaxHeight)

    if (textTabRef.current) {
      resizeObserver.observe(textTabRef.current)
    }

    if (colorsTabRef.current) {
      resizeObserver.observe(colorsTabRef.current)
    }

    return () => {
      resizeObserver.disconnect()
    }
  }, [activeTab, maxTabHeight])

  const handleFontSizeChange = (value: number) => {
    // Ensure font size is within bounds
    const newSize = Math.min(Math.max(value, 8), 72)
    setFontSize(newSize)
    onChange({ ...style, fontSize: newSize })
  }

  const incrementFontSize = () => {
    handleFontSizeChange(fontSize + 1)
  }

  const decrementFontSize = () => {
    handleFontSizeChange(fontSize - 1)
  }

  // Handle text color change
  const handleTextColorChange = (color: RgbaColor) => {
    setTextColor(color)
    setTextHexInput(rgbaToHex(color))
    onChange({ ...style, color: rgbaToHex(color) })
  }

  // Handle background color change
  const handleBgColorChange = (color: RgbaColor) => {
    setBgColor(color)
    setBgHexInput(rgbaToHex(color))
    setIsTransparent(color.a === 0)
    onChange({ ...style, backgroundColor: rgbaToHex(color) })
  }

  // Handle hex input for text color
  const handleTextHexInputChange = (hex: string) => {
    setTextHexInput(hex)
  }

  // Handle hex input for background color
  const handleBgHexInputChange = (hex: string) => {
    setBgHexInput(hex)
  }

  // Apply text hex input
  const applyTextHexInput = () => {
    if (/^#([A-Fa-f0-9]{3,4}|[A-Fa-f0-9]{6}|[A-Fa-f0-9]{8})$/.test(textHexInput)) {
      const rgbaColor = hexToRgba(textHexInput)
      setTextColor(rgbaColor)
      onChange({ ...style, color: textHexInput })
    } else {
      // Reset to current color if invalid
      setTextHexInput(rgbaToHex(textColor))
    }
  }

  // Apply background hex input
  const applyBgHexInput = () => {
    if (/^#([A-Fa-f0-9]{3,4}|[A-Fa-f0-9]{6}|[A-Fa-f0-9]{8})$/.test(bgHexInput)) {
      const rgbaColor = hexToRgba(bgHexInput)
      setBgColor(rgbaColor)
      setIsTransparent(rgbaColor.a === 0)
      onChange({ ...style, backgroundColor: bgHexInput })
    } else {
      // Reset to current color if invalid
      setBgHexInput(rgbaToHex(bgColor))
    }
  }

  // Toggle transparency
  const toggleTransparency = () => {
    if (isTransparent) {
      // If currently transparent, set to fully opaque
      const newColor = { ...bgColor, a: 1 }
      setBgColor(newColor)
      setBgHexInput(rgbaToHex(newColor))
      onChange({ ...style, backgroundColor: rgbaToHex(newColor) })
    } else {
      // If currently opaque, set to fully transparent
      const newColor = { ...bgColor, a: 0 }
      setBgColor(newColor)
      setBgHexInput(rgbaToHex(newColor))
      onChange({ ...style, backgroundColor: rgbaToHex(newColor) })
    }
    setIsTransparent(!isTransparent)
  }

  const [confirmedFont, setConfirmedFont] = useState(style.fontFamily)

  const handleFontChange = (font: string) => {
    setConfirmedFont(font)
    onChange({
      ...style,
      fontFamily: font,
    })
  }

  return (
    <div className="w-full transition-all duration-300 ease-in-out">
      <Tabs defaultValue="text" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger value="text" className="transition-all duration-200">
            Text
          </TabsTrigger>
          <TabsTrigger value="colors" className="transition-all duration-200">
            Colors
          </TabsTrigger>
        </TabsList>

        <div className="overflow-y-auto overflow-x-hidden" style={{ maxHeight: "450px" }}>
          <TabsContent
            value="text"
            className="space-y-4 transition-opacity duration-300 ease-in-out"
            style={{ margin: 0 }}
          >
            <div ref={textTabRef}>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Font Size</Label>
                  <div className="flex items-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 transition-all duration-150"
                      onClick={decrementFontSize}
                    >
                      <ChevronDown className="h-3 w-3" />
                    </Button>
                    <span className="w-8 text-center">{fontSize}</span>
                    <span className="text-xs text-muted-foreground mr-1">px</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 transition-all duration-150"
                      onClick={incrementFontSize}
                    >
                      <ChevronUp className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="space-y-2 mt-4">
  <Label className="text-sm font-medium">Font Family</Label>
  <FontPicker value={style.fontFamily} onChange={handleFontChange} />
  {confirmedFont ? (
    <div className="mt-2 p-2 rounded-md bg-muted/10">
      <p className="text-sm text-muted-foreground">
        <span className="opacity-70">Selected font:</span>{" "}
        <span 
          className="text-base mt-1" 
          style={{ fontFamily: confirmedFont }}
        >
          {confirmedFont}
        </span>
      </p>
    </div>
  ) : (
    <p className="text-sm text-muted-foreground mt-1.5">
      No font selected
    </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Style</Label>
                  <ToggleGroup type="single" variant="outline" className="justify-start">
                    <ToggleGroupItem
                      value="bold"
                      aria-label="Toggle bold"
                      data-state={style.fontWeight === "bold" ? "on" : "off"}
                      onClick={() =>
                        onChange({
                          ...style,
                          fontWeight: style.fontWeight === "bold" ? "normal" : "bold",
                        })
                      }
                      className="transition-all duration-150"
                    >
                      <Bold className="h-4 w-4" />
                    </ToggleGroupItem>
                  </ToggleGroup>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Alignment</Label>
                  <ToggleGroup
                    type="single"
                    variant="outline"
                    className="justify-start"
                    value={style.textAlign || "left"}
                    onValueChange={(value: any) => onChange({ ...style, textAlign: value })}
                  >
                    <ToggleGroupItem value="left" aria-label="Align left" className="transition-all duration-150">
                      <AlignLeft className="h-4 w-4" />
                    </ToggleGroupItem>
                    <ToggleGroupItem value="center" aria-label="Align center" className="transition-all duration-150">
                      <AlignCenter className="h-4 w-4" />
                    </ToggleGroupItem>
                    <ToggleGroupItem value="right" aria-label="Align right" className="transition-all duration-150">
                      <AlignRight className="h-4 w-4" />
                    </ToggleGroupItem>
                  </ToggleGroup>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent
            value="colors"
            className="space-y-6 transition-opacity duration-300 ease-in-out"
            style={{ margin: 0 }}
          >
            <div ref={colorsTabRef}>
              {/* Text Color Selector */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Text Color</Label>
                  <div
                    className="w-5 h-5 rounded-full border shadow-sm transition-all duration-200"
                    style={{
                      backgroundColor: `rgba(${textColor.r}, ${textColor.g}, ${textColor.b}, ${textColor.a})`,
                      backgroundImage:
                        textColor.a < 1
                          ? 'url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAMUlEQVQ4T2NkYGAQYcAP3uCTZhw1gGGYhAGBZIA/nYDCgBDAm9BGDWAAJyRCgLaBCAAgXwixzAS0pgAAAABJRU5ErkJggg==")'
                          : "none",
                      backgroundPosition: "0 0",
                      backgroundSize: "8px 8px",
                    }}
                  />
                </div>

                <div className="p-3 rounded-md bg-muted/30 border">
                  <div className="flex justify-center">
                    <RgbaColorPicker
                      color={textColor}
                      onChange={handleTextColorChange}
                      style={{ width: "100%", height: "150px" }}
                    />
                  </div>

                  <div className="mt-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <Label className="text-xs w-16">Hex</Label>
                      <div className="flex-1 flex gap-1">
                        <Input
                          value={textHexInput}
                          onChange={(e) => handleTextHexInputChange(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault()
                              applyTextHexInput()
                            }
                          }}
                          className="h-7 font-mono text-xs flex-1"
                          spellCheck={false}
                        />
                        <Button size="sm" variant="secondary" className="h-7 px-2" onClick={applyTextHexInput}>
                          <Check className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Label className="text-xs w-16">Opacity</Label>
                      <div className="flex-1 flex items-center gap-2">
                        <Slider
                          value={[textColor.a * 100]}
                          min={0}
                          max={100}
                          step={1}
                          onValueChange={(value) => {
                            const newColor = { ...textColor, a: value[0] / 100 }
                            handleTextColorChange(newColor)
                          }}
                          className="flex-1"
                        />
                        <span className="text-xs w-8 text-right">{Math.round(textColor.a * 100)}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Background Color Selector */}
              <div className="space-y-3 mt-6">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Background Color</Label>
                  <div
                    className="w-5 h-5 rounded-full border shadow-sm transition-all duration-200"
                    style={{
                      backgroundColor: `rgba(${bgColor.r}, ${bgColor.g}, ${bgColor.b}, ${bgColor.a})`,
                      backgroundImage:
                        bgColor.a < 1
                          ? 'url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAMUlEQVQ4T2NkYGAQYcAP3uCTZhw1gGGYhAGBZIA/nYDCgBDAm9BGDWAAJyRCgLaBCAAgXwixzAS0pgAAAABJRU5ErkJggg==")'
                          : "none",
                      backgroundPosition: "0 0",
                      backgroundSize: "8px 8px",
                    }}
                  />
                </div>

                <div className="p-3 rounded-md bg-muted/30 border">
                  <div className="flex justify-center">
                    <RgbaColorPicker
                      color={bgColor}
                      onChange={handleBgColorChange}
                      style={{ width: "100%", height: "150px" }}
                    />
                  </div>

                  <div className="mt-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <Label className="text-xs w-16">Hex</Label>
                      <div className="flex-1 flex gap-1">
                        <Input
                          value={bgHexInput}
                          onChange={(e) => handleBgHexInputChange(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault()
                              applyBgHexInput()
                            }
                          }}
                          className="h-7 font-mono text-xs flex-1"
                          spellCheck={false}
                        />
                        <Button size="sm" variant="secondary" className="h-7 px-2" onClick={applyBgHexInput}>
                          <Check className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Label className="text-xs w-16">Opacity</Label>
                      <div className="flex-1 flex items-center gap-2">
                        <Slider
                          value={[bgColor.a * 100]}
                          min={0}
                          max={100}
                          step={1}
                          onValueChange={(value) => {
                            const newColor = { ...bgColor, a: value[0] / 100 }
                            handleBgColorChange(newColor)
                            setIsTransparent(value[0] === 0)
                          }}
                          className="flex-1"
                        />
                        <span className="text-xs w-8 text-right">{Math.round(bgColor.a * 100)}%</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mt-1">
                      <Button
                        variant={isTransparent ? "secondary" : "outline"}
                        size="sm"
                        className={cn(
                          "h-7 text-xs w-full transition-all duration-200",
                          isTransparent && "bg-secondary/50",
                        )}
                        onClick={toggleTransparency}
                      >
                        <EyeOff className="h-3 w-3 mr-1" />
                        Transparent
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}

// Helper functions for color conversion
function hexToRgba(hex: string): RgbaColor {
  // Default values
  let r = 0,
    g = 0,
    b = 0,
    a = 1

  // Remove # if present
  hex = hex.replace("#", "")

  // Handle different hex formats
  if (hex.length === 3) {
    r = Number.parseInt(hex[0] + hex[0], 16)
    g = Number.parseInt(hex[1] + hex[1], 16)
    b = Number.parseInt(hex[2] + hex[2], 16)
  } else if (hex.length === 4) {
    r = Number.parseInt(hex[0] + hex[0], 16)
    g = Number.parseInt(hex[1] + hex[1], 16)
    b = Number.parseInt(hex[2] + hex[2], 16)
    a = Number.parseInt(hex[3] + hex[3], 16) / 255
  } else if (hex.length === 6) {
    r = Number.parseInt(hex.substring(0, 2), 16)
    g = Number.parseInt(hex.substring(2, 4), 16)
    b = Number.parseInt(hex.substring(4, 6), 16)
  } else if (hex.length === 8) {
    r = Number.parseInt(hex.substring(0, 2), 16)
    g = Number.parseInt(hex.substring(2, 4), 16)
    b = Number.parseInt(hex.substring(4, 6), 16)
    a = Number.parseInt(hex.substring(6, 8), 16) / 255
  }

  // Handle parsing errors
  if (isNaN(r) || isNaN(g) || isNaN(b) || isNaN(a)) {
    return { r: 0, g: 0, b: 0, a: 1 }
  }

  return { r, g, b, a }
}

function rgbaToHex(rgba: RgbaColor): string {
  const r = Math.round(rgba.r).toString(16).padStart(2, "0")
  const g = Math.round(rgba.g).toString(16).padStart(2, "0")
  const b = Math.round(rgba.b).toString(16).padStart(2, "0")

  if (rgba.a < 1) {
    const a = Math.round(rgba.a * 255)
      .toString(16)
      .padStart(2, "0")
    return `#${r}${g}${b}${a}`
  }

  return `#${r}${g}${b}`
}

