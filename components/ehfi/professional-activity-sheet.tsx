"use client"

import { useActionState, useEffect } from "react"
import { IoCalendarOutline, IoLocationOutline, IoPeopleOutline, IoPricetagOutline, IoTimeOutline } from "react-icons/io5"

import { saveProfessionalActivity } from "@/app/actions/activities"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { saoPauloInputParts } from "@/lib/activities/dates"
import type { PlatformActionResult } from "@/lib/activities/types"
import type { ProfessionalActivity } from "@/lib/activities/professional-queries"

const initialState: PlatformActionResult<{ activityId: string }> = {
  ok: true,
  data: { activityId: "" },
}

function FieldError({ children }: { children?: string }) {
  return children ? <span className="text-xs font-normal text-destructive">{children}</span> : null
}

export function ProfessionalActivitySheet({
  open,
  onOpenChange,
  activity,
  today,
  profilePublished,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  activity: ProfessionalActivity | null
  today: string
  profilePublished: boolean
}) {
  const [state, formAction, pending] = useActionState(saveProfessionalActivity, initialState)
  const errors = state.ok ? {} : state.fieldErrors ?? {}
  const activityDate = activity ? saoPauloInputParts(activity.starts_at) : null
  const duration = activity
    ? Math.max(15, Math.round((new Date(activity.ends_at).getTime() - new Date(activity.starts_at).getTime()) / 60_000))
    : 60
  const scheduleLocked = Boolean(activity && activity.reserved_count > 0)
  const canPublish = profilePublished || activity?.status === "published"

  useEffect(() => {
    if (open && state.ok && state.message) onOpenChange(false)
  }, [open, onOpenChange, state])

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full gap-0 overflow-hidden border-border/70 bg-card sm:max-w-[42rem]" key={`${activity?.activity_id ?? "nova"}-${open ? "aberta" : "fechada"}`}>
        <SheetHeader className="shrink-0 border-b border-border/70 px-5 py-5 pr-14 sm:px-7">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ehfi-secondary">Agenda profissional</p>
          <SheetTitle className="mt-1 font-heading text-xl font-semibold">{activity ? "Editar atividade" : "Nova atividade"}</SheetTitle>
          <SheetDescription className="text-sm leading-5">Organize os detalhes da sua sessão. O preço é informativo e não há cobrança pela plataforma.</SheetDescription>
        </SheetHeader>
        <form action={formAction} className="flex min-h-0 flex-1 flex-col">
          {activity && <input type="hidden" name="activity_id" value={activity.activity_id} />}
          <div className="min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain px-5 py-5 sm:px-7 sm:py-6">
            {scheduleLocked && <p className="rounded-xl border border-amber-500/20 bg-amber-500/[0.07] px-3.5 py-3 text-xs leading-5 text-foreground">Esta sessão tem reservas ativas. Data, horário, local e capacidade ficam protegidos; você ainda pode ajustar título, descrição e preço.</p>}
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2 text-sm font-medium">Data <Input name="date" type="date" min={today} defaultValue={activityDate?.date ?? today} readOnly={scheduleLocked} required className="h-12 rounded-xl bg-background/60 px-3" />{errors.date && <FieldError>{errors.date}</FieldError>}</label>
              <label className="grid gap-2 text-sm font-medium">Horário de início <Input name="start_time" type="time" defaultValue={activityDate?.time ?? "09:00"} readOnly={scheduleLocked} required className="h-12 rounded-xl bg-background/60 px-3" />{errors.start_time && <FieldError>{errors.start_time}</FieldError>}</label>
            </div>
            <label className="grid gap-2 text-sm font-medium">Nome da atividade <Input name="title" minLength={3} maxLength={100} defaultValue={activity?.title ?? ""} required placeholder="Ex.: Funcional ao ar livre" className="h-12 rounded-xl bg-background/60 px-3" />{errors.title && <FieldError>{errors.title}</FieldError>}</label>
            <label className="grid gap-2 text-sm font-medium"><span className="inline-flex items-center gap-2"><IoLocationOutline aria-hidden="true" className="size-4 text-muted-foreground" />Local</span><Input name="location" minLength={2} maxLength={160} defaultValue={activity?.location ?? ""} readOnly={scheduleLocked} required placeholder="Parque, estúdio ou endereço" className="h-12 rounded-xl bg-background/60 px-3" />{errors.location && <FieldError>{errors.location}</FieldError>}</label>
            <div className="grid gap-4 sm:grid-cols-3">
              <label className="grid gap-2 text-sm font-medium"><span className="inline-flex items-center gap-2"><IoTimeOutline aria-hidden="true" className="size-4 text-muted-foreground" />Duração</span><select name="duration_minutes" defaultValue={duration} disabled={scheduleLocked} className="h-12 rounded-xl border border-input bg-background/60 px-3 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/40">{![30, 45, 60, 90, 120, 180, 240, 360, 720].includes(duration) && <option value={duration}>{duration} min</option>}<option value="30">30 min</option><option value="45">45 min</option><option value="60">1 hora</option><option value="90">1h 30</option><option value="120">2 horas</option><option value="180">3 horas</option><option value="240">4 horas</option><option value="360">6 horas</option><option value="720">12 horas</option></select>{scheduleLocked && <input type="hidden" name="duration_minutes" value={duration} />}{errors.duration_minutes && <FieldError>{errors.duration_minutes}</FieldError>}</label>
              <label className="grid gap-2 text-sm font-medium"><span className="inline-flex items-center gap-2"><IoPricetagOutline aria-hidden="true" className="size-4 text-muted-foreground" />Preço</span><Input name="price" type="text" inputMode="decimal" defaultValue={activity ? (activity.price_cents / 100).toFixed(2).replace(".", ",") : "0,00"} required placeholder="0,00" className="h-12 rounded-xl bg-background/60 px-3" />{errors.price && <FieldError>{errors.price}</FieldError>}</label>
              <label className="grid gap-2 text-sm font-medium"><span className="inline-flex items-center gap-2"><IoPeopleOutline aria-hidden="true" className="size-4 text-muted-foreground" />Vagas</span><Input name="capacity" type="number" min={1} max={500} defaultValue={activity?.capacity ?? 8} readOnly={scheduleLocked} required className="h-12 rounded-xl bg-background/60 px-3" />{errors.capacity && <FieldError>{errors.capacity}</FieldError>}</label>
            </div>
            <label className="grid gap-2 text-sm font-medium">Observações <Textarea name="description" maxLength={1200} defaultValue={activity?.description ?? ""} placeholder="Nível, materiais ou recomendações para os participantes." className="min-h-28 rounded-xl bg-background/60 px-3 py-3" />{errors.description && <FieldError>{errors.description}</FieldError>}</label>
            <p className="flex items-start gap-2 rounded-xl bg-secondary/70 px-3.5 py-3 text-xs leading-5 text-secondary-foreground"><IoCalendarOutline aria-hidden="true" className="mt-0.5 size-4 shrink-0" />Os horários usam o fuso de Brasília (America/Sao_Paulo). Atividades com conflito de agenda não podem ser publicadas.</p>
            {!profilePublished && activity?.status === "published" && <p className="rounded-xl bg-amber-500/[0.08] px-3.5 py-3 text-xs leading-5 text-foreground">Seu perfil está oculto. Esta atividade continuará fora da descoberta, mas você pode salvar ajustes sem reabrir reservas.</p>}
            {!profilePublished && !activity?.status && <p className="rounded-xl bg-secondary/60 px-3.5 py-3 text-xs leading-5 text-secondary-foreground">Publique seu perfil antes de abrir uma nova atividade para reservas.</p>}
            {state.message && <p role={state.ok ? "status" : "alert"} className={state.ok ? "rounded-xl bg-primary/8 px-3.5 py-3 text-sm" : "rounded-xl bg-destructive/10 px-3.5 py-3 text-sm text-destructive"}>{state.message}</p>}
          </div>
          <SheetFooter className="shrink-0 flex-col-reverse border-t border-border/70 bg-card px-5 py-4 pb-[max(env(safe-area-inset-bottom),1rem)] sm:flex-row sm:justify-end sm:px-7">
            <Button type="submit" name="status" value="draft" variant="outline" disabled={pending || scheduleLocked} className="h-11 w-full rounded-xl sm:w-auto">Salvar rascunho</Button>
            <Button type="submit" name="status" value="published" disabled={pending || !canPublish} className="h-11 w-full rounded-xl px-5 font-semibold sm:w-auto"><IoCalendarOutline aria-hidden="true" />{pending ? "Salvando…" : activity?.status === "published" ? "Salvar alterações" : "Publicar atividade"}</Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
