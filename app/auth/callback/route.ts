import { NextResponse, type NextRequest } from "next/server"

import { createServerSupabaseClient } from "@/lib/supabase/server"

function safeNextPath(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("\\")) {
    return "/"
  }
  const url = new URL(value, "https://ehfi.invalid")
  return url.origin === "https://ehfi.invalid"
    ? url.pathname + url.search + url.hash
    : "/"
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code")
  const next = safeNextPath(request.nextUrl.searchParams.get("next"))
  if (code) {
    const supabase = await createServerSupabaseClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
      const destination = siteUrl
        ? new URL(next, siteUrl)
        : new URL(next, request.url)
      return NextResponse.redirect(destination)
    }
  }
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
  const destination = siteUrl
    ? new URL("/auth/recuperar?erro=link", siteUrl)
    : new URL("/auth/recuperar?erro=link", request.url)
  return NextResponse.redirect(destination)
}
