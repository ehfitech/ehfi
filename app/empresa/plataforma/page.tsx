import { PageTransition } from "@/components/ehfi/page-transition"
import { PlatformPlaceholder } from "@/components/ehfi/platform-placeholder"
import { getAuthorizedProfile } from "@/lib/auth/roles"
import { redirect } from "next/navigation"

export default async function CompanyPlatformPage() {
  const profile = await getAuthorizedProfile("company")
  if (!profile) redirect("/empresa/entrar?next=%2Fempresa%2Fplataforma")
  return <PageTransition><PlatformPlaceholder role="company" /></PageTransition>
}
