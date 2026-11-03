"use client"

import { createBrowserClient } from "@supabase/ssr"
import type { SupabaseClient } from "@supabase/supabase-js"

import type { Database } from "@/lib/database.types"
import { getSupabasePublicEnv } from "@/lib/supabase/env"

let browserClient: SupabaseClient<Database> | undefined

export function createBrowserSupabaseClient() {
  if (!browserClient) {
    const { url, publishableKey } = getSupabasePublicEnv()
    browserClient = createBrowserClient<Database>(url, publishableKey)
  }

  return browserClient
}
