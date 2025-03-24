export interface Position {
  x: number
  y: number
}

export interface Size {
  width: number
  height: number
}

export interface TextStyle {
  fontSize?: number
  fontWeight?: "normal" | "bold"
  color?: string
  backgroundColor?: string
  textAlign?: "left" | "center" | "right"
  fontFamily?: string
}

export interface BaseItem {
  id: string
  type: string
  position: Position
  size: Size
  zIndex: number
  rotation?: number
}

export interface ImageItem extends BaseItem {
  type: "image"
  src: string
  colors: string[]
  onDuplicate?: (item: ImageItem) => void
}

export interface TextItem extends BaseItem {
  type: "text"
  content: string
  style: TextStyle
  onDuplicate?: (item: TextItem) => void
}

export type ItemType = ImageItem | TextItem

export interface MoodboardType {
  id: string
  user_id: string
  title: string
  items: ItemType[]
  background_color: string
  created_at: string
  updated_at: string
  is_saved?: boolean
}

// For Supabase database types
export interface MoodboardItem {
  id: string
  type: 'image' | 'text'
  content?: string
  src?: string
  position: Position
  size: Size
  zIndex: number
  style?: {
    fontSize?: number
    fontWeight?: 'normal' | 'bold'
    color?: string
    backgroundColor?: string
    textAlign?: 'left' | 'center' | 'right'
  }
  rotation?: number
}

export interface Moodboard {
  id: string
  title: string
  background_color: string
  items: MoodboardItem[]
  is_saved?: boolean
}
