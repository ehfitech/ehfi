"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"

import type { Json } from "@/lib/database.types"
import { sanitizeRegistrationPayload } from "@/lib/registration-drafts/sanitize"
import type {
  DraftFileReference,
  RegistrationRole,
} from "@/lib/registration-drafts/types"
import { HEALTH_DATA_CONSENT_VERSION } from "@/lib/registration-drafts/types"

type DraftStatus = "disabled" | "loading" | "ready" | "saving" | "saved" | "error"

type DraftResponse = {
  ok?: boolean
  exists?: boolean
  payload?: Json | null
  files?: Json
  healthConsentVersion?: string | null
  error?: string
}

export function useRegistrationDraft<T>(
  role: RegistrationRole,
  payload: T,
  enabled = true
) {
  const [status, setStatus] = useState<DraftStatus>(enabled ? "loading" : "disabled")
  const [error, setError] = useState<string | null>(null)
  const [restoredPayload, setRestoredPayload] = useState<Partial<T> | null>(null)
  const [draftFiles, setDraftFiles] = useState<DraftFileReference[]>([])
  const [healthConsentVersion, setHealthConsentVersion] = useState<string | null>(null)
  const [revision, setRevision] = useState(0)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const sanitizedPayload = useMemo(
    () =>
      sanitizeRegistrationPayload(
        role,
        payload,
        healthConsentVersion === HEALTH_DATA_CONSENT_VERSION
      ),
    [healthConsentVersion, payload, role]
  )
  const payloadSnapshot = JSON.stringify(sanitizedPayload) ?? ""
  const lastSavedPayload = useRef(payloadSnapshot)
  const lastFailedPayload = useRef<string | null>(null)

  useEffect(() => {
    if (!enabled) {
      setStatus("disabled")
      return
    }

    let cancelled = false
    async function loadDraft() {
      setStatus("loading")
      setError(null)
      try {
        const response = await fetch(
          "/api/registration-draft?role=" + encodeURIComponent(role),
          { cache: "no-store" }
        )
        const result = (await response.json()) as DraftResponse
        if (!response.ok || result.ok !== true) {
          throw new Error(result.error ?? "Não foi possível carregar o rascunho.")
        }
        if (result.exists === false) {
          const ensureResponse = await fetch("/api/registration-draft", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ role, mode: "ensure" }),
          })
          const ensured = (await ensureResponse.json()) as DraftResponse
          if (!ensureResponse.ok || ensured.ok !== true) {
            throw new Error(ensured.error ?? "Não foi possível iniciar o rascunho.")
          }
        }
        if (cancelled) return
        if (result.payload && typeof result.payload === "object" && !Array.isArray(result.payload)) {
          setRestoredPayload(result.payload as Partial<T>)
        }
        if (Array.isArray(result.files)) {
          setDraftFiles(result.files.filter(
            (item): item is DraftFileReference =>
              typeof item === "object" &&
              item !== null &&
              !Array.isArray(item) &&
              typeof item.path === "string" &&
              typeof item.originalName === "string" &&
              typeof item.size === "number" &&
              typeof item.kind === "string"
          ))
        }
        setHealthConsentVersion(result.healthConsentVersion ?? null)
        setStatus("ready")
      } catch {
        if (!cancelled) {
          setError("Não foi possível preparar o salvamento automático.")
          setStatus("error")
        }
      }
    }
    void loadDraft()
    return () => {
      cancelled = true
    }
  }, [enabled, role])

  useEffect(() => {
    if (!enabled || !["ready", "saved", "error"].includes(status)) return
    if (lastSavedPayload.current === payloadSnapshot) return
    if (status === "error" && lastFailedPayload.current === payloadSnapshot) return
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(async () => {
      if (lastSavedPayload.current === payloadSnapshot) return
      setStatus("saving")
      setError(null)
      try {
        const response = await fetch("/api/registration-draft", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ role, payload: sanitizedPayload }),
        })
        const result = (await response.json()) as DraftResponse
        if (!response.ok || result.ok !== true) {
          throw new Error(result.error ?? "Não foi possível salvar o rascunho.")
        }
        lastSavedPayload.current = payloadSnapshot
        lastFailedPayload.current = null
        setStatus("saved")
      } catch {
        lastFailedPayload.current = payloadSnapshot
        setError("Não foi possível salvar agora. Seus dados continuam nesta tela.")
        setStatus("error")
      }
    }, 600)

    return () => {
      if (timer.current) clearTimeout(timer.current)
    }
  }, [enabled, payloadSnapshot, revision, role, sanitizedPayload, status])

  const recordHealthConsent = useCallback(async (accepted: boolean) => {
    const response = await fetch("/api/registration-draft", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        role: "student",
        mode: "health-consent",
        accepted,
        version: HEALTH_DATA_CONSENT_VERSION,
      }),
    })
    const result = (await response.json()) as DraftResponse
    if (!response.ok || result.ok !== true) {
      throw new Error(result.error ?? "Não foi possível registrar sua autorização.")
    }
    setHealthConsentVersion(result.healthConsentVersion ?? null)
    setRevision((current) => current + 1)
    return result.healthConsentVersion
  }, [])

  const clearDraft = useCallback(async () => {
    if (timer.current) {
      clearTimeout(timer.current)
      timer.current = null
    }
    const response = await fetch(
      "/api/registration-draft?role=" + encodeURIComponent(role),
      { method: "DELETE" }
    )
    const result = (await response.json()) as DraftResponse
    if (!response.ok || result.ok !== true) {
      throw new Error(result.error ?? "Não foi possível remover o rascunho.")
    }
    setStatus("disabled")
    setRestoredPayload(null)
    setDraftFiles([])
    setHealthConsentVersion(null)
  }, [role])

  const markPayloadSaved = useCallback(
    (value: T) => {
      const sanitized = sanitizeRegistrationPayload(
        role,
        value,
        healthConsentVersion === HEALTH_DATA_CONSENT_VERSION
      )
      lastSavedPayload.current = JSON.stringify(sanitized) ?? ""
      lastFailedPayload.current = null
    },
    [healthConsentVersion, role]
  )

  return {
    status,
    error,
    restoredPayload,
    draftFiles,
    healthConsentVersion,
    recordHealthConsent,
    clearDraft,
    markPayloadSaved,
  }
}
