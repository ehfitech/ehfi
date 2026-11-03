import type { Metadata } from "next"

import { StudentSignupSuccess } from "@/components/ehfi/student-signup-success"
import { PageTransition } from "@/components/ehfi/page-transition"

export const metadata: Metadata = {
  title: "Cadastro de aluno — EHFI",
  description: "Conclusão demonstrativa do cadastro de aluno EHFI.",
}

export default function StudentSignupSuccessPage() {
  return (
    <PageTransition>
      <StudentSignupSuccess />
    </PageTransition>
  )
}
