import { getSaoPauloDateKey, isValidDateKey, saoPauloDateTimeToIso } from "@/lib/activities/dates"
import type { ActivityStatus } from "@/lib/activities/types"

export type ActivityInput = {
  activityId: string | null
  title: string
  description: string
  startsAt: string
  endsAt: string
  location: string
  priceCents: number
  capacity: number
  status: Extract<ActivityStatus, "draft" | "published">
}

export class ActivityValidationError extends Error {
  constructor(message: string, readonly fieldErrors: Record<string, string>) {
    super(message)
  }
}

function valueText(value: unknown) {
  return typeof value === "string" ? value.trim() : ""
}

function moneyToCents(value: string) {
  const normalized = value.trim().replace(/R\$\s?/i, "").replace(/\s/g, "")
  const canonical = normalized.includes(",")
    ? normalized.replace(/\./g, "").replace(",", ".")
    : normalized
  if (!/^\d+(\.\d{1,2})?$/.test(canonical)) return null
  const amount = Number(canonical)
  if (!Number.isFinite(amount) || amount > 999_999) return null
  return Math.round(amount * 100)
}

export function validateActivityInput(input: unknown): ActivityInput {
  if (typeof input !== "object" || input === null || Array.isArray(input)) {
    throw new ActivityValidationError("Confira os campos da atividade.", {})
  }
  const values = input as Record<string, unknown>
  const activityIdRaw = valueText(values.activity_id)
  const title = valueText(values.title)
  const description = typeof values.description === "string" ? values.description.trim() : ""
  const date = valueText(values.date)
  const startTime = valueText(values.start_time)
  const durationMinutes = Number(valueText(values.duration_minutes))
  const location = valueText(values.location)
  const priceCents = moneyToCents(valueText(values.price))
  const capacity = Number(valueText(values.capacity))
  const status = valueText(values.status)
  const errors: Record<string, string> = {}

  if (activityIdRaw && !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(activityIdRaw)) errors.activity_id = "Atividade inválida."
  if (title.length < 3 || title.length > 100) errors.title = "Use de 3 a 100 caracteres."
  if (description.length > 1200) errors.description = "Use até 1.200 caracteres."
  if (!isValidDateKey(date) || date < getSaoPauloDateKey()) errors.date = "Escolha uma data de hoje em diante."
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(startTime)) errors.start_time = "Informe um horário válido."
  if (!Number.isInteger(durationMinutes) || durationMinutes < 15 || durationMinutes > 720) errors.duration_minutes = "A duração deve ser de 15 minutos a 12 horas."
  if (location.length < 2 || location.length > 160) errors.location = "Use de 2 a 160 caracteres."
  if (priceCents === null) errors.price = "Informe um valor válido, como 0,00."
  if (!Number.isInteger(capacity) || capacity < 1 || capacity > 500) errors.capacity = "Informe de 1 a 500 vagas."
  if (status !== "draft" && status !== "published") errors.status = "Escolha salvar como rascunho ou publicar."
  if (Object.keys(errors).length) throw new ActivityValidationError("Revise os campos destacados.", errors)

  const startsAt = saoPauloDateTimeToIso(date, startTime)
  const endsAt = new Date(new Date(startsAt).getTime() + durationMinutes * 60_000).toISOString()
  if (status === "published" && new Date(startsAt).getTime() <= Date.now()) {
    throw new ActivityValidationError("A publicação precisa começar no futuro.", { date: "Escolha uma data e horário futuros." })
  }

  return {
    activityId: activityIdRaw || null,
    title,
    description,
    startsAt,
    endsAt,
    location,
    priceCents: priceCents ?? 0,
    capacity,
    status: status as "draft" | "published",
  }
}
