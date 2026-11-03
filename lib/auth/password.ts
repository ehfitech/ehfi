import { getStudentPasswordRequirements } from "@/lib/student-registration"

export type PasswordValidationResult = {
  valid: boolean
  message?: string
}

export function validatePassword(value: string): PasswordValidationResult {
  const requirements = getStudentPasswordRequirements(value)
  return Object.values(requirements).every(Boolean)
    ? { valid: true }
    : {
        valid: false,
        message:
          "Use ao menos 8 caracteres, incluindo maiúscula, minúscula, número e símbolo.",
      }
}
