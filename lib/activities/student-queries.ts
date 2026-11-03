import { getAuthorizedProfile } from "@/lib/auth/roles"
import { addCalendarDays, getSaoPauloDateKey, localTodayRange, saoPauloDateTimeToIso } from "@/lib/activities/dates"
import type { DateRange, DiscoverableActivity, StudentBooking } from "@/lib/activities/types"
import { createServerSupabaseClient } from "@/lib/supabase/server"

export type StudentDashboardData = {
  firstName: string
  upcomingBookings: StudentBooking[]
  nextActivities: DiscoverableActivity[]
}

export type StudentActivityDetails = {
  activity: DiscoverableActivity
  bookingId: string | null
  bookingStatus: StudentBooking["booking_status"] | null
  canCancel: boolean
  canReserve: boolean
}

async function requireStudentClient() {
  const profile = await getAuthorizedProfile("student")
  if (!profile) throw new Error("student_role_required")
  return { profile, supabase: await createServerSupabaseClient() }
}

export async function listDiscoverableActivities(range: DateRange): Promise<DiscoverableActivity[]> {
  const { supabase } = await requireStudentClient()
  const { data, error } = await supabase.rpc("list_discoverable_activities", {
    p_from: range.from,
    p_to: range.to,
  })
  if (error) throw new Error("discoverable_activities_load_failed")
  return data ?? []
}

export async function getStudentBookings(range: DateRange): Promise<StudentBooking[]> {
  const { supabase } = await requireStudentClient()
  const { data, error } = await supabase.rpc("list_student_bookings", {
    p_from: range.from,
    p_to: range.to,
  })
  if (error) throw new Error("student_bookings_load_failed")
  const records = (data ?? []).map((item) => ({
    booking_id: item.booking_id,
    booking_status: item.booking_status,
    booked_at: item.booked_at,
    cancelled_at: item.cancelled_at,
    activity: {
      activity_id: item.activity_id,
      title: item.title,
      description: item.description,
      starts_at: item.starts_at,
      ends_at: item.ends_at,
      location: item.location,
      price_cents: item.price_cents,
      capacity: item.capacity,
      status: item.status,
      professional_display_name: item.professional_display_name,
      professional_bio: item.professional_bio,
      professional_specialties: item.professional_specialties,
      professional_city: item.professional_city,
      professional_state: item.professional_state,
      credentials_in_review: item.credentials_in_review,
      reserved_count: item.reserved_count,
      places_remaining: item.places_remaining,
      professional_profile_hidden: item.professional_profile_hidden,
    },
  }))
  const latestByActivity = new Map<string, StudentBooking>()
  for (const booking of records) {
    if (!latestByActivity.has(booking.activity.activity_id)) latestByActivity.set(booking.activity.activity_id, booking)
  }
  return [...latestByActivity.values()]
}

export async function getStudentDashboard(): Promise<StudentDashboardData> {
  const { profile, supabase } = await requireStudentClient()
  const range = localTodayRange(21)
  const [bookingResult, activitiesResult, userResult] = await Promise.all([
    supabase.rpc("list_student_bookings", { p_from: range.from, p_to: range.to }),
    supabase.rpc("list_discoverable_activities", { p_from: range.from, p_to: range.to }),
    supabase.from("user_profiles").select("full_name").eq("id", profile.userId).maybeSingle(),
  ])
  if (bookingResult.error || activitiesResult.error || userResult.error) throw new Error("student_dashboard_load_failed")
  const bookings = (bookingResult.data ?? []).map((item) => ({
    booking_id: item.booking_id,
    booking_status: item.booking_status,
    booked_at: item.booked_at,
    cancelled_at: item.cancelled_at,
    activity: {
      activity_id: item.activity_id,
      title: item.title,
      description: item.description,
      starts_at: item.starts_at,
      ends_at: item.ends_at,
      location: item.location,
      price_cents: item.price_cents,
      capacity: item.capacity,
      status: item.status,
      professional_display_name: item.professional_display_name,
      professional_bio: item.professional_bio,
      professional_specialties: item.professional_specialties,
      professional_city: item.professional_city,
      professional_state: item.professional_state,
      credentials_in_review: item.credentials_in_review,
      reserved_count: item.reserved_count,
      places_remaining: item.places_remaining,
      professional_profile_hidden: item.professional_profile_hidden,
    },
  }))
  const firstName = userResult.data?.full_name.trim().split(/\s+/)[0] || "aluno"
  const activeBookingIds = new Set(bookings.filter((item) => item.booking_status === "reserved").map((item) => item.activity.activity_id))
  return {
    firstName,
    upcomingBookings: bookings.filter((item) => item.booking_status === "reserved" && new Date(item.activity.starts_at).getTime() > Date.now()).slice(0, 4),
    nextActivities: (activitiesResult.data ?? []).filter((item) => item.starts_at >= range.from && item.starts_at < range.to && !activeBookingIds.has(item.activity_id)).slice(0, 4),
  }
}

export async function getStudentActivityDetails(activityId: string): Promise<StudentActivityDetails | null> {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(activityId)) return null
  const { supabase } = await requireStudentClient()
  const [bookingResult, discoverableResult] = await Promise.all([
    supabase
      .from("activity_bookings")
      .select("id, status")
      .eq("activity_id", activityId)
      .order("booked_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase.rpc("get_discoverable_activity", { p_activity_id: activityId }),
  ])
  if (bookingResult.error || discoverableResult.error) throw new Error("student_activity_load_failed")
  let activity = discoverableResult.data?.[0] ?? null
  const isDiscoverable = Boolean(activity)

  if (!activity && bookingResult.data) {
    const { data, error } = await supabase.rpc("get_student_booking_activity", { p_activity_id: activityId })
    if (error) throw new Error("student_booked_activity_load_failed")
    activity = data?.[0] ?? null
  }
  if (!activity) return null
  const bookingStatus = bookingResult.data?.status ?? null
  const startsInFuture = new Date(activity.starts_at).getTime() > Date.now()
  return {
    activity,
    bookingId: bookingResult.data?.id ?? null,
    bookingStatus,
    canCancel: bookingStatus === "reserved" && startsInFuture && activity.status === "published",
    canReserve:
      (bookingStatus === null || bookingStatus === "cancelled_by_student") &&
      startsInFuture &&
      activity.status === "published" &&
      isDiscoverable &&
      activity.places_remaining > 0,
  }
}

export function getStudentActivityListRange(): DateRange {
  const today = getSaoPauloDateKey()
  return {
    from: saoPauloDateTimeToIso(addCalendarDays(today, -90), "00:00"),
    to: saoPauloDateTimeToIso(addCalendarDays(today, 180), "00:00"),
  }
}
