import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ SUPABASE ENV VARS MISSING')
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl || 'MISSING')
  console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseKey ? 'SET' : 'MISSING')
}

export const supabase = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey)
  : null

// User ID dummy (sin auth) - también exportado desde @/lib/auth/constants
export const DUMMY_USER_ID = '00000000-0000-0000-0000-000000000000'

