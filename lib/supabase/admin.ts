import "server-only"

import { createClient } from "@supabase/supabase-js"

import type { Database } from "@/lib/database.types"
import { getSupabasePublicEnv } from "@/lib/supabase/env"

export function createAdminSupabaseClient() {
  const { url } = getSupabasePublicEnv()
  const secretKey = process.env.SUPABASE_SECRET_KEY
  if (!secretKey) {
    throw new Error("Configure SUPABASE_SECRET_KEY for server-only operations.")
  }

  return createClient<Database>(url, secretKey, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
  })
}
