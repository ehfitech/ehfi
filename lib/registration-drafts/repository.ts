import "server-only"

import { cookies } from "next/headers"
import { createHash } from "node:crypto"

import type { Json } from "@/lib/database.types"
import { createAdminSupabaseClient } from "@/lib/supabase/admin"
import {
  HEALTH_DATA_CONSENT_VERSION,
  PROFESSIONAL_PDF_MAX_BYTES,
  REGISTRATION_DRAFT_TTL_DAYS,
  type DraftFileReference,
  type FinalFileReference,
  type RegistrationDraft,
} from "@/lib/registration-drafts/types"
import type { RegistrationRole } from "@/lib/registration-drafts/types"
import {
  getDraftCookieName,
  hashDraftToken,
  createDraftToken,
} from "@/lib/registration-drafts/token"
import {
  removeStudentHealthData,
  sanitizeRegistrationPayload,
} from "@/lib/registration-drafts/sanitize"

const bucket = "professional-documents"

function expirationDate() {
  const date = new Date()
  date.setUTCDate(date.getUTCDate() + REGISTRATION_DRAFT_TTL_DAYS)
  return date.toISOString()
}

async function setDraftCookie(role: RegistrationRole, token: string) {
  const cookieStore = await cookies()
  cookieStore.set(getDraftCookieName(role), token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: REGISTRATION_DRAFT_TTL_DAYS * 24 * 60 * 60,
  })
}

function asFileReferences(value: Json): DraftFileReference[] {
  if (!Array.isArray(value)) return []
  return value.filter(
    (item): item is DraftFileReference =>
      typeof item === "object" &&
      item !== null &&
      !Array.isArray(item) &&
      typeof item.path === "string" &&
      typeof item.originalName === "string" &&
      typeof item.size === "number" &&
      typeof item.kind === "string"
  )
}

function asFinalReferences(value: Json): (FinalFileReference & { sourcePath: string })[] {
  if (!Array.isArray(value)) return []
  return value.filter(
    (item): item is FinalFileReference & { sourcePath: string } =>
      typeof item === "object" &&
      item !== null &&
      !Array.isArray(item) &&
      typeof item.path === "string" &&
      typeof item.sourcePath === "string" &&
      typeof item.originalName === "string" &&
      typeof item.size === "number" &&
      typeof item.kind === "string"
  )
}

export async function readRegistrationDraft(
  role: RegistrationRole,
  token: string
): Promise<RegistrationDraft | null> {
  const admin = createAdminSupabaseClient()
  const { data, error } = await admin
    .from("registration_drafts")
    .select("*")
    .eq("role", role)
    .eq("token_hash", hashDraftToken(token))
    .gt("expires_at", new Date().toISOString())
    .maybeSingle()

  if (error) throw new Error("Não foi possível carregar o rascunho.")
  return data
}

export async function createRegistrationDraft(role: RegistrationRole) {
  const token = createDraftToken()
  const admin = createAdminSupabaseClient()
  const { data, error } = await admin
    .from("registration_drafts")
    .insert({
      role,
      token_hash: hashDraftToken(token),
      expires_at: expirationDate(),
    })
    .select("*")
    .single()

  if (error) throw new Error("Não foi possível iniciar o rascunho.")

  await setDraftCookie(role, token)
  return { draft: data, token }
}

export async function getRegistrationDraftFromCookie(role: RegistrationRole) {
  const cookieStore = await cookies()
  const token = cookieStore.get(getDraftCookieName(role))?.value
  if (!token) return null
  const draft = await readRegistrationDraft(role, token)
  if (draft) await setDraftCookie(role, token)
  return draft ? { draft, token } : null
}

export async function saveRegistrationDraft(
  role: RegistrationRole,
  token: string,
  payload: unknown
) {
  const admin = createAdminSupabaseClient()

  // Consent can be withdrawn while an autosave request is in flight. Match the
  // consent state observed during sanitization so a stale request cannot write
  // health data back after revocation. Retry against the latest state instead.
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const draft = await readRegistrationDraft(role, token)
    if (!draft) return null
    const consentRecorded =
      role === "student" &&
      draft.health_data_consent_version === HEALTH_DATA_CONSENT_VERSION
    const sanitized = sanitizeRegistrationPayload(role, payload, consentRecorded)
    let update = admin
      .from("registration_drafts")
      .update({
        payload: sanitized,
        updated_at: new Date().toISOString(),
        expires_at: expirationDate(),
      })
      .eq("id", draft.id)

    if (role === "student") {
      update = consentRecorded
        ? update.eq("health_data_consent_version", HEALTH_DATA_CONSENT_VERSION)
        : update.is("health_data_consent_version", null)
    }

    const { data, error } = await update.select("*").maybeSingle()
    if (error) throw new Error("Não foi possível salvar o rascunho.")
    if (!data) continue

    await setDraftCookie(role, token)
    return data
  }

  return null
}

