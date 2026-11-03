import { getAuthorizedProfile } from "@/lib/auth/roles"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import type { ProfessionalPublicProfile } from "@/lib/activities/types"

export type ProfessionalProfileEditorData = {
  profile: ProfessionalPublicProfile | null
  credentialsInReview: boolean
}

export async function getProfessionalProfileEditorData(): Promise<ProfessionalProfileEditorData> {
  const authorized = await getAuthorizedProfile("professional")
  if (!authorized) throw new Error("professional_role_required")

  const supabase = await createServerSupabaseClient()
  const [publicProfileResult, credentialResult] = await Promise.all([
    supabase
      .from("professional_public_profiles")
      .select("user_id, display_name, bio, specialties, city, state, is_published")
      .eq("user_id", authorized.userId)
      .maybeSingle(),
    supabase
      .from("professional_profiles")
      .select("practice_status")
      .eq("user_id", authorized.userId)
      .maybeSingle(),
  ])

  if (publicProfileResult.error || credentialResult.error) {
    throw new Error("profile_load_failed")
  }
  return {
    profile: publicProfileResult.data,
    credentialsInReview: credentialResult.data?.practice_status !== "active",
  }
}
