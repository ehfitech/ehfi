import type { Metadata } from "next"

import { CompanySignupSuccess } from "@/components/ehfi/company-signup-success"
import { PageTransition } from "@/components/ehfi/page-transition"

export const metadata: Metadata = {
  title: "Cadastro de empresa — EHFI",
  description: "Conclusão demonstrativa do cadastro de empresa EHFI.",
}

export default function CompanySignupSuccessPage() {
  return (
    <PageTransition>
      <CompanySignupSuccess />
    </PageTransition>
  )
}
