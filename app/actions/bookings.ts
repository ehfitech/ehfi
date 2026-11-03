"use server"

import { revalidatePath } from "next/cache"

import { getAuthorizedProfile } from "@/lib/auth/roles"
import type { PlatformActionResult } from "@/lib/activities/types"
import { createServerSupabaseClient } from "@/lib/supabase/server"

function validUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
}

function bookingError(error: string | undefined): PlatformActionResult<never> {
  const message = error?.toLowerCase() ?? ""
  if (message.includes("activity_full")) return { ok: false, code: "activity_full", message: "As vagas desta atividade acabaram. Atualize a lista para consultar outras sessões." }
  if (message.includes("activity_hidden")) return { ok: false, code: "activity_hidden", message: "Esta atividade não está mais recebendo novas reservas." }
  if (message.includes("student_schedule_conflict")) return { ok: false, code: "schedule_conflict", message: "Você já tem uma reserva em horário que se sobrepõe a esta atividade." }
  if (message.includes("cannot_reserve_own_activity")) return { ok: false, code: "own_activity", message: "Você não pode reservar uma atividade publicada pela sua própria conta profissional." }
  if (message.includes("already_reserved")) return { ok: false, code: "already_reserved", message: "Você já tem uma vaga reservada nesta atividade." }
  if (message.includes("activity_unavailable")) return { ok: false, code: "activity_unavailable", message: "Esta atividade não está mais disponível para reserva." }
  if (message.includes("booking_not_found")) return { ok: false, code: "booking_not_found", message: "Não encontramos esta reserva na sua conta." }
  if (message.includes("booking_not_active")) return { ok: false, code: "booking_not_active", message: "Esta reserva já foi encerrada ou cancelada." }
  if (message.includes("cancellation_deadline_passed")) return { ok: false, code: "cancellation_deadline_passed", message: "O cancelamento pela plataforma encerra no início da atividade." }
  if (message.includes("student_role_required")) return { ok: false, code: "student_role_required", message: "Entre com uma conta de aluno para continuar." }
  return { ok: false, code: "booking_failed", message: "Não foi possível concluir esta ação. Atualize a página e tente novamente." }
}

export async function reserveActivity(activityId: string): Promise<PlatformActionResult<{ bookingId: string }>> {
  if (!validUuid(activityId)) return { ok: false, code: "invalid_activity_id", message: "Atividade inválida." }
  if (!(await getAuthorizedProfile("student"))) return { ok: false, code: "student_role_required", message: "Entre com uma conta de aluno para continuar." }
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase.rpc("reserve_activity", { p_activity_id: activityId })
  if (error || !data) return bookingError(error?.message)
  revalidatePath("/aluno/plataforma")
  revalidatePath("/aluno/plataforma/aulas")
  revalidatePath("/aluno/plataforma/aulas/[activityId]", "page")
  revalidatePath(`/aluno/plataforma/aulas/${activityId}`)
  return { ok: true, data: { bookingId: data }, message: "Vaga reservada. Esta atividade já aparece na sua jornada." }
}

export async function cancelStudentBooking(bookingId: string): Promise<PlatformActionResult<null>> {
  if (!validUuid(bookingId)) return { ok: false, code: "invalid_booking_id", message: "Reserva inválida." }
  if (!(await getAuthorizedProfile("student"))) return { ok: false, code: "student_role_required", message: "Entre com uma conta de aluno para continuar." }
  const supabase = await createServerSupabaseClient()
  const { error } = await supabase.rpc("cancel_student_booking", { p_booking_id: bookingId })
  if (error) return bookingError(error.message)
  revalidatePath("/aluno/plataforma")
  revalidatePath("/aluno/plataforma/aulas")
  revalidatePath("/aluno/plataforma/aulas/[activityId]", "page")
  return { ok: true, data: null, message: "Reserva cancelada. A vaga voltou a ficar disponível." }
}
