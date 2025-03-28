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
}

export interface MoodboardItem {
  id: string
  type: "image" | "text"
  content?: string
  src?: string
  position: Position
  size: Size
  zIndex: number
  style?: TextStyle
  rotation?: number
}

export interface Moodboard {
  id: string
  user_id: string
  title: string
  background_color: string
  items: MoodboardItem[]
  created_at: string
  updated_at: string
  is_saved?: boolean
}

// For Supabase typing, we need to define the Database interface
export type Database = {
  public: {
    Tables: {
      moodboards: {
        Row: Moodboard
        Insert: Omit<Moodboard, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Moodboard, 'id' | 'created_at' | 'user_id'>>
      }
      profiles: {
        Row: {
          id: string
          full_name: string | null
          avatar_url: string | null
          updated_at: string | null
        }
        Insert: {
          id: string
          full_name?: string | null
          avatar_url?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          full_name?: string | null
          avatar_url?: string | null
          updated_at?: string | null
        }
      }
    }
  }
}

