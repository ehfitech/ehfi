import type { Json } from "@/lib/database.types"
import type { RegistrationRole } from "@/lib/registration-drafts/types"

const credentialKeys = new Set([
  "password",
  "passwordconfirmation",
  "token",
  "tokenhash",
  "accesstoken",
  "refreshtoken",
  "authorization",
])

const studentHealthKeys = new Set([
  "conditions",
  "othercondition",
  "conditioncontrol",
  "usesmedication",
  "medicationname",
  "medicationpurpose",
  "symptoms",
  "symptomdetails",
  "limitations",
  "limitationdetails",
  "injuryhistory",
  "injurydetails",
  "exerciserestriction",
  "restrictiondetails",
  "pregnancystatus",
  "pregnancyduration",
  "otherhealthinfo",
  "guardianname",
  "guardiancontact",
  "guardianconfirmed",
  "healthdataconsent",
])

function sanitizeValue(
  value: unknown,
  role: RegistrationRole,
  healthConsentRecorded: boolean,
  depth: number
): Json | undefined {
  if (depth > 8) return undefined
  if (value === null || typeof value === "boolean") return value
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : undefined
  }
  if (typeof value === "string") return value.slice(0, 10000)
  if (Array.isArray(value)) {
    return value
      .slice(0, 100)
      .map((item) => sanitizeValue(item, role, healthConsentRecorded, depth + 1))
      .filter((item): item is Json => item !== undefined)
  }
  if (typeof value !== "object") return undefined

  const sanitized: Record<string, Json> = {}
  for (const [key, item] of Object.entries(value)) {
    const normalizedKey = key.toLowerCase().replace(/[^a-z]/g, "")
    if (credentialKeys.has(normalizedKey)) continue
    if (
      role === "student" &&
      !healthConsentRecorded &&
      studentHealthKeys.has(normalizedKey)
    ) {
      continue
    }
    if (
      role === "student" &&
      ["healthdataconsent", "guardianname", "guardiancontact", "guardianconfirmed"].includes(normalizedKey)
    ) continue
    const sanitizedValue = sanitizeValue(
      item,
      role,
      healthConsentRecorded,
      depth + 1
    )
    if (sanitizedValue !== undefined) sanitized[key] = sanitizedValue
  }
  return sanitized
}

export function sanitizeRegistrationPayload(
  role: RegistrationRole,
  payload: unknown,
  healthConsentRecorded: boolean
): Json {
  const sanitized = sanitizeValue(payload, role, healthConsentRecorded, 0)
  if (!sanitized || Array.isArray(sanitized) || typeof sanitized !== "object") {
    throw new Error("O rascunho precisa ser um objeto válido.")
  }
  return sanitized
}

export function removeStudentHealthData(payload: Json): Json {
  return sanitizeRegistrationPayload("student", payload, false)
}
