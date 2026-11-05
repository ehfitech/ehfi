"use server"

import { revalidatePath } from "next/cache"

import { getAuthorizedProfile } from "@/lib/auth/roles"
import { addCalendarDays, isValidDateKey, saoPauloDateTimeToIso } from "@/lib/activities/dates"
import { ActivityValidationError, validateActivityInput, type ActivityInput } from "@/lib/activities/activity-validation"
import type { PlatformActionResult } from "@/lib/activities/types"
import type { ProfessionalParticipant } from "@/lib/activities/types"
import { listProfessionalActivities, type ProfessionalActivity } from "@/lib/activities/professional-queries"
import { createServerSupabaseClient } from "@/lib/supabase/server"

function activityError(error: string | undefined): PlatformActionResult<never> {
  const message = error?.toLowerCase() ?? ""
  if (message.includes("public_profile_required")) return { ok: false, code: "public_profile_required", message: "Publique seu perfil profissional antes de divulgar uma atividade." }
  if (message.includes("professional_schedule_conflict")) return { ok: false, code: "schedule_conflict", message: "Este horário se sobrepõe a outra atividade publicada da sua agenda." }
  if (message.includes("booked_activity_schedule_locked")) return { ok: false, code: "booked_schedule_locked", message: "Com reservas ativas, não é possível alterar data, horário, local ou capacidade." }
  if (message.includes("booked_activity_cannot_be_unpublished")) return { ok: false, code: "booked_cannot_unpublish", message: "Uma atividade com reservas não pode voltar a rascunho. Cancele a atividade para avisar os participantes." }
  if (message.includes("capacity_below_reserved_count")) return { ok: false, code: "capacity_too_small", message: "A capacidade não pode ficar abaixo do número de reservas ativas." }
  if (message.includes("activity_start_must_be_future")) return { ok: false, code: "start_in_past", message: "A atividade publicada precisa começar no futuro." }
  if (message.includes("activity_not_found")) return { ok: false, code: "activity_not_found", message: "Esta atividade não está mais disponível para edição." }
  if (message.includes("activity_not_editable")) return { ok: false, code: "activity_not_editable", message: "Atividades canceladas ou concluídas não podem ser reabertas. Crie uma nova sessão." }
  if (message.includes("professional_role_required")) return { ok: false, code: "professional_role_required", message: "Entre com uma conta profissional para continuar." }
  return { ok: false, code: "activity_save_failed", message: "Não foi possível salvar a atividade. Atualize a página e tente novamente." }
}

export async function saveProfessionalActivity(
  _previousState: PlatformActionResult<{ activityId: string; startsAt: string }>,
  formData: FormData
): Promise<PlatformActionResult<{ activityId: string; startsAt: string }>> {
  let input: ActivityInput
  try {
    input = validateActivityInput({
      activity_id: formData.get("activity_id"),
      title: formData.get("title"),
      description: formData.get("description"),
      date: formData.get("date"),
      start_time: formData.get("start_time"),
      duration_minutes: formData.get("duration_minutes"),
      location: formData.get("location"),
      price: formData.get("price"),
      capacity: formData.get("capacity"),
      status: formData.get("status"),
    })
  } catch (error) {
    if (error instanceof ActivityValidationError) {
      return { ok: false, code: "invalid_activity", message: error.message, fieldErrors: error.fieldErrors }
    }
    return { ok: false, code: "invalid_activity", message: "Confira os campos da atividade." }
  }

  if (!(await getAuthorizedProfile("professional"))) {
    return { ok: false, code: "professional_role_required", message: "Entre com uma conta profissional para continuar." }
  }
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase.rpc("save_professional_activity", {
    p_activity_id: input.activityId,
    p_title: input.title,
    p_description: input.description,
    p_starts_at: input.startsAt,
    p_ends_at: input.endsAt,
    p_location: input.location,
    p_price_cents: input.priceCents,
    p_capacity: input.capacity,
    p_status: input.status,
  })
  if (error || !data) return activityError(error?.message)

  revalidatePath("/profissional/plataforma")
  revalidatePath("/profissional/plataforma/agenda")
  revalidatePath("/aluno/plataforma")
  revalidatePath("/aluno/plataforma/aulas")
  return {
    ok: true,
    data: { activityId: data, startsAt: input.startsAt },
    message: input.status === "published" ? "Atividade publicada na EHFI." : "Rascunho salvo com segurança.",
  }
}

export async function cancelProfessionalActivity(activityId: string): Promise<PlatformActionResult<null>> {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(activityId)) {
    return { ok: false, code: "invalid_activity_id", message: "Atividade inválida." }
  }
  if (!(await getAuthorizedProfile("professional"))) {
    return { ok: false, code: "professional_role_required", message: "Entre com uma conta profissional para continuar." }
  }
  const supabase = await createServerSupabaseClient()
  const { error } = await supabase.rpc("cancel_professional_activity", { p_activity_id: activityId })
  if (error) return activityError(error.message)
  revalidatePath("/profissional/plataforma")
  revalidatePath("/profissional/plataforma/agenda")
  revalidatePath("/aluno/plataforma")
  revalidatePath("/aluno/plataforma/aulas")
  return { ok: true, data: null, message: "Atividade cancelada. As reservas ativas foram encerradas e a sessão saiu da descoberta." }
}

export async function loadProfessionalActivityParticipants(
  activityId: string
): Promise<PlatformActionResult<ProfessionalParticipant[]>> {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(activityId)) {
    return { ok: false, code: "invalid_activity_id", message: "Atividade inválida." }
  }
  if (!(await getAuthorizedProfile("professional"))) {
    return { ok: false, code: "professional_role_required", message: "Entre com uma conta profissional para continuar." }
  }
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase.rpc("list_professional_activity_participants", {
    p_activity_id: activityId,
  })
  if (error) return { ok: false, code: "participants_load_failed", message: "Não foi possível carregar os participantes desta atividade." }
  return { ok: true, data: data ?? [] }
}

export async function loadProfessionalAgendaChunk(
  startDate: string
): Promise<PlatformActionResult<ProfessionalActivity[]>> {
  if (typeof startDate !== "string" || !isValidDateKey(startDate)) {
    return { ok: false, code: "invalid_agenda_range", message: "O período solicitado para a agenda é inválido." }
  }

  try {
    const endDate = addCalendarDays(startDate, 7)
    const activities = await listProfessionalActivities({
      from: saoPauloDateTimeToIso(startDate, "00:00"),
      to: saoPauloDateTimeToIso(endDate, "00:00"),
    })
    return { ok: true, data: activities }
  } catch {
    return { ok: false, code: "agenda_chunk_load_failed", message: "Não foi possível carregar mais dias da agenda." }
  }
}
