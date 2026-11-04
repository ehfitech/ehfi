"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import { motion, useInView, useReducedMotion } from "motion/react"
import {
  IoCalendarClearOutline,
  IoCheckmarkOutline,
  IoLocationOutline,
  IoSearchOutline,
  IoTimeOutline,
} from "react-icons/io5"

import { ehfiEase } from "@/lib/ehfi-motion"

const stepDuration = 3000
const tapDelay = 300

type DiscoveryStep = "search" | "results" | "schedule" | "confirmed" | "agenda"
type TapTarget =
  | "search-submit"
  | "open-schedule"
  | "select-time"
  | "confirm-booking"
  | "open-agenda"

const steps: DiscoveryStep[] = [
  "search",
  "results",
  "schedule",
  "confirmed",
  "agenda",
]

const tapSchedule: Record<DiscoveryStep, [number, TapTarget][]> = {
  search: [[tapDelay, "search-submit"]],
  results: [[tapDelay, "open-schedule"]],
  schedule: [
    [tapDelay, "select-time"],
    [tapDelay + 900, "confirm-booking"],
  ],
  confirmed: [[tapDelay, "open-agenda"]],
  agenda: [],
}

function StudentIllustration() {
  return (
    <div
      aria-hidden="true"
      className="absolute bottom-0 left-[-3%] z-0 h-[98%] w-[72%]"
    >
      <Image
        src="/images/ehfi-student-searcher.png"
        alt=""
        fill
        sizes="(max-width: 640px) 72vw, 390px"
        className="pointer-events-none object-contain object-bottom select-none"
      />
    </div>
  )
}
function TapHighlight({
  active,
  compact = false,
}: {
  active: boolean
  compact?: boolean
}) {
  if (!active) return null

  return (
    <span
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-10 grid place-items-center"
    >
      <motion.span
        initial={{ opacity: 0, scale: 0.45 }}
        animate={{ opacity: [0.95, 0.45, 0], scale: [0.45, 1.2, 1.65] }}
        transition={{ duration: 0.72, ease: ehfiEase }}
        className={`flex ${compact ? "size-3 border" : "size-6 border-2"} items-center justify-center rounded-full border-white bg-primary/90 shadow-[0_0_0_2px_rgba(91,46,255,0.28)]`}
      >
        <span
          className={
            compact
              ? "size-1 rounded-full bg-primary-foreground"
              : "size-1.5 rounded-full bg-primary-foreground"
          }
        />
      </motion.span>
    </span>
  )
}

function SearchContent({ showTap }: { showTap: boolean }) {
  return (
    <>
      <div className="mt-3 rounded-xl border border-border bg-card px-2.5 py-2">
        <div className="flex items-center gap-2 text-ehfi-secondary">
          <IoSearchOutline className="size-3.5 shrink-0" />
          <span className="text-[8px] font-medium text-foreground sm:text-[9px]">
            Treino funcional coletivo
          </span>
        </div>
        <div className="mt-2 flex items-center gap-2 border-t border-border pt-2 text-muted-foreground">
          <IoLocationOutline className="size-3.5 shrink-0 text-primary" />
          <span className="text-[8px] sm:text-[9px]">
            Campinas · perto de você
          </span>
        </div>
      </div>
      <div className="mt-auto pt-3">
        <div className="relative flex h-8 items-center justify-center gap-1.5 rounded-lg bg-primary text-[8px] font-semibold text-primary-foreground sm:text-[9px]">
          {showTap ? "Buscando..." : "Buscar profissionais"}
          <IoSearchOutline className="size-3" />
          <TapHighlight active={showTap} />
        </div>
        <p className="mt-2 text-center text-[7px] text-muted-foreground sm:text-[8px]">
          {showTap ? "Buscando opções na região" : "Atividades perto de você"}
        </p>
      </div>
    </>
  )
}