export async function saveHealthDataConsent(
  token: string,
  accepted: boolean,
  version: string
) {
  if (version !== HEALTH_DATA_CONSENT_VERSION) {
    throw new Error("A versão do aviso de saúde não é válida.")
  }
  const draft = await readRegistrationDraft("student", token)
  if (!draft) return null

  const admin = createAdminSupabaseClient()
  const payload = accepted
    ? draft.payload
    : removeStudentHealthData(draft.payload)
  const { data, error } = await admin
    .from("registration_drafts")
    .update({
      payload,
      health_data_consent_version: accepted ? version : null,
      health_data_consent_at: accepted ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
      expires_at: expirationDate(),
    })
    .eq("id", draft.id)
    .select("*")
    .single()

  if (error) throw new Error("Não foi possível registrar a autorização.")
  await setDraftCookie("student", token)
  return data
}

export async function deleteRegistrationDraft(
  role: RegistrationRole,
  token: string
) {
  const draft = await readRegistrationDraft(role, token)
  if (!draft) return
  const admin = createAdminSupabaseClient()
  const temporaryPaths = asFileReferences(draft.files)
    .map((file) => file.path)
    .filter((path) => path.startsWith("drafts/" + draft.id + "/"))
  if (temporaryPaths.length > 0) {
    await admin.storage.from(bucket).remove(temporaryPaths)
  }

  {
    const staged = asFinalReferences(draft.staged_files)
    const userId = staged[0]?.path.split("/")[0]
    if (userId) {
      const profile = await admin
        .from("professional_profiles")
        .select("documents")
        .eq("user_id", userId)
        .maybeSingle()
      const committed = Array.isArray(profile.data?.documents)
        ? new Set(
            profile.data.documents.flatMap((item) =>
              typeof item === "object" &&
              item !== null &&
              !Array.isArray(item) &&
              typeof item.path === "string"
                ? [item.path]
                : []
            )
          )
        : new Set<string>()
      const uncommittedPaths = staged
        .map((file) => file.path)
        .filter((path) => !committed.has(path))
      if (uncommittedPaths.length > 0) {
        await admin.storage.from(bucket).remove(uncommittedPaths)
      }
    }
  }

  await admin.from("registration_drafts").delete().eq("id", draft.id)
  const cookieStore = await cookies()
  cookieStore.set(getDraftCookieName(role), "", { path: "/", maxAge: 0 })
}

