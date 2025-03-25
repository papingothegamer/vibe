import { useEffect, useRef } from 'react'
import type { MoodboardType, ItemType } from '@/types/moodboard'

export function useCanvas(moodboard: MoodboardType) {
  const contextRef = useRef<CanvasRenderingContext2D | null>(null)

  useEffect(() => {
    if (!contextRef.current) return

    const ctx = contextRef.current
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)

    // Draw background
    ctx.fillStyle = moodboard.background_color
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)

    // Draw items
    moodboard.items.forEach(item => {
      if (item.type === 'image') {
        // Draw image items
        const img = new Image()
        img.src = item.src
        img.onload = () => {
          ctx.drawImage(
            img,
            item.position.x,
            item.position.y,
            item.size.width,
            item.size.height
          )
        }
      } else {
        // Draw text items
        ctx.font = `${item.style?.fontSize}px sans-serif`
        ctx.fillStyle = item.style?.color || '#000'
        ctx.fillText(
          item.content,
          item.position.x,
          item.position.y
        )
      }
    })
  }, [moodboard])

  return contextRef
}