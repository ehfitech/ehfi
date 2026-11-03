export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

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
    }
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
