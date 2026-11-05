"use client"

import Link from "next/link"
import { useCallback, useEffect, useLayoutEffect, useRef, useState, useTransition } from "react"
import {
  IoAddOutline,
  IoAlertCircleOutline,
  IoArrowBackOutline,
  IoArrowForwardOutline,
  IoCalendarOutline,
  IoCheckmarkCircleOutline,
  IoCreateOutline,
  IoPeopleOutline,
  IoTimeOutline,
  IoTrashOutline,
} from "react-icons/io5"

import { cancelProfessionalActivity, loadProfessionalAgendaChunk } from "@/app/actions/activities"
import { ProfessionalActivitySheet } from "@/components/ehfi/professional-activity-sheet"
import { ProfessionalParticipantList } from "@/components/ehfi/professional-participant-list"
import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import type { ProfessionalActivity } from "@/lib/activities/professional-queries"
import { addCalendarDays, formatSaoPauloDate, formatSaoPauloTime, getSaoPauloDateKey, getSaoPauloWeek, getWeekdayLabel } from "@/lib/activities/dates"
import { cn } from "@/lib/utils"

type AgendaFilter = "all" | "available" | "last" | "full" | "cancelled"

const filters: { id: AgendaFilter; label: string }[] = [
  { id: "all", label: "Todas" },
  { id: "available", label: "Abertas" },
  { id: "last", label: "Últimas vagas" },
  { id: "full", label: "Lotadas" },
  { id: "cancelled", label: "Canceladas" },
]

function getAvailability(activity: ProfessionalActivity) {
  if (activity.status !== "published") return activity.status === "cancelled" ? "Cancelada" : activity.status === "completed" ? "Concluída" : "Rascunho"
  const remaining = activity.capacity - activity.reserved_count
  if (remaining <= 0) return "Lotada"
  return remaining <= 3 ? `Últimas ${remaining} vagas` : `${remaining} vagas abertas`
}

function matchesFilter(activity: ProfessionalActivity, filter: AgendaFilter) {
  const remaining = activity.capacity - activity.reserved_count
  if (filter === "all") return true
  if (filter === "cancelled") return activity.status === "cancelled"
  if (activity.status !== "published") return false
  if (filter === "full") return remaining <= 0
  if (filter === "last") return remaining > 0 && remaining <= 3
  return remaining > 3
}

function dateKeysInRange(from: string, toExclusive: string) {
  const days: string[] = []
  for (let day = from; day < toExclusive; day = addCalendarDays(day, 1)) {
    days.push(day)
  }
  return days
}

function mergeActivities(current: ProfessionalActivity[], incoming: ProfessionalActivity[]) {
  const byId = new Map(current.map((activity) => [activity.activity_id, activity]))
  incoming.forEach((activity) => byId.set(activity.activity_id, activity))
  return Array.from(byId.values()).sort((left, right) => left.starts_at.localeCompare(right.starts_at))
}

