import { PageTransition } from "@/components/ehfi/page-transition"
import { PlatformPlaceholder } from "@/components/ehfi/platform-placeholder"
import { getAuthorizedProfile } from "@/lib/auth/roles"
import { redirect } from "next/navigation"

export default async function StudentPlatformPage() {
  const profile = await getAuthorizedProfile("student")
  if (!profile) redirect("/aluno/entrar?next=%2Faluno%2Fplataforma")
  return <PageTransition><PlatformPlaceholder role="student" /></PageTransition>
}
