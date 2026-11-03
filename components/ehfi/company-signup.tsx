"use client"

import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useRef, useState, type ChangeEvent, type ReactNode } from "react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import {
  IoAddOutline,
  IoArrowBackOutline,
  IoArrowForwardOutline,
  IoBusinessOutline,
  IoCalendarOutline,
  IoCallOutline,
  IoCashOutline,
  IoCheckmarkOutline,
  IoDocumentTextOutline,
  IoFitnessOutline,
  IoGlobeOutline,
  IoLocationOutline,
  IoMailOutline,
  IoPeopleOutline,
  IoPersonOutline,
  IoSearchOutline,
  IoShieldCheckmarkOutline,
  IoTimeOutline,
  IoTrashOutline,
} from "react-icons/io5"

import { CompanySignupStepper } from "@/components/ehfi/company-signup-stepper"
import {
  StudentChoiceGrid,
  StudentField,
  StudentIconInput,
  StudentPanel,
  StudentSectionTitle,
  StudentTextarea,
  type StudentChoiceOption,
} from "@/components/ehfi/student-signup-fields"
import { ThemeToggle } from "@/components/ehfi/theme-toggle"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  companyActivityOptions,
  companyContractInterestOptions,
  companyDurationOptions,
  companyFrequencyOptions,
  companyGoalOptions,
  companyPriorExperienceOptions,
  companySectorOptions,
  companySignupSteps,
  companyStartWindowOptions,
  companyUfs,
  companyWeekdayOptions,
  employeeBandOptions,
  formatCnpj,
  getEmployeeBand,
  initialCompanyRegistration,
  validateCompanyStep,
  type CompanyActivity,
  type CompanyDirectoryData,
  type CompanyGoal,
  type CompanyRegistrationErrors,
  type CompanyRegistrationField,
  type CompanyRegistrationForm,
  type CompanySector,
  type CompanySignupStep,
  type CompanyWeekday,
} from "@/lib/company-registration"
import {
  formatPhone,
  formatWithCaret,
} from "@/lib/professional-registration"
import {
  ehfiEase,
  ehfiMotion,
  fieldRevealVariants,
  panelRevealVariants,
  stillFieldVariants,
  stillPanelVariants,
} from "@/lib/ehfi-motion"

type LookupState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "found" }
  | { status: "not_found" }
  | { status: "invalid" }
  | { status: "unavailable" }

type DirectoryField =
  | "legalName"
  | "tradeName"
  | "street"
  | "number"
  | "complement"
  | "district"
  | "city"
  | "state"
  | "postalCode"
  | "mainCnae"
  | "registrationStatus"

const directoryFields: readonly DirectoryField[] = [
  "legalName",
  "tradeName",
  "street",
  "number",
  "complement",
  "district",
  "city",
  "state",
  "postalCode",
  "mainCnae",
  "registrationStatus",
]
const companyIdentityReset: Pick<
  CompanyRegistrationForm,
  | DirectoryField
  | "activity"
  | "otherActivity"
  | "websiteOrSocial"
> = {
  legalName: "",
  tradeName: "",
  activity: "",
  otherActivity: "",
  mainCnae: "",
  registrationStatus: "",
  street: "",
  number: "",
  complement: "",
  district: "",
  city: "",
  state: "",
  postalCode: "",
  websiteOrSocial: "",
}

const weekdayOptions: readonly StudentChoiceOption<CompanyWeekday>[] =
  companyWeekdayOptions.map(({ value, shortTitle }) => ({
    value,
    title: shortTitle,
  }))
const timePattern = /^(?:[01]\d|2[0-3]):[0-5]\d$/

