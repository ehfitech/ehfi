import { AuthPageFrame } from "@/components/ehfi/auth-page-frame"
import { LoginForm } from "@/components/ehfi/login-form"
import { PageTransition } from "@/components/ehfi/page-transition"

export default function CompanyLoginPage() {
  return <PageTransition><AuthPageFrame><LoginForm role="company" /></AuthPageFrame></PageTransition>
}
