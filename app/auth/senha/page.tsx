import { AuthPageFrame } from "@/components/ehfi/auth-page-frame"
import { PasswordUpdateForm } from "@/components/ehfi/password-reset-form"
import { PageTransition } from "@/components/ehfi/page-transition"

export default function PasswordUpdatePage() {
  return <PageTransition><AuthPageFrame><PasswordUpdateForm /></AuthPageFrame></PageTransition>
}
