export interface Position {
  x: number
  y: number
}

export interface Size {
  width: number
  height: number
}

export interface TextStyle {
  fontSize: number
  fontWeight: string
  color: string
  backgroundColor: string
  textAlign?: "left" | "center" | "right"
}

export interface BaseItem {
  id: string
  type: string
  position: Position
  size: Size
  zIndex: number
}

export interface ImageItem extends BaseItem {
  type: "image"
  src: string
  colors: string[]
}

export interface TextItem extends BaseItem {
  type: "text"
  content: string
  style: TextStyle
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
}
export interface MoodboardItem {
  id: string
  type: 'image' | 'text'
  content?: string
  src?: string
  position: {
    x: number
    y: number
  }
  size: {
    width: number
    height: number
  }
  zIndex: number
  style: {
    fontSize?: number
    fontWeight?: 'normal' | 'bold'
    color?: string
    backgroundColor?: string
    textAlign?: 'left' | 'center' | 'right'
  }
}

export interface Moodboard {
  id: string
  title: string
  background_color: string
  items: MoodboardItem[]
}
