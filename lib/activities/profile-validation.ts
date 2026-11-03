import type { ProfessionalPublicProfileInput } from "@/lib/activities/types"

const validBrazilianStates = new Set([
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS",
  "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC",
  "SP", "SE", "TO",
])

export class PublicProfileValidationError extends Error {
  constructor(
    message: string,
    readonly fieldErrors: Record<string, string>
  ) {
    super(message)
  }
}

function textValue(value: unknown) {
  return typeof value === "string" ? value.trim() : ""
}

export function validateProfessionalPublicProfile(
  input: unknown
): ProfessionalPublicProfileInput {
  if (typeof input !== "object" || input === null || Array.isArray(input)) {
    throw new PublicProfileValidationError("Confira os dados do perfil.", {})
  }
  const values = input as Record<string, unknown>
  const displayName = textValue(values.display_name)
  const bio = textValue(values.bio)
  const city = textValue(values.city)
  const state = textValue(values.state).toUpperCase()
  const specialtiesRaw = values.specialties
  const specialties = (Array.isArray(specialtiesRaw)
    ? specialtiesRaw
    : typeof specialtiesRaw === "string"
      ? specialtiesRaw.split(/[\n,;]/)
      : [])
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean)
    .filter((item, index, list) => list.findIndex((candidate) => candidate.toLocaleLowerCase("pt-BR") === item.toLocaleLowerCase("pt-BR")) === index)

  const fieldErrors: Record<string, string> = {}
  if (displayName.length < 2 || displayName.length > 80) fieldErrors.display_name = "Use de 2 a 80 caracteres."
  if (bio.length > 600) fieldErrors.bio = "A apresentação pode ter até 600 caracteres."
  if (specialties.length > 12 || specialties.some((item) => item.length > 60)) fieldErrors.specialties = "Informe até 12 áreas, com no máximo 60 caracteres cada."
  if (city.length < 2 || city.length > 80) fieldErrors.city = "Informe uma cidade válida."
  if (!validBrazilianStates.has(state)) fieldErrors.state = "Escolha a sigla válida do estado brasileiro."
  if (Object.keys(fieldErrors).length) {
    throw new PublicProfileValidationError("Revise os campos destacados.", fieldErrors)
  }

  return {
    display_name: displayName,
    bio,
    specialties,
    city,
    state,
    is_published: values.is_published === true || values.is_published === "true" || values.is_published === "on",
  }
}
