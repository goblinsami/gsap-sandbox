import { createClient } from '@supabase/supabase-js'

const rawSupabaseUrl = String(import.meta.env.VITE_SUPABASE_URL ?? '').trim()
const supabaseAnonKey = String(import.meta.env.VITE_SUPABASE_ANON_KEY ?? '').trim()
const supabaseUrl = rawSupabaseUrl
  .replace(/\/+$/, '')
  .replace(/\/rest\/v1$/i, '')

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    '[supabase] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Check your environment variables.'
  )
}

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
)