export async function uploadDraftPdf(
  token: string,
  file: File,
  kind: DraftFileReference["kind"]
) {
  if (
    file.size < 1 ||
    file.size > PROFESSIONAL_PDF_MAX_BYTES ||
    file.type !== "application/pdf"
  ) {
    throw new Error("Envie um PDF com até 10 MB.")
  }
  const bytes = new Uint8Array(await file.arrayBuffer())
  if (new TextDecoder().decode(bytes.slice(0, 5)) !== "%PDF-") {
    throw new Error("O arquivo enviado não é um PDF válido.")
  }

  const draft = await readRegistrationDraft("professional", token)
  if (!draft) return null
  const id = crypto.randomUUID().replaceAll("-", "")
  const path = "drafts/" + draft.id + "/" + id + ".pdf"
  const admin = createAdminSupabaseClient()
  const { error: uploadError } = await admin.storage
    .from(bucket)
    .upload(path, bytes, { contentType: "application/pdf", upsert: false })
  if (uploadError) throw new Error("Não foi possível enviar o documento.")

  const prior = asFileReferences(draft.files).filter((item) => item.kind !== kind)
  const removed = asFileReferences(draft.files).filter((item) => item.kind === kind)
  const priorStaged = asFinalReferences(draft.staged_files).filter(
    (item) => item.kind !== kind
  )
  const replacedStaged = asFinalReferences(draft.staged_files).filter(
    (item) => item.kind === kind
  )
  const reference: DraftFileReference = {
    path,
    originalName: file.name.replace(/[\\\\/]/g, "_").slice(0, 180),
    size: file.size,
    kind,
  }
  const { error: updateError } = await admin
    .from("registration_drafts")
    .update({
      files: [...prior, reference] as unknown as Json,
      staged_files: priorStaged as unknown as Json,
      updated_at: new Date().toISOString(),
      expires_at: expirationDate(),
    })
    .eq("id", draft.id)
  if (updateError) {
    await admin.storage.from(bucket).remove([path])
    throw new Error("Não foi possível salvar a referência do documento.")
  }
  await setDraftCookie("professional", token)
  const oldPaths = removed
    .map((item) => item.path)
    .filter((oldPath) => oldPath.startsWith("drafts/" + draft.id + "/"))
  if (oldPaths.length > 0) await admin.storage.from(bucket).remove(oldPaths)
  if (replacedStaged.length > 0) {
    const userId = replacedStaged[0].path.split("/")[0]
    const profile = await admin
      .from("professional_profiles")
      .select("documents")
      .eq("user_id", userId)
      .maybeSingle()
    const committed = Array.isArray(profile.data?.documents)
      ? new Set(
          profile.data.documents.flatMap((item) =>
            typeof item === "object" &&
            item !== null &&
            !Array.isArray(item) &&
            typeof item.path === "string"
              ? [item.path]
              : []
          )
        )
      : new Set<string>()
    const uncommitted = replacedStaged
      .map((item) => item.path)
      .filter((oldPath) => !committed.has(oldPath))
    if (uncommitted.length > 0) {
      await admin.storage.from(bucket).remove(uncommitted)
    }
  }
  return reference
}

export async function removeDraftPdf(token: string, path: string) {
  const draft = await readRegistrationDraft("professional", token)
  if (!draft) return false
  const files = asFileReferences(draft.files)
  const staged = asFinalReferences(draft.staged_files)
  const existsInDraft = files.some((file) => file.path === path)
  const stagedFile = staged.find((file) => file.path === path)
  if (!existsInDraft && !stagedFile) return false

  const admin = createAdminSupabaseClient()
  if (existsInDraft && path.startsWith("drafts/" + draft.id + "/")) {
    await admin.storage.from(bucket).remove([path])
  }
  if (stagedFile && path.startsWith(stagedFile.path.split("/")[0] + "/" + draft.id + "/")) {
    const userId = stagedFile.path.split("/")[0]
    const profile = await admin
      .from("professional_profiles")
      .select("documents")
      .eq("user_id", userId)
      .maybeSingle()
    const committed = Array.isArray(profile.data?.documents)
      ? profile.data.documents.some(
          (item) =>
            typeof item === "object" &&
            item !== null &&
            !Array.isArray(item) &&
            item.path === path
        )
      : false
    if (!committed) await admin.storage.from(bucket).remove([path])
  }
  await admin
    .from("registration_drafts")
    .update({
      files: files.filter((file) => file.path !== path) as unknown as Json,
      staged_files: staged.filter((file) => file.path !== path) as unknown as Json,
      updated_at: new Date().toISOString(),
      expires_at: expirationDate(),
    })
    .eq("id", draft.id)
  await setDraftCookie("professional", token)
  return true
}

