import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'

// Singleton instance
let supabaseClient: SupabaseClient | null = null

export function createClient() {
  // Return existing instance if it exists
  if (supabaseClient) {
    return supabaseClient
  }

  // Create new instance only if it doesn't exist
  supabaseClient = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: 'pkce'
      }
    }
  )

  return supabaseClient
}

// Helper function to get the singleton instance
export function getSupabaseClient() {
  return createClient()
}