function ActivityCard({
  activity,
  onEdit,
  onParticipants,
  onCancel,
  cancelPending,
}: {
  activity: ProfessionalActivity
  onEdit: () => void
  onParticipants: () => void
  onCancel: () => void
  cancelPending: boolean
}) {
  const cancelled = activity.status === "cancelled"
  const finished = activity.status === "completed"
  const status = getAvailability(activity)
  return (
    <Card className={cn("overflow-visible rounded-[1.45rem] border-border/70 bg-card/80 shadow-[0_14px_45px_-38px_rgba(40,25,65,0.48)]", cancelled && "opacity-75")}>
      <CardContent className="gap-4 px-4 py-4 sm:flex-row sm:items-center sm:gap-5 sm:px-5">
        <div className="flex w-full shrink-0 items-center gap-3 sm:w-24 sm:flex-col sm:items-start sm:gap-1 sm:border-r sm:border-border/60 sm:pr-4">
          <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary sm:hidden"><IoTimeOutline aria-hidden="true" className="size-5" /></span>
          <span className="font-heading text-lg font-semibold tabular-nums text-foreground">{formatSaoPauloTime(activity.starts_at)}</span>
          <span className="text-xs text-muted-foreground">até {formatSaoPauloTime(activity.ends_at)}</span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2"><h3 className="font-heading text-base font-semibold text-foreground">{activity.title}</h3><Badge variant={cancelled ? "destructive" : activity.status === "published" ? "secondary" : "outline"} className="h-6 rounded-full px-2.5">{status}</Badge></div>
          <p className="mt-1 line-clamp-2 text-sm leading-5 text-muted-foreground">{activity.description || activity.location}</p>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted-foreground"><span className="inline-flex items-center gap-1.5"><IoCalendarOutline aria-hidden="true" className="size-3.5" />{formatSaoPauloDate(activity.starts_at, "d 'de' MMMM")}</span><span className="inline-flex items-center gap-1.5"><IoPeopleOutline aria-hidden="true" className="size-3.5" />{activity.reserved_count} de {activity.capacity} reservas</span><span>{activity.location}</span></div>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-1 border-t border-border/60 pt-3 sm:border-0 sm:pt-0">
          {(activity.reserved_count > 0 || cancelled) && <Button type="button" variant="ghost" size="sm" onClick={onParticipants} className="h-9 rounded-lg px-2.5 text-muted-foreground"><IoPeopleOutline aria-hidden="true" />Participantes</Button>}
          {!cancelled && !finished && <Button type="button" variant="ghost" size="icon" aria-label="Editar atividade" title="Editar atividade" onClick={onEdit} className="size-9 rounded-lg text-muted-foreground"><IoCreateOutline aria-hidden="true" /></Button>}
          {!cancelled && !finished && <Button type="button" variant="ghost" size="icon" aria-label={activity.status === "draft" ? "Cancelar rascunho" : "Cancelar atividade"} title={activity.status === "draft" ? "Cancelar rascunho" : "Cancelar atividade"} onClick={onCancel} disabled={cancelPending} className="size-9 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive"><IoTrashOutline aria-hidden="true" /></Button>}
        </div>
      </CardContent>
    </Card>
  )
}

