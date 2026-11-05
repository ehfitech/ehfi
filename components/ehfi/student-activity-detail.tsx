"use client"

import Link from "next/link"
import { useState, useTransition } from "react"
import {
  IoArrowBackOutline,
  IoCalendarOutline,
  IoCheckmarkCircleOutline,
  IoLocationOutline,
  IoPeopleOutline,
  IoPersonCircleOutline,
  IoPricetagOutline,
  IoShieldCheckmarkOutline,
  IoTimeOutline,
} from "react-icons/io5"

import { cancelStudentBooking, reserveActivity } from "@/app/actions/bookings"
import { PageTransition } from "@/components/ehfi/page-transition"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { StudentActivityDetails } from "@/lib/activities/student-queries"
import { formatSaoPauloDate, formatSaoPauloTime } from "@/lib/activities/dates"
import { cn } from "@/lib/utils"

const money = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" })

function initials(name: string) {
  return name.trim().split(/\s+/).slice(0, 2).map((item) => item[0]).join("").toLocaleUpperCase("pt-BR")
}

function durationLabel(startsAt: string, endsAt: string) {
  const minutes = Math.max(0, Math.round((new Date(endsAt).getTime() - new Date(startsAt).getTime()) / 60_000))
  if (minutes < 60) return `${minutes} min`
  const hours = Math.floor(minutes / 60)
  const remainder = minutes % 60
  return remainder ? `${hours}h ${remainder}min` : `${hours}h`
}

