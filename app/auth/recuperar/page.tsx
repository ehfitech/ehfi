import { Suspense } from "react"

import { AuthPageFrame } from "@/components/ehfi/auth-page-frame"
import { PasswordResetRequestForm } from "@/components/ehfi/password-reset-form"
import { PageTransition } from "@/components/ehfi/page-transition"

export default function PasswordResetRequestPage() {
  return (
    <PageTransition>
      <AuthPageFrame>
        <Suspense
          fallback={
            <div
              role="status"
              aria-label="Carregando formulário de recuperação"
              className="min-h-[18rem] animate-pulse motion-reduce:animate-none rounded-[1.75rem] border border-border/60 bg-card/80 p-5 shadow-[0_24px_70px_-38px_rgba(31,22,50,0.35)] sm:p-8"
            >
              <span className="sr-only">Carregando formulário…</span>
              <div className="h-3 w-40 rounded-full bg-muted" />
              <div className="mt-5 h-8 w-56 max-w-full rounded-xl bg-muted" />
              <div className="mt-9 h-4 w-28 rounded-full bg-muted" />
              <div className="mt-2 h-11 rounded-xl bg-muted" />
              <div className="mt-5 h-11 rounded-xl bg-muted" />
            </div>
          }
        >
          <PasswordResetRequestForm />
        </Suspense>
      </AuthPageFrame>
    </PageTransition>
  )
}
