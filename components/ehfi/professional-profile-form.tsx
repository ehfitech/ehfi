"use client"

import { useActionState, useState } from "react"
import {
  IoEyeOffOutline,
  IoEyeOutline,
  IoLocationOutline,
  IoShieldCheckmarkOutline,
} from "react-icons/io5"

import { saveProfessionalPublicProfile } from "@/app/actions/professional-profile"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import type { ProfessionalPublicProfile } from "@/lib/activities/types"
import type { PlatformActionResult } from "@/lib/activities/types"

const initialState: PlatformActionResult<null> = { ok: true, data: null }
type ProfileFormValues = {
  displayName: string
  state: string
  city: string
  bio: string
  specialties: string
  isPublished: boolean
}

function displayInitials(value: string) {
  return value.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toLocaleUpperCase("pt-BR") || "EH"
}

export function ProfessionalProfileForm({
  profile,
  credentialsInReview,
}: {
  profile: ProfessionalPublicProfile | null
  credentialsInReview: boolean
}) {
  const [state, formAction, pending] = useActionState(saveProfessionalPublicProfile, initialState)
  const [values, setValues] = useState<ProfileFormValues>(() => ({
    displayName: profile?.display_name ?? "",
    state: profile?.state ?? "",
    city: profile?.city ?? "",
    bio: profile?.bio ?? "",
    specialties: profile?.specialties.join("\n") ?? "",
    isPublished: profile?.is_published ?? false,
  }))
  const fieldErrors = state.ok ? undefined : state.fieldErrors
  const currentName = values.displayName || "Seu nome público"
  const previewSpecialties = values.specialties.split(/[\n,;]/).map((item) => item.trim()).filter(Boolean).slice(0, 4)

  function update<K extends keyof ProfileFormValues>(field: K, value: ProfileFormValues[K]) {
    setValues((current) => ({ ...current, [field]: value }))
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1.35fr)_minmax(17rem,0.65fr)]">
      <Card className="rounded-[1.7rem] border-border/70 bg-card/80 shadow-[0_22px_70px_-45px_rgba(42,25,68,0.42)] backdrop-blur-xl">
        <CardHeader className="px-5 pt-6 sm:px-7 sm:pt-7">
          <CardTitle className="font-heading text-lg font-semibold">Apresentação pública</CardTitle>
          <p className="text-sm leading-6 text-muted-foreground">Escolha com cuidado o que alunos podem conhecer sobre seu trabalho. Seus dados de cadastro e documentos continuam privados.</p>
        </CardHeader>
        <CardContent className="px-5 pb-6 sm:px-7 sm:pb-7">
          {credentialsInReview && (
            <div className="mb-5 flex gap-3 rounded-2xl border border-amber-500/20 bg-amber-500/[0.07] p-4 text-sm leading-5 text-foreground">
              <IoShieldCheckmarkOutline aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-amber-600 dark:text-amber-400" />
              <span><strong className="font-semibold">Credenciais em análise.</strong> Você já pode publicar seu perfil e suas atividades. A EHFI não apresentará suas credenciais como verificadas enquanto a análise estiver pendente.</span>
            </div>
          )}

          <form action={formAction} className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_7rem]">
              <label className="grid gap-2 text-sm font-medium text-foreground">
                Nome de apresentação
                <Input name="display_name" required minLength={2} maxLength={80} value={values.displayName} onChange={(event) => update("displayName", event.target.value)} aria-invalid={Boolean(fieldErrors?.display_name)} className="h-12 rounded-xl bg-background/60 px-3" />
                {fieldErrors?.display_name && <span className="text-xs font-normal text-destructive">{fieldErrors.display_name}</span>}
              </label>
              <label className="grid gap-2 text-sm font-medium text-foreground">
                Estado
                <Input name="state" required minLength={2} maxLength={2} value={values.state} onChange={(event) => update("state", event.target.value.toUpperCase())} placeholder="SP" aria-invalid={Boolean(fieldErrors?.state)} className="h-12 rounded-xl bg-background/60 px-3 uppercase" />
                {fieldErrors?.state && <span className="text-xs font-normal text-destructive">{fieldErrors.state}</span>}
              </label>
            </div>
            <label className="grid gap-2 text-sm font-medium text-foreground">
              Cidade
              <Input name="city" required minLength={2} maxLength={80} value={values.city} onChange={(event) => update("city", event.target.value)} placeholder="Ex.: Campinas" aria-invalid={Boolean(fieldErrors?.city)} className="h-12 rounded-xl bg-background/60 px-3" />
              {fieldErrors?.city && <span className="text-xs font-normal text-destructive">{fieldErrors.city}</span>}
            </label>
            <label className="grid gap-2 text-sm font-medium text-foreground">
              Sobre seu trabalho
              <Textarea name="bio" maxLength={600} value={values.bio} onChange={(event) => update("bio", event.target.value)} placeholder="Conte em poucas linhas como você orienta seus alunos." aria-invalid={Boolean(fieldErrors?.bio)} className="min-h-28 rounded-xl bg-background/60 px-3 py-3" />
              <span className="text-xs font-normal text-muted-foreground">Até 600 caracteres. Não inclua telefone, e-mail ou informações sensíveis.</span>
              {fieldErrors?.bio && <span className="text-xs font-normal text-destructive">{fieldErrors.bio}</span>}
            </label>
            <label className="grid gap-2 text-sm font-medium text-foreground">
              Especialidades e modalidades
              <Textarea name="specialties" value={values.specialties} onChange={(event) => update("specialties", event.target.value)} placeholder={"Uma por linha, por exemplo:\nTreinamento funcional\nCorrida para iniciantes"} aria-invalid={Boolean(fieldErrors?.specialties)} className="min-h-24 rounded-xl bg-background/60 px-3 py-3" />
              <span className="text-xs font-normal text-muted-foreground">Até 12 itens. Separe cada um por linha ou vírgula.</span>
              {fieldErrors?.specialties && <span className="text-xs font-normal text-destructive">{fieldErrors.specialties}</span>}
            </label>

            <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-border/70 bg-background/45 p-4">
              <input type="checkbox" name="is_published" value="true" checked={values.isPublished} onChange={(event) => update("isPublished", event.target.checked)} className="mt-0.5 size-4 accent-primary" />
              <span>
                <span className="block text-sm font-semibold text-foreground">Deixar meu perfil visível</span>
                <span className="mt-1 block text-xs leading-5 text-muted-foreground">Quando oculto, suas atividades saem da descoberta e não recebem novas reservas. Quem já reservou continua vendo e pode cancelar.</span>
              </span>
            </label>

            {!state.ok && <p role="alert" className="rounded-xl bg-destructive/10 px-3.5 py-3 text-sm text-destructive">{state.message}</p>}
            {state.ok && state.message && <p role="status" className="rounded-xl bg-primary/8 px-3.5 py-3 text-sm text-foreground">{state.message}</p>}
            <Button type="submit" disabled={pending} className="h-12 w-full rounded-xl font-semibold sm:w-auto sm:min-w-52">
              {pending ? "Salvando perfil…" : "Salvar apresentação"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="h-fit rounded-[1.7rem] border-border/70 bg-card/75 shadow-[0_22px_70px_-48px_rgba(42,25,68,0.4)]">
        <CardHeader className="px-5 pt-6 sm:px-6">
          <CardTitle className="font-heading text-base font-semibold">Prévia do perfil</CardTitle>
          <p className="text-sm leading-5 text-muted-foreground">Veja a apresentação mudar conforme você edita os campos.</p>
        </CardHeader>
        <CardContent className="px-5 pb-6 sm:px-6">
          <div className="rounded-[1.35rem] border border-border/70 bg-background/55 p-4">
            <div className="flex items-center gap-3">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/15 to-ehfi-secondary/15 font-heading text-sm font-bold text-ehfi-secondary">{displayInitials(currentName)}</span>
              <span className="min-w-0"><span className="block truncate font-heading text-sm font-semibold text-foreground">{currentName}</span><span className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground"><IoLocationOutline aria-hidden="true" className="size-3.5" />{values.city ? `${values.city}, ${values.state}` : "Cidade e estado"}</span></span>
            </div>
            <p className="mt-4 line-clamp-4 min-h-16 text-sm leading-6 text-muted-foreground">{values.bio || "Sua apresentação profissional aparecerá aqui."}</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {previewSpecialties.length ? previewSpecialties.map((item) => <span key={item} className="rounded-full bg-secondary px-2.5 py-1 text-[0.68rem] font-medium text-secondary-foreground">{item}</span>) : <span className="rounded-full bg-muted px-2.5 py-1 text-[0.68rem] text-muted-foreground">Suas especialidades</span>}
            </div>
            {credentialsInReview && <p className="mt-4 flex items-center gap-2 border-t border-border/60 pt-3 text-xs font-medium text-amber-700 dark:text-amber-300"><IoEyeOutline aria-hidden="true" className="size-4" /> Credenciais em análise</p>}
            {!values.isPublished && <p className="mt-4 flex items-center gap-2 border-t border-border/60 pt-3 text-xs font-medium text-muted-foreground"><IoEyeOffOutline aria-hidden="true" className="size-4" /> Perfil ainda não publicado</p>}
          </div>
          <p className="mt-4 text-xs leading-5 text-muted-foreground">Nome de cadastro, documentos, CPF, telefone, e-mail e dados de saúde não aparecem nesta prévia pública.</p>
        </CardContent>
      </Card>
    </div>
  )
}