function ResultsContent({ showTap }: { showTap: boolean }) {
  return (
    <>
      <div className="mt-3 flex items-center justify-between text-[8px] text-muted-foreground sm:text-[9px]">
        <span>Campinas, até 5 km</span>
        <span>3 opções</span>
      </div>
      <div className="mt-2 rounded-xl border border-border bg-card p-2.5">
        <div className="mb-2 inline-flex rounded-full bg-secondary px-2 py-1 text-[7px] font-semibold text-secondary-foreground sm:text-[8px]">
          FUNCIONAL COLETIVO
        </div>
        <div className="flex items-center gap-2">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-accent text-[9px] font-semibold text-primary">
            MC
          </div>
          <div className="min-w-0">
            <p className="truncate text-[9px] font-semibold text-foreground sm:text-[10px]">
              Prof. Camila
            </p>
            <p className="mt-0.5 text-[7px] text-muted-foreground sm:text-[8px]">
              Educação física · 1,2 km
            </p>
          </div>
        </div>
        <div className="mt-2 flex items-center gap-1.5 rounded-lg bg-muted px-2 py-1.5 text-[7px] text-foreground/80 sm:text-[8px]">
          <IoCalendarClearOutline className="size-3 text-primary" />
          Próxima turma · sábado, 9h30
        </div>
        <div className="relative mt-2 flex h-7 items-center justify-center rounded-lg bg-primary text-[8px] font-semibold text-primary-foreground sm:text-[9px]">
          {showTap ? "Horários disponíveis" : "Ver horários"}
          <TapHighlight active={showTap} />
        </div>
      </div>
      <p className="mt-auto pt-2 text-center text-[7px] text-muted-foreground sm:text-[8px]">
        Profissional perto da sua região
      </p>
    </>
  )
}

function ScheduleContent({
  hasSelectedTime,
  showTimeTap,
  showConfirmTap,
}: {
  hasSelectedTime: boolean
  showTimeTap: boolean
  showConfirmTap: boolean
}) {
  return (
    <>
      <div className="mt-3 rounded-xl border border-border bg-card p-2.5">
        <div className="flex items-center gap-2">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-accent text-[9px] font-semibold text-primary">
            MC
          </div>
          <div>
            <p className="text-[9px] font-semibold text-foreground sm:text-[10px]">
              Camila Souza
            </p>
            <p className="text-[7px] text-muted-foreground sm:text-[8px]">
              Treino funcional coletivo
            </p>
          </div>
        </div>
        <p className="mt-3 text-[8px] font-semibold text-foreground/80 sm:text-[9px]">
          Próximos horários
        </p>
        <div className="mt-2 grid grid-cols-3 gap-1.5">
          <span className="rounded-lg border border-border px-1 py-2 text-center text-[7px] text-muted-foreground">
            TER · 18h
          </span>
          <span
            className={`relative rounded-lg border px-1 py-2 text-center text-[7px] ${hasSelectedTime ? "border-primary bg-accent font-semibold text-primary" : "border-border text-muted-foreground"}`}
          >
            SÁB · 9h30
            <TapHighlight active={showTimeTap} />
          </span>
          <span className="rounded-lg border border-border px-1 py-2 text-center text-[7px] text-muted-foreground">
            SÁB · 11h
          </span>
        </div>
      </div>
      <div className="relative mt-auto flex h-8 items-center justify-center gap-1.5 rounded-lg bg-primary text-[8px] font-semibold text-primary-foreground sm:text-[9px]">
        {showConfirmTap ? (
          <IoCheckmarkOutline className="size-3" />
        ) : (
          <IoCalendarClearOutline className="size-3" />
        )}
        {showConfirmTap ? "Aula marcada" : "Confirmar aula"}
        <TapHighlight active={showConfirmTap} />
      </div>
    </>
  )
}

function ConfirmedContent({ showAgendaTap }: { showAgendaTap: boolean }) {
  return (
    <div className="my-auto rounded-xl border border-[#D8EFE3] bg-[#F2FBF5] p-3 text-center dark:border-[#264A35] dark:bg-[#13231A]">
      <div className="mx-auto flex size-8 items-center justify-center rounded-full bg-[#D8EFE3] text-[#167A4A] dark:bg-[#1B3928] dark:text-[#9AD6AF]">
        <IoCheckmarkOutline className="size-4" />
      </div>
      <p className="mt-2 text-[10px] font-semibold text-[#236444] sm:text-[11px] dark:text-[#B7E4C8]">
        Aula marcada!
      </p>
      <p className="mt-1 text-[8px] leading-4 text-[#527360] sm:text-[9px] dark:text-[#A1C2AD]">
        Sábado, às 9h30
        <br />
        com Camila Souza
      </p>
      <div className="mt-3 flex items-center justify-center gap-1 text-[7px] text-[#527360] sm:text-[8px] dark:text-[#A1C2AD]">
        <IoCalendarClearOutline className="size-3" />
        {showAgendaTap ? "Abrindo sua agenda..." : "Adicionada à sua agenda"}
      </div>
    </div>
  )
}

