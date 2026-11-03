import type { Metadata } from "next"

import { StudentSignup } from "@/components/ehfi/student-signup"
import { PageTransition } from "@/components/ehfi/page-transition"

export const metadata: Metadata = {
  title: "Cadastro de aluno — EHFI",
  description: "Cadastro demonstrativo de aluno e anamnese inicial da EHFI.",
}

export default function StudentSignupPage() {
  return (
    <PageTransition>
      <StudentSignup />
    </PageTransition>
  )
}
