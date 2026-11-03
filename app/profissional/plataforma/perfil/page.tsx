import { PageTransition } from "@/components/ehfi/page-transition"
import { ProfessionalProfileForm } from "@/components/ehfi/professional-profile-form"
import { getProfessionalProfileEditorData } from "@/lib/activities/profile-queries"
import { IoArrowBackOutline, IoPersonOutline } from "react-icons/io5"
import Link from "next/link"

export default async function ProfessionalPublicProfilePage() {
  let data: Awaited<ReturnType<typeof getProfessionalProfileEditorData>>
  try {
    data = await getProfessionalProfileEditorData()
  } catch {
    return (
      <section className="mx-auto max-w-3xl rounded-[1.7rem] border border-border/70 bg-card/80 p-6 shadow-sm sm:p-9">
        <p className="text-sm font-semibold text-destructive">Não foi possível carregar seu perfil público.</p>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">Atualize a página. Se o problema continuar, confira a conexão e as migrações configuradas no Supabase.</p>
      </section>
    )
  }

  return (
    <PageTransition>
      <div className="space-y-6 pb-10">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Link href="/profissional/plataforma" className="mb-4 inline-flex min-h-9 items-center gap-2 rounded-lg px-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-card/70 hover:text-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40">
              <IoArrowBackOutline aria-hidden="true" className="size-4" /> Voltar ao início
            </Link>
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-ehfi-secondary"><IoPersonOutline aria-hidden="true" className="size-4" /> Perfil profissional</p>
            <h1 className="mt-2 font-heading text-3xl font-semibold tracking-[-0.035em] text-foreground sm:text-4xl">Sua presença na EHFI</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">Uma apresentação clara ajuda alunos a encontrar atividades que combinam com o que você oferece.</p>
          </div>
          {data.profile?.is_published ? (
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-600/15 bg-emerald-600/8 px-3.5 py-2 text-xs font-semibold text-emerald-700 dark:text-emerald-300"><span className="size-2 rounded-full bg-emerald-500" /> Visível para alunos</span>
          ) : (
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-card/65 px-3.5 py-2 text-xs font-semibold text-muted-foreground"><span className="size-2 rounded-full bg-muted-foreground/50" /> Oculto da descoberta</span>
          )}
        </header>
        <ProfessionalProfileForm profile={data.profile} credentialsInReview={data.credentialsInReview} />
      </div>
    </PageTransition>
  )
}
