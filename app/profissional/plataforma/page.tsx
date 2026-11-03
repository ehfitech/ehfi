import { PlatformPlaceholder } from "@/components/ehfi/platform-placeholder"
import { PageTransition } from "@/components/ehfi/page-transition"
import { getAuthorizedProfile } from "@/lib/auth/roles"
import { redirect } from "next/navigation"

export default async function ProfessionalPlatformPage() {
  const profile = await getAuthorizedProfile("professional")
  if (!profile) redirect("/profissional/entrar?next=%2Fprofissional%2Fplataforma")
  return (
    <PageTransition>
      <PlatformPlaceholder role="professional" />
    </PageTransition>
  )
}
