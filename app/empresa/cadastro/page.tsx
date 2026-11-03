import type { Metadata } from "next"

import { CompanySignup } from "@/components/ehfi/company-signup"
import { PageTransition } from "@/components/ehfi/page-transition"

export const metadata: Metadata = {
  title: "Cadastro de empresa — EHFI",
  description: "Cadastro demonstrativo de empresa interessada em ginástica laboral.",
}

export default function CompanySignupPage() {
  return (
    <PageTransition>
      <CompanySignup />
    </PageTransition>
  )
}
