export type ActivityStatus = "draft" | "published" | "cancelled" | "completed"

export type BookingStatus =
  | "reserved"
  | "cancelled_by_student"
  | "cancelled_by_professional"
  | "attended"
  | "no_show"

export type DateRange = {
  from: string
  to: string
}

export type ProfessionalPublicProfile = {
  user_id: string
  display_name: string
  bio: string
  specialties: string[]
  city: string
  state: string
  is_published: boolean
}

export type ProfessionalPublicProfileInput = Omit<
  ProfessionalPublicProfile,
  "user_id"
>

export type ActivitySummary = {
  activity_id: string
  title: string
  starts_at: string
  ends_at: string
  location: string
  price_cents: number
  capacity: number
  status: ActivityStatus
  reserved_count: number
}

export type DiscoverableActivity = {
  activity_id: string
  title: string
  description: string
  starts_at: string
  ends_at: string
  location: string
  price_cents: number
  capacity: number
  status: ActivityStatus
  professional_display_name: string
  professional_bio: string
  professional_specialties: string[]
  professional_city: string
  professional_state: string
  credentials_in_review: boolean
  reserved_count: number
  places_remaining: number
  professional_profile_hidden?: boolean
}

export type StudentBooking = {
  booking_id: string
  activity: DiscoverableActivity
  booking_status: BookingStatus
  booked_at: string
  cancelled_at: string | null
}

export type ProfessionalParticipant = {
  booking_id: string
  first_name: string
  surname_initial: string | null
  status: BookingStatus
  booked_at: string
}

export type PlatformActionResult<T> =
  | { ok: true; data: T; message?: string }
  | {
      ok: false
      code: string
      message: string
      fieldErrors?: Record<string, string>
    }
