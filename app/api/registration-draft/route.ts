import { NextResponse, type NextRequest } from "next/server"

import {
  createRegistrationDraft,
  deleteRegistrationDraft,
  getRegistrationDraftFromCookie,
  saveHealthDataConsent,
  saveRegistrationDraft,
} from "@/lib/registration-drafts/repository"
import { isRegistrationRole } from "@/lib/registration-drafts/token"
import { HEALTH_DATA_CONSENT_VERSION } from "@/lib/registration-drafts/types"

const maxPayloadBytes = 1024 * 1024

function sameOrigin(request: NextRequest) {
  const origin = request.headers.get("origin")
  return origin !== null && origin === new URL(request.url).origin
}

function jsonError(message: string, status: number) {
  return NextResponse.json({ ok: false, error: message }, { status })
}

async function getOrCreateDraft(role: "student" | "professional" | "company") {
  const existing = await getRegistrationDraftFromCookie(role)
  if (existing) return existing
  return createRegistrationDraft(role)
}

export async function GET(request: NextRequest) {
  const role = request.nextUrl.searchParams.get("role")
  if (!isRegistrationRole(role)) return jsonError("Rascunho indisponível.", 400)

  try {
    const current = await getRegistrationDraftFromCookie(role)
    return NextResponse.json({
      ok: true,
      exists: Boolean(current),
      payload: current?.draft.payload ?? null,
      files: current?.draft.files ?? [],
      healthConsentVersion:
        role === "student"
          ? current?.draft.health_data_consent_version ?? null
          : null,
    })
  } catch {
    return jsonError("Não foi possível carregar seu rascunho.", 503)
  }
}

export async function POST(request: NextRequest) {
  if (!sameOrigin(request)) return jsonError("Solicitação inválida.", 403)
  const contentLength = Number(request.headers.get("content-length") ?? 0)
  if (contentLength > maxPayloadBytes) return jsonError("Rascunho muito grande.", 413)

  try {
    const rawBody = await request.text()
    if (new TextEncoder().encode(rawBody).byteLength > maxPayloadBytes) {
      return jsonError("Rascunho muito grande.", 413)
    }
    const body: unknown = JSON.parse(rawBody)
    if (typeof body !== "object" || body === null || Array.isArray(body)) {
      return jsonError("Solicitação inválida.", 400)
    }
    const input = body as Record<string, unknown>
    const role = input.role
    if (!isRegistrationRole(role)) return jsonError("Rascunho indisponível.", 400)

    if (input.mode === "ensure") {
      await getOrCreateDraft(role)
      return NextResponse.json({ ok: true })
    }

    if (input.mode === "health-consent") {
      if (
        role !== "student" ||
        typeof input.accepted !== "boolean" ||
        input.version !== HEALTH_DATA_CONSENT_VERSION
      ) {
        return jsonError("Autorização indisponível.", 400)
      }
      const draft = await getRegistrationDraftFromCookie(role)
      if (!draft) return jsonError("Rascunho indisponível.", 410)
      const saved = await saveHealthDataConsent(
        draft.token,
        input.accepted,
        HEALTH_DATA_CONSENT_VERSION
      )
      if (!saved) return jsonError("Não foi possível registrar a autorização.", 503)
      return NextResponse.json({
        ok: true,
        healthConsentVersion: saved.health_data_consent_version,
      })
    }

    if (!("payload" in input)) return jsonError("Solicitação inválida.", 400)
    const draft = await getRegistrationDraftFromCookie(role)
    if (!draft) return jsonError("Rascunho indisponível.", 410)
    const saved = await saveRegistrationDraft(role, draft.token, input.payload)
    if (!saved) return jsonError("Rascunho indisponível.", 410)
    return NextResponse.json({ ok: true, updatedAt: saved.updated_at })
  } catch {
    return jsonError("Não foi possível salvar seu rascunho.", 503)
  }
}

export async function DELETE(request: NextRequest) {
  if (!sameOrigin(request)) return jsonError("Solicitação inválida.", 403)
  const role = request.nextUrl.searchParams.get("role")
  if (!isRegistrationRole(role)) return jsonError("Rascunho indisponível.", 400)

  try {
    const current = await getRegistrationDraftFromCookie(role)
    if (current) await deleteRegistrationDraft(role, current.token)
    return NextResponse.json({ ok: true })
  } catch {
    return jsonError("Não foi possível remover o rascunho.", 503)
  }
}
