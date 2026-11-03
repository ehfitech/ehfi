import type { Metadata } from "next"

import { StudentSignup } from "@/components/ehfi/student-signup"
import { PageTransition } from "@/components/ehfi/page-transition"

export const metadata: Metadata = {
  title: "Cadastro de aluno — EHFI",
  description: "Crie uma conta de aluno e preencha sua anamnese inicial EHFI.",
}

export default function StudentSignupPage() {
  return (
    <PageTransition>
      <StudentSignup />
    </PageTransition>
  )
}
