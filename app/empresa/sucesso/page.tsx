import type { Metadata } from "next"

import { redirect } from "next/navigation"

export const metadata: Metadata = {
  title: "Conta de empresa — EHFI",
}

export default function CompanySignupSuccessPage() {
  redirect("/empresa/plataforma")
}
