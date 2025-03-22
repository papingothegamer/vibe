import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { SupabaseClient } from "@supabase/auth-helpers-nextjs"
import { env } from "@/lib/env"

// Create a singleton instance
let supabaseInstance: SupabaseClient | null = null

export function getSupabaseClient() {
  if (!supabaseInstance) {
    supabaseInstance = createClientComponentClient({
      supabaseUrl: env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseKey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    })
  }
  return supabaseInstance
}

