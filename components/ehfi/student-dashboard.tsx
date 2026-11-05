import Link from "next/link"
import { IoArrowForwardOutline, IoCalendarClearOutline, IoCompassOutline, IoLocationOutline, IoTimeOutline } from "react-icons/io5"

import { PageTransition } from "@/components/ehfi/page-transition"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import type { StudentDashboardData } from "@/lib/activities/student-queries"
import { formatSaoPauloDateTime } from "@/lib/activities/dates"
import { cn } from "@/lib/utils"

const money = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" })

function BookingCard({ title, startsAt, location, professional, places, reserved, priceCents, href }: {
  title: string
  startsAt: string
  location: string
  professional: string
  places: number
  reserved: boolean
  priceCents: number
  href: string
}) {
  return (
    <Link href={href} className="group rounded-[1.4rem] focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40">
      <Card className="h-full rounded-[1.4rem] border-border/65 bg-card/80 transition duration-200 group-hover:-translate-y-0.5 group-hover:border-primary/20 group-hover:shadow-lg group-hover:shadow-primary/5">
        <CardContent className="gap-4 px-4 py-4">
          <div className="flex items-start justify-between gap-3"><span className={reserved ? "rounded-full bg-primary/8 px-2.5 py-1 text-[0.68rem] font-semibold text-primary" : "rounded-full bg-secondary px-2.5 py-1 text-[0.68rem] font-semibold text-secondary-foreground"}>{reserved ? "Vaga reservada" : places > 0 ? `${places} vagas abertas` : "Lotada"}</span><span className="text-xs font-semibold text-foreground">{priceCents ? money.format(priceCents / 100) : "Gratuita"}</span></div>
          <div><h3 className="line-clamp-2 min-h-11 font-heading text-base font-semibold text-foreground">{title}</h3><p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground"><IoTimeOutline aria-hidden="true" className="size-3.5" />{formatSaoPauloDateTime(startsAt)}</p></div>
          <div className="flex flex-col gap-1 border-t border-border/60 pt-3 text-xs text-muted-foreground"><span className="truncate font-medium text-foreground">{professional}</span><span className="inline-flex items-center gap-1.5"><IoLocationOutline aria-hidden="true" className="size-3.5" />{location}</span></div>
        </CardContent>
      </Card>
    </Link>
  )
}

export function StudentDashboard({ data }: { data: StudentDashboardData }) {
  return (
    <PageTransition>
      <div className="space-y-6 pb-10 sm:space-y-7">
        <section className="relative isolate overflow-hidden rounded-[2rem] border border-border/70 bg-gradient-to-br from-primary/[0.13] via-card/85 to-ehfi-secondary/[0.12] px-5 py-6 shadow-[0_26px_85px_-50px_rgba(65,35,96,0.5)] backdrop-blur-xl sm:px-8 sm:py-8">
          <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-32 -z-10 size-72 rounded-full bg-primary/10 blur-3xl" />
          <div aria-hidden="true" className="pointer-events-none absolute -bottom-40 left-[35%] -z-10 size-80 rounded-full bg-ehfi-secondary/10 blur-3xl" />
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ehfi-secondary">Sua jornada de movimento</p>
          <div className="mt-2 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div><h1 className="font-heading text-3xl font-semibold tracking-[-0.04em] text-foreground sm:text-[2.65rem]">Olá, {data.firstName}</h1><p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">Encontre atividades que combinam com você e acompanhe os próximos passos da sua rotina.</p></div>
            <Link href="/aluno/plataforma/aulas" className={buttonVariants({ className: "h-12 w-full rounded-xl px-5 font-semibold shadow-md shadow-primary/15 sm:w-auto" })}><IoCompassOutline aria-hidden="true" className="size-4" /> Explorar atividades</Link>
          </div>
        </section>

        <section className="space-y-4" id="proximas-reservas">
          <div className="flex items-end justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-ehfi-secondary">Sua agenda</p><h2 className="mt-1 font-heading text-xl font-semibold tracking-tight text-foreground">Próximas reservas</h2></div><Link href="/aluno/plataforma/aulas#reservas" className="inline-flex min-h-10 items-center gap-1 rounded-xl px-3 text-sm font-medium text-primary hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40">Minha jornada <IoArrowForwardOutline aria-hidden="true" className="size-4" /></Link></div>
          {data.upcomingBookings.length ? (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{data.upcomingBookings.map((booking) => <BookingCard key={booking.booking_id} title={booking.activity.title} startsAt={booking.activity.starts_at} location={booking.activity.location} professional={booking.activity.professional_display_name} places={booking.activity.places_remaining} reserved priceCents={booking.activity.price_cents} href={`/aluno/plataforma/aulas/${booking.activity.activity_id}`} />)}</div>
          ) : (
            <Card className="rounded-[1.6rem] border-dashed border-border bg-card/55 shadow-none"><CardContent className="items-center gap-3 px-6 py-10 text-center"><span className="flex size-12 items-center justify-center rounded-2xl bg-secondary text-ehfi-secondary"><IoCalendarClearOutline aria-hidden="true" className="size-6" /></span><div><p className="font-heading text-base font-semibold text-foreground">Ainda sem atividade reservada</p><p className="mt-1 max-w-sm text-sm leading-5 text-muted-foreground">Explore as próximas sessões e reserve uma vaga para começar sua jornada.</p></div><Link href="/aluno/plataforma/aulas" className={cn(buttonVariants({ variant: "outline", className: "mt-1 h-10 rounded-xl" }))}>Encontrar uma atividade</Link></CardContent></Card>
          )}
        </section>

        {data.nextActivities.length > 0 && <section className="space-y-4"><div className="flex items-end justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Para conhecer</p><h2 className="mt-1 font-heading text-xl font-semibold text-foreground">Próximas atividades</h2></div><Link href="/aluno/plataforma/aulas" className="inline-flex min-h-10 items-center gap-1 rounded-xl px-3 text-sm font-medium text-primary hover:bg-primary/5">Ver todas <IoArrowForwardOutline aria-hidden="true" className="size-4" /></Link></div><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{data.nextActivities.map((activity) => <BookingCard key={activity.activity_id} title={activity.title} startsAt={activity.starts_at} location={activity.location} professional={activity.professional_display_name} places={activity.places_remaining} reserved={false} priceCents={activity.price_cents} href={`/aluno/plataforma/aulas/${activity.activity_id}`} />)}</div></section>}
      </div>
    </PageTransition>
  )
}
