"use server"

import { redirect } from "next/navigation"

import { validatePassword } from "@/lib/auth/password"
import { safeRoleNextPath } from "@/lib/auth/roles"
import type { RegistrationRole } from "@/lib/registration-drafts/types"
import { createServerSupabaseClient } from "@/lib/supabase/server"

export type AuthActionResult =
  | { ok: true; redirectTo: string }
  | { ok: false; code: string; message: string }

function isRole(value: unknown): value is RegistrationRole {
  return value === "student" || value === "professional" || value === "company"
}

function validEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export async function signInWithProfile(input: {
  role: RegistrationRole
  email: string
  password: string
  next?: string
}): Promise<AuthActionResult> {
  if (
    !input ||
    typeof input !== "object" ||
    !isRole(input.role) ||
    typeof input.email !== "string" ||
    !validEmail(input.email) ||
    typeof input.password !== "string" ||
    !input.password
  ) {
    return {
      ok: false,
      code: "invalid_credentials",
      message: "Confira o e-mail e a senha.",
    }
  }

  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase.auth.signInWithPassword({
    email: input.email.trim().toLowerCase(),
    password: input.password,
  })

  if (error || !data.user) {
    return {
      ok: false,
      code: "invalid_credentials",
      message: "E-mail ou senha inválidos.",
    }
  }

  const { data: association, error: roleError } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", data.user.id)
    .eq("role", input.role)
    .maybeSingle()

  if (roleError) {
    return {
      ok: false,
      code: "profile_lookup_failed",
      message: "Não foi possível validar este perfil. Tente novamente.",
    }
  }
  if (!association) {
    return {
      ok: false,
      code: "profile_not_found",
      message:
        "Esta conta ainda não tem um perfil deste tipo. Conclua o cadastro ou escolha outro acesso.",
    }
  }

  return {
    ok: true,
    redirectTo: safeRoleNextPath(input.role, input.next),
  }
}

export async function signOut() {
  const supabase = await createServerSupabaseClient()
  await supabase.auth.signOut()
  redirect("/")
}

export async function requestPasswordReset(email: string): Promise<AuthActionResult> {
  const genericResult = {
    ok: true as const,
    redirectTo: "/auth/recuperar?enviado=1",
  }
  if (typeof email !== "string" || !validEmail(email.trim())) return genericResult

  try {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
    if (!siteUrl) return genericResult
    const origin = new URL(siteUrl)
    if (origin.protocol !== "https:" && origin.hostname !== "localhost") {
      return genericResult
    }
    const redirectTo = new URL("/auth/callback?next=/auth/senha", origin).toString()
    const supabase = await createServerSupabaseClient()
    await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
      redirectTo,
    })
  } catch {
    // Keep the response generic to avoid disclosing whether an account exists.
  }
  return genericResult
}

export async function updatePassword(
  password: string,
  confirmation: string
): Promise<AuthActionResult> {
  const validation = validatePassword(password)
  if (!validation.valid) {
    return {
      ok: false,
      code: "weak_password",
      message: validation.message ?? "A senha não atende aos requisitos.",
    }
  }
  if (password !== confirmation) {
    return {
      ok: false,
      code: "password_mismatch",
      message: "As senhas precisam ser iguais.",
    }
  }

  const supabase = await createServerSupabaseClient()
  const { data: claims } = await supabase.auth.getClaims()
  if (!claims?.claims?.sub) {
    return {
      ok: false,
      code: "session_required",
      message: "Abra novamente o link de recuperação enviado por e-mail.",
    }
  }
  const { error } = await supabase.auth.updateUser({ password })
  if (error) {
    return {
      ok: false,
      code: "password_update_failed",
      message: "Não foi possível atualizar a senha. Solicite um novo link.",
    }
  }
  return { ok: true, redirectTo: "/" }
}
