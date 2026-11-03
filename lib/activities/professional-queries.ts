import { getAuthorizedProfile } from "@/lib/auth/roles"
import type { ActivitySummary, DateRange, ProfessionalParticipant } from "@/lib/activities/types"
import { getSaoPauloDateKey, localTodayRange } from "@/lib/activities/dates"
import { createServerSupabaseClient } from "@/lib/supabase/server"

export type ProfessionalDashboardSummary = {
  firstName: string
  todayActivityCount: number
  upcomingReservedCount: number
  upcomingActivities: ActivitySummary[]
  profilePublished: boolean
  credentialsInReview: boolean
}

export type ProfessionalActivity = ActivitySummary & { description: string }

async function requireProfessionalClient() {
  const profile = await getAuthorizedProfile("professional")
  if (!profile) throw new Error("professional_role_required")
  return { profile, supabase: await createServerSupabaseClient() }
}

export async function listProfessionalActivities(range: DateRange): Promise<ProfessionalActivity[]> {
  const { supabase } = await requireProfessionalClient()
  const [summaryResult, activityResult] = await Promise.all([
    supabase.rpc("get_professional_activity_summary", { p_from: range.from, p_to: range.to }),
    supabase
      .from("activities")
      .select("id, description")
      .gte("starts_at", range.from)
      .lt("starts_at", range.to),
  ])
  if (summaryResult.error || activityResult.error) throw new Error("professional_activities_load_failed")
  const descriptions = new Map((activityResult.data ?? []).map((item) => [item.id, item.description]))
  return (summaryResult.data ?? []).map((item) => ({ ...item, description: descriptions.get(item.activity_id) ?? "" }))
}

export async function getProfessionalDashboardSummary(): Promise<ProfessionalDashboardSummary> {
  const { profile, supabase } = await requireProfessionalClient()
  const range = localTodayRange(30)
  const [activitiesResult, userResult, publicProfileResult, credentialResult] = await Promise.all([
    supabase.rpc("get_professional_activity_summary", { p_from: range.from, p_to: range.to }),
    supabase.from("user_profiles").select("full_name").eq("id", profile.userId).maybeSingle(),
    supabase.from("professional_public_profiles").select("is_published").eq("user_id", profile.userId).maybeSingle(),
    supabase.from("professional_profiles").select("practice_status").eq("user_id", profile.userId).maybeSingle(),
  ])
  if (activitiesResult.error || userResult.error || publicProfileResult.error || credentialResult.error) {
    throw new Error("professional_dashboard_load_failed")
  }
  const activities = activitiesResult.data ?? []
  const today = getSaoPauloDateKey()
  const firstName = userResult.data?.full_name.trim().split(/\s+/)[0] || "profissional"
  const futureActivities = activities.filter((item) => new Date(item.starts_at).getTime() > Date.now())
  return {
    firstName,
    todayActivityCount: activities.filter((item) => getSaoPauloDateKey(item.starts_at) === today && (item.status === "published" || item.status === "completed")).length,
    upcomingReservedCount: futureActivities.reduce((total, item) => total + item.reserved_count, 0),
    upcomingActivities: futureActivities.filter((item) => item.status !== "cancelled").slice(0, 4),
    profilePublished: publicProfileResult.data?.is_published ?? false,
    credentialsInReview: credentialResult.data?.practice_status !== "active",
  }
}

export async function listProfessionalActivityParticipants(activityId: string): Promise<ProfessionalParticipant[]> {
  const { supabase } = await requireProfessionalClient()
  const { data, error } = await supabase.rpc("list_professional_activity_participants", {
    p_activity_id: activityId,
  })
  if (error) throw new Error("professional_participants_load_failed")
  return data ?? []
}
