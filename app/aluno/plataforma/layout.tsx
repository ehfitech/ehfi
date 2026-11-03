import { PlatformShell } from "@/components/ehfi/platform-shell"
import { getAvailablePlatformRoles, getAuthorizedProfile } from "@/lib/auth/roles"
import { redirect } from "next/navigation"

export default async function StudentPlatformLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const route = "/aluno/plataforma"
  const profile = await getAuthorizedProfile("student")
  if (!profile) {
    redirect(`/aluno/entrar?next=${encodeURIComponent(route)}`)
  }
  const availableRoles = await getAvailablePlatformRoles(profile.userId)

  return (
    <PlatformShell
      role="student"
      availableRoles={availableRoles.includes("student") ? availableRoles : ["student"]}
    >
      {children}
    </PlatformShell>
  )
}
