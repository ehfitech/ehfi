import { timingSafeEqual } from "node:crypto"
import { NextResponse, type NextRequest } from "next/server"

import { cleanupExpiredRegistrationDrafts } from "@/lib/registration-drafts/repository"

function hasValidCronSecret(request: NextRequest) {
  const expected = process.env.CRON_SECRET
  const authorization = request.headers.get("authorization")
  if (!expected || !authorization?.startsWith("Bearer ")) return false
  const provided = Buffer.from(authorization.slice(7))
  const expectedBuffer = Buffer.from(expected)
  return (
    provided.length === expectedBuffer.length &&
    timingSafeEqual(provided, expectedBuffer)
  )
}

export async function POST(request: NextRequest) {
  if (!hasValidCronSecret(request)) {
    return NextResponse.json({ ok: false }, { status: 401 })
  }

  try {
    const deleted = await cleanupExpiredRegistrationDrafts()
    return NextResponse.json({ ok: true, deleted })
  } catch {
    return NextResponse.json({ ok: false }, { status: 503 })
  }
}