function makeId() {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`
}

function CompanyField({
  id,
  label,
  error,
  hint,
  children,
}: {
  id: string
  label: string
  error?: string
  hint?: string
  children: ReactNode
}) {
  return (
    <StudentField id={id} label={label} error={error} hint={hint}>
      {children}
    </StudentField>
  )
}

function CompanySelect({
  id,
  label,
  value,
  options,
  error,
  hint,
  placeholder = "Selecione uma opção",
  onChange,
}: {
  id: string
  label: string
  value: string
  options: readonly { value: string; title: string }[]
  error?: string
  hint?: string
  placeholder?: string
  onChange: (value: string) => void
}) {
  return (
    <CompanyField id={id} label={label} error={error} hint={hint}>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        className="h-11 w-full rounded-xl border border-input bg-background/60 px-3 text-sm text-foreground outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40"
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.title}
          </option>
        ))}
      </select>
    </CompanyField>
  )
}

function CompanyTextarea({
  id,
  label,
  value,
  onChange,
  error,
  hint,
  placeholder,
  rows = 3,
}: {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  error?: string
  hint?: string
  placeholder?: string
  rows?: number
}) {
  return (
    <CompanyField id={id} label={label} error={error} hint={hint}>
      <Textarea
        id={id}
        rows={rows}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        className="min-h-24 w-full rounded-xl bg-background/60 px-3 py-2.5 text-sm leading-6"
      />
    </CompanyField>
  )
}

function AnimatedPanel({ children }: { children: ReactNode }) {
  const reducedMotion = Boolean(useReducedMotion())
  return (
    <motion.div
      data-ehfi-reveal
      variants={reducedMotion ? stillPanelVariants : panelRevealVariants}
      initial={reducedMotion ? false : "hidden"}
      animate="visible"
      className="min-w-0 space-y-4"
    >
      {children}
    </motion.div>
  )
}

function FormGrid({ children }: { children: ReactNode }) {
  return <div className="grid min-w-0 gap-4 sm:grid-cols-2">{children}</div>
}

function CheckCard({
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
  children?: ReactNode
}) {
  const prefersReducedMotion = Boolean(useReducedMotion())
  return (
    <motion.div
      data-ehfi-reveal
      variants={prefersReducedMotion ? stillFieldVariants : fieldRevealVariants}
      initial={prefersReducedMotion ? false : "hidden"}
      whileInView="visible"
      viewport={{ once: true, amount: 0.15 }}
      className={`rounded-2xl border p-4 transition-colors ${error ? "border-destructive/50 bg-destructive/[0.035]" : "border-border/70 bg-background/50"}`}
    >
      <div className="flex items-start gap-3">
        <Checkbox
          id={id}
          checked={checked}
          onCheckedChange={(next) => onCheckedChange(next === true)}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          className="mt-1"
        />
        <div className="min-w-0 flex-1">
          <Label
            htmlFor={id}
            className="cursor-pointer text-sm leading-6 text-foreground"
          >
            {label}
          </Label>
          {description ? (
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              {description}
            </p>
          ) : null}
          {children}
          {error ? (
            <p id={`${id}-error`} role="alert" className="mt-2 text-xs leading-5 text-destructive">
              {error}
            </p>
          ) : null}
        </div>
      </div>
    </motion.div>
  )
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 border-b border-border/50 py-3 last:border-b-0 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
      <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
      <dd className="text-sm leading-5 text-foreground sm:max-w-[65%] sm:text-right">
        {value || "Não informado"}
      </dd>
    </div>
  )
}

function formatPostalCode(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 8)
  return digits.replace(/^(\d{5})(\d)/, "$1-$2")
}

function parseLookupPayload(value: unknown): CompanyDirectoryData | null {
  if (typeof value !== "object" || value === null) return null
  const payload = value as { success?: unknown; data?: unknown }
  if (payload.success !== true || typeof payload.data !== "object" || payload.data === null) {
    return null
  }
  const data = payload.data as Partial<CompanyDirectoryData>
  if (typeof data.legalName !== "string" || !data.legalName.trim()) return null
  return data as CompanyDirectoryData
}

export function CompanySignup() {
  const router = useRouter()
  const prefersReducedMotion = Boolean(useReducedMotion())
  const pendingInvalidFocusStep = useRef<CompanySignupStep | null>(null)
  const requestSequence = useRef(0)
  const observedCnpj = useRef("")
  const lastCompleteCnpj = useRef("")
  const lastRequestedCnpj = useRef("")
  const autoFilledFields = useRef(new Set<DirectoryField>())
  const manuallyEditedFields = useRef(new Set<DirectoryField>())
  const [step, setStep] = useState<CompanySignupStep>(1)
  const [direction, setDirection] = useState<1 | -1>(1)
  const [continuedSteps, setContinuedSteps] = useState<ReadonlySet<CompanySignupStep>>(() => new Set())
  const [attemptedSteps, setAttemptedSteps] = useState<ReadonlySet<CompanySignupStep>>(() => new Set())
  const [form, setForm] = useState(initialCompanyRegistration)
  const [lookupState, setLookupState] = useState<LookupState>({ status: "idle" })
  const [keyboardInset, setKeyboardInset] = useState(0)
  const [sectorDraft, setSectorDraft] = useState<CompanySector | "">("")
  const [otherSectorDraft, setOtherSectorDraft] = useState("")
  const [shiftDraft, setShiftDraft] = useState<"first" | "second" | "third" | "other" | "">("")
  const [otherShiftDraft, setOtherShiftDraft] = useState("")

  useEffect(() => {
    const viewport = window.visualViewport
    if (!viewport) return

    const updateKeyboardInset = () => {
      setKeyboardInset(
        Math.max(0, window.innerHeight - viewport.height - viewport.offsetTop)
      )
    }

    viewport.addEventListener("resize", updateKeyboardInset)
    viewport.addEventListener("scroll", updateKeyboardInset)
    window.addEventListener("resize", updateKeyboardInset)
    document.addEventListener("focusin", updateKeyboardInset)
    document.addEventListener("focusout", updateKeyboardInset)
    updateKeyboardInset()

    return () => {
      viewport.removeEventListener("resize", updateKeyboardInset)
      viewport.removeEventListener("scroll", updateKeyboardInset)
      window.removeEventListener("resize", updateKeyboardInset)
      document.removeEventListener("focusin", updateKeyboardInset)
      document.removeEventListener("focusout", updateKeyboardInset)
    }
  }, [])

  const allSteps: readonly CompanySignupStep[] = [1, 2, 3, 4, 5, 6]
  const errorsByStep = new Map<CompanySignupStep, CompanyRegistrationErrors>(
    allSteps.map((currentStep) => [
      currentStep,
      validateCompanyStep(form, currentStep),
    ])
  )
  const completedSteps = new Set<CompanySignupStep>(
    allSteps.filter(
      (currentStep) => Object.keys(errorsByStep.get(currentStep) ?? {}).length === 0
    )
  )
  const transitionDuration = prefersReducedMotion ? 0 : ehfiMotion.duration.step
  const currentLookupCnpj = form.cnpj.replace(/\D/g, "")

  function errorFor(field: CompanyRegistrationField) {
    if (!attemptedSteps.has(step)) return undefined
    return errorsByStep.get(step)?.[field]
  }

  function fieldState(field: CompanyRegistrationField, hasHint = false) {
    const error = errorFor(field)
    return {
      "aria-invalid": error ? true : undefined,
      "aria-describedby": error
        ? `${field}-error`
        : hasHint
          ? `${field}-hint`
          : undefined,
    }
  }

  function startTimeIsInvalid(value: string) {
    return attemptedSteps.has(3) && !timePattern.test(value)
  }

  function endTimeIsInvalid(start: string, end: string) {
    return (
      attemptedSteps.has(3) &&
      (!timePattern.test(end) ||
        (timePattern.test(start) && timePattern.test(end) && start === end))
    )
  }

  function updateForm<Key extends CompanyRegistrationField>(
    key: Key,
    value: CompanyRegistrationForm[Key]
  ) {
    if (directoryFields.includes(key as DirectoryField)) {
      manuallyEditedFields.current.add(key as DirectoryField)
    }
    setForm((current) => ({ ...current, [key]: value }))
  }

  function toggleWeekday(
    current: readonly CompanyWeekday[],
    value: CompanyWeekday
  ) {
    return current.includes(value)
      ? current.filter((day) => day !== value)
      : [...current, value]
  }

  function navigateToStep(nextStep: CompanySignupStep) {
    if (nextStep === step) return
    pendingInvalidFocusStep.current = null
    setDirection(nextStep > step ? 1 : -1)
    setStep(nextStep)
    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion ? "auto" : "smooth",
    })
  }

  function focusFirstInvalid(targetStep: CompanySignupStep) {
    requestAnimationFrame(() => {
      const firstInvalid = document.querySelector<HTMLElement>(
        `[data-company-step="${targetStep}"] [aria-invalid="true"]`
      )
      firstInvalid?.focus({ preventScroll: true })
      firstInvalid?.scrollIntoView({
        behavior: prefersReducedMotion ? "auto" : "smooth",
        block: "center",
      })
    })
  }

  useEffect(() => {
    if (!prefersReducedMotion || pendingInvalidFocusStep.current !== step) return
    const frame = window.requestAnimationFrame(() => {
      if (pendingInvalidFocusStep.current !== step) return
      pendingInvalidFocusStep.current = null
      focusFirstInvalid(step)
    })
    return () => window.cancelAnimationFrame(frame)
  }, [prefersReducedMotion, step])

  function continueToNextStep() {
    const errors = errorsByStep.get(step) ?? {}
    setAttemptedSteps((current) => new Set(current).add(step))
    if (Object.keys(errors).length > 0) {
      focusFirstInvalid(step)
      return
    }
    setContinuedSteps((current) => new Set(current).add(step))
    navigateToStep((step + 1) as CompanySignupStep)
  }

  function finishSignup() {
    setAttemptedSteps(new Set(allSteps))
    const firstInvalidStep = allSteps.find(
      (currentStep) => Object.keys(errorsByStep.get(currentStep) ?? {}).length > 0
    )
    if (firstInvalidStep) {
      if (firstInvalidStep === step) {
        focusFirstInvalid(firstInvalidStep)
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
    router.push("/empresa/sucesso", { transitionTypes: ["nav-forward"] })
  }

  function updateCnpj(event: ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget
    const formatted = formatWithCaret(
      input.value,
      input.selectionStart,
      input.selectionEnd,
      formatCnpj
    )
    setForm((current) => ({ ...current, cnpj: formatted.value }))
    requestAnimationFrame(() => {
      input.setSelectionRange(formatted.selectionStart, formatted.selectionEnd)
    })
  }

  function updateMaskedPhone(event: ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget
    const formatted = formatWithCaret(
      input.value,
      input.selectionStart,
      input.selectionEnd,
      formatPhone
    )
    updateForm("contactPhone", formatted.value)
    requestAnimationFrame(() => {
      input.setSelectionRange(formatted.selectionStart, formatted.selectionEnd)
    })
  }

  function applyDirectoryData(data: CompanyDirectoryData) {
    const values: Partial<Record<DirectoryField, string>> = {
      legalName: data.legalName,
      tradeName: data.tradeName,
      street: data.street,
      number: data.number,
      complement: data.complement,
      district: data.district,
      city: data.city,
      state: data.state,
      postalCode: data.postalCode,
      mainCnae: data.mainCnae,
      registrationStatus: data.registrationStatus,
    }
    setForm((current) => {
      if (current.cnpj.replace(/\D/g, "") !== data.cnpj) return current
      const next = { ...current }
      for (const [field, value] of Object.entries(values) as [DirectoryField, string | undefined][]) {
        if (!value || manuallyEditedFields.current.has(field)) continue
        const isPreviousLookupValue = autoFilledFields.current.has(field)
        if (!isPreviousLookupValue && next[field].trim()) continue
        next[field] = value as never
        autoFilledFields.current.add(field)
      }
      return next
    })
  }

  useEffect(() => {
    const cnpj = currentLookupCnpj
    const previousCnpj = observedCnpj.current
    if (previousCnpj !== cnpj) {
      observedCnpj.current = cnpj
      lastRequestedCnpj.current = ""
      setLookupState({ status: "idle" })
      const switchedCompleteCnpj =
        /^\d{14}$/.test(cnpj) &&
        Boolean(lastCompleteCnpj.current) &&
        lastCompleteCnpj.current !== cnpj
      if (switchedCompleteCnpj) {
        setForm((current) => ({ ...current, ...companyIdentityReset }))
        autoFilledFields.current.clear()
        manuallyEditedFields.current.clear()
      } else if (autoFilledFields.current.size > 0) {
        setForm((current) => {
          const next = { ...current }
          for (const field of autoFilledFields.current) {
            if (!manuallyEditedFields.current.has(field)) next[field] = "" as never
          }
          return next
        })
        autoFilledFields.current.clear()
      }
    }

    if (cnpj.length !== 14 || !/^\d{14}$/.test(cnpj)) return
    lastCompleteCnpj.current = cnpj
    if (lastRequestedCnpj.current === cnpj) return

    let controller: AbortController | null = null
    const sequence = ++requestSequence.current
    const timeout = window.setTimeout(() => {
      lastRequestedCnpj.current = cnpj
      controller = new AbortController()
      setLookupState({ status: "loading" })
      fetch(`/api/cnpj/${cnpj}`, { signal: controller.signal })
        .then(async (response) => {
          let body: unknown
          try {
            body = await response.json()
          } catch {
            body = null
          }
          if (sequence !== requestSequence.current) return
          if (!response.ok) {
            const code =
              typeof body === "object" && body !== null && "error" in body
                ? (body as { error?: unknown }).error
                : undefined
            if (code === "not_found") setLookupState({ status: "not_found" })
            else if (code === "invalid_cnpj") setLookupState({ status: "invalid" })
            else setLookupState({ status: "unavailable" })
            return
          }
          const data = parseLookupPayload(body)
          if (!data) {
            setLookupState({ status: "unavailable" })
            return
          }
          applyDirectoryData(data)
          setLookupState({ status: "found" })
        })
        .catch(() => {
          if (sequence === requestSequence.current) {
            setLookupState({ status: "unavailable" })
          }
        })
    }, 450)

    return () => {
      window.clearTimeout(timeout)
      controller?.abort()
      requestSequence.current += 1
    }
  }, [currentLookupCnpj])

  function updateServiceModes(value: CompanyRegistrationForm["serviceModes"][number]) {
    setForm((current) => {
      if (value === "guidance") {
        return {
          ...current,
          serviceModes: current.serviceModes.includes("guidance") ? [] : ["guidance"],
          collectiveSpace: "",
        }
      }
      const withoutGuidance = current.serviceModes.filter((mode) => mode !== "guidance")
      const serviceModes = withoutGuidance.includes(value)
        ? withoutGuidance.filter((mode) => mode !== value)
        : [...withoutGuidance, value]
      return {
        ...current,
        serviceModes,
        collectiveSpace: serviceModes.includes("collective")
          ? current.collectiveSpace
          : "",
      }
    })
  }

  function updateGoals(value: CompanyGoal) {
    const goals = form.goals.includes(value)
      ? form.goals.filter((goal) => goal !== value)
      : [...form.goals, value]
    setForm((current) => ({
      ...current,
      goals,
      otherGoal: goals.includes("other") ? current.otherGoal : "",
    }))
  }

  function addSector() {
    if (!sectorDraft) return
    const customName = otherSectorDraft.trim()
    if (sectorDraft === "other" && !customName) return
    if (
      sectorDraft === "other" &&
      form.sectors.some(
        (sector) =>
          sector.category === "other" &&
          sector.customName.toLocaleLowerCase("pt-BR") === customName.toLocaleLowerCase("pt-BR")
      )
    ) {
      return
    }
    setForm((current) => ({
      ...current,
      sectors: [
        ...current.sectors,
        {
          id: makeId(),
          category: sectorDraft,
          customName: sectorDraft === "other" ? customName : "",
          sameAsCompanyHours: true,
          days: [],
          schedules: [],
        },
      ],
    }))
    setSectorDraft("")
    setOtherSectorDraft("")
  }

  function removeSector(id: string) {
    setForm((current) => ({
      ...current,
      sectors: current.sectors.filter((sector) => sector.id !== id),
    }))
  }

  function updateSector<Key extends "customName" | "sameAsCompanyHours" | "days">(
    id: string,
    key: Key,
    value: CompanyRegistrationForm["sectors"][number][Key]
  ) {
    setForm((current) => ({
      ...current,
      sectors: current.sectors.map((sector) =>
        sector.id === id ? { ...sector, [key]: value } : sector
      ),
    }))
  }

  function addSectorSchedule(sectorId: string) {
    setForm((current) => ({
      ...current,
      sectors: current.sectors.map((sector) =>
        sector.id === sectorId
          ? {
              ...sector,
              schedules: [
                ...sector.schedules,
                { id: makeId(), startTime: "", endTime: "" },
              ],
            }
          : sector
      ),
    }))
  }

  function updateSectorSchedule(
    sectorId: string,
    scheduleId: string,
    key: "startTime" | "endTime",
    value: string
  ) {
    setForm((current) => ({
      ...current,
      sectors: current.sectors.map((sector) =>
        sector.id === sectorId
          ? {
              ...sector,
              schedules: sector.schedules.map((schedule) =>
                schedule.id === scheduleId ? { ...schedule, [key]: value } : schedule
              ),
            }
          : sector
      ),
    }))
  }

  function removeSectorSchedule(sectorId: string, scheduleId: string) {
    setForm((current) => ({
      ...current,
      sectors: current.sectors.map((sector) =>
        sector.id === sectorId
          ? {
              ...sector,
              schedules: sector.schedules.filter((schedule) => schedule.id !== scheduleId),
            }
          : sector
      ),
    }))
  }

  function addShift() {
    if (!shiftDraft) return
    const customName = otherShiftDraft.trim()
    if (shiftDraft === "other" && !customName) return
    if (
      shiftDraft !== "other" &&
      form.shifts.some((shift) => shift.kind === shiftDraft)
    ) {
      return
    }
    setForm((current) => ({
      ...current,
      shifts: [
        ...current.shifts,
        {
          id: makeId(),
          kind: shiftDraft,
          customName: shiftDraft === "other" ? customName : "",
          startTime: "",
          endTime: "",
        },
      ],
    }))
    setShiftDraft("")
    setOtherShiftDraft("")
  }

  function updateShift(
    id: string,
    key: "startTime" | "endTime" | "customName",
    value: string
  ) {
    setForm((current) => ({
      ...current,
      shifts: current.shifts.map((shift) =>
        shift.id === id ? { ...shift, [key]: value } : shift
      ),
    }))
  }

  function removeShift(id: string) {
    setForm((current) => ({
      ...current,
      shifts: current.shifts.filter((shift) => shift.id !== id),
    }))
  }

  const employeeBand = form.employeeExact
    ? getEmployeeBand(form.employeeExact)
    : form.employeeBand
  const companySectorTitle = (sector: CompanyRegistrationForm["sectors"][number]) =>
    sector.category === "other"
      ? sector.customName
      : companySectorOptions.find((option) => option.value === sector.category)?.title ?? "Setor"
  const currentStepDefinition = companySignupSteps[step - 1]
  const lookupCopy = {
    idle: null,
    loading: "Consultando o Open CNPJ…",
    found: "Dados cadastrais carregados. Revise e edite o que for necessário.",
    not_found: "Não encontramos esse CNPJ. Confira o número ou preencha os dados manualmente.",
    invalid: "O CNPJ não foi aceito pela consulta. Confira o número e preencha manualmente.",
    unavailable: "A consulta está indisponível agora. Você pode continuar preenchendo manualmente.",
  }[lookupState.status]

  return (
    <main className="relative isolate flex min-h-dvh flex-col overflow-hidden px-4 py-4 sm:px-7 sm:py-6">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-32 right-[-8rem] -z-10 size-[28rem] rounded-full bg-primary/10 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-[-14rem] left-[-10rem] -z-10 size-[30rem] rounded-full bg-ehfi-secondary/10 blur-3xl"
      />

      <header className="mx-auto flex w-full max-w-6xl items-center justify-between">
        <Link
          href="/"
          transitionTypes={["nav-back"]}
          aria-label="EHFI — início"
          className="inline-flex items-center gap-3 rounded-full outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <Image
            src="/pwa/icon-192.png"
            width={42}
            height={42}
            alt=""
            className="size-[2.625rem] rounded-xl border border-border/70 bg-card"
          />
          <span className="font-heading text-sm font-bold tracking-[0.16em] text-foreground">
            EHFI
          </span>
        </Link>
        <ThemeToggle />
      </header>

      <section className="mx-auto my-auto w-full max-w-6xl py-8 pb-32 sm:py-10 sm:pb-10">
        <motion.div
          data-ehfi-reveal
          initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: prefersReducedMotion ? 0 : ehfiMotion.duration.entrance, ease: ehfiEase }}
          className="mb-5 flex flex-col gap-4 sm:mb-7 sm:flex-row sm:items-end sm:justify-between"
        >
          <div>
            <Link
              href="/"
              transitionTypes={["nav-back"]}
              className="mb-3 inline-flex min-h-9 items-center gap-2 rounded-lg px-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-card/55 hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/40 focus-visible:outline-none"
            >
              <IoArrowBackOutline aria-hidden="true" className="size-4" /> Início
            </Link>
            <p className="text-xs font-semibold tracking-[0.14em] text-ehfi-secondary uppercase">
              Cadastro demonstrativo
            </p>
            <h1 className="mt-1 font-heading text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              Cadastro de empresa
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              Conte como funciona sua empresa para encontrarmos o formato de ginástica laboral mais adequado.
            </p>
          </div>
          <p className="max-w-sm text-xs leading-5 text-muted-foreground sm:text-right">
            Esta demonstração não cria conta nem salva respostas. Apenas o CNPJ é consultado no Open CNPJ.
          </p>
        </motion.div>

        <Card className="gap-0 rounded-[1.75rem] border-border/70 bg-card/75 py-5 shadow-[0_24px_70px_-42px_rgba(25,16,40,0.34)] backdrop-blur-2xl sm:py-7">
          <CardContent className="px-4 sm:px-7">
            <div className="mb-6 border-b border-border/60 pb-5 sm:mb-7 sm:pb-6">
              <CompanySignupStepper
                currentStep={step}
                completedSteps={completedSteps}
                continuedSteps={continuedSteps}
                onStepSelect={navigateToStep}
              />
              <div className="mt-5 flex items-center justify-between gap-4">
                <p className="text-xs font-semibold tracking-[0.12em] text-ehfi-secondary uppercase">
                  Etapa {step} de 6
                </p>
                <p className="truncate text-xs font-medium text-muted-foreground">
                  {currentStepDefinition?.label}
                </p>
              </div>
            </div>

            <form
              id="company-signup-form"
              onSubmit={(event) => {
                event.preventDefault()
                if (step === 6) finishSignup()
                else continueToNextStep()
              }}
              noValidate
            >
              <AnimatePresence mode="wait" custom={direction} initial={false}>
                <motion.div
                  key={step}
                  data-company-step={step}
                  custom={direction}
                  initial={{
                    opacity: 0,
                    x: prefersReducedMotion ? 0 : direction * ehfiMotion.distance.step,
                  }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{
                    opacity: 0,
                    x: prefersReducedMotion ? 0 : direction * -ehfiMotion.distance.step,
                  }}
                  transition={{ duration: transitionDuration, ease: ehfiEase }}
                  className="min-w-0 space-y-4"
                >
                  {step === 1 ? (
                    <StudentPanel>
                      <StudentSectionTitle
                        icon={<IoBusinessOutline aria-hidden="true" className="size-5" />}
                        title="Dados da empresa"
                        subtitle="A consulta pelo CNPJ preenche dados cadastrais públicos para você revisar."
                      />

                      <CompanyField
                        id="cnpj"
                        label="CNPJ"
                        error={errorFor("cnpj")}
                        hint="Digite os 14 números. A busca começa após uma breve pausa e consulta o Open CNPJ. O endereço registrado pode ser diferente do local das sessões."
                      >
                        <InputGroup className="h-11 rounded-xl bg-background/60 transition-colors focus-within:bg-background/80">
                          <InputGroupInput
                            id="cnpj"
                            inputMode="numeric"
                            autoComplete="off"
                            placeholder="00.000.000/0000-00"
                            value={form.cnpj}
                            onChange={updateCnpj}
                            maxLength={18}
                            aria-invalid={errorFor("cnpj") ? true : undefined}
                            aria-describedby={
                              errorFor("cnpj")
                                ? "cnpj-error"
                                : "cnpj-hint"
                            }
                            className="h-11 text-sm"
                          />
                          <InputGroupAddon
                            align="inline-start"
                            className="pr-1 pl-3 text-ehfi-secondary/80 [&_svg]:size-[18px]"
                          >
                            <IoSearchOutline aria-hidden="true" />
                          </InputGroupAddon>
                        </InputGroup>
                      </CompanyField>

                      {lookupCopy ? (
                        <p
                          role="status"
                          aria-live="polite"
                          aria-atomic="true"
                          className={`flex items-start gap-2 rounded-xl border px-3 py-2.5 text-xs leading-5 ${lookupState.status === "found" ? "border-primary/20 bg-primary/[0.045] text-foreground/85" : lookupState.status === "loading" ? "border-border/70 bg-background/50 text-muted-foreground" : "border-amber-500/20 bg-amber-500/[0.045] text-muted-foreground"}`}
                        >
                          {lookupState.status === "found" ? (
                            <IoCheckmarkOutline aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-primary" />
                          ) : lookupState.status === "loading" ? (
                            <span aria-hidden="true" className="mt-0.5 size-3.5 shrink-0 animate-spin rounded-full border-2 border-ehfi-secondary/30 border-t-ehfi-secondary motion-reduce:animate-none" />
                          ) : (
                            <IoSearchOutline aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-ehfi-secondary" />
                          )}
                          <span>{lookupCopy}</span>
                        </p>
                      ) : null}

                      <FormGrid>
                        <CompanyField id="legalName" label="Razão social" error={errorFor("legalName")}>
                          <StudentIconInput
                            id="legalName"
                            icon={<IoBusinessOutline aria-hidden="true" />}
                            autoComplete="organization"
                            placeholder="Razão social registrada"
                            value={form.legalName}
                            onChange={(event) => updateForm("legalName", event.target.value)}
                            {...fieldState("legalName")}
                          />
                        </CompanyField>
                        <CompanyField id="tradeName" label="Nome fantasia" error={errorFor("tradeName")}>
                          <StudentIconInput
                            id="tradeName"
                            icon={<IoBusinessOutline aria-hidden="true" />}
                            autoComplete="organization"
                            placeholder="Nome conhecido pelo público"
                            value={form.tradeName}
                            onChange={(event) => updateForm("tradeName", event.target.value)}
                            {...fieldState("tradeName")}
                          />
                        </CompanyField>
                      </FormGrid>

                      <CompanySelect
                        id="activity"
                        label="Ramo principal de atividade"
                        value={form.activity}
                        options={companyActivityOptions}
                        error={errorFor("activity")}
                        onChange={(value) => updateForm("activity", value as CompanyActivity | "")}
                      />
                      {form.activity === "other" ? (
                        <CompanyField id="otherActivity" label="Qual é o ramo?" error={errorFor("otherActivity")}>
                          <StudentIconInput
                            id="otherActivity"
                            icon={<IoBusinessOutline aria-hidden="true" />}
                            placeholder="Descreva a atividade"
                            value={form.otherActivity}
                            onChange={(event) => updateForm("otherActivity", event.target.value)}
                            {...fieldState("otherActivity")}
                          />
                        </CompanyField>
                      ) : null}

                      {form.mainCnae || form.registrationStatus ? (
                        <div className="rounded-2xl border border-primary/15 bg-primary/[0.04] p-4">
                          {form.mainCnae ? (
                            <p className="text-xs leading-5 text-foreground/85">
                              <span className="font-semibold">Atividade principal na Receita:</span> {form.mainCnae}
                            </p>
                          ) : null}
                          {form.registrationStatus ? (
                            <p className="mt-1 text-xs leading-5 text-muted-foreground">
                              Situação cadastral consultada: {form.registrationStatus}
                            </p>
                          ) : null}
                        </div>
                      ) : null}

                      <div className="space-y-4 rounded-2xl border border-border/60 bg-background/35 p-4 sm:p-5">
                        <div>
                          <h3 className="text-sm font-semibold text-foreground">Endereço cadastral</h3>
                          <p className="mt-1 text-xs leading-5 text-muted-foreground">Revise o preenchimento ou informe o endereço onde as sessões aconteceriam.</p>
                        </div>
                        <FormGrid>
                          <CompanyField id="street" label="Logradouro" error={errorFor("street")}>
                            <StudentIconInput id="street" icon={<IoLocationOutline aria-hidden="true" />} autoComplete="address-line1" placeholder="Rua ou avenida" value={form.street} onChange={(event) => updateForm("street", event.target.value)} {...fieldState("street")} />
                          </CompanyField>
                          <CompanyField id="number" label="Número" error={errorFor("number")}>
                            <StudentIconInput id="number" icon={<IoLocationOutline aria-hidden="true" />} autoComplete="off" placeholder="Número" value={form.number} onChange={(event) => updateForm("number", event.target.value)} {...fieldState("number")} />
                          </CompanyField>
                          <CompanyField id="complement" label="Complemento" hint="Opcional.">
                            <StudentIconInput id="complement" icon={<IoLocationOutline aria-hidden="true" />} autoComplete="address-line2" placeholder="Sala, bloco, conjunto" value={form.complement} onChange={(event) => updateForm("complement", event.target.value)} />
                          </CompanyField>
                          <CompanyField id="district" label="Bairro" error={errorFor("district")}>
                            <StudentIconInput id="district" icon={<IoLocationOutline aria-hidden="true" />} autoComplete="address-level3" placeholder="Bairro" value={form.district} onChange={(event) => updateForm("district", event.target.value)} {...fieldState("district")} />
                          </CompanyField>
                          <CompanyField id="city" label="Cidade" error={errorFor("city")}>
                            <StudentIconInput id="city" icon={<IoLocationOutline aria-hidden="true" />} autoComplete="address-level2" placeholder="Cidade" value={form.city} onChange={(event) => updateForm("city", event.target.value)} {...fieldState("city")} />
                          </CompanyField>
                          <CompanySelect id="state" label="Estado" value={form.state} options={companyUfs.map((uf) => ({ value: uf, title: uf }))} error={errorFor("state")} onChange={(value) => updateForm("state", value)} />
                          <CompanyField id="postalCode" label="CEP" error={errorFor("postalCode")}>
                            <StudentIconInput id="postalCode" icon={<IoLocationOutline aria-hidden="true" />} inputMode="numeric" autoComplete="postal-code" placeholder="00000-000" value={form.postalCode} onChange={(event) => updateForm("postalCode", formatPostalCode(event.target.value))} {...fieldState("postalCode")} />
                          </CompanyField>
                          <CompanyField id="websiteOrSocial" label="Site ou rede social" hint="Opcional.">
                            <StudentIconInput id="websiteOrSocial" icon={<IoGlobeOutline aria-hidden="true" />} inputMode="url" autoComplete="url" placeholder="https://..." value={form.websiteOrSocial} onChange={(event) => updateForm("websiteOrSocial", event.target.value)} {...fieldState("websiteOrSocial", true)} />
                          </CompanyField>
                        </FormGrid>
                      </div>
                    </StudentPanel>
                  ) : step === 2 ? (
                    <StudentPanel>
                      <StudentSectionTitle
                        icon={<IoPersonOutline aria-hidden="true" className="size-5" />}
                        title="Responsável pelo cadastro"
                        subtitle="Quem o EHFI deve procurar para conversar sobre esta solicitação?"
                      />
                      <FormGrid>
                        <CompanyField id="contactName" label="Nome completo" error={errorFor("contactName")}>
                          <StudentIconInput id="contactName" icon={<IoPersonOutline aria-hidden="true" />} autoComplete="name" placeholder="Nome e sobrenome" value={form.contactName} onChange={(event) => updateForm("contactName", event.target.value)} {...fieldState("contactName")} />
                        </CompanyField>
                        <CompanyField id="contactRole" label="Cargo ou função" error={errorFor("contactRole")}>
                          <StudentIconInput id="contactRole" icon={<IoBusinessOutline aria-hidden="true" />} autoComplete="organization-title" placeholder="Ex.: gerente de RH" value={form.contactRole} onChange={(event) => updateForm("contactRole", event.target.value)} {...fieldState("contactRole")} />
                        </CompanyField>
                        <CompanyField id="contactDepartment" label="Setor em que trabalha" error={errorFor("contactDepartment")}>
                          <StudentIconInput id="contactDepartment" icon={<IoPeopleOutline aria-hidden="true" />} placeholder="Ex.: Recursos Humanos" value={form.contactDepartment} onChange={(event) => updateForm("contactDepartment", event.target.value)} {...fieldState("contactDepartment")} />
                        </CompanyField>
                        <CompanyField id="contactEmail" label="E-mail" error={errorFor("contactEmail")}>
                          <StudentIconInput id="contactEmail" type="email" icon={<IoMailOutline aria-hidden="true" />} autoComplete="email" placeholder="voce@empresa.com.br" value={form.contactEmail} onChange={(event) => updateForm("contactEmail", event.target.value)} {...fieldState("contactEmail")} />
                        </CompanyField>
                        <CompanyField id="contactPhone" label="Telefone ou WhatsApp" error={errorFor("contactPhone")}>
                          <StudentIconInput id="contactPhone" type="tel" icon={<IoCallOutline aria-hidden="true" />} inputMode="tel" autoComplete="tel" placeholder="(11) 91234-5678" value={form.contactPhone} onChange={updateMaskedPhone} {...fieldState("contactPhone")} />
                        </CompanyField>
                        <CompanySelect
                          id="contactTime"
                          label="Melhor horário para contato"
                          value={form.contactTime}
                          options={[
                            { value: "morning", title: "Manhã" },
                            { value: "afternoon", title: "Tarde" },
                            { value: "night", title: "Noite" },
                            { value: "any", title: "Qualquer horário" },
                          ]}
                          error={errorFor("contactTime")}
                          onChange={(value) => updateForm("contactTime", value as CompanyRegistrationForm["contactTime"])}
                        />
                      </FormGrid>
                    </StudentPanel>
                  ) : step === 3 ? (
                    <>
                      <StudentPanel>
                        <StudentSectionTitle
                          icon={<IoPeopleOutline aria-hidden="true" className="size-5" />}
                          title="Estrutura da empresa"
                          subtitle="As faixas ajudam a dimensionar o atendimento. Você também pode informar o total exato."
                        />
                        <StudentChoiceGrid
                          id="employeeBand"
                          label="Quantos colaboradores trabalham atualmente na empresa?"
                          hint="Selecione uma faixa ou informe o total exato abaixo."
                          error={errorFor("employeeBand")}
                          options={employeeBandOptions.map(({ value, title }) => ({ value, title }))}
                          selected={employeeBand}
                          onSelect={(value) => {
                            updateForm("employeeBand", value)
                            updateForm("employeeExact", "")
                          }}
                          columns={3}
                        />
                        <CompanyField id="employeeExact" label="Quantidade exata" error={errorFor("employeeExact")} hint="Opcional. Se preencher, a faixa será calculada automaticamente.">
                          <StudentIconInput id="employeeExact" icon={<IoPeopleOutline aria-hidden="true" />} inputMode="numeric" type="text" placeholder="Ex.: 84" value={form.employeeExact} onChange={(event) => updateForm("employeeExact", event.target.value.replace(/\D/g, ""))} {...fieldState("employeeExact", true)} />
                        </CompanyField>

                        <fieldset className="space-y-3" aria-describedby={errorFor("sectors") ? "sectors-error" : "sectors-hint"}>
                          <legend className="text-sm leading-5 font-medium text-foreground/90">Quais setores existem na empresa?</legend>
                          <p id="sectors-hint" className="text-xs leading-5 text-muted-foreground">Adicione cada setor. A quantidade é calculada pela lista.</p>
                          <div className="flex flex-col gap-2 sm:flex-row">
                            <select
                              aria-label="Tipo de setor para adicionar"
                              aria-invalid={errorFor("sectors") && form.sectors.length === 0 ? true : undefined}
                              aria-describedby={errorFor("sectors") ? "sectors-error" : undefined}
                              value={sectorDraft}
                              onChange={(event) => setSectorDraft(event.target.value as CompanySector | "")}
                              className="h-11 min-w-0 flex-1 rounded-xl border border-input bg-background/60 px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40"
                            >
                              <option value="">Selecione um setor</option>
                              {companySectorOptions.map((option) => (
                                <option
                                  key={option.value}
                                  value={option.value}
                                  disabled={option.value !== "other" && form.sectors.some((sector) => sector.category === option.value)}
                                >
                                  {option.title}
                                </option>
                              ))}
                            </select>
                            {sectorDraft === "other" ? (
                              <input
                                aria-label="Nome do outro setor"
                                value={otherSectorDraft}
                                onChange={(event) => setOtherSectorDraft(event.target.value)}
                                placeholder="Nome do setor"
                                className="h-11 min-w-0 flex-1 rounded-xl border border-input bg-background/60 px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40"
                              />
                            ) : null}
                            <Button type="button" variant="outline" className="h-11 rounded-xl" disabled={!sectorDraft || (sectorDraft === "other" && !otherSectorDraft.trim())} onClick={addSector}>
                              <IoAddOutline aria-hidden="true" className="size-4" /> Adicionar
                            </Button>
                          </div>
                          {errorFor("sectors") ? <p id="sectors-error" role="alert" className="text-xs leading-5 text-destructive">{errorFor("sectors")}</p> : null}
                          {form.sectors.length > 0 ? (
                            <p className="text-xs font-medium text-muted-foreground">{form.sectors.length} {form.sectors.length === 1 ? "setor adicionado" : "setores adicionados"}</p>
                          ) : null}
                          <div className="space-y-3">
                            {form.sectors.map((sector, index) => (
                              <div key={sector.id} className="space-y-4 rounded-2xl border border-border/70 bg-background/45 p-4">
                                <div className="flex items-start justify-between gap-4">
                                  <div>
                                    <h3 className="text-sm font-semibold text-foreground">{companySectorTitle(sector)}</h3>
                                    <p className="mt-1 text-xs leading-5 text-muted-foreground">Informe os horários deste setor se forem diferentes dos horários gerais.</p>
                                  </div>
                                  <Button type="button" variant="ghost" size="icon-sm" className="size-9 shrink-0 rounded-full text-muted-foreground hover:text-destructive" aria-label={`Remover setor ${companySectorTitle(sector)}`} onClick={() => removeSector(sector.id)}>
                                    <IoTrashOutline aria-hidden="true" className="size-4" />
                                  </Button>
                                </div>
                                <CheckCard
                                  id={`sector-same-hours-${sector.id}`}
                                  label="Este setor segue os horários gerais da empresa"
                                  checked={sector.sameAsCompanyHours}
                                  onCheckedChange={(checked) => updateSector(sector.id, "sameAsCompanyHours", checked)}
                                />
                                {!sector.sameAsCompanyHours ? (
                                  <div className="space-y-4">
                                    <StudentChoiceGrid
                                      id={`sector-days-${sector.id}`}
                                      label={`Dias de funcionamento — ${companySectorTitle(sector)}`}
                                      error={
                                        attemptedSteps.has(3) && sector.days.length === 0
                                          ? "Selecione os dias deste setor."
                                          : undefined
                                      }
                                      options={weekdayOptions}
                                      selected={sector.days}
                                      onSelect={(day) => updateSector(sector.id, "days", toggleWeekday(sector.days, day))}
                                      columns={3}
                                    />
                                    <div className="space-y-3">
                                      {sector.schedules.map((schedule, scheduleIndex) => (
                                        <div key={schedule.id} className="grid items-end gap-3 sm:grid-cols-[1fr_1fr_auto]">
                                          <CompanyField id={`sector-${sector.id}-start-${schedule.id}`} label={`Início ${scheduleIndex + 1}`}>
                                            <StudentIconInput id={`sector-${sector.id}-start-${schedule.id}`} icon={<IoTimeOutline aria-hidden="true" />} type="time" value={schedule.startTime} aria-invalid={startTimeIsInvalid(schedule.startTime) ? true : undefined} aria-describedby={errorFor("sectors") ? "sectors-error" : undefined} onChange={(event) => updateSectorSchedule(sector.id, schedule.id, "startTime", event.target.value)} />
                                          </CompanyField>
                                          <CompanyField id={`sector-${sector.id}-end-${schedule.id}`} label={`Término ${scheduleIndex + 1}`}>
                                            <StudentIconInput id={`sector-${sector.id}-end-${schedule.id}`} icon={<IoTimeOutline aria-hidden="true" />} type="time" value={schedule.endTime} aria-invalid={endTimeIsInvalid(schedule.startTime, schedule.endTime) ? true : undefined} aria-describedby={errorFor("sectors") ? "sectors-error" : undefined} onChange={(event) => updateSectorSchedule(sector.id, schedule.id, "endTime", event.target.value)} />
                                          </CompanyField>
                                          <Button type="button" variant="ghost" size="icon-sm" className="mb-0.5 size-10 rounded-full text-muted-foreground hover:text-destructive" aria-label={`Remover horário ${scheduleIndex + 1} de ${companySectorTitle(sector)}`} onClick={() => removeSectorSchedule(sector.id, schedule.id)}>
                                            <IoTrashOutline aria-hidden="true" className="size-4" />
                                          </Button>
                                        </div>
                                      ))}
                                      <Button type="button" variant="outline" className="h-10 rounded-xl" aria-invalid={attemptedSteps.has(3) && sector.schedules.length === 0 ? true : undefined} aria-describedby={errorFor("sectors") ? "sectors-error" : undefined} onClick={() => addSectorSchedule(sector.id)}>
                                        <IoAddOutline aria-hidden="true" className="size-4" /> Adicionar horário
                                      </Button>
                                    </div>
                                  </div>
                                ) : null}
                              </div>
                            ))}
                          </div>
                        </fieldset>

                        <StudentChoiceGrid
                          id="workArrangement"
                          label="Os colaboradores trabalham…"
                          error={errorFor("workArrangement")}
                          options={[
                            { value: "onsite", title: "Presencialmente" },
                            { value: "remote", title: "Remotamente" },
                            { value: "hybrid", title: "Em formato híbrido" },
                          ]}
                          selected={form.workArrangement}
                          onSelect={(value) => updateForm("workArrangement", value)}
                        />
                        <StudentChoiceGrid
                          id="spaceAvailability"
                          label="A empresa tem espaço para ginástica laboral?"
                          error={errorFor("spaceAvailability")}
                          options={[
                            { value: "ample", title: "Sim, espaço amplo" },
                            { value: "limited", title: "Sim, espaço limitado" },
                            { value: "none", title: "Não possui espaço específico" },
                            { value: "unknown", title: "Não sabe informar" },
                          ]}
                          selected={form.spaceAvailability}
                          onSelect={(value) => updateForm("spaceAvailability", value)}
                        />
                      </StudentPanel>

                      <StudentPanel>
                        <StudentSectionTitle
                          icon={<IoTimeOutline aria-hidden="true" className="size-5" />}
                          title="Funcionamento e turnos"
                          subtitle="Informe os horários gerais e acrescente turnos quando a empresa trabalhar em horários diferentes."
                        />
                        <FormGrid>
                          <CompanyField id="openingTime" label="Horário de abertura" error={errorFor("openingTime")}>
                            <StudentIconInput id="openingTime" icon={<IoTimeOutline aria-hidden="true" />} type="time" value={form.openingTime} onChange={(event) => updateForm("openingTime", event.target.value)} {...fieldState("openingTime")} />
                          </CompanyField>
                          <CompanyField id="closingTime" label="Horário de fechamento" error={errorFor("closingTime")}>
                            <StudentIconInput id="closingTime" icon={<IoTimeOutline aria-hidden="true" />} type="time" value={form.closingTime} onChange={(event) => updateForm("closingTime", event.target.value)} {...fieldState("closingTime")} />
                          </CompanyField>
                        </FormGrid>
                        <StudentChoiceGrid
                          id="operatingDays"
                          label="Dias de funcionamento"
                          hint="Pode selecionar mais de um dia."
                          error={errorFor("operatingDays")}
                          options={weekdayOptions}
                          selected={form.operatingDays}
                          onSelect={(day) => updateForm("operatingDays", toggleWeekday(form.operatingDays, day))}
                          columns={3}
                        />
                        <StudentChoiceGrid
                          id="hasShifts"
                          label="A empresa trabalha com turnos?"
                          error={errorFor("hasShifts")}
                          options={[
                            { value: "yes", title: "Sim" },
                            { value: "no", title: "Não" },
                          ]}
                          selected={form.hasShifts}
                          onSelect={(value) => {
                            updateForm("hasShifts", value)
                            if (value === "no") {
                              updateForm("hasNightShift", "")
                              updateForm("shifts", [])
                            }
                          }}
                        />
                        {form.hasShifts === "yes" ? (
                          <div className="space-y-4 rounded-2xl border border-primary/15 bg-primary/[0.035] p-4 sm:p-5">
                            <StudentChoiceGrid
                              id="hasNightShift"
                              label="A empresa possui turno noturno?"
                              error={errorFor("hasNightShift")}
                              options={[
                                { value: "yes", title: "Sim" },
                                { value: "no", title: "Não" },
                              ]}
                              selected={form.hasNightShift}
                              onSelect={(value) => updateForm("hasNightShift", value)}
                            />
                            <div className="space-y-3">
                              <div>
                                <h3 className="text-sm font-semibold text-foreground">Horários dos turnos</h3>
                                <p className="mt-1 text-xs leading-5 text-muted-foreground">Adicione primeiro, segundo, terceiro e outros turnos conforme necessário.</p>
                              </div>
                              <div className="flex flex-col gap-2 sm:flex-row">
                                <select
                                  aria-label="Turno para adicionar"
                                  aria-invalid={errorFor("shifts") && form.shifts.length === 0 ? true : undefined}
                                  aria-describedby={errorFor("shifts") ? "shifts-error" : undefined}
                                  value={shiftDraft}
                                  onChange={(event) => setShiftDraft(event.target.value as typeof shiftDraft)}
                                  className="h-11 min-w-0 flex-1 rounded-xl border border-input bg-background/60 px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40"
                                >
                                  <option value="">Selecione um turno</option>
                                  <option value="first" disabled={form.shifts.some((shift) => shift.kind === "first")}>Primeiro turno</option>
                                  <option value="second" disabled={form.shifts.some((shift) => shift.kind === "second")}>Segundo turno</option>
                                  <option value="third" disabled={form.shifts.some((shift) => shift.kind === "third")}>Terceiro turno</option>
                                  <option value="other">Outro</option>
                                </select>
                                {shiftDraft === "other" ? (
                                  <input aria-label="Nome do outro turno" value={otherShiftDraft} onChange={(event) => setOtherShiftDraft(event.target.value)} placeholder="Nome do turno" className="h-11 min-w-0 flex-1 rounded-xl border border-input bg-background/60 px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40" />
                                ) : null}
                                <Button type="button" variant="outline" className="h-11 rounded-xl" disabled={!shiftDraft || (shiftDraft === "other" && !otherShiftDraft.trim())} onClick={addShift}>
                                  <IoAddOutline aria-hidden="true" className="size-4" /> Adicionar
                                </Button>
                              </div>
                                {errorFor("shifts") ? <p id="shifts-error" role="alert" className="text-xs leading-5 text-destructive">{errorFor("shifts")}</p> : null}
                              <div className="space-y-3">
                                {form.shifts.map((shift, index) => {
                                  const title = shift.kind === "first" ? "Primeiro turno" : shift.kind === "second" ? "Segundo turno" : shift.kind === "third" ? "Terceiro turno" : shift.customName
                                  return (
                                    <div key={shift.id} className="space-y-3 rounded-xl border border-border/60 bg-background/50 p-3">
                                      <div className="flex items-center justify-between gap-3">
                                        <p className="text-sm font-medium text-foreground">{title || `Turno ${index + 1}`}</p>
                                        <Button type="button" variant="ghost" size="icon-sm" className="size-8 rounded-full text-muted-foreground hover:text-destructive" aria-label={`Remover ${title || `turno ${index + 1}`}`} onClick={() => removeShift(shift.id)}>
                                          <IoTrashOutline aria-hidden="true" className="size-4" />
                                        </Button>
                                      </div>
                                      {shift.kind === "other" ? (
                                        <CompanyField id={`shift-name-${shift.id}`} label="Nome do turno">
                                          <StudentIconInput id={`shift-name-${shift.id}`} icon={<IoTimeOutline aria-hidden="true" />} value={shift.customName} aria-invalid={attemptedSteps.has(3) && shift.kind === "other" && !shift.customName.trim() ? true : undefined} aria-describedby={errorFor("shifts") ? "shifts-error" : undefined} onChange={(event) => updateShift(shift.id, "customName", event.target.value)} />
                                        </CompanyField>
                                      ) : null}
                                      <FormGrid>
                                        <CompanyField id={`shift-start-${shift.id}`} label="Início do turno">
                                          <StudentIconInput id={`shift-start-${shift.id}`} icon={<IoTimeOutline aria-hidden="true" />} type="time" value={shift.startTime} aria-invalid={startTimeIsInvalid(shift.startTime) ? true : undefined} aria-describedby={errorFor("shifts") ? "shifts-error" : undefined} onChange={(event) => updateShift(shift.id, "startTime", event.target.value)} />
                                        </CompanyField>
                                        <CompanyField id={`shift-end-${shift.id}`} label="Término do turno">
                                          <StudentIconInput id={`shift-end-${shift.id}`} icon={<IoTimeOutline aria-hidden="true" />} type="time" value={shift.endTime} aria-invalid={endTimeIsInvalid(shift.startTime, shift.endTime) ? true : undefined} aria-describedby={errorFor("shifts") ? "shifts-error" : undefined} onChange={(event) => updateShift(shift.id, "endTime", event.target.value)} />
                                        </CompanyField>
                                      </FormGrid>
                                    </div>
                                  )
                                })}
                              </div>
                            </div>
                          </div>
                        ) : null}
                      </StudentPanel>
                    </>
                  ) : step === 4 ? (
                    <StudentPanel>
                      <StudentSectionTitle
                        icon={<IoFitnessOutline aria-hidden="true" className="size-5" />}
                        title="Modelo de ginástica laboral"
                        subtitle="Selecione os formatos que gostaria de avaliar. Se ainda não souber, peça orientação."
                      />
                      <StudentChoiceGrid
                        id="serviceModes"
                        label="Como gostaria de organizar as sessões?"
                        hint="Pode escolher mais de um formato. “Quero orientação” deve ficar sozinha."
                        error={errorFor("serviceModes")}
                        options={[
                          { value: "collective", title: "Sessão coletiva", description: "Todos participam juntos no mesmo horário." },
                          { value: "sector", title: "Por setor", description: "Cada equipe participa em seu próprio horário." },
                          { value: "shift", title: "Por turno", description: "Sessões conforme os turnos de trabalho." },
                          { value: "guidance", title: "Quero orientação", description: "Ainda não sei qual modelo escolher." },
                        ]}
                        selected={form.serviceModes}
                        onSelect={(value) => updateServiceModes(value)}
                      />
                      {form.serviceModes.includes("collective") ? (
                        <div className="rounded-2xl border border-primary/15 bg-primary/[0.035] p-4">
                          <StudentChoiceGrid
                            id="collectiveSpace"
                            label="Há espaço para reunir todos os colaboradores ao mesmo tempo?"
                            error={errorFor("collectiveSpace")}
                            options={[
                              { value: "yes", title: "Sim" },
                              { value: "no", title: "Não" },
                              { value: "needs_evaluation", title: "Precisa avaliar" },
                            ]}
                            selected={form.collectiveSpace}
                            onSelect={(value) => updateForm("collectiveSpace", value)}
                          />
                        </div>
                      ) : null}
                      <StudentChoiceGrid
                        id="frequency"
                        label="Com que frequência gostaria de oferecer as sessões?"
                        error={errorFor("frequency")}
                        options={companyFrequencyOptions}
                        selected={form.frequency}
                        onSelect={(value) => updateForm("frequency", value)}
                        columns={3}
                      />
                      <StudentChoiceGrid
                        id="duration"
                        label="Qual seria a duração de cada sessão?"
                        error={errorFor("duration")}
                        options={companyDurationOptions}
                        selected={form.duration}
                        onSelect={(value) => updateForm("duration", value)}
                        columns={3}
                      />
                    </StudentPanel>
                  ) : step === 5 ? (
                    <>
                      <StudentPanel>
                        <StudentSectionTitle
                          icon={<IoCashOutline aria-hidden="true" className="size-5" />}
                          title="Interesse na contratação"
                          subtitle="Não é uma contratação. Essas respostas ajudam a entender o momento da empresa."
                        />
                        <StudentChoiceGrid
                          id="contractInterest"
                          label="Qual é o interesse inicial da empresa?"
                          error={errorFor("contractInterest")}
                          options={companyContractInterestOptions}
                          selected={form.contractInterest}
                          onSelect={(value) => updateForm("contractInterest", value)}
                        />
                        <StudentChoiceGrid
                          id="startWindow"
                          label="Quando gostaria de iniciar as atividades?"
                          error={errorFor("startWindow")}
                          options={companyStartWindowOptions}
                          selected={form.startWindow}
                          onSelect={(value) => updateForm("startWindow", value)}
                          columns={3}
                        />
                        <StudentChoiceGrid
                          id="budgetStatus"
                          label="A empresa possui orçamento definido?"
                          error={errorFor("budgetStatus")}
                          options={[
                            { value: "yes", title: "Sim" },
                            { value: "no", title: "Não" },
                            { value: "wants_values", title: "Quer conhecer os valores primeiro" },
                          ]}
                          selected={form.budgetStatus}
                          onSelect={(value) => {
                            updateForm("budgetStatus", value)
                            if (value !== "yes") updateForm("budgetAmount", "")
                          }}
                        />
                        {form.budgetStatus === "yes" ? (
                          <CompanyField id="budgetAmount" label="Orçamento mensal disponível" hint="Opcional. Informe um valor aproximado em reais.">
                            <InputGroup className="h-11 rounded-xl bg-background/60 transition-colors focus-within:bg-background/80">
                              <InputGroupAddon align="inline-start" className="pl-3 pr-1 text-muted-foreground">R$</InputGroupAddon>
                              <InputGroupInput id="budgetAmount" inputMode="decimal" type="number" min="0" step="0.01" placeholder="0,00" value={form.budgetAmount} onChange={(event) => updateForm("budgetAmount", event.target.value)} {...fieldState("budgetAmount", true)} className="h-11 text-sm" />
                            </InputGroup>
                          </CompanyField>
                        ) : null}
                      </StudentPanel>

                      <StudentPanel>
                        <StudentSectionTitle
                          icon={<IoCalendarOutline aria-hidden="true" className="size-5" />}
                          title="Objetivos e necessidades"
                          subtitle="O que a empresa espera alcançar com a ginástica laboral?"
                        />
                        <StudentChoiceGrid
                          id="goals"
                          label="Quais são os principais objetivos?"
                          hint="Pode selecionar mais de um."
                          error={errorFor("goals")}
                          options={companyGoalOptions}
                          selected={form.goals}
                          onSelect={updateGoals}
                          columns={2}
                        />
                        {form.goals.includes("other") ? (
                          <CompanyField id="otherGoal" label="Qual outro objetivo?" error={errorFor("otherGoal")}>
                            <StudentIconInput id="otherGoal" icon={<IoCalendarOutline aria-hidden="true" />} placeholder="Descreva o objetivo" value={form.otherGoal} onChange={(event) => updateForm("otherGoal", event.target.value)} {...fieldState("otherGoal")} />
                          </CompanyField>
                        ) : null}
                        <StudentChoiceGrid
                          id="priorExperience"
                          label="A empresa já ofereceu ginástica laboral?"
                          error={errorFor("priorExperience")}
                          options={companyPriorExperienceOptions}
                          selected={form.priorExperience}
                          onSelect={(value) => updateForm("priorExperience", value)}
                        />
                        <CompanyTextarea
                          id="specificNeeds"
                          label="Há alguma necessidade específica para compartilhar com o profissional?"
                          value={form.specificNeeds}
                          onChange={(value) => updateForm("specificNeeds", value)}
                          hint="Opcional."
                          placeholder="Conte algo que ajude a entender a rotina da empresa."
                        />
                      </StudentPanel>
                    </>
                  ) : (
                    <>
                      <StudentPanel>
                        <StudentSectionTitle
                          icon={<IoDocumentTextOutline aria-hidden="true" className="size-5" />}
                          title="Revise as informações"
                          subtitle="Confira o resumo. Use as etapas acima para ajustar os dados antes de concluir."
                        />
                        <dl className="divide-y divide-border/50 rounded-2xl border border-border/60 bg-background/40 px-4 sm:px-5">
                          <SummaryRow label="Empresa" value={`${form.tradeName || form.legalName} · ${form.cnpj || "CNPJ não informado"}`} />
                          <SummaryRow label="Endereço" value={[form.street, form.number, form.city, form.state].filter(Boolean).join(", ")} />
                          <SummaryRow label="Responsável" value={`${form.contactName}${form.contactEmail ? ` · ${form.contactEmail}` : ""}`} />
                          <SummaryRow label="Colaboradores e setores" value={`${form.employeeExact || employeeBandOptions.find((option) => option.value === employeeBand)?.title || "Não informado"} · ${form.sectors.map(companySectorTitle).join(", ")}`} />
                          <SummaryRow label="Atendimento" value={form.serviceModes.map((mode) => mode === "collective" ? "Coletivo" : mode === "sector" ? "Por setor" : mode === "shift" ? "Por turno" : "Orientação").join(", ")} />
                          <SummaryRow label="Frequência e início" value={`${companyFrequencyOptions.find((option) => option.value === form.frequency)?.title ?? "Não informado"} · ${companyStartWindowOptions.find((option) => option.value === form.startWindow)?.title ?? "Não informado"}`} />
                        </dl>
                      </StudentPanel>

                      <StudentPanel>
                        <StudentSectionTitle
                          icon={<IoShieldCheckmarkOutline aria-hidden="true" className="size-5" />}
                          title="Termos e confirmações"
                          subtitle="Leia os documentos e confirme cada declaração para concluir a demonstração."
                        />
                        <CheckCard
                          id="termsAccepted"
                          label="Li e aceito os Termos de Uso desta demonstração."
                          checked={form.termsAccepted}
                          onCheckedChange={(checked) => updateForm("termsAccepted", checked)}
                          error={errorFor("termsAccepted")}
                        >
                          <Link href="/termos-de-uso" target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex rounded-sm text-xs font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40">
                            Ler Termos de Uso da demonstração
                          </Link>
                        </CheckCard>
                        <CheckCard
                          id="privacyAcknowledged"
                          label="Li a Política de Privacidade e entendi que o CNPJ será consultado no Open CNPJ."
                          checked={form.privacyAcknowledged}
                          onCheckedChange={(checked) => updateForm("privacyAcknowledged", checked)}
                          error={errorFor("privacyAcknowledged")}
                        >
                          <Link href="/privacidade#cadastro-empresa" target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex rounded-sm text-xs font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40">
                            Ler Política de Privacidade
                          </Link>
                        </CheckCard>
                        <CheckCard
                          id="contactAuthorized"
                          label="Autorizo o contato do EHFI sobre esta solicitação."
                          checked={form.contactAuthorized}
                          onCheckedChange={(checked) => updateForm("contactAuthorized", checked)}
                          error={errorFor("contactAuthorized")}
                          description="Esta autorização é demonstrativa; nenhum contato será realizado por este protótipo."
                        />
                        <CheckCard
                          id="accuracyConfirmed"
                          label="Confirmo que revisei as informações e que estão corretas de acordo com o que sei."
                          checked={form.accuracyConfirmed}
                          onCheckedChange={(checked) => updateForm("accuracyConfirmed", checked)}
                          error={errorFor("accuracyConfirmed")}
                        />
                      </StudentPanel>
                    </>
                  )}
                </motion.div>
              </AnimatePresence>
            </form>
          </CardContent>
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
                onClick={() => navigateToStep((step - 1) as CompanySignupStep)}
              >
                <IoArrowBackOutline aria-hidden="true" className="size-4" /> Voltar
              </Button>
            ) : (
              <span className="hidden sm:block" />
            )}
            <Button
              form="company-signup-form"
              type="submit"
              className="h-12 w-full rounded-xl px-5 font-semibold shadow-[0_8px_24px_-10px_color-mix(in_oklch,var(--primary)_65%,transparent)] sm:w-auto"
            >
              {step === 6 ? "Concluir cadastro" : "Continuar"}
              <IoArrowForwardOutline aria-hidden="true" className="size-4" />
            </Button>
          </div>
          <p className="mx-auto mt-2 max-w-6xl text-center text-[0.68rem] text-muted-foreground sm:hidden">
            Nenhuma resposta será enviada ao EHFI ou salva.
          </p>
        </div>
      </section>
    </main>
  )
}
