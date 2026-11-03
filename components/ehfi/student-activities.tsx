"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import {
  IoCalendarOutline,
  IoCheckmarkCircleOutline,
  IoCompassOutline,
  IoLocationOutline,
  IoPersonOutline,
  IoTimeOutline,
} from "react-icons/io5"

import { Card, CardContent } from "@/components/ui/card"
import type { DiscoverableActivity, StudentBooking } from "@/lib/activities/types"
import { formatSaoPauloDateTime } from "@/lib/activities/dates"
import { cn } from "@/lib/utils"

type ActivityFilter = "all" | "available" | "last" | "full"
const activityFilters: { id: ActivityFilter; label: string }[] = [
  { id: "all", label: "Todas" },
  { id: "available", label: "Abertas" },
  { id: "last", label: "Últimas vagas" },
  { id: "full", label: "Lotadas" },
]
const money = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" })

function bookingCopy(booking: StudentBooking) {
  if (booking.activity.status === "completed") return "Concluída"
  if (booking.booking_status === "cancelled_by_professional") return "Cancelada pelo profissional"
  if (booking.booking_status === "cancelled_by_student") return "Cancelada por você"
  if (booking.booking_status === "attended") return "Concluída"
  if (booking.booking_status === "no_show") return "Não compareceu"
  if (booking.activity.status === "cancelled") return "Atividade cancelada"
  return "Vaga reservada"
}

function ActivityCard({ activity, reserved = false }: { activity: DiscoverableActivity; reserved?: boolean }) {
  const remaining = activity.places_remaining
  const availability = reserved
    ? "Vaga reservada"
    : activity.status === "cancelled"
      ? "Cancelada"
      : activity.status === "completed"
        ? "Concluída"
    : remaining <= 0
      ? "Lotada"
      : remaining <= 3
        ? `Últimas ${remaining} vagas`
        : `${remaining} vagas abertas`
  return (
    <Link href={`/aluno/plataforma/aulas/${activity.activity_id}`} className="group rounded-[1.5rem] focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40">
      <Card className="h-full rounded-[1.5rem] border-border/70 bg-card/80 transition duration-200 group-hover:-translate-y-0.5 group-hover:border-primary/20 group-hover:shadow-lg group-hover:shadow-primary/5">
        <CardContent className="gap-4 px-4 py-4 sm:px-5 sm:py-5">
          <div className="flex items-start justify-between gap-2"><span className={cn("rounded-full px-2.5 py-1 text-[0.68rem] font-semibold", reserved ? "bg-primary/8 text-primary" : activity.status === "cancelled" ? "bg-destructive/10 text-destructive" : remaining === 0 ? "bg-muted text-muted-foreground" : remaining <= 3 ? "bg-amber-500/10 text-amber-700 dark:text-amber-300" : "bg-secondary text-secondary-foreground")}>{availability}</span><span className="shrink-0 text-xs font-semibold text-foreground">{activity.price_cents ? money.format(activity.price_cents / 100) : "Gratuita"}</span></div>
          <div><h3 className="line-clamp-2 min-h-11 font-heading text-base font-semibold text-foreground">{activity.title}</h3><p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground"><IoTimeOutline aria-hidden="true" className="size-3.5" />{formatSaoPauloDateTime(activity.starts_at)}</p></div>
          <div className="space-y-1.5 border-t border-border/60 pt-3 text-xs text-muted-foreground"><span className="flex items-center gap-1.5 truncate font-medium text-foreground"><IoPersonOutline aria-hidden="true" className="size-3.5 shrink-0" />{activity.professional_display_name}</span><span className="flex items-center gap-1.5"><IoLocationOutline aria-hidden="true" className="size-3.5 shrink-0" />{activity.professional_city}, {activity.professional_state} · {activity.location}</span></div>
        </CardContent>
      </Card>
    </Link>
  )
}