function AgendaContent() {
  return (
    <>
      <div className="mt-3 flex items-center justify-between rounded-lg bg-secondary px-2.5 py-2">
        <div>
          <p className="text-[7px] font-semibold tracking-[0.08em] text-secondary-foreground uppercase">
            Próxima aula
          </p>
          <p className="mt-0.5 text-[9px] font-semibold text-foreground sm:text-[10px]">
            Sábado · 9h30
          </p>
        </div>
        <IoCalendarClearOutline className="size-4 text-ehfi-secondary" />
      </div>
      <div className="mt-2 rounded-xl border border-border bg-card p-2.5">
        <div className="flex items-start justify-between gap-1">
          <span className="rounded-full bg-[#E7F5EC] px-2 py-1 text-[7px] font-semibold text-[#26764B] dark:bg-[#183425] dark:text-[#9AD6AF]">
            CONFIRMADA
          </span>
          <IoTimeOutline className="mt-0.5 size-3.5 text-primary" />
        </div>
        <p className="mt-2 text-[9px] leading-4 font-semibold text-foreground sm:text-[10px]">
          Treino funcional coletivo
        </p>
        <p className="mt-1 text-[7px] text-muted-foreground sm:text-[8px]">
          Com Prof. Camila Souza
        </p>
        <div className="mt-2 flex items-center gap-1 text-[7px] text-muted-foreground sm:text-[8px]">
          <IoLocationOutline className="size-3 text-primary" />
          Parque Taquaral · Campinas
        </div>
      </div>
      <p className="mt-auto pt-2 text-center text-[7px] text-muted-foreground sm:text-[8px]">
        Sua aula já está na agenda
      </p>
    </>
  )
}

const screenCopy: Record<DiscoveryStep, { eyebrow: string; title: string }> = {
  search: { eyebrow: "DESCUBRA", title: "Encontre sua aula" },
  results: { eyebrow: "PERTO DE VOCÊ", title: "Atividades na região" },
  schedule: { eyebrow: "ESCOLHA", title: "Marque seu horário" },
  confirmed: { eyebrow: "RESERVA", title: "Tudo certo" },
  agenda: { eyebrow: "SUA ROTINA", title: "Minha agenda" },
}

function ScreenStep({
  step,
  active,
  reducedMotion,
  tapTarget,
}: {
  step: DiscoveryStep
  active: boolean
  reducedMotion: boolean
  tapTarget: TapTarget | null
}) {
  const copy = screenCopy[step]

  return (
    <motion.div
      key={step}
      initial={false}
      animate={{ opacity: active ? 1 : 0, y: active ? 0 : 3 }}
      transition={{ duration: reducedMotion ? 0 : 0.2, ease: ehfiEase }}
      aria-hidden={!active}
      style={{ pointerEvents: active ? "auto" : "none" }}
      className="absolute inset-0 flex min-h-0 flex-col"
    >
      <p className="text-[7px] font-bold tracking-[0.12em] text-ehfi-secondary sm:text-[8px]">
        {copy.eyebrow}
      </p>
      <h3 className="mt-1 text-[11px] leading-tight font-semibold tracking-tight text-foreground sm:text-xs">
        {copy.title}
      </h3>

      {step === "search" && (
        <SearchContent showTap={tapTarget === "search-submit"} />
      )}
      {step === "results" && (
        <ResultsContent showTap={tapTarget === "open-schedule"} />
      )}
      {step === "schedule" && (
        <ScheduleContent
          hasSelectedTime={
            tapTarget === "select-time" || tapTarget === "confirm-booking"
          }
          showTimeTap={tapTarget === "select-time"}
          showConfirmTap={tapTarget === "confirm-booking"}
        />
      )}
      {step === "confirmed" && (
        <ConfirmedContent showAgendaTap={tapTarget === "open-agenda"} />
      )}
      {step === "agenda" && <AgendaContent />}
    </motion.div>
  )
}

