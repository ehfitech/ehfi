import type { Json } from "@/lib/database.types"

export const registrationRoles = ["student", "professional", "company"] as const
export type RegistrationRole = (typeof registrationRoles)[number]

export type DraftFileReference = {
  path: string
  originalName: string
  size: number
  kind:
    | "diploma"
    | "transcript"
    | "completion_declaration"
    | "cref-card"
    | "cref-request"
}

export type FinalFileReference = DraftFileReference

export type RegistrationDraft = {
  id: string
  role: RegistrationRole
  payload: Json
  files: Json
  staged_files: Json
  health_data_consent_version: string | null
  health_data_consent_at: string | null
  updated_at: string
  expires_at: string
}

export const HEALTH_DATA_CONSENT_VERSION = "health-data-v1"
export const REGISTRATION_DRAFT_TTL_DAYS = 30
export const PROFESSIONAL_PDF_MAX_BYTES = 10 * 1024 * 1024
