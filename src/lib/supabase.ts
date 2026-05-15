import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

function assertEnv(value: string | undefined, name: string): string {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }
  return value
}

/**
 * Creates a Supabase client that reads the user's auth cookie from the
 * incoming request. Use this for all user-facing API routes.
 */
export async function createServerClient(): Promise<SupabaseClient> {
  const url = assertEnv(SUPABASE_URL, 'NEXT_PUBLIC_SUPABASE_URL')
  const key = assertEnv(SUPABASE_ANON_KEY, 'NEXT_PUBLIC_SUPABASE_ANON_KEY')

  const cookieStore = await cookies()
  const authToken = cookieStore.get('sb-access-token')?.value

  return createClient(url, key, {
    global: {
      headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
    },
    auth: {
      persistSession: false,
    },
  })
}

/**
 * Creates a Supabase client using the service role key. Bypasses RLS.
 * Only use in admin-verified routes.
 */
export function createAdminClient(): SupabaseClient {
  const url = assertEnv(SUPABASE_URL, 'NEXT_PUBLIC_SUPABASE_URL')
  const key = assertEnv(SUPABASE_SERVICE_ROLE_KEY, 'SUPABASE_SERVICE_ROLE_KEY')

  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
}