export function ProfessionalAgenda({
  activities: initialActivities,
  loadedFrom: initialLoadedFrom,
  loadedTo: initialLoadedTo,
  initialSelectedDay,
  initialCreateOpen,
  initialActivityId,
  profilePublished,
}: {
  activities: ProfessionalActivity[]
  loadedFrom: string
  loadedTo: string
  initialSelectedDay: string
  initialCreateOpen: boolean
  initialActivityId: string | null
  profilePublished: boolean
}) {
  const [selectedDay, setSelectedDay] = useState(initialSelectedDay)
  const [filter, setFilter] = useState<AgendaFilter>("all")
  const [activities, setActivities] = useState(initialActivities)
  const [dayKeys, setDayKeys] = useState(() => dateKeysInRange(initialLoadedFrom, initialLoadedTo))
  const [loadedFrom, setLoadedFrom] = useState(initialLoadedFrom)
  const [loadedTo, setLoadedTo] = useState(initialLoadedTo)
  const initialActivity = initialActivities.find((activity) => activity.activity_id === initialActivityId) ?? null
  const [sheetOpen, setSheetOpen] = useState(initialCreateOpen || Boolean(initialActivity))
  const [editing, setEditing] = useState<ProfessionalActivity | null>(initialActivity)
  const [rosterActivity, setRosterActivity] = useState<ProfessionalActivity | null>(null)
  const [rosterOpen, setRosterOpen] = useState(false)
  const [notice, setNotice] = useState<{ message: string; ok: boolean } | null>(null)
  const [rangeError, setRangeError] = useState("")
  const [cancelPending, startCancel] = useTransition()
  const dayRailRef = useRef<HTMLDivElement>(null)
  const previousSentinelRef = useRef<HTMLDivElement>(null)
  const nextSentinelRef = useRef<HTMLDivElement>(null)
  const selectedDayButtonRef = useRef<HTMLButtonElement>(null)
  const requestedChunksRef = useRef(new Set<string>())
  const pendingPrependAdjustmentRef = useRef<{ scrollLeft: number; scrollWidth: number } | null>(null)
  const today = getSaoPauloDateKey()
  const selectedWeek = getSaoPauloWeek(selectedDay)
  const titleRange = `${formatSaoPauloDate(`${selectedWeek.startDate}T12:00:00-03:00`, "d 'de' MMMM")} – ${formatSaoPauloDate(`${addCalendarDays(selectedWeek.startDate, 6)}T12:00:00-03:00`, "d 'de' MMMM")}`
  const days = dayKeys
  const selectedActivities = activities.filter((activity) => getSaoPauloDateKey(activity.starts_at) === selectedDay)
  const visibleActivities = selectedActivities.filter((activity) => matchesFilter(activity, filter))
  const previousWeek = addCalendarDays(selectedWeek.startDate, -7)
  const nextWeek = addCalendarDays(selectedWeek.startDate, 7)

  useEffect(() => {
    setActivities((current) => mergeActivities(current, initialActivities))
  }, [initialActivities])

  const refreshSavedActivity = useCallback(async (_activityId: string, startsAt: string) => {
    const weekStart = getSaoPauloWeek(getSaoPauloDateKey(startsAt)).startDate
    try {
      const result = await loadProfessionalAgendaChunk(weekStart)
      if (!result.ok) {
        setRangeError(result.message)
        return
      }

      setActivities((current) => mergeActivities(current, result.data))
    } catch {
      setRangeError("A atividade foi salva, mas a agenda não pôde ser atualizada agora.")
    }
  }, [])

  useLayoutEffect(() => {
    const rail = dayRailRef.current
    const selectedButton = selectedDayButtonRef.current
    if (!rail || !selectedButton) return

    const targetLeft = selectedButton.offsetLeft - (rail.clientWidth - selectedButton.offsetWidth) / 2
    rail.scrollLeft = Math.max(0, Math.min(rail.scrollWidth - rail.clientWidth, targetLeft))
  }, [])

  useLayoutEffect(() => {
    const adjustment = pendingPrependAdjustmentRef.current
    const rail = dayRailRef.current
    if (!adjustment || !rail) return

    rail.scrollLeft = adjustment.scrollLeft + (rail.scrollWidth - adjustment.scrollWidth)
    pendingPrependAdjustmentRef.current = null
  }, [loadedFrom])

  const requestAdjacentChunk = useCallback(async (direction: "previous" | "next") => {
    const startDate = direction === "previous" ? addCalendarDays(loadedFrom, -7) : loadedTo
    const requestKey = `${direction}:${startDate}`
    if (requestedChunksRef.current.has(requestKey)) return

    requestedChunksRef.current.add(requestKey)
    try {
      const result = await loadProfessionalAgendaChunk(startDate)
      if (!result.ok) throw new Error(result.message)

      setRangeError("")
      setActivities((current) => mergeActivities(current, result.data))
      if (direction === "previous") {
        const rail = dayRailRef.current
        if (rail) {
          pendingPrependAdjustmentRef.current = { scrollLeft: rail.scrollLeft, scrollWidth: rail.scrollWidth }
        }
        setDayKeys((current) => [...dateKeysInRange(startDate, loadedFrom), ...current])
        setLoadedFrom(startDate)
      } else {
        const endDate = addCalendarDays(startDate, 7)
        setDayKeys((current) => [...current, ...dateKeysInRange(startDate, endDate)])
        setLoadedTo(endDate)
      }
    } catch (error) {
      requestedChunksRef.current.delete(requestKey)
      if (direction === "previous") pendingPrependAdjustmentRef.current = null
      setRangeError(error instanceof Error ? error.message : "Não foi possível carregar mais dias da agenda.")
    }
  }, [loadedFrom, loadedTo])

  useEffect(() => {
    const rail = dayRailRef.current
    const previousSentinel = previousSentinelRef.current
    const nextSentinel = nextSentinelRef.current
    if (!rail || !previousSentinel || !nextSentinel || typeof IntersectionObserver !== "function") return

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return
        if (entry.target === previousSentinel) void requestAdjacentChunk("previous")
        if (entry.target === nextSentinel) void requestAdjacentChunk("next")
      })
    }, { root: rail, rootMargin: "0px 200% 0px 200%", threshold: 0 })

    observer.observe(previousSentinel)
    observer.observe(nextSentinel)
    return () => observer.disconnect()
  }, [requestAdjacentChunk])

  function handleCancel(activity: ProfessionalActivity) {
    const action = activity.status === "draft" ? "cancelar este rascunho" : "cancelar esta atividade"
    const consequence = activity.status === "draft"
      ? "Ele ficará no histórico de atividades canceladas."
      : activity.reserved_count > 0
        ? "As reservas serão encerradas e a atividade deixará de aparecer para novos alunos."
        : "Esta ação não pode ser desfeita."
    if (!window.confirm(`Deseja ${action}? ${consequence}`)) return
    startCancel(async () => {
      const result = await cancelProfessionalActivity(activity.activity_id)
      if (result.ok) {
        setActivities((current) => current.map((item) => item.activity_id === activity.activity_id
          ? { ...item, status: "cancelled" }
          : item))
      }
      setNotice({ message: result.message ?? (result.ok ? "Atividade cancelada." : "Não foi possível cancelar a atividade."), ok: result.ok })
    })
  }

  return (
    <div className="space-y-5 pb-10">
      <section className="flex flex-col gap-4 rounded-[1.8rem] border border-border/65 bg-card/65 px-5 py-5 shadow-[0_20px_70px_-50px_rgba(42,25,68,0.35)] backdrop-blur-xl sm:flex-row sm:items-end sm:justify-between sm:px-7 sm:py-6">
        <div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-ehfi-secondary">Organize seus encontros</p><h1 className="mt-1 font-heading text-3xl font-semibold tracking-[-0.04em] text-foreground">Agenda</h1><p className="mt-1 text-sm text-muted-foreground">{titleRange} · horários de Brasília</p></div>
        <Button type="button" onClick={() => { setEditing(null); setSheetOpen(true) }} className="h-11 w-full rounded-xl px-4 font-semibold sm:w-auto"><IoAddOutline aria-hidden="true" className="size-5" /> Nova atividade</Button>
      </section>

      <Card className="rounded-[1.6rem] border-border/65 bg-card/75 shadow-sm">
        <CardContent className="gap-5 px-4 py-4 sm:px-6 sm:py-5">
          <div className="flex items-center justify-between gap-3">
            <Link href={`?week=${previousWeek}`} aria-label="Semana anterior" className={buttonVariants({ variant: "outline", size: "icon", className: "size-10 rounded-xl" })}><IoArrowBackOutline aria-hidden="true" /></Link>
            <p className="font-heading text-sm font-semibold capitalize text-foreground sm:text-base">{titleRange}</p>
            <Link href={`?week=${nextWeek}`} aria-label="Próxima semana" className={buttonVariants({ variant: "outline", size: "icon", className: "size-10 rounded-xl" })}><IoArrowForwardOutline aria-hidden="true" /></Link>
          </div>
          <div
            ref={dayRailRef}
            role="group"
            aria-label="Dias da agenda"
            tabIndex={0}
            onKeyDown={(event) => {
              if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return
              const rail = event.currentTarget
              const buttons = Array.from(rail.querySelectorAll<HTMLButtonElement>("button[data-agenda-day]"))
              const currentIndex = buttons.indexOf(document.activeElement as HTMLButtonElement)
              if (currentIndex < 0) return

              const nextIndex = currentIndex + (event.key === "ArrowRight" ? 1 : -1)
              const nextButton = buttons[nextIndex]
              if (!nextButton) {
                if (event.key === "ArrowRight") void requestAdjacentChunk("next")
                if (event.key === "ArrowLeft") void requestAdjacentChunk("previous")
                return
              }

              event.preventDefault()
              nextButton.focus()
              const nextDay = nextButton.dataset.agendaDay
              if (nextDay) setSelectedDay(nextDay)
            }}
            onScroll={(event) => {
              const rail = event.currentTarget
              if (rail.scrollLeft < rail.clientWidth * 2) void requestAdjacentChunk("previous")
              if (rail.scrollWidth - rail.clientWidth - rail.scrollLeft < rail.clientWidth * 2) void requestAdjacentChunk("next")
            }}
            className="relative scrollbar-none flex snap-x snap-mandatory gap-2 overflow-x-auto overscroll-x-contain scroll-px-1 pb-1 focus-visible:rounded-xl focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40"
          >
            <div ref={previousSentinelRef} aria-hidden="true" className="w-px shrink-0" />
            {days.map((day) => {
              const selected = selectedDay === day
              const count = activities.filter((activity) => getSaoPauloDateKey(activity.starts_at) === day && activity.status !== "cancelled").length
              return <button key={day} ref={selected ? selectedDayButtonRef : undefined} data-agenda-day={day} type="button" onClick={() => setSelectedDay(day)} aria-pressed={selected} className={cn("flex min-w-0 shrink-0 basis-[calc((100%_-_2rem)/5)] snap-start flex-col items-center gap-1 rounded-xl border px-1 py-2.5 transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40 sm:basis-[calc((100%_-_3rem)/7)] sm:gap-1.5 sm:rounded-2xl sm:py-3", selected ? "border-primary/20 bg-primary text-primary-foreground shadow-md shadow-primary/15" : "border-transparent bg-background/50 text-muted-foreground hover:border-border hover:text-foreground")}><span className="text-[0.6rem] font-semibold uppercase sm:text-xs">{getWeekdayLabel(day)}</span><span className="font-heading text-base font-semibold tabular-nums sm:text-lg">{Number(day.slice(-2))}</span><span className={cn("h-1 w-1 rounded-full", count ? selected ? "bg-primary-foreground" : "bg-primary" : "bg-transparent")} aria-hidden="true" /></button>
            })}
            <div ref={nextSentinelRef} aria-hidden="true" className="w-px shrink-0" />
          </div>
        </CardContent>
      </Card>

      {rangeError && <p role="alert" className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">{rangeError}</p>}

      <div role="group" aria-label="Filtrar atividades" className="flex flex-wrap gap-2">
        {filters.map(({ id, label }) => {
          const count = selectedActivities.filter((activity) => matchesFilter(activity, id)).length
          return <button key={id} type="button" onClick={() => setFilter(id)} aria-pressed={filter === id} className={cn("inline-flex h-9 shrink-0 items-center gap-2 rounded-full border px-3.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40", filter === id ? "border-primary/20 bg-primary text-primary-foreground" : "border-border/65 bg-card/65 text-muted-foreground hover:bg-card hover:text-foreground")}>{label}<span className={cn("text-[0.68rem] tabular-nums", filter === id ? "text-primary-foreground/80" : "text-muted-foreground/70")}>{count}</span></button>
        })}
      </div>

      {notice && <p role={notice.ok ? "status" : "alert"} className={cn("flex items-start gap-2 rounded-xl px-4 py-3 text-sm", notice.ok ? "border border-primary/10 bg-primary/[0.045] text-foreground" : "bg-destructive/10 text-destructive")}>{notice.ok ? <IoCheckmarkCircleOutline aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-primary" /> : <IoAlertCircleOutline aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-destructive" />}{notice.message}</p>}
      {cancelPending && <p role="status" className="sr-only">Cancelando atividade…</p>}

      <section className="space-y-3" aria-live="polite">
        <div className="flex items-end justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">{selectedDay === today ? "Hoje" : getWeekdayLabel(selectedDay, "EEEE")}</p><h2 className="mt-1 font-heading text-xl font-semibold capitalize text-foreground">{formatSaoPauloDate(`${selectedDay}T12:00:00-03:00`, "d 'de' MMMM")}</h2></div><span className="text-xs font-medium text-muted-foreground">{visibleActivities.length} {visibleActivities.length === 1 ? "atividade" : "atividades"}</span></div>
        {visibleActivities.length ? <div className="space-y-3">{visibleActivities.map((activity) => <ActivityCard key={activity.activity_id} activity={activity} cancelPending={cancelPending} onEdit={() => { setEditing(activity); setSheetOpen(true) }} onParticipants={() => { setRosterActivity(activity); setRosterOpen(true) }} onCancel={() => handleCancel(activity)} />)}</div> : <Card className="rounded-[1.6rem] border-dashed border-border bg-card/50 shadow-none"><CardContent className="items-center gap-3 px-6 py-10 text-center"><span className="flex size-12 items-center justify-center rounded-2xl bg-secondary text-ehfi-secondary"><IoCalendarOutline aria-hidden="true" className="size-6" /></span><div><p className="font-heading text-base font-semibold text-foreground">{selectedActivities.length ? "Nada neste filtro" : "Nenhuma atividade neste dia"}</p><p className="mt-1 max-w-sm text-sm leading-5 text-muted-foreground">{selectedActivities.length ? "Escolha outro filtro para ver suas atividades." : "Escolha outro dia ou crie uma nova sessão para sua agenda."}</p></div><Button type="button" variant="outline" onClick={() => { setEditing(null); setSheetOpen(true) }} className="mt-1 h-10 rounded-xl">Criar atividade</Button></CardContent></Card>}
      </section>

      <ProfessionalActivitySheet key={`${editing?.activity_id ?? "new"}-${sheetOpen ? "open" : "closed"}`} open={sheetOpen} onOpenChange={setSheetOpen} activity={editing} today={today} profilePublished={profilePublished} onSaved={refreshSavedActivity} />
      <ProfessionalParticipantList activity={rosterActivity} open={rosterOpen} onOpenChange={setRosterOpen} />
    </div>
  )
}
