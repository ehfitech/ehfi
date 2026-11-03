"use server"

import { revalidatePath } from "next/cache"

import { getAuthorizedProfile } from "@/lib/auth/roles"
import { validateProfessionalPublicProfile, PublicProfileValidationError } from "@/lib/activities/profile-validation"
import type { PlatformActionResult, ProfessionalPublicProfileInput } from "@/lib/activities/types"
import { createServerSupabaseClient } from "@/lib/supabase/server"

export async function saveProfessionalPublicProfile(
  _previousState: PlatformActionResult<null>,
  formData: FormData
): Promise<PlatformActionResult<null>> {
  let input: ProfessionalPublicProfileInput
  try {
    input = validateProfessionalPublicProfile({
      display_name: formData.get("display_name"),
      bio: formData.get("bio"),
      specialties: formData.get("specialties"),
      city: formData.get("city"),
      state: formData.get("state"),
      is_published: formData.get("is_published"),
    })
  } catch (error) {
    if (error instanceof PublicProfileValidationError) {
      return {
        ok: false,
        code: "invalid_profile",
        message: error.message,
        fieldErrors: error.fieldErrors,
      }
    }
    return { ok: false, code: "invalid_profile", message: "Confira os dados do perfil." }
  }

  const authorized = await getAuthorizedProfile("professional")
  if (!authorized) {
    return { ok: false, code: "professional_role_required", message: "Entre novamente para editar seu perfil." }
  }

  const supabase = await createServerSupabaseClient()
  const { error } = await supabase
    .from("professional_public_profiles")
    .upsert({ user_id: authorized.userId, ...input }, { onConflict: "user_id" })
  if (error) {
    return { ok: false, code: "profile_save_failed", message: "Não foi possível salvar seu perfil agora. Tente novamente." }
  }

  revalidatePath("/profissional/plataforma")
  revalidatePath("/profissional/plataforma/perfil")
  revalidatePath("/aluno/plataforma")
  revalidatePath("/aluno/plataforma/aulas")
  return {
    ok: true,
    data: null,
    message: input.is_published ? "Seu perfil e suas atividades estão visíveis na descoberta." : "Perfil oculto. As reservas existentes foram preservadas.",
  }
}
