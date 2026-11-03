import { addDays, format, startOfWeek } from "date-fns"
import { ptBR } from "date-fns/locale"

export const ACTIVITY_TIME_ZONE = "America/Sao_Paulo"

type ZonedParts = { year: number; month: number; day: number; hour: number; minute: number }

function partsFor(value: Date | string): ZonedParts {
  const date = value instanceof Date ? value : new Date(value)
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: ACTIVITY_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date)
  const part = (type: Intl.DateTimeFormatPartTypes) => Number(parts.find((item) => item.type === type)?.value)
  return { year: part("year"), month: part("month"), day: part("day"), hour: part("hour"), minute: part("minute") }
}

function calendarDate(year: number, month: number, day: number) {
  return new Date(year, month - 1, day, 12)
}

export function getSaoPauloDateKey(value: Date | string = new Date()) {
  const parts = partsFor(value)
  return `${parts.year}-${String(parts.month).padStart(2, "0")}-${String(parts.day).padStart(2, "0")}`
}

export function addCalendarDays(dateKey: string, amount: number) {
  const [year, month, day] = dateKey.split("-").map(Number)
  return format(addDays(calendarDate(year, month, day), amount), "yyyy-MM-dd")
}

export function getSaoPauloWeek(dateKey = getSaoPauloDateKey()) {
  const [year, month, day] = dateKey.split("-").map(Number)
  const monday = startOfWeek(calendarDate(year, month, day), { weekStartsOn: 1 })
  const startDate = format(monday, "yyyy-MM-dd")
  const endDate = addCalendarDays(startDate, 7)
  return {
    startDate,
    endDate,
    from: saoPauloDateTimeToIso(startDate, "00:00"),
    to: saoPauloDateTimeToIso(endDate, "00:00"),
  }
}

export function saoPauloDateTimeToIso(dateKey: string, time: string) {
  const [year, month, day] = dateKey.split("-").map(Number)
  const [hour, minute] = time.split(":").map(Number)
  const localAsUtc = Date.UTC(year, month - 1, day, hour, minute)
  const offsetParts = new Intl.DateTimeFormat("en-US", {
    timeZone: ACTIVITY_TIME_ZONE,
    timeZoneName: "longOffset",
  }).formatToParts(new Date(localAsUtc))
  const offsetText = offsetParts.find((item) => item.type === "timeZoneName")?.value ?? "GMT-03:00"
  const match = offsetText.match(/GMT([+-])(\d{2}):?(\d{2})/)
  const direction = match?.[1] === "-" ? -1 : 1
  const offsetMinutes = match ? direction * (Number(match[2]) * 60 + Number(match[3])) : -180
  return new Date(localAsUtc - offsetMinutes * 60_000).toISOString()
}

export function saoPauloInputParts(value: string) {
  const parts = partsFor(value)
  return {
    date: `${parts.year}-${String(parts.month).padStart(2, "0")}-${String(parts.day).padStart(2, "0")}`,
    time: `${String(parts.hour).padStart(2, "0")}:${String(parts.minute).padStart(2, "0")}`,
  }
}

export function formatSaoPauloDate(value: string, pattern = "EEEE, d 'de' MMMM") {
  const parts = partsFor(value)
  return format(calendarDate(parts.year, parts.month, parts.day), pattern, { locale: ptBR })
}

export function formatSaoPauloTime(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: ACTIVITY_TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value))
}

export function formatSaoPauloDateTime(value: string) {
  return `${formatSaoPauloDate(value, "EEE, d 'de' MMM")}, ${formatSaoPauloTime(value)}`
}

export function getWeekdayLabel(dateKey: string, pattern = "EEE") {
  const [year, month, day] = dateKey.split("-").map(Number)
  return format(calendarDate(year, month, day), pattern, { locale: ptBR })
}

export function localTodayRange(days = 30) {
  const today = getSaoPauloDateKey()
  const end = addCalendarDays(today, days)
  return {
    from: saoPauloDateTimeToIso(today, "00:00"),
    to: saoPauloDateTimeToIso(end, "00:00"),
  }
}

export function isValidDateKey(value: string | null | undefined): value is string {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const [year, month, day] = value.split("-").map(Number)
  const date = new Date(Date.UTC(year, month - 1, day))
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
}
