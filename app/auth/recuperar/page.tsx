import { AuthPageFrame } from "@/components/ehfi/auth-page-frame"
import { PasswordResetRequestForm } from "@/components/ehfi/password-reset-form"
import { PageTransition } from "@/components/ehfi/page-transition"

export default function PasswordResetRequestPage() {
  return <PageTransition><AuthPageFrame><PasswordResetRequestForm /></AuthPageFrame></PageTransition>
}
