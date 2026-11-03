export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type ActivityStatus = "draft" | "published" | "cancelled" | "completed"
export type ActivityBookingStatus = "reserved" | "cancelled_by_student" | "cancelled_by_professional" | "attended" | "no_show"

type Table<Row, Insert, Update = Partial<Insert>> = {
  Row: Row
  Insert: Insert
  Update: Update
  Relationships: []
}

export type Database = {
  public: {
    Tables: {
      user_profiles: Table<
        {
          id: string
          full_name: string
          email: string
          phone: string | null
          birth_date: string | null
          onboarding_status: string
          created_at: string
          updated_at: string
        },
        {
          id: string
          full_name: string
          email: string
          phone?: string | null
          birth_date?: string | null
          onboarding_status?: string
        }
      >
      user_roles: Table<
        { user_id: string; role: string; created_at: string },
        { user_id: string; role: string }
      >
      student_profiles: Table<
        {
          user_id: string
          data: Json
          review_status: string
          created_at: string
          updated_at: string
        },
        { user_id: string; data: Json; review_status?: string }
      >
      student_health_records: Table<
        {
          user_id: string
          data: Json
          created_at: string
          updated_at: string
        },
        { user_id: string; data: Json }
      >
      professional_profiles: Table<
        {
          user_id: string
          data: Json
          documents: Json
          practice_status: string
          created_at: string
          updated_at: string
        },
        {
          user_id: string
          data: Json
          documents?: Json
          practice_status?: string
        }
      >
      professional_public_profiles: Table<
        {
          user_id: string
          display_name: string
          bio: string
          specialties: string[]
          city: string
          state: string
          is_published: boolean
          created_at: string
          updated_at: string
        },
        {
          user_id: string
          display_name: string
          bio?: string
          specialties?: string[]
          city: string
          state: string
          is_published?: boolean
        }
      >
      activities: Table<
        {
          id: string
          professional_id: string
          title: string
          description: string
          starts_at: string
          ends_at: string
          location: string
          price_cents: number
          capacity: number
          status: ActivityStatus
          created_at: string
          updated_at: string
        },
        {
          id?: string
          professional_id: string
          title: string
          description?: string
          starts_at: string
          ends_at: string
          location: string
          price_cents?: number
          capacity: number
          status?: ActivityStatus
        }
      >
      activity_bookings: Table<
        {
          id: string
          activity_id: string
          student_id: string
          status: ActivityBookingStatus
          booked_at: string
          updated_at: string
          cancelled_at: string | null
        },
        {
          id?: string
          activity_id: string
          student_id: string
          status?: ActivityBookingStatus
          cancelled_at?: string | null
        }
      >
      companies: Table<
        {
          id: string
          cnpj: string
          legal_name: string
          data: Json
          created_at: string
          updated_at: string
        },
        { cnpj: string; legal_name: string; data: Json }
      >
      company_members: Table<
        {
          company_id: string
          user_id: string
          member_role: string
          created_at: string
        },
        { company_id: string; user_id: string; member_role?: string }
      >
      company_intakes: Table<
        {
          company_id: string
          data: Json
          created_at: string
          updated_at: string
        },
        { company_id: string; data: Json }
      >
      consent_records: Table<
        {
          id: string
          user_id: string
          role: string
          consent_type: string
          consent_version: string
          accepted: boolean
          representative_type: string | null
          accepted_at: string
        },
        {
          user_id: string
          role: string
          consent_type: string
          consent_version: string
          accepted: boolean
          representative_type?: string | null
        }
      >
      registration_drafts: Table<
        {
          id: string
          role: string
          token_hash: string
          payload: Json
          files: Json
          staged_files: Json
          health_data_consent_version: string | null
          health_data_consent_at: string | null
          updated_at: string
          expires_at: string
        },
        {
          id?: string
          role: string
          token_hash: string
          payload?: Json
          files?: Json
          staged_files?: Json
          health_data_consent_version?: string | null
          health_data_consent_at?: string | null
          updated_at?: string
          expires_at: string
        }
      >
    }
    Views: Record<string, never>
    Functions: {
      finalize_student_registration: {
        Args: { p_profile: Json; p_health: Json; p_consents: Json; p_draft_token_hash: string }
        Returns: undefined
      }
      finalize_professional_registration: {
        Args: { p_profile: Json; p_documents: Json; p_consents: Json; p_draft_token_hash: string }
        Returns: undefined
      }
      finalize_company_registration: {
        Args: { p_company: Json; p_intake: Json; p_consents: Json; p_draft_token_hash: string }
        Returns: string
      }
      save_professional_activity: {
        Args: {
          p_activity_id: string | null
          p_title: string
          p_description: string
          p_starts_at: string
          p_ends_at: string
          p_location: string
          p_price_cents: number
          p_capacity: number
          p_status: string
        }
        Returns: string
      }
      reserve_activity: { Args: { p_activity_id: string }; Returns: string }
      cancel_student_booking: { Args: { p_booking_id: string }; Returns: undefined }
      cancel_professional_activity: { Args: { p_activity_id: string }; Returns: undefined }
      list_discoverable_activities: {
        Args: { p_from: string; p_to: string }
        Returns: {
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
        }[]
      }
      get_student_booking_activity: {
        Args: { p_activity_id: string }
        Returns: {
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
          professional_profile_hidden: boolean
        }[]
      }
      get_discoverable_activity: {
        Args: { p_activity_id: string }
        Returns: {
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
        }[]
      }
      list_student_bookings: {
        Args: { p_from: string; p_to: string }
        Returns: {
          booking_id: string
          booking_status: ActivityBookingStatus
          booked_at: string
          cancelled_at: string | null
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
          professional_profile_hidden: boolean
        }[]
      }
      list_professional_activity_participants: {
        Args: { p_activity_id: string }
        Returns: {
          booking_id: string
          first_name: string
          surname_initial: string | null
          status: ActivityBookingStatus
          booked_at: string
        }[]
      }
      get_professional_activity_summary: {
        Args: { p_from: string; p_to: string }
        Returns: {
          activity_id: string
          title: string
          starts_at: string
          ends_at: string
          location: string
          price_cents: number
          capacity: number
          status: ActivityStatus
          reserved_count: number
        }[]
      }
    }
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