export function ActivityDiscoveryVisual() {
  const sceneRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(sceneRef, { amount: 0.2 })
  const prefersReducedMotion = Boolean(useReducedMotion())
  const [activeIndex, setActiveIndex] = useState(0)
  const [tapTarget, setTapTarget] = useState<TapTarget | null>(null)
  const activeStep: DiscoveryStep = prefersReducedMotion
    ? "agenda"
    : (steps[activeIndex] ?? "search")
  const activeTab =
    activeStep === "agenda" ||
    (activeStep === "confirmed" && tapTarget === "open-agenda")
      ? "agenda"
      : "explore"

  useEffect(() => {
    if (prefersReducedMotion || !isInView) return

    let stepTimeout: ReturnType<typeof setTimeout>
    let tapTimeouts: ReturnType<typeof setTimeout>[] = []

    const showStep = (index: number) => {
      const step = steps[index] ?? "search"
      setActiveIndex(index)
      setTapTarget(null)
      tapTimeouts.forEach(clearTimeout)
      tapTimeouts = (tapSchedule[step] ?? []).map(([delay, target]) =>
        setTimeout(() => setTapTarget(target), delay)
      )
      stepTimeout = setTimeout(
        () => showStep((index + 1) % steps.length),
        stepDuration
      )
    }

    showStep(0)
    return () => {
      clearTimeout(stepTimeout)
      tapTimeouts.forEach(clearTimeout)
    }
  }, [isInView, prefersReducedMotion])

  return (
    <div className="mx-auto w-full max-w-[34rem]">
      <div
        role="img"
        ref={sceneRef}
        aria-label="Demonstração: uma aluna busca treino funcional coletivo perto dela, escolhe um horário e vê a aula confirmada na agenda do celular."
        className="relative isolate min-h-[24rem] overflow-hidden rounded-[2rem] border border-border/70 bg-secondary/40 shadow-[0_28px_74px_-46px_rgba(38,24,64,0.38)] sm:aspect-[1.08] sm:min-h-0 sm:rounded-[2.25rem]"
      >
        <div
          aria-hidden="true"
          className="absolute inset-x-[7%] bottom-[8%] h-px bg-border"
        />

        <StudentIllustration />

        <div className="absolute top-1/2 right-[3%] z-10 w-[46%] max-w-[15rem] -translate-y-1/2 rounded-[2rem] border-[5px] border-[#282431] bg-[#282431] p-1.5 shadow-[0_22px_40px_-20px_rgba(25,20,38,0.45)] sm:right-[5%] sm:rounded-[2.2rem] sm:border-[6px] sm:p-2">
          <div className="relative flex aspect-[0.49] flex-col overflow-hidden rounded-[1.48rem] bg-background px-2.5 pt-7 pb-2 sm:rounded-[1.65rem] sm:px-3.5 sm:pt-8 sm:pb-2.5">
            <div
              aria-hidden="true"
              className="absolute top-2 left-1/2 h-[0.28rem] w-[3.3rem] -translate-x-1/2 rounded-full bg-[#282431]"
            />
            <div className="mb-2 flex items-center justify-between border-b border-border pb-2">
              <span className="inline-flex items-center gap-1.5">
                <Image
                  src="/pwa/icon-192.png"
                  alt=""
                  width={24}
                  height={24}
                  className="size-[1.125rem] rounded-md object-cover"
                />
                <span className="text-[9px] font-bold tracking-[0.12em] text-foreground sm:text-[10px]">
                  EHFI
                </span>
              </span>
              <span className="flex items-center gap-1 text-[7px] text-muted-foreground sm:text-[8px]">
                <span className="size-1.5 rounded-full bg-[#36A269]" />
                aluna
              </span>
            </div>

            <div className="relative min-h-0 flex-1">
              {steps.map((step) => (
                <ScreenStep
                  key={step}
                  step={step}
                  active={step === activeStep}
                  reducedMotion={prefersReducedMotion}
                  tapTarget={step === activeStep ? tapTarget : null}
                />
              ))}
            </div>

            <div className="mt-2 flex items-center justify-around border-t border-border pt-2 text-[6px] text-muted-foreground sm:text-[7px]">
              <span
                className={`relative rounded px-2 ${activeTab === "explore" ? "font-semibold text-ehfi-secondary" : ""}`}
              >
                Explorar
              </span>
              <span className="relative rounded px-2">Salvos</span>
              <span
                className={`relative rounded px-2 ${activeTab === "agenda" ? "font-semibold text-ehfi-secondary" : ""}`}
              >
                <span className="relative z-20">Agenda</span>
                <TapHighlight active={tapTarget === "open-agenda"} compact />
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
