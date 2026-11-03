import type { Metadata } from "next"
import { redirect } from "next/navigation"

export const metadata: Metadata = { title: "Conta de aluno — EHFI" }

export default function StudentSignupSuccessPage() {
  redirect("/aluno/plataforma")
}
