"use client"

import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useRef, useState, type ChangeEvent } from "react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import {
  IoAlertCircleOutline,
  IoArrowBackOutline,
  IoArrowForwardOutline,
  IoCalendarOutline,
  IoCallOutline,
  IoCheckmarkOutline,
  IoDocumentTextOutline,
  IoEyeOffOutline,
  IoEyeOutline,
  IoFitnessOutline,
  IoHeartOutline,
  IoMailOutline,
  IoPersonOutline,
  IoShieldCheckmarkOutline,
  IoTimeOutline,
} from "react-icons/io5"

import { SignupStepper } from "@/components/ehfi/signup-stepper"
import { finalizeStudentRegistration } from "@/app/actions/registrations"
import {
  StudentChoiceGrid,
  StudentField,
  StudentIconInput,
  StudentPanel,
  StudentPasswordStrength,
  StudentSectionTitle,
  StudentTextarea,
  type StudentChoiceOption,
} from "@/components/ehfi/student-signup-fields"
import { ThemeToggle } from "@/components/ehfi/theme-toggle"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { InputGroupButton } from "@/components/ui/input-group"
import { Label } from "@/components/ui/label"
import { ehfiEase, ehfiMotion } from "@/lib/ehfi-motion"
import {
  ConditionControl,
  ExerciseModality,
  FitnessLevel,
  HealthCondition,
  HealthSymptom,
  CurrentLimitation,
  StudentGoal,
  StudentRegistrationErrors,
  StudentRegistrationField,
  StudentSignupStep,
  currentExerciseOptions,
  dailyRoutineOptions,
  exerciseRestrictionOptions,
  fitnessLevelOptions,
  formatStudentBirthDate,
  healthConditionOptions,
  healthSymptomOptions,
  initialStudentRegistration,
  injuryHistoryOptions,
  limitationOptions,
  nutritionRoutineOptions,
  pregnancyStatusOptions,
  practiceDurationOptions,
  requiresProfessionalReview,
  sleepQualityOptions,
  studentSignupSteps,
  validateStudentStep,
} from "@/lib/student-registration"
import { formatPhone, formatWithCaret } from "@/lib/professional-registration"
import { useRegistrationDraft } from "@/hooks/use-registration-draft"
import { HEALTH_DATA_CONSENT_VERSION } from "@/lib/registration-drafts/types"

const modalityOptions: readonly StudentChoiceOption<ExerciseModality>[] = [
  { value: "strength", title: "Musculação" },
  { value: "functional", title: "Treinamento funcional" },
  { value: "walking_running", title: "Caminhada ou corrida" },
  { value: "dance", title: "Dança" },
  { value: "pilates_stretching", title: "Pilates ou alongamento" },
  { value: "team_sports", title: "Esportes coletivos" },
  { value: "outdoors", title: "Exercícios ao ar livre" },
  { value: "other", title: "Outra modalidade" },
]

const goalOptions: readonly StudentChoiceOption<StudentGoal>[] = [
  { value: "health", title: "Melhorar saúde e qualidade de vida" },
  { value: "weight_loss", title: "Emagrecer ou reduzir gordura corporal" },
  { value: "muscle_gain", title: "Ganhar massa muscular" },
  { value: "strength_endurance", title: "Melhorar força e resistência" },
  { value: "mobility", title: "Melhorar mobilidade e flexibilidade" },
  { value: "pain_function", title: "Reduzir dores ou melhorar funcionalidade" },
  { value: "sports_performance", title: "Melhorar desempenho esportivo" },
  { value: "stress_wellbeing", title: "Reduzir estresse e melhorar bem-estar" },
  {
    value: "return_to_exercise",
    title: "Receber orientação para voltar a se exercitar",
  },
  { value: "other", title: "Outro objetivo" },
]

function toggleChoice<Value extends string>(
  current: readonly Value[],
  value: Value
) {
  return current.includes(value)
    ? current.filter((item) => item !== value)
    : [...current, value]
}

function toggleExclusiveChoice<Value extends string>(
  current: readonly Value[],
  value: Value,
  exclusive: Value
) {
  if (value === exclusive) return current.includes(value) ? [] : [value]
  const withoutExclusive = current.filter((item) => item !== exclusive)
  return withoutExclusive.includes(value)
    ? withoutExclusive.filter((item) => item !== value)
    : [...withoutExclusive, value]
}