export async function stageDraftFilesForUser(
  token: string,
  userId: string,
  allowedSourcePaths?: string[]
): Promise<FinalFileReference[]> {
  const draft = await readRegistrationDraft("professional", token)
  if (!draft) throw new Error("O rascunho de documentos expirou.")
  const admin = createAdminSupabaseClient()
  const previousStaged = asFinalReferences(draft.staged_files)
  const allowed = new Set(
    allowedSourcePaths ?? asFileReferences(draft.files).map((file) => file.path)
  )
  const staged = asFinalReferences(draft.staged_files).filter((file) =>
    allowed.has(file.sourcePath)
  )
  const results: (FinalFileReference & { sourcePath: string })[] = [...staged]

  for (const file of asFileReferences(draft.files).filter((item) => allowed.has(item.path))) {
    const existing = results.find((item) => item.sourcePath === file.path)
    if (existing) continue
    const hash = createHash("sha256").update(file.path).digest("hex")
    const finalPath = userId + "/" + draft.id + "/" + hash + ".pdf"
    const { error } = await admin.storage.from(bucket).move(file.path, finalPath)
    if (error) {
      const { data: existingObject } = await admin.storage
        .from(bucket)
        .download(finalPath)
      if (!existingObject) throw new Error("Não foi possível preparar o documento.")
    }
    results.push({ ...file, path: finalPath, sourcePath: file.path })
  }

  const { error } = await admin
    .from("registration_drafts")
    .update({
      staged_files: results as unknown as Json,
      updated_at: new Date().toISOString(),
      expires_at: expirationDate(),
    })
    .eq("id", draft.id)
  if (error) throw new Error("Não foi possível registrar os documentos preparados.")
  const keptPaths = new Set(results.map((file) => file.path))
  const obsoletePaths = previousStaged
    .map((file) => file.path)
    .filter((path) => !keptPaths.has(path))
  if (obsoletePaths.length > 0) {
    const profile = await admin
      .from("professional_profiles")
      .select("documents")
      .eq("user_id", userId)
      .maybeSingle()
    const committed = Array.isArray(profile.data?.documents)
      ? new Set(
          profile.data.documents.flatMap((item) =>
            typeof item === "object" &&
            item !== null &&
            !Array.isArray(item) &&
            typeof item.path === "string"
              ? [item.path]
              : []
          )
        )
      : new Set<string>()
    const uncommitted = obsoletePaths.filter((path) => !committed.has(path))
    if (uncommitted.length > 0) {
      await admin.storage.from(bucket).remove(uncommitted)
    }
  }
  return results.map(({ path, originalName, size, kind }) => ({
    path,
    originalName,
    size,
    kind,
  }))
}

export async function cleanupExpiredRegistrationDrafts() {
  const admin = createAdminSupabaseClient()
  const { data: drafts, error } = await admin
    .from("registration_drafts")
    .select("*")
    .lte("expires_at", new Date().toISOString())
  if (error) throw new Error("Não foi possível localizar rascunhos expirados.")

  for (const draft of drafts ?? []) {
    const temporaryPaths = asFileReferences(draft.files)
      .map((file) => file.path)
      .filter((path) => path.startsWith("drafts/" + draft.id + "/"))
    if (temporaryPaths.length > 0) {
      await admin.storage.from(bucket).remove(temporaryPaths)
    }

    const staged = asFinalReferences(draft.staged_files)
    const userId = staged[0]?.path.split("/")[0]
    if (userId && staged.length > 0) {
      const profile = await admin
        .from("professional_profiles")
        .select("documents")
        .eq("user_id", userId)
        .maybeSingle()
      const committed = Array.isArray(profile.data?.documents)
        ? new Set(
            profile.data.documents.flatMap((item) =>
              typeof item === "object" &&
              item !== null &&
              !Array.isArray(item) &&
              typeof item.path === "string"
                ? [item.path]
                : []
            )
          )
        : new Set<string>()
      const uncommitted = staged
        .map((file) => file.path)
        .filter((path) => !committed.has(path))
      if (uncommitted.length > 0) {
        await admin.storage.from(bucket).remove(uncommitted)
      }
    }

    const { error: deleteError } = await admin
      .from("registration_drafts")
      .delete()
      .eq("id", draft.id)
    if (deleteError) throw new Error("Não foi possível remover um rascunho expirado.")
  }

  return drafts?.length ?? 0
}

export async function getDraftConsentVersion(token: string) {
  const draft = await readRegistrationDraft("student", token)
  return draft?.health_data_consent_version ?? null
}

export async function refreshDraftExpiry(role: RegistrationRole, token: string) {
  const draft = await readRegistrationDraft(role, token)
  if (!draft) return false
  const admin = createAdminSupabaseClient()
  const { error } = await admin
    .from("registration_drafts")
    .update({ updated_at: new Date().toISOString(), expires_at: expirationDate() })
    .eq("id", draft.id)
  return !error
}

export async function removeDraftHealthData(token: string) {
  const draft = await readRegistrationDraft("student", token)
  if (!draft) return false
  const admin = createAdminSupabaseClient()
  const { error } = await admin
    .from("registration_drafts")
    .update({
      payload: removeStudentHealthData(draft.payload),
      health_data_consent_version: null,
      health_data_consent_at: null,
      updated_at: new Date().toISOString(),
      expires_at: expirationDate(),
    })
    .eq("id", draft.id)
  return !error
}