export function StudentActivityDetail({ details }: { details: StudentActivityDetails }) {
  const { activity } = details
  const [pending, startTransition] = useTransition()
  const [notice, setNotice] = useState<{ message: string; ok: boolean } | null>(null)
  const isReserved = details.bookingStatus === "reserved"
  const activityCancelled = activity.status === "cancelled" || details.bookingStatus === "cancelled_by_professional"
  const activityCompleted = activity.status === "completed"
  const stateText = activityCancelled
    ? "Atividade cancelada"
    : activityCompleted
      ? "Atividade concluída"
    : isReserved
      ? "Sua vaga está reservada"
      : details.bookingStatus === "cancelled_by_student"
        ? "Reserva cancelada por você"
        : activity.places_remaining <= 0
          ? "Atividade lotada"
          : "Atividade disponível"

  function handleReserve() {
    startTransition(async () => {
      const result = await reserveActivity(activity.activity_id)
      setNotice({ message: result.message ?? (result.ok ? "Vaga reservada." : "Não foi possível reservar a vaga."), ok: result.ok })
    })
  }

  function handleCancel() {
    if (!details.bookingId) return
    if (!window.confirm("Deseja cancelar sua reserva? A vaga voltará a ficar disponível para outro aluno.")) return
    startTransition(async () => {
      const result = await cancelStudentBooking(details.bookingId as string)
      setNotice({ message: result.message ?? (result.ok ? "Reserva cancelada." : "Não foi possível cancelar a reserva."), ok: result.ok })
    })
  }

  return (
    <PageTransition>
      <div className="mx-auto max-w-5xl space-y-5 pb-10">
        <Link href="/aluno/plataforma/aulas#descobrir" className="inline-flex min-h-10 items-center gap-2 rounded-xl px-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-card/65 hover:text-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40"><IoArrowBackOutline aria-hidden="true" className="size-4" /> Voltar para atividades</Link>
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1.25fr)_minmax(17rem,0.75fr)]">
          <div className="space-y-5">
            <section className="relative isolate overflow-hidden rounded-[2rem] border border-border/70 bg-gradient-to-br from-primary/[0.13] via-card/85 to-ehfi-secondary/[0.12] px-5 py-6 shadow-[0_26px_85px_-50px_rgba(65,35,96,0.5)] backdrop-blur-xl sm:px-8 sm:py-8">
              <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-28 -z-10 size-72 rounded-full bg-primary/10 blur-3xl" />
              <span className={cn("inline-flex rounded-full px-3 py-1.5 text-xs font-semibold", isReserved ? "bg-primary/10 text-primary" : activity.places_remaining > 0 && !activityCancelled ? "bg-emerald-600/10 text-emerald-700 dark:text-emerald-300" : "bg-muted text-muted-foreground")}>{stateText}</span>
              <h1 className="mt-4 max-w-2xl font-heading text-3xl font-semibold tracking-[-0.04em] text-foreground sm:text-4xl">{activity.title}</h1>
              <p className="mt-3 max-w-2xl whitespace-pre-line text-sm leading-6 text-muted-foreground">{activity.description || "Uma sessão presencial para você conhecer e participar."}</p>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <div className="flex items-start gap-3 rounded-2xl border border-border/60 bg-background/45 p-3.5"><span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"><IoCalendarOutline aria-hidden="true" className="size-4" /></span><span><span className="block text-xs text-muted-foreground">Data e horário</span><span className="mt-1 block text-sm font-semibold capitalize text-foreground">{formatSaoPauloDate(activity.starts_at)} · {formatSaoPauloTime(activity.starts_at)}</span></span></div>
                <div className="flex items-start gap-3 rounded-2xl border border-border/60 bg-background/45 p-3.5"><span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-secondary text-ehfi-secondary"><IoTimeOutline aria-hidden="true" className="size-4" /></span><span><span className="block text-xs text-muted-foreground">Duração</span><span className="mt-1 block text-sm font-semibold text-foreground">{durationLabel(activity.starts_at, activity.ends_at)}</span></span></div>
                <div className="flex items-start gap-3 rounded-2xl border border-border/60 bg-background/45 p-3.5"><span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-secondary text-ehfi-secondary"><IoLocationOutline aria-hidden="true" className="size-4" /></span><span><span className="block text-xs text-muted-foreground">Local</span><span className="mt-1 block text-sm font-semibold text-foreground">{activity.location}</span><span className="mt-0.5 block text-xs text-muted-foreground">{activity.professional_city}, {activity.professional_state}</span></span></div>
                <div className="flex items-start gap-3 rounded-2xl border border-border/60 bg-background/45 p-3.5"><span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"><IoPricetagOutline aria-hidden="true" className="size-4" /></span><span><span className="block text-xs text-muted-foreground">Valor informado</span><span className="mt-1 block text-sm font-semibold text-foreground">{activity.price_cents ? money.format(activity.price_cents / 100) : "Gratuita"}</span><span className="mt-0.5 block text-xs text-muted-foreground">Sem pagamento pela EHFI nesta etapa</span></span></div>
              </div>
            </section>

            <Card className="rounded-[1.7rem] border-border/70 bg-card/80 shadow-sm">
              <CardHeader className="px-5 pt-5 sm:px-6"><CardTitle className="font-heading text-base font-semibold">Sobre o profissional</CardTitle></CardHeader>
              <CardContent className="px-5 pb-5 sm:px-6 sm:pb-6">
                <div className="flex items-start gap-3.5"><span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/12 to-ehfi-secondary/15 font-heading text-sm font-semibold text-ehfi-secondary">{initials(activity.professional_display_name) || <IoPersonCircleOutline aria-hidden="true" className="size-7" />}</span><div className="min-w-0"><h2 className="font-heading font-semibold text-foreground">{activity.professional_display_name}</h2><p className="mt-1 text-xs text-muted-foreground">{activity.professional_city}, {activity.professional_state}</p></div></div>
                {activity.professional_bio && <p className="mt-4 whitespace-pre-line text-sm leading-6 text-muted-foreground">{activity.professional_bio}</p>}
                {activity.professional_specialties.length > 0 && <div className="mt-4 flex flex-wrap gap-1.5">{activity.professional_specialties.map((item) => <span key={item} className="rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground">{item}</span>)}</div>}
                {activity.credentials_in_review && <p className="mt-4 flex items-start gap-2 border-t border-border/60 pt-4 text-xs leading-5 text-amber-700 dark:text-amber-300"><IoShieldCheckmarkOutline aria-hidden="true" className="mt-0.5 size-4 shrink-0" /><span><strong className="font-semibold">Credenciais em análise.</strong> A revisão profissional ainda está em andamento.</span></p>}
              </CardContent>
            </Card>
          </div>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <Card className="rounded-[1.7rem] border-border/70 bg-card/85 shadow-[0_22px_70px_-45px_rgba(42,25,68,0.4)] backdrop-blur-xl">
              <CardHeader className="px-5 pt-5 sm:px-6"><p className="text-xs font-semibold uppercase tracking-[0.14em] text-ehfi-secondary">Sua reserva</p><CardTitle className="mt-1 font-heading text-xl font-semibold">{isReserved ? "Vaga garantida" : "Participe desta atividade"}</CardTitle></CardHeader>
              <CardContent className="px-5 pb-5 sm:px-6 sm:pb-6">
                <div className="flex items-center justify-between rounded-xl bg-background/55 px-3.5 py-3 text-sm"><span className="inline-flex items-center gap-2 text-muted-foreground"><IoPeopleOutline aria-hidden="true" className="size-4" />Vagas restantes</span><strong className="font-semibold text-foreground">{activity.places_remaining} de {activity.capacity}</strong></div>
                {activity.professional_profile_hidden && isReserved && <p className="mt-3 rounded-xl bg-amber-500/[0.08] px-3.5 py-3 text-xs leading-5 text-foreground">O perfil público do profissional está oculto. Sua reserva continua válida e você pode cancelá-la até o início.</p>}
                {activity.professional_profile_hidden && !isReserved && <p className="mt-3 rounded-xl bg-amber-500/[0.08] px-3.5 py-3 text-xs leading-5 text-foreground">O perfil público do profissional está oculto; novas reservas estão pausadas.</p>}
                {activityCancelled && <p className="mt-3 rounded-xl bg-destructive/8 px-3.5 py-3 text-xs leading-5 text-destructive">Esta atividade foi cancelada. Nenhum pagamento foi realizado pela plataforma.</p>}
                {activityCompleted && <p className="mt-3 rounded-xl bg-muted/65 px-3.5 py-3 text-xs leading-5 text-muted-foreground">Esta atividade já aconteceu. Sua reserva permanece no histórico da jornada.</p>}
                {notice && <p role={notice.ok ? "status" : "alert"} className={cn("mt-3 rounded-xl px-3.5 py-3 text-sm leading-5", notice.ok ? "bg-primary/8 text-foreground" : "bg-destructive/10 text-destructive")}>{notice.message}</p>}
                {isReserved && details.canCancel ? <Button type="button" variant="outline" onClick={handleCancel} disabled={pending} className="mt-4 h-12 w-full rounded-xl border-primary/25 font-semibold text-primary hover:bg-primary/5">{pending ? "Atualizando…" : "Cancelar reserva"}</Button> : details.canReserve ? <Button type="button" onClick={handleReserve} disabled={pending} className="mt-4 h-12 w-full rounded-xl font-semibold shadow-md shadow-primary/15">{pending ? "Reservando vaga…" : "Reservar minha vaga"}</Button> : activityCompleted ? <Button type="button" disabled className="mt-4 h-12 w-full rounded-xl">Atividade concluída</Button> : isReserved ? <p className="mt-4 rounded-xl bg-muted/65 px-3.5 py-3 text-center text-xs leading-5 text-muted-foreground">O cancelamento pela plataforma encerra no início da atividade.</p> : <Button type="button" disabled className="mt-4 h-12 w-full rounded-xl">{activityCancelled ? "Atividade encerrada" : activity.places_remaining <= 0 ? "Sem vagas disponíveis" : "Reserva indisponível"}</Button>}
                {!isReserved && !activityCancelled && details.canReserve && <p className="mt-3 text-center text-xs leading-5 text-muted-foreground">Ao reservar, sua vaga fica vinculada à sua conta EHFI. Você poderá cancelar até o início da sessão.</p>}
                <p className="mt-4 flex items-start gap-2 border-t border-border/60 pt-4 text-[0.7rem] leading-5 text-muted-foreground"><IoCheckmarkCircleOutline aria-hidden="true" className="mt-0.5 size-3.5 shrink-0 text-primary" />Sua reserva não compartilha seus dados de saúde ou informações de contato com o profissional.</p>
              </CardContent>
            </Card>
            <Link href="/aluno/plataforma/aulas#reservas" className="mt-3 inline-flex min-h-10 w-full items-center justify-center rounded-xl text-sm font-medium text-muted-foreground hover:bg-card/55 hover:text-foreground">Minha jornada</Link>
          </aside>
        </div>
      </div>
    </PageTransition>
  )
}
