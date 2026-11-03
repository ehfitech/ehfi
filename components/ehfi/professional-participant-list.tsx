"use client"

import { useEffect, useState } from "react"
import { IoPeopleOutline, IoShieldCheckmarkOutline } from "react-icons/io5"

import { loadProfessionalActivityParticipants } from "@/app/actions/activities"
import { Card, CardContent } from "@/components/ui/card"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { formatSaoPauloDateTime } from "@/lib/activities/dates"
import type { ProfessionalParticipant } from "@/lib/activities/types"
import type { ProfessionalActivity } from "@/lib/activities/professional-queries"

export function ProfessionalParticipantList({
  activity,
  open,
  onOpenChange,
}: {
  activity: ProfessionalActivity | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [participants, setParticipants] = useState<ProfessionalParticipant[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!open || !activity) return
    let active = true
    setLoading(true)
    setError("")
    loadProfessionalActivityParticipants(activity.activity_id).then((result) => {
      if (!active) return
      if (result.ok) setParticipants(result.data)
      else setError(result.message)
      setLoading(false)
    }).catch(() => {
      if (!active) return
      setError("Não foi possível carregar os participantes. Tente novamente.")
      setLoading(false)
    })
    return () => { active = false }
  }, [activity, open])

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full gap-0 border-border/70 bg-card sm:max-w-md">
        <SheetHeader className="border-b border-border/70 px-5 py-5 pr-14 text-left sm:px-6">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ehfi-secondary">Lista privada</p>
          <SheetTitle className="mt-1 line-clamp-2 font-heading text-lg font-semibold">{activity?.title ?? "Participantes"}</SheetTitle>
          <SheetDescription>{activity ? formatSaoPauloDateTime(activity.starts_at) : "Participantes com reserva ativa"}</SheetDescription>
        </SheetHeader>
        <div className="flex-1 space-y-4 overflow-y-auto p-5 sm:p-6">
          <p className="flex items-start gap-2 rounded-xl bg-secondary/65 p-3 text-xs leading-5 text-secondary-foreground"><IoShieldCheckmarkOutline aria-hidden="true" className="mt-0.5 size-4 shrink-0" />Por privacidade, você vê apenas o primeiro nome e a inicial do sobrenome. Contatos e informações de saúde não são compartilhados.</p>
          {loading && <div role="status" className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">Carregando participantes…</div>}
          {error && <div role="alert" className="rounded-2xl bg-destructive/10 p-4 text-sm text-destructive">{error}</div>}
          {!loading && !error && participants.length === 0 && <Card className="rounded-2xl border-dashed bg-background/45 shadow-none"><CardContent className="items-center px-5 py-9 text-center"><span className="flex size-11 items-center justify-center rounded-2xl bg-secondary text-ehfi-secondary"><IoPeopleOutline aria-hidden="true" className="size-5" /></span><p className="mt-3 font-medium text-foreground">Ainda sem reservas</p><p className="mt-1 text-xs leading-5 text-muted-foreground">Quando um aluno reservar, ele aparecerá nesta lista.</p></CardContent></Card>}
          {!loading && participants.length > 0 && <ul className="space-y-2">{participants.map((participant) => <li key={participant.booking_id} className="flex items-center justify-between rounded-2xl border border-border/65 bg-background/55 px-4 py-3"><span className="flex min-w-0 items-center gap-3"><span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/10 to-ehfi-secondary/15 font-heading text-sm font-semibold text-ehfi-secondary">{participant.first_name.slice(0, 1).toLocaleUpperCase("pt-BR")}{participant.surname_initial ?? ""}</span><span className="truncate text-sm font-medium text-foreground">{participant.first_name}{participant.surname_initial ? ` ${participant.surname_initial}.` : ""}</span></span><span className="text-xs text-muted-foreground">{participant.status === "reserved" ? "Reservado" : "Reserva encerrada"}</span></li>)}</ul>}
        </div>
      </SheetContent>
    </Sheet>
  )
}
