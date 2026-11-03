import { PlatformShell } from "@/components/ehfi/platform-shell"
import { getAvailablePlatformRoles, getAuthorizedProfile } from "@/lib/auth/roles"
import { redirect } from "next/navigation"

export default async function ProfessionalPlatformLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const route = "/profissional/plataforma"
  const profile = await getAuthorizedProfile("professional")
  if (!profile) {
    redirect(`/profissional/entrar?next=${encodeURIComponent(route)}`)
  }
  const availableRoles = await getAvailablePlatformRoles(profile.userId)

  return (
    <PlatformShell
      role="professional"
      availableRoles={availableRoles.includes("professional") ? availableRoles : ["professional"]}
    >
      {children}
    </PlatformShell>
  )
}
