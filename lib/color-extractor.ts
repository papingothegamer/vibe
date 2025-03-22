export async function extractColors(file: File): Promise<string[]> {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const colors = getColorsFromImage(img)
        resolve(colors)
      }
      img.src = e.target?.result as string
    }
    reader.readAsDataURL(file)
  })
}

function getColorsFromImage(img: HTMLImageElement, numColors = 5): string[] {
  // Create a canvas element
  const canvas = document.createElement("canvas")
  const ctx = canvas.getContext("2d")
  if (!ctx) return ["#000000", "#ffffff", "#cccccc", "#999999", "#666666"]

  // Set canvas dimensions to image dimensions
  canvas.width = img.width
  canvas.height = img.height

  // Draw image on canvas
  ctx.drawImage(img, 0, 0, img.width, img.height)

  // Get image data
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const data = imageData.data

  // Sample pixels at regular intervals
  const pixelCount = data.length / 4
  const sampleInterval = Math.max(1, Math.floor(pixelCount / 1000))

  // Store colors and their frequency
  const colorMap: Record<string, number> = {}

  for (let i = 0; i < pixelCount; i += sampleInterval) {
    const offset = i * 4
    const r = data[offset]
    const g = data[offset + 1]
    const b = data[offset + 2]

    // Skip transparent pixels
    if (data[offset + 3] < 128) continue

    // Convert to hex
    const hex = rgbToHex(r, g, b)

    // Count frequency
    colorMap[hex] = (colorMap[hex] || 0) + 1
  }

  // Convert to array and sort by frequency
  const colorEntries = Object.entries(colorMap)
  colorEntries.sort((a, b) => b[1] - a[1])

  // Get the most frequent colors
  const dominantColors = colorEntries.slice(0, numColors).map((entry) => entry[0])

  // If we don't have enough colors, add some defaults
  while (dominantColors.length < numColors) {
    dominantColors.push("#000000")
  }

  return dominantColors
}

function rgbToHex(r: number, g: number, b: number): string {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)
}