export function StudentActivities({
  activities,
  bookings,
}: {
  activities: DiscoverableActivity[]
  bookings: StudentBooking[]
}) {
  const [filter, setFilter] = useState<ActivityFilter>("all")
  const activeBookingIds = useMemo(() => new Set(bookings.filter((item) => item.booking_status === "reserved").map((item) => item.activity.activity_id)), [bookings])
  const availableToDiscover = activities.filter((item) => !activeBookingIds.has(item.activity_id))
  const visibleActivities = availableToDiscover.filter((activity) => {
    if (filter === "all") return true
    if (filter === "full") return activity.places_remaining === 0
    if (filter === "last") return activity.places_remaining > 0 && activity.places_remaining <= 3
    return activity.places_remaining > 3
  })
  const now = Date.now()
  const orderedBookings = [...bookings].sort((left, right) => {
    const leftTime = new Date(left.activity.starts_at).getTime()
    const rightTime = new Date(right.activity.starts_at).getTime()
    const leftFuture = leftTime > now
    const rightFuture = rightTime > now
    if (leftFuture !== rightFuture) return leftFuture ? -1 : 1
    return leftFuture ? leftTime - rightTime : rightTime - leftTime
  })

  return (
    <div className="space-y-7 pb-10">
      <section className="relative isolate overflow-hidden rounded-[2rem] border border-white/55 bg-gradient-to-br from-primary/[0.13] via-card/85 to-ehfi-secondary/[0.12] px-5 py-6 shadow-[0_26px_85px_-50px_rgba(65,35,96,0.5)] backdrop-blur-xl sm:px-8 sm:py-8">
        <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-32 -z-10 size-72 rounded-full bg-primary/10 blur-3xl" />
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ehfi-secondary">Escolha seu próximo movimento</p>
        <h1 className="mt-2 font-heading text-3xl font-semibold tracking-[-0.04em] text-foreground sm:text-4xl">Atividades e jornada</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">Consulte sessões publicadas, conheça a apresentação do profissional e reserve a vaga que combina com sua rotina.</p>
      </section>

      <section id="reservas" className="scroll-mt-24 space-y-4">
        <div className="flex items-end justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-ehfi-secondary">Seus compromissos</p><h2 className="mt-1 font-heading text-xl font-semibold text-foreground">Minha jornada</h2></div><span className="text-xs text-muted-foreground">{orderedBookings.length} {orderedBookings.length === 1 ? "registro" : "registros"}</span></div>
        {orderedBookings.length ? <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{orderedBookings.map((booking) => <div key={booking.booking_id} className="space-y-2"><ActivityCard activity={booking.activity} reserved={booking.booking_status === "reserved"} /><div className={cn("flex items-start gap-2 rounded-xl px-3.5 py-2.5 text-xs leading-5", booking.booking_status === "cancelled_by_professional" || booking.activity.status === "cancelled" ? "bg-destructive/8 text-destructive" : booking.activity.professional_profile_hidden ? "bg-amber-500/8 text-foreground" : "bg-muted/60 text-muted-foreground")}><IoCalendarOutline aria-hidden="true" className="mt-0.5 size-3.5 shrink-0" /><span><strong className="font-semibold">{bookingCopy(booking)}.</strong>{booking.activity.professional_profile_hidden && booking.booking_status === "reserved" ? " O perfil público está oculto; sua reserva continua válida e você pode cancelá-la até o início." : booking.cancelled_at ? ` Registro atualizado em ${new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeZone: "America/Sao_Paulo" }).format(new Date(booking.cancelled_at))}.` : ""}</span></div></div>)}</div> : <Card className="rounded-[1.5rem] border-dashed bg-card/50 shadow-none"><CardContent className="items-center gap-3 px-6 py-9 text-center"><span className="flex size-11 items-center justify-center rounded-2xl bg-secondary text-ehfi-secondary"><IoCheckmarkCircleOutline aria-hidden="true" className="size-5" /></span><div><p className="font-heading font-semibold text-foreground">Sua jornada começa com uma reserva</p><p className="mt-1 text-sm text-muted-foreground">As atividades reservadas aparecerão aqui.</p></div></CardContent></Card>}
      </section>

      <section id="descobrir" className="scroll-mt-24 space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-ehfi-secondary">Publicadas na EHFI</p><h2 className="mt-1 font-heading text-xl font-semibold text-foreground">Descobrir atividades</h2></div><div className="flex gap-2 overflow-x-auto pb-1">{activityFilters.map(({ id, label }) => <button key={id} type="button" onClick={() => setFilter(id)} aria-pressed={filter === id} className={cn("inline-flex h-9 shrink-0 items-center rounded-full border px-3.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40", filter === id ? "border-primary/20 bg-primary text-primary-foreground" : "border-border/65 bg-card/65 text-muted-foreground hover:bg-card hover:text-foreground")}>{label}<span className="ml-2 tabular-nums opacity-70">{availableToDiscover.filter((activity) => id === "all" || (id === "full" ? activity.places_remaining === 0 : id === "last" ? activity.places_remaining > 0 && activity.places_remaining <= 3 : activity.places_remaining > 3)).length}</span></button>)}</div></div>
        {visibleActivities.length ? <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{visibleActivities.map((activity) => <ActivityCard key={activity.activity_id} activity={activity} />)}</div> : <Card className="rounded-[1.5rem] border-dashed bg-card/50 shadow-none"><CardContent className="items-center gap-3 px-6 py-10 text-center"><span className="flex size-11 items-center justify-center rounded-2xl bg-secondary text-ehfi-secondary"><IoCompassOutline aria-hidden="true" className="size-5" /></span><div><p className="font-heading font-semibold text-foreground">{availableToDiscover.length ? "Nenhuma atividade neste filtro" : "Novas atividades em breve"}</p><p className="mt-1 max-w-md text-sm leading-5 text-muted-foreground">{availableToDiscover.length ? "Mude o filtro para consultar outras vagas." : "No momento não há sessões futuras publicadas. Volte em breve para descobrir novas opções."}</p></div></CardContent></Card>}
      </section>
    </div>
  )
}
