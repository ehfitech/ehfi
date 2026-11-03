import { WelcomeScreen } from "@/components/ehfi/welcome-screen"
import { PageTransition } from "@/components/ehfi/page-transition"

export default function Page() {
  return (
    <PageTransition>
      <WelcomeScreen />
    </PageTransition>
  )
}
