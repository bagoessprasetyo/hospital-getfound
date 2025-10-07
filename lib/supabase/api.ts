import { createServerClient } from '@supabase/ssr'
import { NextRequest } from 'next/server'

export function createClient(request?: NextRequest) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          if (request) {
            // Get cookies from request headers in API routes
            const cookieHeader = request.headers.get('cookie')
            if (!cookieHeader) return []
            
            return cookieHeader.split(';').map(cookie => {
              const [name, value] = cookie.trim().split('=')
              return { name, value }
            })
          }
          return []
        },
        setAll(cookiesToSet) {
          // In API routes, we can't set cookies directly
          // This would need to be handled in the response
        },
      },
    }
  )
}

// Alternative client for API routes that uses service role key for admin operations
export function createAdminClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() {
          return []
        },
        setAll() {
          // No-op for admin client
        },
      },
    }
  )
}