function ConditionalBlock({
  show,
  children,
  duration,
}: {
  show: boolean
  children: React.ReactNode
  duration: number
}) {
  return (
    <AnimatePresence initial={false}>
      {show ? (
        <motion.div
          key="conditional-fields"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration, ease: ehfiEase }}
          className="overflow-hidden"
        >
          {children}
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}

function ReviewNotice({ error }: { error?: string }) {
  const blocked = Boolean(error)

  return (
    <div
      role={blocked ? "alert" : "status"}
      tabIndex={blocked ? -1 : undefined}
      data-student-error-focus={blocked ? "true" : undefined}
      className={
        "flex items-start gap-3 rounded-2xl border p-4 " +
        (blocked
          ? "border-destructive/30 bg-destructive/[0.035]"
          : "border-primary/20 bg-primary/[0.045]") +
        (blocked
          ? " focus:outline-none focus-visible:ring-2 focus-visible:ring-destructive/40"
          : "")
      }
    >
      <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <IoAlertCircleOutline aria-hidden="true" className="size-5" />
      </span>
      <div>
        <p className="text-sm font-semibold text-foreground">
          {blocked
            ? "Não foi possível concluir o cadastro"
            : "Revisão profissional necessária"}
        </p>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">
          Algumas respostas precisam de revisão profissional. Você pode criar
          sua conta; recursos que dependem dessa revisão ficam pendentes.
        </p>
        {error ? (
          <p className="mt-2 text-xs leading-5 text-destructive">{error}</p>
        ) : null}
      </div>
    </div>
  )
}

function ConfirmationCard({
  id,
  label,
  checked,
  onCheckedChange,
  error,
  description,
  children,
}: {
  id: string
  label: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  error?: string
  description?: string
  children?: React.ReactNode
}) {
  return (
    <div
      className={
        "rounded-2xl border p-4 " +
        (error
          ? "border-destructive/50 bg-destructive/[0.035]"
          : "border-border/70 bg-background/50")
      }
    >
      <div className="flex items-start gap-3">
        <Checkbox
          id={id}
          checked={checked}
          onCheckedChange={(value) => onCheckedChange(value === true)}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? id + "-error" : undefined}
          aria-labelledby={id + "-label"}
          className="mt-0.5 size-5 rounded-md"
        />
        <div className="min-w-0">
          <Label
            htmlFor={id}
            id={id + "-label"}
            className="cursor-pointer text-sm leading-6 text-foreground"
          >
            {label}
          </Label>
          {description ? (
            <p className="mt-2 text-xs leading-5 text-muted-foreground">
              {description}
            </p>
          ) : null}
          {children}
          {error ? (
            <p
              id={id + "-error"}
              role="alert"
              className="mt-2 text-xs leading-5 text-destructive"
            >
              {error}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  )
}

export function StudentSignup() {
  const router = useRouter()
  const prefersReducedMotion = Boolean(useReducedMotion())
  const [step, setStep] = useState<StudentSignupStep>(1)
  const [direction, setDirection] = useState<1 | -1>(1)
  const [continuedSteps, setContinuedSteps] = useState<
    ReadonlySet<StudentSignupStep>
  >(() => new Set())
  const [attemptedSteps, setAttemptedSteps] = useState<
    ReadonlySet<StudentSignupStep>
  >(() => new Set())
  const [form, setForm] = useState(initialStudentRegistration)
  const draft = useRegistrationDraft("student", form, true)
  const didRestoreDraft = useRef(false)
  const [consentPending, setConsentPending] = useState(false)
  const [consentError, setConsentError] = useState<string | null>(null)
  const [consentDeclined, setConsentDeclined] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submissionError, setSubmissionError] = useState<string | null>(null)
  const [passwordVisible, setPasswordVisible] = useState(false)
  const [passwordConfirmationVisible, setPasswordConfirmationVisible] =
    useState(false)

  useEffect(() => {
    if (draft.status === "loading" || didRestoreDraft.current) return
    didRestoreDraft.current = true
    const restored = draft.restoredPayload
    if (!restored) return
    setForm({
      ...initialStudentRegistration,
      ...restored,
      password: "",
      passwordConfirmation: "",
      healthDataConsent:
        draft.healthConsentVersion === HEALTH_DATA_CONSENT_VERSION,
    })
  }, [draft.healthConsentVersion, draft.restoredPayload, draft.status])
  const [keyboardInset, setKeyboardInset] = useState(0)
  const pendingInvalidFocusStep = useRef<StudentSignupStep | null>(null)

  useEffect(() => {
    const viewport = window.visualViewport
    if (!viewport) return

    let frame = 0
    const updateKeyboardInset = () => {
      window.cancelAnimationFrame(frame)
      frame = window.requestAnimationFrame(() => {
        const activeElement = document.activeElement
        const isEditing =
          activeElement instanceof HTMLElement &&
          (activeElement.isContentEditable ||
            activeElement.matches("input, textarea, select"))
        const coveredHeight = Math.max(
          0,
          window.innerHeight - viewport.height - viewport.offsetTop
        )
        setKeyboardInset(isEditing && coveredHeight > 80 ? coveredHeight : 0)
      })
    }

    viewport.addEventListener("resize", updateKeyboardInset)
    viewport.addEventListener("scroll", updateKeyboardInset)
    window.addEventListener("resize", updateKeyboardInset)
    document.addEventListener("focusin", updateKeyboardInset)
    document.addEventListener("focusout", updateKeyboardInset)
    updateKeyboardInset()

    return () => {
      window.cancelAnimationFrame(frame)
      viewport.removeEventListener("resize", updateKeyboardInset)
      viewport.removeEventListener("scroll", updateKeyboardInset)
      window.removeEventListener("resize", updateKeyboardInset)
      document.removeEventListener("focusin", updateKeyboardInset)
      document.removeEventListener("focusout", updateKeyboardInset)
    }
  }, [])

  const orderedSteps: readonly StudentSignupStep[] = [1, 2, 3, 4, 5, 6]
  const errorsByStep = new Map<StudentSignupStep, StudentRegistrationErrors>(
    orderedSteps.map(
      (currentStep) =>
        [currentStep, validateStudentStep(form, currentStep)] as const
    )
  )
  const completedSteps = new Set<StudentSignupStep>(
    orderedSteps.filter(
      (currentStep) =>
        Object.keys(errorsByStep.get(currentStep) ?? {}).length === 0
    )
  )
  const needsProfessionalReview = requiresProfessionalReview(form)
  const healthConsentAllowed =
    form.healthDataConsent &&
    draft.healthConsentVersion === HEALTH_DATA_CONSENT_VERSION
  const transitionDuration = prefersReducedMotion ? 0 : ehfiMotion.duration.step

  function errorFor(field: StudentRegistrationField | "professionalReview") {
    if (!attemptedSteps.has(step)) return undefined
    return errorsByStep.get(step)?.[field]
  }

  function inputState(
    field: StudentRegistrationField,
    hasHint = false,
    additionalDescriptionIds: readonly string[] = []
  ) {
    const error = errorFor(field)
    const descriptionIds = error
      ? [field + "-error", ...additionalDescriptionIds]
      : hasHint
        ? [field + "-hint", ...additionalDescriptionIds]
        : [...additionalDescriptionIds]

    return {
      "aria-invalid": error ? true : undefined,
      "aria-describedby":
        descriptionIds.length > 0 ? descriptionIds.join(" ") : undefined,
    }
  }

  function updateForm<Key extends StudentRegistrationField>(
    key: Key,
    value: (typeof form)[Key]
  ) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  function updateMasked(
    key: "birthDate" | "phone",
    event: ChangeEvent<HTMLInputElement>,
    formatter: (value: string) => string
  ) {
    const input = event.currentTarget
    const formatted = formatWithCaret(
      input.value,
      input.selectionStart,
      input.selectionEnd,
      formatter
    )
    updateForm(key, formatted.value)
    requestAnimationFrame(() => {
      input.setSelectionRange(formatted.selectionStart, formatted.selectionEnd)
    })
  }

  function toggleHealthCondition(value: HealthCondition) {
    setForm((current) => {
      const conditions = toggleExclusiveChoice(
        current.conditions,
        value,
        "none"
      )
      const stillHasCondition = conditions.some(
        (condition) => condition !== "none"
      )
      return {
        ...current,
        conditions,
        conditionControl: stillHasCondition ? current.conditionControl : "",
        otherCondition: stillHasCondition ? current.otherCondition : "",
      }
    })
  }

  function toggleSymptom(value: HealthSymptom) {
    setForm((current) => {
      const symptoms = toggleExclusiveChoice(current.symptoms, value, "none")
      const stillHasSymptoms = symptoms.some((symptom) => symptom !== "none")
      return {
        ...current,
        symptoms,
        symptomDetails: stillHasSymptoms ? current.symptomDetails : "",
      }
    })
  }

  function toggleLimitation(value: CurrentLimitation) {
    setForm((current) => {
      const limitations = toggleExclusiveChoice(
        current.limitations,
        value,
        "none"
      )
      const stillHasLimitations = limitations.some(
        (limitation) => limitation !== "none"
      )
      return {
        ...current,
        limitations,
        limitationDetails: stillHasLimitations ? current.limitationDetails : "",
      }
    })
  }

  function toggleModality(value: ExerciseModality) {
    setForm((current) => {
      const modalities = toggleChoice(current.modalities, value)
      return {
        ...current,
        modalities,
        otherModality: modalities.includes("other")
          ? current.otherModality
          : "",
      }
    })
  }

  function toggleGoal(value: StudentGoal) {
    setForm((current) => {
      const goals = toggleChoice(current.goals, value)
      return {
        ...current,
        goals,
        otherGoal: goals.includes("other") ? current.otherGoal : "",
      }
    })
  }

  function updateMedicationAnswer(value: "yes" | "no") {
    setForm((current) => ({
      ...current,
      usesMedication: value,
      medicationName: value === "yes" ? current.medicationName : "",
      medicationPurpose: value === "yes" ? current.medicationPurpose : "",
    }))
  }

  function updateInjuryHistory(value: "none" | "recovered" | "ongoing") {
    setForm((current) => ({
      ...current,
      injuryHistory: value,
      injuryDetails: value === "none" ? "" : current.injuryDetails,
    }))
  }

  function updateExerciseRestriction(value: "no" | "yes" | "unsure") {
    setForm((current) => ({
      ...current,
      exerciseRestriction: value,
      restrictionDetails: value === "yes" ? current.restrictionDetails : "",
    }))
  }

  function updatePregnancyStatus(
    value: "no" | "pregnant" | "postpartum" | "prefer_not_to_answer"
  ) {
    setForm((current) => ({
      ...current,
      pregnancyStatus: value,
      pregnancyDuration:
        value === "pregnant" || value === "postpartum"
          ? current.pregnancyDuration
          : "",
    }))
  }

  function finalizeBirthDate(value: string) {
    const birthDate = formatStudentBirthDate(value)
    setForm((current) => ({ ...current, birthDate }))
  }

  function scrollToFirstInvalidField(targetStep: StudentSignupStep) {
    requestAnimationFrame(() => {
      const firstInvalidField = document.querySelector<HTMLElement>(
        '[data-student-step="' +
          targetStep +
          '"] [aria-invalid="true"], [data-student-step="' +
          targetStep +
          '"] [data-student-error-focus="true"]'
      )
      firstInvalidField?.focus({ preventScroll: true })
      firstInvalidField?.scrollIntoView({
        behavior: prefersReducedMotion ? "auto" : "smooth",
        block: "center",
      })
    })
  }

  useEffect(() => {
    if (!prefersReducedMotion || pendingInvalidFocusStep.current !== step)
      return

    const frame = window.requestAnimationFrame(() => {
      if (pendingInvalidFocusStep.current !== step) return
      pendingInvalidFocusStep.current = null
      scrollToFirstInvalidField(step)
    })

    return () => window.cancelAnimationFrame(frame)
  }, [prefersReducedMotion, step])

  function navigateToStep(nextStep: StudentSignupStep) {
    if (nextStep > 4 && !healthConsentAllowed) {
      setConsentError("Autorize o tratamento de dados de saúde antes de continuar.")
      nextStep = 4
    }
    if (nextStep === step) return
    pendingInvalidFocusStep.current = null
    setDirection(nextStep > step ? 1 : -1)
    setStep(nextStep)
    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion ? "auto" : "smooth",
    })
  }

  function continueToNextStep() {
    if (step === 4 && !healthConsentAllowed) {
      setConsentError(
        "Autorize o tratamento de dados de saúde para continuar ou encerre o cadastro."
      )
      return
    }
    const errors = errorsByStep.get(step) ?? {}
    setAttemptedSteps((current) => new Set(current).add(step))
    if (Object.keys(errors).length > 0) {
      scrollToFirstInvalidField(step)
      return
    }

    setContinuedSteps((current) => new Set(current).add(step))
    navigateToStep((step + 1) as StudentSignupStep)
  }

  async function handleHealthConsent(accepted: boolean) {
    setConsentPending(true)
    setConsentError(null)
    setSubmissionError(null)
    try {
      await draft.recordHealthConsent(accepted)
      if (accepted) {
        updateForm("healthDataConsent", true)
        return
      }

      setForm((current) => ({
        ...current,
        conditions: [],
        otherCondition: "",
        conditionControl: "",
        usesMedication: "",
        medicationName: "",
        medicationPurpose: "",
        symptoms: [],
        symptomDetails: "",
        limitations: [],
        limitationDetails: "",
        injuryHistory: "",
        injuryDetails: "",
        exerciseRestriction: "",
        restrictionDetails: "",
        pregnancyStatus: "",
        pregnancyDuration: "",
        otherHealthInfo: "",
        healthDataConsent: false,
      }))
      await draft.clearDraft()
      setConsentDeclined(true)
    } catch {
      setConsentError("Não foi possível registrar sua escolha. Tente novamente.")
    } finally {
      setConsentPending(false)
    }
  }

  async function finishSignup() {
    pendingInvalidFocusStep.current = null
    setSubmissionError(null)
    setAttemptedSteps(new Set(orderedSteps))
    const firstInvalidStep = orderedSteps.find(
      (currentStep) =>
        Object.keys(errorsByStep.get(currentStep) ?? {}).length > 0
    )

    if (firstInvalidStep) {
      if (firstInvalidStep === step) {
        scrollToFirstInvalidField(firstInvalidStep)
      } else {
        pendingInvalidFocusStep.current = firstInvalidStep
        setDirection(firstInvalidStep > step ? 1 : -1)
        setStep(firstInvalidStep)
        window.scrollTo({
          top: 0,
          behavior: prefersReducedMotion ? "auto" : "smooth",
        })
      }
      return
    }

    setSubmitting(true)
    try {
      const result = await finalizeStudentRegistration(form)
      if (!result.ok) {
        setSubmissionError(result.message)
        if (result.code === "health_consent_required") {
          navigateToStep(4)
        }
        return
      }
      router.push(result.redirectTo, { transitionTypes: ["nav-forward"] })
    } catch {
      setSubmissionError(
        "Não foi possível concluir agora. Seus dados permanecem nesta tela; tente novamente."
      )
    } finally {
      setSubmitting(false)
    }
  }

  const fieldReveal = (key: StudentRegistrationField) => errorFor(key)
  const showCondition = form.conditions.some((value) => value !== "none")
  const showMedication = form.usesMedication === "yes"
  const showSymptoms = form.symptoms.some((value) => value !== "none")
  const showLimitations = form.limitations.some((value) => value !== "none")
  const showInjuryDetails =
    form.injuryHistory === "recovered" || form.injuryHistory === "ongoing"
  const showRestrictionDetails = form.exerciseRestriction === "yes"
  const showPregnancyDuration =
    form.pregnancyStatus === "pregnant" || form.pregnancyStatus === "postpartum"
  const showOtherModality = form.modalities.includes("other")
  const showOtherGoal = form.goals.includes("other")

  if (draft.status === "loading") {
    return (
      <main className="flex min-h-dvh items-center justify-center px-5">
        <p role="status" className="text-sm text-muted-foreground">
          Carregando seu cadastro salvo…
        </p>
      </main>
    )
  }

  return (
    <main className="relative isolate min-h-dvh overflow-clip px-4 pt-4 pb-32 sm:px-7 sm:pt-6 sm:pb-10">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-36 right-[-10rem] -z-10 size-[28rem] rounded-full bg-primary/10 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-[-16rem] left-[-12rem] -z-10 size-[32rem] rounded-full bg-ehfi-secondary/10 blur-3xl"
      />

      <header className="mx-auto flex w-full max-w-6xl items-center justify-between">
        <Link
          href="/"
          transitionTypes={["nav-back"]}
          aria-label="EHFI — início"
          className="inline-flex items-center gap-2.5 rounded-full outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <Image
            src="/pwa/icon-192.png"
            width={42}
            height={42}
            alt=""
            priority
            className="size-[2.625rem] rounded-xl border border-border/70 bg-card"
          />
          <span className="font-heading text-sm font-bold tracking-[0.16em] text-foreground">
            EHFI
          </span>
        </Link>
        <ThemeToggle />
      </header>

      <div className="mx-auto mt-6 grid w-full max-w-6xl items-start gap-6 lg:mt-10 lg:grid-cols-[minmax(15rem,0.68fr)_minmax(0,1.32fr)] lg:gap-10">
        <motion.aside
          initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: transitionDuration, ease: ehfiEase }}
          className="lg:sticky lg:top-8"
        >
          <Link
            href="/aluno/entrar"
            transitionTypes={["nav-back"]}
            className="mb-5 inline-flex h-10 items-center gap-2 rounded-xl px-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-card/55 hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/40 focus-visible:outline-none"
          >
            <IoArrowBackOutline aria-hidden="true" className="size-4" /> Voltar
            ao login
          </Link>
          <p className="text-xs font-semibold tracking-[0.16em] text-ehfi-secondary uppercase">
            Cadastro de aluno
          </p>
          <h1 className="mt-2 max-w-[16ch] font-heading text-3xl leading-[1.08] font-semibold tracking-[-0.035em] text-foreground sm:text-4xl">
            Sua saúde importa.
          </h1>
          <p className="mt-3 max-w-md text-sm leading-6 text-muted-foreground sm:text-base">
            Conte sobre sua rotina, seus objetivos e os cuidados que ajudam o
            profissional responsável a planejar uma experiência adequada para
            você.
          </p>
        </motion.aside>

        <section className="min-w-0">
          <Card className="gap-0 overflow-visible rounded-[1.8rem] border-border/60 bg-card/60 p-4 shadow-[0_24px_80px_-42px_rgba(31,22,50,0.34)] backdrop-blur-2xl sm:p-7 lg:p-8">
            <CardHeader className="gap-5 px-0 pb-5">
              <SignupStepper
                ariaLabel="Etapas do cadastro de aluno"
                steps={studentSignupSteps}
                currentStep={step}
                completedSteps={completedSteps}
                continuedSteps={continuedSteps}
                onStepSelect={navigateToStep}
              />
              <div className="flex items-center gap-3">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  {step === 1 ? (
                    <IoPersonOutline aria-hidden="true" className="size-5" />
                  ) : step === 2 ? (
                    <IoFitnessOutline aria-hidden="true" className="size-5" />
                  ) : step === 3 ? (
                    <IoTimeOutline aria-hidden="true" className="size-5" />
                  ) : step === 4 ? (
                    <IoHeartOutline aria-hidden="true" className="size-5" />
                  ) : step === 5 ? (
                    <IoShieldCheckmarkOutline
                      aria-hidden="true"
                      className="size-5"
                    />
                  ) : (
                    <IoDocumentTextOutline
                      aria-hidden="true"
                      className="size-5"
                    />
                  )}
                </span>
                <div>
                  <h2 className="font-heading text-lg font-semibold tracking-tight text-foreground sm:text-xl">
                    {studentSignupSteps[step - 1]?.label}
                  </h2>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Etapa {step} de 6
                  </p>
                </div>
              </div>
            </CardHeader>

            <form
              id="student-signup-form"
              noValidate
              onSubmit={(event) => {
                event.preventDefault()
                if (step === 6) void finishSignup()
                else continueToNextStep()
              }}
            >
              <div className="mb-4 flex justify-end text-sm">
                <Link
                  href="/aluno/entrar"
                  className="font-medium text-primary underline-offset-4 hover:underline"
                >
                  Já tem conta? Entrar
                </Link>
              </div>
              {submissionError ? (
                <p role="alert" className="mb-4 rounded-xl border border-destructive/25 bg-destructive/[0.04] p-3 text-sm text-destructive">
                  {submissionError}
                </p>
              ) : null}
              {draft.error ? (
                <p role="alert" className="mb-4 text-sm text-destructive">{draft.error}</p>
              ) : null}
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  data-student-step={step}
                  key={step}
                  initial={{
                    opacity: 0,
                    x: prefersReducedMotion
                      ? 0
                      : direction * ehfiMotion.distance.step,
                  }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{
                    opacity: 0,
                    x: prefersReducedMotion
                      ? 0
                      : direction * -ehfiMotion.distance.step,
                  }}
                  transition={{ duration: transitionDuration, ease: ehfiEase }}
                  onAnimationComplete={() => {
                    if (pendingInvalidFocusStep.current !== step) return
                    pendingInvalidFocusStep.current = null
                    scrollToFirstInvalidField(step)
                  }}
                  className="space-y-4"
                >
                  {step === 1 ? (
                    <StudentPanel>
                      <StudentSectionTitle
                        icon={
                          <IoPersonOutline
                            aria-hidden="true"
                            className="size-5"
                          />
                        }
                        title="Identificação e acesso"
                        subtitle="Crie sua conta EHFI para acessar sua área de aluno."
                      />
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="sm:col-span-2">
                          <StudentField
                            id="fullName"
                            label="Nome completo"
                            error={fieldReveal("fullName")}
                          >
                            <StudentIconInput
                              id="fullName"
                              icon={<IoPersonOutline aria-hidden="true" />}
                              autoComplete="name"
                              placeholder="Ex.: Ana Souza"
                              value={form.fullName}
                              onChange={(event) =>
                                updateForm("fullName", event.target.value)
                              }
                              {...inputState("fullName")}
                            />
                          </StudentField>
                        </div>
                        <StudentField
                          id="email"
                          label="E-mail"
                          error={fieldReveal("email")}
                        >
                          <StudentIconInput
                            id="email"
                            type="email"
                            inputMode="email"
                            icon={<IoMailOutline aria-hidden="true" />}
                            autoComplete="email"
                            placeholder="voce@email.com"
                            value={form.email}
                            onChange={(event) =>
                              updateForm("email", event.target.value)
                            }
                            {...inputState("email")}
                          />
                        </StudentField>
                        <StudentField
                          id="phone"
                          label="Telefone / WhatsApp"
                          hint="Inclua o DDD."
                          error={fieldReveal("phone")}
                        >
                          <StudentIconInput
                            id="phone"
                            type="tel"
                            inputMode="tel"
                            icon={<IoCallOutline aria-hidden="true" />}
                            autoComplete="tel"
                            placeholder="(11) 91234-5678"
                            maxLength={16}
                            value={form.phone}
                            onChange={(event) =>
                              updateMasked("phone", event, formatPhone)
                            }
                            {...inputState("phone", true)}
                          />
                        </StudentField>
                        <StudentField
                          id="password"
                          label="Senha"
                          hint="Use ao menos 8 caracteres, com maiúscula, minúscula, número e símbolo."
                          error={fieldReveal("password")}
                        >
                          <StudentIconInput
                            id="password"
                            type={passwordVisible ? "text" : "password"}
                            icon={
                              <IoShieldCheckmarkOutline aria-hidden="true" />
                            }
                            trailing={
                              <InputGroupButton
                                size="icon-sm"
                                className="size-11 rounded-xl p-0 text-muted-foreground hover:text-foreground"
                                aria-label={
                                  passwordVisible
                                    ? "Ocultar senha"
                                    : "Mostrar senha"
                                }
                                aria-pressed={passwordVisible}
                                title={
                                  passwordVisible
                                    ? "Ocultar senha"
                                    : "Mostrar senha"
                                }
                                onClick={() =>
                                  setPasswordVisible((visible) => !visible)
                                }
                              >
                                {passwordVisible ? (
                                  <IoEyeOffOutline
                                    aria-hidden="true"
                                    className="size-5"
                                  />
                                ) : (
                                  <IoEyeOutline
                                    aria-hidden="true"
                                    className="size-5"
                                  />
                                )}
                              </InputGroupButton>
                            }
                            autoComplete="new-password"
                            placeholder="Crie uma senha segura"
                            value={form.password}
                            onChange={(event) =>
                              updateForm("password", event.target.value)
                            }
                            {...inputState("password", true, [
                              "password-strength-status",
                              "password-strength-checklist",
                            ])}
                          />
                          <StudentPasswordStrength password={form.password} />
                        </StudentField>
                        <StudentField
                          id="passwordConfirmation"
                          label="Confirme sua senha"
                          error={fieldReveal("passwordConfirmation")}
                        >
                          <StudentIconInput
                            id="passwordConfirmation"
                            type={
                              passwordConfirmationVisible ? "text" : "password"
                            }
                            icon={
                              <IoShieldCheckmarkOutline aria-hidden="true" />
                            }
                            trailing={
                              <InputGroupButton
                                size="icon-sm"
                                className="size-11 rounded-xl p-0 text-muted-foreground hover:text-foreground"
                                aria-label={
                                  passwordConfirmationVisible
                                    ? "Ocultar confirmação de senha"
                                    : "Mostrar confirmação de senha"
                                }
                                aria-pressed={passwordConfirmationVisible}
                                title={
                                  passwordConfirmationVisible
                                    ? "Ocultar confirmação de senha"
                                    : "Mostrar confirmação de senha"
                                }
                                onClick={() =>
                                  setPasswordConfirmationVisible(
                                    (visible) => !visible
                                  )
                                }
                              >
                                {passwordConfirmationVisible ? (
                                  <IoEyeOffOutline
                                    aria-hidden="true"
                                    className="size-5"
                                  />
                                ) : (
                                  <IoEyeOutline
                                    aria-hidden="true"
                                    className="size-5"
                                  />
                                )}
                              </InputGroupButton>
                            }
                            autoComplete="new-password"
                            placeholder="Digite a senha novamente"
                            value={form.passwordConfirmation}
                            onChange={(event) =>
                              updateForm(
                                "passwordConfirmation",
                                event.target.value
                              )
                            }
                            {...inputState("passwordConfirmation")}
                          />
                        </StudentField>
                      </div>
                    </StudentPanel>
                  ) : step === 2 ? (
                    <StudentPanel>
                      <StudentSectionTitle
                        icon={
                          <IoFitnessOutline
                            aria-hidden="true"
                            className="size-5"
                          />
                        }
                        title="Seu perfil físico"
                        subtitle="Essas informações ajudam a contextualizar sua anamnese."
                      />
                      <div className="grid gap-4 sm:grid-cols-2">
                        <StudentField
                          id="birthDate"
                          label="Data de nascimento"
                          hint="Dia, mês e ano."
                          error={fieldReveal("birthDate")}
                        >
                          <StudentIconInput
                            id="birthDate"
                            type="text"
                            inputMode="numeric"
                            icon={<IoCalendarOutline aria-hidden="true" />}
                            autoComplete="bday"
                            placeholder="DD/MM/AAAA"
                            maxLength={10}
                            value={form.birthDate}
                            onChange={(event) =>
                              updateMasked(
                                "birthDate",
                                event,
                                formatStudentBirthDate
                              )
                            }
                            onBlur={(event) =>
                              finalizeBirthDate(event.currentTarget.value)
                            }
                            {...inputState("birthDate", true)}
                          />
                        </StudentField>
                        <StudentField
                          id="heightCm"
                          label="Altura"
                          hint="Em centímetros."
                          error={fieldReveal("heightCm")}
                        >
                          <StudentIconInput
                            id="heightCm"
                            type="number"
                            inputMode="decimal"
                            min="1"
                            max="300"
                            icon={<IoFitnessOutline aria-hidden="true" />}
                            placeholder="Ex.: 168"
                            value={form.heightCm}
                            onChange={(event) =>
                              updateForm("heightCm", event.target.value)
                            }
                            {...inputState("heightCm", true)}
                          />
                        </StudentField>
                        <StudentField
                          id="weightKg"
                          label="Peso atual"
                          hint="Opcional · em quilogramas."
                          error={fieldReveal("weightKg")}
                        >
                          <StudentIconInput
                            id="weightKg"
                            type="number"
                            inputMode="decimal"
                            min="1"
                            max="500"
                            icon={<IoFitnessOutline aria-hidden="true" />}
                            placeholder="Ex.: 65"
                            value={form.weightKg}
                            onChange={(event) =>
                              updateForm("weightKg", event.target.value)
                            }
                            {...inputState("weightKg", true)}
                          />
                        </StudentField>
                      </div>
                      <StudentChoiceGrid<FitnessLevel>
                        id="fitnessLevel"
                        label="Como você considera seu nível atual de condicionamento?"
                        error={fieldReveal("fitnessLevel")}
                        options={fitnessLevelOptions}
                        selected={form.fitnessLevel}
                        onSelect={(value) => updateForm("fitnessLevel", value)}
                      />
                    </StudentPanel>
                  ) : step === 3 ? (
                    <>
                      <StudentPanel>
                        <StudentSectionTitle
                          icon={
                            <IoFitnessOutline
                              aria-hidden="true"
                              className="size-5"
                            />
                          }
                          title="Histórico de exercício"
                          subtitle="Conte como o movimento faz parte da sua rotina."
                        />
                        <StudentChoiceGrid
                          id="currentExercise"
                          label="Você pratica exercício físico atualmente?"
                          error={fieldReveal("currentExercise")}
                          options={currentExerciseOptions}
                          selected={form.currentExercise}
                          onSelect={(value) =>
                            updateForm("currentExercise", value)
                          }
                        />
                        <StudentChoiceGrid
                          id="practiceDuration"
                          label="Há quanto tempo pratica ou praticou regularmente?"
                          error={fieldReveal("practiceDuration")}
                          options={practiceDurationOptions}
                          selected={form.practiceDuration}
                          onSelect={(value) =>
                            updateForm("practiceDuration", value)
                          }
                          columns={3}
                        />
                        <StudentChoiceGrid<ExerciseModality>
                          id="modalities"
                          label="Quais modalidades pratica ou gostaria de praticar?"
                          hint="Pode selecionar mais de uma."
                          error={fieldReveal("modalities")}
                          options={modalityOptions}
                          selected={form.modalities}
                          onSelect={toggleModality}
                        />
                        <ConditionalBlock
                          show={showOtherModality}
                          duration={transitionDuration}
                        >
                          <div className="pt-4">
                            <StudentField
                              id="otherModality"
                              label="Qual outra modalidade?"
                              error={fieldReveal("otherModality")}
                            >
                              <StudentIconInput
                                id="otherModality"
                                icon={<IoFitnessOutline aria-hidden="true" />}
                                placeholder="Descreva a modalidade"
                                value={form.otherModality}
                                onChange={(event) =>
                                  updateForm(
                                    "otherModality",
                                    event.target.value
                                  )
                                }
                                {...inputState("otherModality")}
                              />
                            </StudentField>
                          </div>
                        </ConditionalBlock>
                      </StudentPanel>

                      <StudentPanel>
                        <StudentSectionTitle
                          icon={
                            <IoTimeOutline
                              aria-hidden="true"
                              className="size-5"
                            />
                          }
                          title="Hábitos e rotina"
                          subtitle="Um retrato simples do seu dia a dia."
                        />
                        <StudentChoiceGrid
                          id="sleepQuality"
                          label="Como você avalia a qualidade do seu sono?"
                          error={fieldReveal("sleepQuality")}
                          options={sleepQualityOptions}
                          selected={form.sleepQuality}
                          onSelect={(value) =>
                            updateForm("sleepQuality", value)
                          }
                          columns={3}
                        />
                        <StudentChoiceGrid
                          id="dailyRoutine"
                          label="Como é sua rotina diária?"
                          error={fieldReveal("dailyRoutine")}
                          options={dailyRoutineOptions}
                          selected={form.dailyRoutine}
                          onSelect={(value) =>
                            updateForm("dailyRoutine", value)
                          }
                        />
                        <StudentChoiceGrid
                          id="nutritionRoutine"
                          label="Como considera sua alimentação e hidratação?"
                          error={fieldReveal("nutritionRoutine")}
                          options={nutritionRoutineOptions}
                          selected={form.nutritionRoutine}
                          onSelect={(value) =>
                            updateForm("nutritionRoutine", value)
                          }
                        />
                      </StudentPanel>
                    </>
                  ) : step === 4 ? (
                    <StudentPanel>
                      <StudentSectionTitle
                        icon={
                          <IoHeartOutline
                            aria-hidden="true"
                            className="size-5"
                          />
                        }
                        title="Histórico de saúde"
                        subtitle="Antes das perguntas, leia o aviso e escolha se autoriza o tratamento dos dados de saúde."
                      />
                      {healthConsentAllowed ? (
                        <>
                      <StudentChoiceGrid<HealthCondition>
                        id="conditions"
                        label="Você possui ou já recebeu diagnóstico de alguma condição?"
                        hint="Pode selecionar mais de uma. “Não possuo nenhuma” deve ficar sozinha."
                        error={fieldReveal("conditions")}
                        options={healthConditionOptions}
                        selected={form.conditions}
                        onSelect={toggleHealthCondition}
                      />
                      <ConditionalBlock
                        show={showCondition}
                        duration={transitionDuration}
                      >
                        <div className="space-y-4 pt-4">
                          <StudentChoiceGrid<ConditionControl>
                            id="conditionControl"
                            label="A condição está controlada?"
                            error={fieldReveal("conditionControl")}
                            options={[
                              {
                                value: "controlled",
                                title: "Sim, está controlada",
                              },
                              {
                                value: "uncontrolled",
                                title: "Não está controlada",
                              },
                              { value: "unsure", title: "Não tenho certeza" },
                            ]}
                            selected={form.conditionControl}
                            onSelect={(value) =>
                              updateForm("conditionControl", value)
                            }
                            columns={3}
                          />
                          <StudentField
                            id="otherCondition"
                            label="Se desejar, descreva qual condição possui."
                            hint="Opcional."
                            error={fieldReveal("otherCondition")}
                          >
                            <StudentTextarea
                              id="otherCondition"
                              value={form.otherCondition}
                              onChange={(value) =>
                                updateForm("otherCondition", value)
                              }
                              placeholder="Você também pode informar se ela está controlada."
                              rows={2}
                              error={fieldReveal("otherCondition")}
                              hasHint
                            />
                          </StudentField>
                        </div>
                      </ConditionalBlock>

                      <StudentChoiceGrid<"yes" | "no">
                        id="usesMedication"
                        label="Você utiliza algum medicamento regularmente?"
                        error={fieldReveal("usesMedication")}
                        options={[
                          { value: "no", title: "Não" },
                          { value: "yes", title: "Sim" },
                        ]}
                        selected={form.usesMedication}
                        onSelect={updateMedicationAnswer}
                        columns={2}
                      />
                      <ConditionalBlock
                        show={showMedication}
                        duration={transitionDuration}
                      >
                        <div className="grid gap-4 pt-4 sm:grid-cols-2">
                          <StudentField
                            id="medicationName"
                            label="Nome do medicamento"
                            error={fieldReveal("medicationName")}
                          >
                            <StudentIconInput
                              id="medicationName"
                              icon={
                                <IoDocumentTextOutline aria-hidden="true" />
                              }
                              placeholder="Nome do medicamento"
                              value={form.medicationName}
                              onChange={(event) =>
                                updateForm("medicationName", event.target.value)
                              }
                              {...inputState("medicationName")}
                            />
                          </StudentField>
                          <StudentField
                            id="medicationPurpose"
                            label="Finalidade"
                            hint="Opcional · se souber."
                            error={fieldReveal("medicationPurpose")}
                          >
                            <StudentIconInput
                              id="medicationPurpose"
                              icon={<IoHeartOutline aria-hidden="true" />}
                              placeholder="Para que utiliza"
                              value={form.medicationPurpose}
                              onChange={(event) =>
                                updateForm(
                                  "medicationPurpose",
                                  event.target.value
                                )
                              }
                              {...inputState("medicationPurpose", true)}
                            />
                          </StudentField>
                        </div>
                      </ConditionalBlock>

                      <StudentChoiceGrid<HealthSymptom>
                        id="symptoms"
                        label="Você sente ou já sentiu algum destes sintomas durante exercício ou atividades cotidianas?"
                        hint="Pode selecionar mais de um. “Nenhum desses sintomas” deve ficar sozinho."
                        error={fieldReveal("symptoms")}
                        options={healthSymptomOptions}
                        selected={form.symptoms}
                        onSelect={toggleSymptom}
                      />
                      <ConditionalBlock
                        show={showSymptoms}
                        duration={transitionDuration}
                      >
                        <div className="pt-4">
                          <StudentField
                            id="symptomDetails"
                            label="Quando acontece? Ainda ocorre atualmente?"
                            error={fieldReveal("symptomDetails")}
                          >
                            <StudentTextarea
                              id="symptomDetails"
                              value={form.symptomDetails}
                              onChange={(value) =>
                                updateForm("symptomDetails", value)
                              }
                              placeholder="Conte em que situações acontece e se ainda ocorre."
                              rows={3}
                              error={fieldReveal("symptomDetails")}
                            />
                          </StudentField>
                        </div>
                      </ConditionalBlock>
                      {needsProfessionalReview ? <ReviewNotice /> : null}
                        </>
                      ) : consentDeclined ? (
                        <div className="space-y-4 rounded-2xl border border-border/70 bg-background/50 p-5">
                          <p role="status" className="text-sm leading-6 text-muted-foreground">
                            Sem essa autorização não é possível criar uma conta de aluno. Nenhuma resposta de saúde foi coletada e o rascunho foi removido.
                          </p>
                          <Button type="button" variant="outline" className="h-11 rounded-xl" onClick={() => router.push("/")}>
                            Voltar ao início
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-4 rounded-2xl border border-primary/20 bg-primary/[0.045] p-5">
                          <div>
                            <h3 className="font-semibold text-foreground">
                              Autorização para dados de saúde
                            </h3>
                            <p className="mt-2 text-sm leading-6 text-muted-foreground">
                              Autorizo o tratamento dos meus dados de saúde para avaliação inicial, planejamento e acompanhamento da prática de exercício físico, conforme o aviso de privacidade da EHFI. Esta autorização é necessária para criar a conta de aluno.
                            </p>
                            <Link
                              href="/privacidade#cadastro-aluno"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-2 inline-block text-sm font-medium text-primary underline-offset-4 hover:underline"
                            >
                              Ler aviso de privacidade
                            </Link>
                          </div>
                          {consentError ? (
                            <p role="alert" className="text-sm text-destructive">{consentError}</p>
                          ) : null}
                          <div className="flex flex-col gap-2 sm:flex-row">
                            <Button
                              type="button"
                              disabled={consentPending}
                              className="h-11 rounded-xl"
                              onClick={() => void handleHealthConsent(true)}
                            >
                              {consentPending ? "Registrando…" : "Autorizo e continuo"}
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              disabled={consentPending}
                              className="h-11 rounded-xl"
                              onClick={() => void handleHealthConsent(false)}
                            >
                              Não autorizo
                            </Button>
                          </div>
                        </div>
                      )}
                    </StudentPanel>
                  ) : step === 5 ? (
                    <StudentPanel>
                      <StudentSectionTitle
                        icon={
                          <IoShieldCheckmarkOutline
                            aria-hidden="true"
                            className="size-5"
                          />
                        }
                        title="Cuidados e limitações"
                        subtitle="Conte o que o profissional deve considerar para orientar sua prática."
                      />
                      <StudentChoiceGrid<CurrentLimitation>
                        id="limitations"
                        label="Você possui alguma dor, lesão ou limitação física atualmente?"
                        hint="Pode selecionar mais de uma. “Não” deve ficar sozinha."
                        error={fieldReveal("limitations")}
                        options={limitationOptions}
                        selected={form.limitations}
                        onSelect={toggleLimitation}
                      />
                      <ConditionalBlock
                        show={showLimitations}
                        duration={transitionDuration}
                      >
                        <div className="pt-4">
                          <StudentField
                            id="limitationDetails"
                            label="Região afetada, há quanto tempo e quais movimentos causam desconforto"
                            error={fieldReveal("limitationDetails")}
                          >
                            <StudentTextarea
                              id="limitationDetails"
                              value={form.limitationDetails}
                              onChange={(value) =>
                                updateForm("limitationDetails", value)
                              }
                              placeholder="Ex.: joelho direito, há dois meses; agachar causa desconforto."
                              rows={3}
                              error={fieldReveal("limitationDetails")}
                            />
                          </StudentField>
                        </div>
                      </ConditionalBlock>

                      <StudentChoiceGrid
                        id="injuryHistory"
                        label="Você já passou por cirurgia ou sofreu uma lesão importante?"
                        error={fieldReveal("injuryHistory")}
                        options={injuryHistoryOptions}
                        selected={form.injuryHistory}
                        onSelect={updateInjuryHistory}
                      />
                      <ConditionalBlock
                        show={showInjuryDetails}
                        duration={transitionDuration}
                      >
                        <div className="pt-4">
                          <StudentField
                            id="injuryDetails"
                            label="Descreva brevemente"
                            error={fieldReveal("injuryDetails")}
                          >
                            <StudentTextarea
                              id="injuryDetails"
                              value={form.injuryDetails}
                              onChange={(value) =>
                                updateForm("injuryDetails", value)
                              }
                              placeholder="Conte sobre a cirurgia ou lesão e alguma limitação atual."
                              rows={3}
                              error={fieldReveal("injuryDetails")}
                            />
                          </StudentField>
                        </div>
                      </ConditionalBlock>

                      <StudentChoiceGrid
                        id="exerciseRestriction"
                        label="Algum profissional de saúde recomendou evitar ou restringir exercícios?"
                        error={fieldReveal("exerciseRestriction")}
                        options={exerciseRestrictionOptions}
                        selected={form.exerciseRestriction}
                        onSelect={updateExerciseRestriction}
                      />
                      <ConditionalBlock
                        show={showRestrictionDetails}
                        duration={transitionDuration}
                      >
                        <div className="pt-4">
                          <StudentField
                            id="restrictionDetails"
                            label="Quais restrições foram recomendadas?"
                            error={fieldReveal("restrictionDetails")}
                          >
                            <StudentTextarea
                              id="restrictionDetails"
                              value={form.restrictionDetails}
                              onChange={(value) =>
                                updateForm("restrictionDetails", value)
                              }
                              placeholder="Descreva os exercícios ou movimentos que devem ser evitados."
                              rows={3}
                              error={fieldReveal("restrictionDetails")}
                            />
                          </StudentField>
                        </div>
                      </ConditionalBlock>

                      <StudentChoiceGrid
                        id="pregnancyStatus"
                        label="Você está gestante ou no período pós-parto?"
                        error={fieldReveal("pregnancyStatus")}
                        options={pregnancyStatusOptions}
                        selected={form.pregnancyStatus}
                        onSelect={updatePregnancyStatus}
                      />
                      <ConditionalBlock
                        show={showPregnancyDuration}
                        duration={transitionDuration}
                      >
                        <div className="pt-4">
                          <StudentField
                            id="pregnancyDuration"
                            label={
                              form.pregnancyStatus === "pregnant"
                                ? "Tempo de gestação"
                                : "Tempo desde o parto"
                            }
                            error={fieldReveal("pregnancyDuration")}
                          >
                            <StudentIconInput
                              id="pregnancyDuration"
                              icon={<IoCalendarOutline aria-hidden="true" />}
                              placeholder={
                                form.pregnancyStatus === "pregnant"
                                  ? "Ex.: 20 semanas"
                                  : "Ex.: 3 meses"
                              }
                              value={form.pregnancyDuration}
                              onChange={(event) =>
                                updateForm(
                                  "pregnancyDuration",
                                  event.target.value
                                )
                              }
                              {...inputState("pregnancyDuration")}
                            />
                          </StudentField>
                        </div>
                      </ConditionalBlock>

                      <StudentField
                        id="otherHealthInfo"
                        label="Outra informação de saúde importante"
                        hint="Opcional."
                        error={fieldReveal("otherHealthInfo")}
                      >
                        <StudentTextarea
                          id="otherHealthInfo"
                          value={form.otherHealthInfo}
                          onChange={(value) =>
                            updateForm("otherHealthInfo", value)
                          }
                          placeholder="Compartilhe algo que considera importante para a prática de exercício."
                          rows={3}
                          error={fieldReveal("otherHealthInfo")}
                          hasHint
                        />
                      </StudentField>
                      {needsProfessionalReview ? <ReviewNotice /> : null}
                    </StudentPanel>
                  ) : (
                    <>
                      <StudentPanel>
                        <StudentSectionTitle
                          icon={
                            <IoHeartOutline
                              aria-hidden="true"
                              className="size-5"
                            />
                          }
                          title="Seus objetivos"
                          subtitle="O que você espera alcançar com a prática?"
                        />
                        <StudentChoiceGrid<StudentGoal>
                          id="goals"
                          label="Quais são seus principais objetivos?"
                          hint="Pode selecionar mais de um."
                          error={fieldReveal("goals")}
                          options={goalOptions}
                          selected={form.goals}
                          onSelect={toggleGoal}
                        />
                        <ConditionalBlock
                          show={showOtherGoal}
                          duration={transitionDuration}
                        >
                          <div className="pt-4">
                            <StudentField
                              id="otherGoal"
                              label="Qual outro objetivo?"
                              error={fieldReveal("otherGoal")}
                            >
                              <StudentIconInput
                                id="otherGoal"
                                icon={<IoHeartOutline aria-hidden="true" />}
                                placeholder="Descreva seu objetivo"
                                value={form.otherGoal}
                                onChange={(event) =>
                                  updateForm("otherGoal", event.target.value)
                                }
                                {...inputState("otherGoal")}
                              />
                            </StudentField>
                          </div>
                        </ConditionalBlock>
                        <StudentField
                          id="experienceNotes"
                          label="Existe algo que ajudaria a tornar sua experiência melhor e mais segura?"
                          hint="Opcional."
                          error={fieldReveal("experienceNotes")}
                        >
                          <StudentTextarea
                            id="experienceNotes"
                            value={form.experienceNotes}
                            onChange={(value) =>
                              updateForm("experienceNotes", value)
                            }
                            placeholder="Conte o que gostaria que o profissional soubesse."
                            rows={3}
                            error={fieldReveal("experienceNotes")}
                            hasHint
                          />
                        </StudentField>
                      </StudentPanel>

                      <StudentPanel>
                        <StudentSectionTitle
                          icon={
                            <IoDocumentTextOutline
                              aria-hidden="true"
                              className="size-5"
                            />
                          }
                          title="Confirmação das informações"
                          subtitle="Leia o aviso de privacidade e confirme cada declaração."
                        />
                        <ConfirmationCard
                          id="accuracyConfirmed"
                          label="Declaro que respondi de acordo com as informações de que disponho e que comunicarei ao profissional qualquer alteração relevante no meu estado de saúde."
                          checked={form.accuracyConfirmed}
                          onCheckedChange={(checked) =>
                            updateForm("accuracyConfirmed", checked)
                          }
                          error={fieldReveal("accuracyConfirmed")}
                        />
                      </StudentPanel>

                      {needsProfessionalReview ? (
                        <ReviewNotice error={errorFor("professionalReview")} />
                      ) : null}
                    </>
                  )}
                </motion.div>
              </AnimatePresence>
            </form>
          </Card>

          <div
            style={{ bottom: keyboardInset }}
            className="fixed inset-x-0 bottom-0 z-30 border-t border-border/60 bg-background/90 px-4 pt-3 pb-[max(env(safe-area-inset-bottom),1rem)] backdrop-blur-xl sm:static sm:mt-6 sm:border-0 sm:bg-transparent sm:p-0 sm:pt-1"
          >
            <div className="mx-auto flex w-full max-w-6xl flex-col-reverse gap-2 sm:flex-row sm:justify-between sm:gap-3">
              {step > 1 ? (
                <Button
                  type="button"
                  variant="outline"
                  className="h-12 w-full rounded-xl sm:w-auto"
                  onClick={() =>
                    navigateToStep((step - 1) as StudentSignupStep)
                  }
                >
                  <IoArrowBackOutline aria-hidden="true" className="size-4" />{" "}
                  Voltar
                </Button>
              ) : (
                <span className="hidden sm:block" />
              )}
              <Button
                form="student-signup-form"
                type="submit"
                disabled={submitting}
                className="h-12 w-full rounded-xl px-5 font-semibold shadow-[0_8px_24px_-10px_color-mix(in_oklch,var(--primary)_65%,transparent)] sm:w-auto"
              >
                {submitting ? "Salvando conta…" : step === 6 ? "Criar conta" : "Continuar"}
                <IoArrowForwardOutline aria-hidden="true" className="size-4" />
              </Button>
            </div>
            <p className="mx-auto mt-2 max-w-6xl text-center text-[0.68rem] text-muted-foreground sm:hidden">
              Rascunho salvo automaticamente. Senhas não são armazenadas no rascunho.
            </p>
          </div>
        </section>
      </div>
    </main>
  )
}
