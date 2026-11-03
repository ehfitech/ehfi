import type { RegistrationRole } from "@/lib/registration-drafts/types"
import { createServerSupabaseClient } from "@/lib/supabase/server"

export type AuthorizedProfile = {
  userId: string
  role: RegistrationRole
}

export type CompanyMembership = {
  companyId: string
  userId: string
  memberRole: string
}

export type PlatformRole = Extract<RegistrationRole, "student" | "professional">

const destinations: Record<RegistrationRole, string> = {
  student: "/aluno/plataforma",
  professional: "/profissional/plataforma",
  company: "/empresa/plataforma",
}

export function getRoleDestination(role: RegistrationRole) {
  return destinations[role]
}

export function safeRoleNextPath(
  role: RegistrationRole,
  next: string | undefined
) {
  const fallback = getRoleDestination(role)
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.includes("\\")) {
    return fallback
  }
  try {
    const parsed = new URL(next, "https://ehfi.invalid")
    const rolePrefix =
      role === "student"
        ? "/aluno/"
        : role === "professional"
          ? "/profissional/"
          : "/empresa/"
    return parsed.origin === "https://ehfi.invalid" &&
      parsed.pathname.startsWith(rolePrefix)
      ? parsed.pathname + parsed.search + parsed.hash
      : fallback
  } catch {
    return fallback
  }
}

export async function getAuthorizedProfile(
  role: RegistrationRole
): Promise<AuthorizedProfile | null> {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase.auth.getClaims()
  const userId = data?.claims?.sub
  if (error || typeof userId !== "string") return null

  const { data: association, error: roleError } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", role)
    .maybeSingle()

  if (roleError || !association) return null
  if (role === "company" && !(await getCompanyMembership())) return null
  return { userId, role }
}

export async function getAvailablePlatformRoles(userId: string): Promise<PlatformRole[]> {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
  if (error || !data) return []
  return data.flatMap(({ role }) =>
    role === "student" || role === "professional" ? [role] : []
  )
}

export async function getCompanyMembership(): Promise<CompanyMembership | null> {
  const supabase = await createServerSupabaseClient()
  const { data: claims, error: claimsError } = await supabase.auth.getClaims()
  const userId = claims?.claims?.sub
  if (claimsError || typeof userId !== "string") return null

  const { data: membership, error } = await supabase
    .from("company_members")
    .select("company_id, user_id, member_role")
    .eq("user_id", userId)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle()
  if (error || !membership) return null

  return {
    companyId: membership.company_id,
    userId: membership.user_id,
    memberRole: membership.member_role,
  }
}
