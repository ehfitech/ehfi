import { createHash, randomBytes } from "node:crypto"

import type { RegistrationRole } from "@/lib/registration-drafts/types"

export function createDraftToken() {
  return randomBytes(32).toString("base64url")
}

export function hashDraftToken(token: string) {
  return createHash("sha256").update(token).digest("hex")
}

export function getDraftCookieName(role: RegistrationRole) {
  return "ehfi-registration-" + role
}

export function isRegistrationRole(value: unknown): value is RegistrationRole {
  return value === "student" || value === "professional" || value === "company"
}
