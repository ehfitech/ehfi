import { NextResponse, type NextRequest } from "next/server"

import {
  getRegistrationDraftFromCookie,
  removeDraftPdf,
  uploadDraftPdf,
} from "@/lib/registration-drafts/repository"
import type { DraftFileReference } from "@/lib/registration-drafts/types"

const allowedKinds = new Set<DraftFileReference["kind"]>([
  "diploma",
  "transcript",
  "completion_declaration",
  "cref-card",
  "cref-request",
])

function sameOrigin(request: NextRequest) {
  const origin = request.headers.get("origin")
  return origin !== null && origin === new URL(request.url).origin
}

function jsonError(message: string, status: number) {
  return NextResponse.json({ ok: false, error: message }, { status })
}

export async function POST(request: NextRequest) {
  if (!sameOrigin(request)) return jsonError("Solicitação inválida.", 403)
  if (Number(request.headers.get("content-length") ?? 0) > 11 * 1024 * 1024) {
    return jsonError("O arquivo excede o limite de 10 MB.", 413)
  }

  try {
    const current = await getRegistrationDraftFromCookie("professional")
    if (!current) return jsonError("Inicie o cadastro antes do envio.", 409)
    const formData = await request.formData()
    const file = formData.get("file")
    const kind = formData.get("kind")
    if (!(file instanceof File) || typeof kind !== "string" || !allowedKinds.has(kind as DraftFileReference["kind"])) {
      return jsonError("Arquivo ou categoria inválida.", 400)
    }
    const reference = await uploadDraftPdf(
      current.token,
      file,
      kind as DraftFileReference["kind"]
    )
    if (!reference) return jsonError("Rascunho indisponível.", 410)
    return NextResponse.json({ ok: true, file: reference })
  } catch {
    return jsonError("Não foi possível enviar o PDF.", 400)
  }
}

export async function DELETE(request: NextRequest) {
  if (!sameOrigin(request)) return jsonError("Solicitação inválida.", 403)
  try {
    const current = await getRegistrationDraftFromCookie("professional")
    if (!current) return NextResponse.json({ ok: true })
    const body: unknown = await request.json()
    if (
      typeof body !== "object" ||
      body === null ||
      Array.isArray(body) ||
      typeof (body as Record<string, unknown>).path !== "string"
    ) {
      return jsonError("Arquivo inválido.", 400)
    }
    const removed = await removeDraftPdf(
      current.token,
      (body as Record<string, string>).path
    )
    if (!removed) return jsonError("Arquivo não encontrado.", 404)
    return NextResponse.json({ ok: true })
  } catch {
    return jsonError("Não foi possível remover o PDF.", 400)
  }
}
