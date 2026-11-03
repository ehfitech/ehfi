import Link from "next/link"
import {
  IoArrowForwardOutline,
  IoCalendarClearOutline,
  IoPeopleOutline,
  IoTimeOutline,
  IoWarningOutline,
} from "react-icons/io5"

import { PageTransition } from "@/components/ehfi/page-transition"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import type { ProfessionalDashboardSummary } from "@/lib/activities/professional-queries"
import { formatSaoPauloDateTime, getSaoPauloWeek, getSaoPauloDateKey } from "@/lib/activities/dates"
import { cn } from "@/lib/utils"

const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" })

function statusLabel(status: string) {
  if (status === "published") return "Publicada"
  if (status === "cancelled") return "Cancelada"
  if (status === "completed") return "Concluída"
  return "Rascunho"
}

export function ProfessionalDashboard({ summary }: { summary: ProfessionalDashboardSummary }) {
  const week = getSaoPauloWeek(getSaoPauloDateKey())
  return (
    <PageTransition>
      <div className="space-y-6 pb-10 sm:space-y-7">
        <section className="relative isolate overflow-hidden rounded-[2rem] border border-white/55 bg-gradient-to-br from-primary/[0.13] via-card/85 to-ehfi-secondary/[0.12] px-5 py-6 shadow-[0_26px_85px_-50px_rgba(65,35,96,0.5)] backdrop-blur-xl sm:px-8 sm:py-8">
          <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-32 -z-10 size-72 rounded-full bg-primary/10 blur-3xl" />
          <div aria-hidden="true" className="pointer-events-none absolute -bottom-40 left-[35%] -z-10 size-80 rounded-full bg-ehfi-secondary/10 blur-3xl" />
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ehfi-secondary">Seu espaço profissional</p>
          <div className="mt-2 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="font-heading text-3xl font-semibold tracking-[-0.04em] text-foreground sm:text-[2.65rem]">Olá, {summary.firstName}</h1>
              <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">Organize seus encontros e acompanhe cada atividade da sua agenda.</p>
            </div>
            <Link href="/profissional/plataforma/agenda?novo=1" className={buttonVariants({ className: "h-12 w-full rounded-xl px-5 font-semibold shadow-md shadow-primary/15 sm:w-auto" })}>
              <IoCalendarClearOutline aria-hidden="true" className="size-4" /> Nova atividade
            </Link>
          </div>
          {summary.credentialsInReview && (
            <p className="mt-5 flex max-w-2xl items-start gap-2.5 rounded-2xl border border-amber-500/20 bg-amber-500/[0.07] px-4 py-3 text-xs leading-5 text-foreground">
              <IoWarningOutline aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400" />
              <span><strong className="font-semibold">Credenciais em análise.</strong> Você pode publicar atividades enquanto a revisão está pendente.</span>
            </p>
          )}
        </section>

        {!summary.profilePublished && (
          <Card className="rounded-2xl border-primary/15 bg-primary/[0.045] shadow-none">
            <CardContent className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="max-w-2xl">
                <p className="font-heading text-base font-semibold text-foreground">Prepare seu perfil para os alunos</p>
                <p className="mt-1 text-sm leading-5 text-muted-foreground">Publique sua apresentação para que suas atividades apareçam na descoberta.</p>
              </div>
              <Link href="/profissional/plataforma/perfil" className={buttonVariants({ variant: "outline", className: "h-11 rounded-xl px-4" })}>Editar perfil <IoArrowForwardOutline aria-hidden="true" /></Link>
            </CardContent>
          </Card>
        )}

        <section aria-label="Resumo da agenda" className="grid gap-3 sm:grid-cols-2 sm:gap-4">
          <Card className="rounded-[1.6rem] border-border/65 bg-card/80 shadow-[0_15px_55px_-44px_rgba(42,25,68,0.55)]">
            <CardContent className="flex flex-row items-center gap-4 px-5 py-5 sm:px-6">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary"><IoCalendarClearOutline aria-hidden="true" className="size-6" /></span>
              <span><span className="block text-3xl font-semibold tracking-tight text-foreground">{summary.todayActivityCount}</span><span className="mt-0.5 block text-sm text-muted-foreground">atividades hoje</span></span>
            </CardContent>
          </Card>
          <Card className="rounded-[1.6rem] border-border/65 bg-card/80 shadow-[0_15px_55px_-44px_rgba(42,25,68,0.55)]">
            <CardContent className="flex flex-row items-center gap-4 px-5 py-5 sm:px-6">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-secondary text-ehfi-secondary"><IoPeopleOutline aria-hidden="true" className="size-6" /></span>
              <span><span className="block text-3xl font-semibold tracking-tight text-foreground">{summary.upcomingReservedCount}</span><span className="mt-0.5 block text-sm text-muted-foreground">reservas nos próximos 30 dias</span></span>
            </CardContent>
          </Card>
        </section>

        <section className="space-y-4">
          <div className="flex items-end justify-between gap-3">
            <div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-ehfi-secondary">Em breve</p><h2 className="mt-1 font-heading text-xl font-semibold tracking-tight text-foreground">Próximas atividades</h2></div>
            <Link href={`/profissional/plataforma/agenda?week=${week.startDate}`} className="inline-flex min-h-10 items-center gap-1 rounded-xl px-3 text-sm font-medium text-primary hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40">Ver agenda <IoArrowForwardOutline aria-hidden="true" className="size-4" /></Link>
          </div>
          {summary.upcomingActivities.length ? (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {summary.upcomingActivities.map((activity) => (
                <Link key={activity.activity_id} href={`/profissional/plataforma/agenda?week=${getSaoPauloWeek(getSaoPauloDateKey(activity.starts_at)).startDate}&atividade=${activity.activity_id}`} className="group rounded-[1.5rem] focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40">
                  <Card className="h-full rounded-[1.5rem] border-border/70 bg-card/75 transition duration-200 group-hover:-translate-y-0.5 group-hover:border-primary/20 group-hover:shadow-lg group-hover:shadow-primary/5">
                    <CardContent className="gap-4 px-4 py-4">
                      <div className="flex items-start justify-between gap-2"><span className="rounded-full bg-secondary px-2.5 py-1 text-[0.68rem] font-semibold text-secondary-foreground">{statusLabel(activity.status)}</span><span className="text-xs font-medium text-muted-foreground">{activity.reserved_count}/{activity.capacity} vagas</span></div>
                      <div><h3 className="line-clamp-2 min-h-11 font-heading text-base font-semibold text-foreground">{activity.title}</h3><p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground"><IoTimeOutline aria-hidden="true" className="size-3.5" />{formatSaoPauloDateTime(activity.starts_at)}</p></div>
                      <div className="flex items-center justify-between border-t border-border/60 pt-3 text-xs"><span className="truncate text-muted-foreground">{activity.location}</span><span className="shrink-0 font-semibold text-foreground">{activity.price_cents ? brl.format(activity.price_cents / 100) : "Gratuita"}</span></div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <Card className="rounded-[1.6rem] border-dashed border-border bg-card/55 shadow-none"><CardContent className="items-center gap-3 px-6 py-10 text-center"><span className="flex size-12 items-center justify-center rounded-2xl bg-secondary text-ehfi-secondary"><IoCalendarClearOutline aria-hidden="true" className="size-6" /></span><div><p className="font-heading text-base font-semibold text-foreground">Sua agenda está livre</p><p className="mt-1 text-sm text-muted-foreground">Crie uma atividade para começar a organizar seus encontros.</p></div><Link href="/profissional/plataforma/agenda?novo=1" className={cn(buttonVariants({ variant: "outline", className: "mt-1 h-10 rounded-xl" }))}>Criar primeira atividade</Link></CardContent></Card>
          )}
        </section>
      </div>
    </PageTransition>
  )
}
