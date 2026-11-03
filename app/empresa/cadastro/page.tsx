import type { Metadata } from "next"

import { CompanySignup } from "@/components/ehfi/company-signup"
import { PageTransition } from "@/components/ehfi/page-transition"

export const metadata: Metadata = {
  title: "Cadastro de empresa — EHFI",
  description: "Crie uma conta de empresa e envie informações sobre ginástica laboral.",
}

export default function CompanySignupPage() {
  return (
    <PageTransition>
      <CompanySignup />
    </PageTransition>
  )
}
