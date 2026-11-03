"use client"

import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import {
  IoArrowBackOutline,
  IoArrowForwardOutline,
  IoBookOutline,
  IoBusinessOutline,
  IoCalendarOutline,
  IoCallOutline,
  IoCardOutline,
  IoCheckmarkOutline,
  IoDocumentTextOutline,
  IoEyeOffOutline,
  IoEyeOutline,
  IoFitnessOutline,
  IoLocationOutline,
  IoLogoInstagram,
  IoMailOutline,
  IoMapOutline,
  IoPeopleOutline,
  IoPersonOutline,
  IoSchoolOutline,
  IoSparklesOutline,
  IoShieldCheckmarkOutline,
  IoTimeOutline,
  IoTrashOutline,
} from "react-icons/io5"

import { ThemeToggle } from "@/components/ehfi/theme-toggle"
import { PrivatePdfUpload } from "@/components/ehfi/private-pdf-upload"
import { finalizeProfessionalRegistration } from "@/app/actions/registrations"
import { ProfessionalSignupStepper, type ProfessionalSignupStep } from "@/components/ehfi/professional-signup-stepper"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { StudentPasswordStrength as PasswordStrengthIndicator } from "@/components/ehfi/student-signup-fields"
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useRegistrationDraft } from "@/hooks/use-registration-draft"
import type { DraftFileReference } from "@/lib/registration-drafts/types"
import {
  ehfiEase,
  ehfiMotion,
  fieldRevealVariants,
  panelRevealVariants,
  stillFieldVariants,
  stillPanelVariants,
  entranceProps,
} from "@/lib/ehfi-motion"
import {
  AcademicForm,
  AcademicStatus,
  AlternativeDocument,
  CrefField,
  CrefForm,
  DiplomaAvailability,
  FormationType,
  PersonalField,
  PersonalForm,
  ProfessionalLaborForm,
  SelectedFile,
  SignupTerms,
  formatBirthDate,
  formatCpf,
  formatPhone,
  formatWithCaret,
  crefCouncilOptions,
  formationOptions,
  getRequiredProof,
  initialAcademic,
  initialCref,
  initialPersonal,
  initialProfessionalLabor,
  initialSignupTerms,
  proofLabels,
  validateAcademic,
  validateCref,
  validateProfessionalLabor,
  validatePersonal,
  validateSignupTerms,
} from "@/lib/professional-registration"

type FieldProps = {
  id: string
  label: string
  error?: string
  hint?: string
  revealOrder?: number
  children: React.ReactNode
}

function FormField({ id, label, error, hint, revealOrder = 0, children }: FieldProps) {
  const prefersReducedMotion = Boolean(useReducedMotion())

  return (
    <motion.div
      data-ehfi-reveal
      variants={prefersReducedMotion ? stillFieldVariants : fieldRevealVariants}
      custom={revealOrder * ehfiMotion.stagger.field}
      initial={prefersReducedMotion ? false : "hidden"}
      whileInView="visible"
      viewport={{ once: true, amount: 0.18 }}
      className="min-w-0 space-y-2 [&_[data-slot=input-group-control]]:!h-11"
    >
      <Label htmlFor={id} className="text-sm font-medium text-foreground/90">
        {label}
      </Label>
      {children}
      {error ? (
        <p id={`${id}-error`} role="alert" className="text-xs leading-5 text-destructive">
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs leading-5 text-muted-foreground">{hint}</p>
      ) : null}
    </motion.div>
  )
}

type IconInputProps = React.ComponentProps<typeof InputGroupInput> & {
  icon: React.ReactNode
  trailing?: React.ReactNode
}

function IconInput({ icon, trailing, ...props }: IconInputProps) {
  return (
    <InputGroup className="h-11 rounded-xl bg-background/60 transition-colors focus-within:bg-background/80">
      <InputGroupInput {...props} className="h-11 text-sm" />
      <InputGroupAddon
        align="inline-start"
        className="pl-3 pr-1 text-ehfi-secondary/80 [&_svg]:size-[18px]"
      >
        {icon}
      </InputGroupAddon>
      {trailing ? (
        <InputGroupAddon align="inline-end" className="py-0 pr-0.5">
          {trailing}
        </InputGroupAddon>
      ) : null}
    </InputGroup>
  )
}

function PasswordVisibilityButton({
  visible,
  label,
  onToggle,
}: {
  visible: boolean
  label: string
  onToggle: () => void
}) {
  const action = visible ? "Ocultar" : "Mostrar"

  return (
    <InputGroupButton
      size="icon-sm"
      className="size-11 rounded-xl p-0 text-muted-foreground hover:text-foreground"
      aria-label={`${action} ${label}`}
      aria-pressed={visible}
      title={`${action} ${label}`}
      onClick={onToggle}
    >
      {visible ? (
        <IoEyeOffOutline aria-hidden="true" className="size-5" />
      ) : (
        <IoEyeOutline aria-hidden="true" className="size-5" />
      )}
    </InputGroupButton>
  )
}

function SectionTitle({
  icon,
  title,
  subtitle,
  revealOrder = 0,
}: {
  icon: React.ReactNode
  title: string
  subtitle: string
  revealOrder?: number
}) {
  const prefersReducedMotion = Boolean(useReducedMotion())

  return (
    <motion.div
      data-ehfi-reveal
      variants={prefersReducedMotion ? stillFieldVariants : fieldRevealVariants}
      custom={revealOrder * ehfiMotion.stagger.field}
      initial={prefersReducedMotion ? false : "hidden"}
      whileInView="visible"
      viewport={{ once: true, amount: 0.18 }}
      className="mb-5 flex items-start gap-3"
    >
      <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-secondary text-ehfi-secondary">
        {icon}
      </span>
      <div className="min-w-0">
        <h2 className="font-heading text-base font-semibold tracking-tight text-foreground sm:text-lg">
          {title}
        </h2>
        <p className="mt-1 text-sm leading-5 text-muted-foreground">{subtitle}</p>
      </div>
    </motion.div>
  )
}

function Panel({ children }: { children: React.ReactNode }) {
  const prefersReducedMotion = Boolean(useReducedMotion())

  return (
    <motion.div
      data-ehfi-reveal
      variants={prefersReducedMotion ? stillPanelVariants : panelRevealVariants}
      initial={prefersReducedMotion ? false : "hidden"}
      whileInView="visible"
      viewport={{ once: true, amount: 0.12, margin: "0px 0px -40px 0px" }}
      className="min-w-0"
    >
      <Card className="gap-0 rounded-3xl border-border/70 bg-card/75 py-5 shadow-[0_16px_44px_-32px_rgba(25,16,40,0.28)] backdrop-blur-xl sm:py-6">
        <CardContent className="gap-0 px-4 sm:px-6">{children}</CardContent>
      </Card>
    </motion.div>
  )
}

function SelectableCard({
  title,
  description,
  selected,
  onClick,
  revealOrder = 0,
  errorId,
}: {
  title: string
  description: string
  selected: boolean
  onClick: () => void
  revealOrder?: number
  errorId?: string
}) {
  const prefersReducedMotion = Boolean(useReducedMotion())

  return (
    <motion.button
      type="button"
      aria-pressed={selected}
      aria-invalid={errorId ? true : undefined}
      aria-describedby={errorId}
      variants={prefersReducedMotion ? stillFieldVariants : fieldRevealVariants}
      custom={revealOrder * ehfiMotion.stagger.field}
      initial={prefersReducedMotion ? false : "hidden"}
      whileInView="visible"
      viewport={{ once: true, amount: 0.18 }}
      onClick={onClick}
      className={`group min-h-20 rounded-2xl border px-4 py-3 text-left outline-none transition-[border-color,background-color,box-shadow] duration-200 focus-visible:ring-3 focus-visible:ring-ring/40 ${
        selected
          ? "border-primary/60 bg-primary/[0.07] shadow-[0_0_0_3px_color-mix(in_oklch,var(--primary)_10%,transparent)]"
          : "border-border/80 bg-background/45 hover:border-primary/30 hover:bg-background/75"
      }`}
    >
      <span className="flex items-start justify-between gap-3">
        <span>
          <span className="block text-sm font-semibold text-foreground">{title}</span>
          <span className="mt-1 block text-xs leading-5 text-muted-foreground">{description}</span>
        </span>
        <span
          aria-hidden="true"
          className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border transition-colors ${
            selected ? "border-primary bg-primary text-primary-foreground" : "border-input bg-background"
          }`}
        >
          {selected ? <IoCheckmarkOutline className="size-3.5" /> : null}
        </span>
      </span>
    </motion.button>
  )
}

const formationIconMap = {
  school: IoSchoolOutline,
  person: IoPersonOutline,
  construct: IoFitnessOutline,
  ribbon: IoSparklesOutline,
  "ellipsis-horizontal-circle": IoPeopleOutline,
} as const

function normalizeFormationSearch(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("pt-BR")
}

function toggleLaborOption<T extends string>(options: T[], option: T, checked: boolean) {
  if (checked) return options.includes(option) ? options : [...options, option]
  return options.filter((current) => current !== option)
}

function LaborCheckboxOption({
  id,
  label,
  checked,
  onCheckedChange,
}: {
  id: string
  label: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
}) {
  return (
    <Label htmlFor={id} className="flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border border-border/70 bg-background/45 px-3 py-2.5 text-sm leading-5 text-foreground/90 transition-colors hover:border-primary/30 hover:bg-background/75">
      <Checkbox id={id} checked={checked} onCheckedChange={(nextChecked) => onCheckedChange(nextChecked === true)} />
      <span>{label}</span>
    </Label>
  )
}

const laborExperienceOptions = [
  { value: "experienced", title: "Sim", description: "Já atuei com ginástica laboral." },
  { value: "not_experienced", title: "Não", description: "Ainda não tenho experiência na área." },
  { value: "interested_without_experience", title: "Não tenho experiência, mas tenho interesse em atuar na área", description: "Quero começar a atuar com ginástica laboral." },
] as const

const laborServiceModeOptions = [
  { value: "collective", label: "Sessões coletivas com todos os colaboradores" },
  { value: "sector", label: "Sessões separadas por setor" },
  { value: "shift", label: "Sessões por turno" },
] as const

const laborPeriodOptions = [
  { value: "morning", label: "Manhã" },
  { value: "afternoon", label: "Tarde" },
  { value: "evening", label: "Noite" },
  { value: "overnight", label: "Madrugada" },
] as const

const laborDayOptions = [
  { value: "monday", label: "Segunda-feira" },
  { value: "tuesday", label: "Terça-feira" },
  { value: "wednesday", label: "Quarta-feira" },
  { value: "thursday", label: "Quinta-feira" },
  { value: "friday", label: "Sexta-feira" },
  { value: "saturday", label: "Sábado" },
  { value: "sunday", label: "Domingo" },
] as const

const laborFrequencyOptions = [
  { value: "weekly_1", title: "Uma vez por semana", description: "Uma sessão semanal." },
  { value: "weekly_2", title: "Duas vezes por semana", description: "Duas sessões semanais." },
  { value: "weekly_3", title: "Três vezes por semana", description: "Três sessões semanais." },
  { value: "weekdays", title: "Todos os dias úteis", description: "Atendimentos de segunda a sexta-feira." },
  { value: "flexible", title: "Horários flexíveis, conforme negociação", description: "A combinar conforme a necessidade." },
] as const

export function ProfessionalSignup() {
  const router = useRouter()
  const prefersReducedMotion = Boolean(useReducedMotion())
  const [step, setStep] = useState<ProfessionalSignupStep>(1)
  const [direction, setDirection] = useState<1 | -1>(1)
  const [continuedSteps, setContinuedSteps] = useState<ReadonlySet<ProfessionalSignupStep>>(() => new Set())
  const pendingInvalidFocusStep = useRef<ProfessionalSignupStep | null>(null)
  const [personal, setPersonal] = useState<PersonalForm>(initialPersonal)
  const [passwordVisible, setPasswordVisible] = useState(false)
  const [passwordConfirmationVisible, setPasswordConfirmationVisible] = useState(false)
  const [academic, setAcademic] = useState<AcademicForm>(initialAcademic)
  const [cref, setCref] = useState<CrefForm>(initialCref)
  const [labor, setLabor] = useState<ProfessionalLaborForm>(initialProfessionalLabor)
  const [serviceAreaDraft, setServiceAreaDraft] = useState("")
  const [signupTerms, setSignupTerms] = useState<SignupTerms>(initialSignupTerms)
  const [uploadedFiles, setUploadedFiles] = useState<DraftFileReference[]>([])
  const laborSelectionScrollPosition = useRef<{ left: number; top: number } | null>(null)
  const signupTermsScrollPosition = useRef<{ left: number; top: number } | null>(null)
  const [selectedFile, setSelectedFile] = useState<SelectedFile | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [submissionError, setSubmissionError] = useState<string | null>(null)
  const didRestoreDraft = useRef(false)
  const [attemptedPersonal, setAttemptedPersonal] = useState(false)
  const [attemptedAcademic, setAttemptedAcademic] = useState(false)
  const [attemptedCref, setAttemptedCref] = useState(false)
  const [attemptedLabor, setAttemptedLabor] = useState(false)
  const [attemptedTerms, setAttemptedTerms] = useState(false)
  const [keyboardInset, setKeyboardInset] = useState(0)
  const draftPayload = useMemo(
    () => ({ personal, academic, cref, labor, terms: signupTerms, selectedFile }),
    [academic, cref, labor, personal, selectedFile, signupTerms]
  )
  const draft = useRegistrationDraft("professional", draftPayload, true)

  useEffect(() => {
    if (draft.status === "loading" || didRestoreDraft.current) return
    didRestoreDraft.current = true
    if (draft.restoredPayload) {
      const restored = draft.restoredPayload as Partial<typeof draftPayload>
      const restoredPersonal = {
        ...initialPersonal,
        ...restored.personal,
        password: "",
        passwordConfirmation: "",
      }
      const restoredAcademic = { ...initialAcademic, ...restored.academic }
      const restoredCref = { ...initialCref, ...restored.cref }
      setPersonal(restoredPersonal)
      setAcademic(restoredAcademic)
      setCref(restoredCref)
      setLabor({ ...initialProfessionalLabor, ...restored.labor })
      setSignupTerms({ ...initialSignupTerms, ...restored.terms })
    }
    const files = draft.draftFiles
    setUploadedFiles(files)
    const required = draft.restoredPayload && typeof draft.restoredPayload === "object"
      ? getRequiredProof(
          { ...initialAcademic, ...(draft.restoredPayload as Partial<typeof draftPayload>).academic }
        )
      : getRequiredProof(academic)
    const academicFile = required ? files.find((file) => file.kind === required) : undefined
    setSelectedFile(
      academicFile
        ? {
            kind: academicFile.kind as SelectedFile["kind"],
            name: academicFile.originalName,
            path: academicFile.path,
            size: academicFile.size,
          }
        : null
    )
  }, [
    academic,
    draft.draftFiles,
    draft.restoredPayload,
    draft.status,
  ])

  useEffect(() => {
    const viewport = window.visualViewport
    if (!viewport) {
      // Browsers that resize the layout viewport already move fixed controls with the keyboard.
      return
    }

    let frame = 0
    const updateKeyboardInset = () => {
      window.cancelAnimationFrame(frame)
      frame = window.requestAnimationFrame(() => {
        const activeElement = document.activeElement
        const isEditing = activeElement instanceof HTMLElement && (
          activeElement.isContentEditable || activeElement.matches("input, textarea, select")
        )
        const coveredHeight = Math.max(0, window.innerHeight - viewport.height - viewport.offsetTop)
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

  const personalErrors = validatePersonal(personal)
  const academicErrors = validateAcademic(academic, selectedFile)
  const crefErrors = validateCref(cref)
  const laborErrors = validateProfessionalLabor(labor)
  const signupTermsErrors = validateSignupTerms(signupTerms)
  const completedSteps = new Set<ProfessionalSignupStep>()
  if (Object.keys(personalErrors).length === 0) completedSteps.add(1)
  if (Object.keys(academicErrors).length === 0) completedSteps.add(2)
  if (Object.keys(crefErrors).length === 0) completedSteps.add(3)
  if (labor.interest !== null && Object.keys(laborErrors).length === 0) completedSteps.add(4)
  if (Object.keys(signupTermsErrors).length === 0) completedSteps.add(5)
  const requiredProof = getRequiredProof(academic)
  const crefPreventsPractice = cref.answer === "awaiting"
    || cref.answer === "none"
    || (cref.answer === "registered" && cref.declaredSituation === "pending_issues")
  const fieldError = (key: PersonalField) => attemptedPersonal ? personalErrors[key] : undefined
  const academicError = (key: keyof typeof academicErrors) => attemptedAcademic ? academicErrors[key] : undefined
  const crefError = (key: CrefField) => attemptedCref ? crefErrors[key] : undefined
  const laborError = (key: keyof typeof laborErrors) => attemptedLabor ? laborErrors[key] : undefined
  const signupTermsError = (key: "privacyAcknowledged" | "authenticityDeclared") => attemptedTerms ? signupTermsErrors[key] : undefined
  const transitionDuration = prefersReducedMotion ? 0 : ehfiMotion.duration.step

  function updatePersonal<K extends PersonalField>(key: K, value: PersonalForm[K]) {
    setPersonal((current) => ({ ...current, [key]: value }))
  }

  function updateMaskedPersonal(
    key: "birthDate" | "cpf" | "phone",
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
    updatePersonal(key, formatted.value)
    requestAnimationFrame(() => {
      input.setSelectionRange(formatted.selectionStart, formatted.selectionEnd)
    })
  }

  function updateAcademic<K extends keyof AcademicForm>(key: K, value: AcademicForm[K]) {
    setAcademic((current) => ({ ...current, [key]: value }))
  }

  function updateCref<K extends keyof CrefForm>(key: K, value: CrefForm[K]) {
    setCref((current) => ({ ...current, [key]: value }))
  }

  function updateDraftFile(kind: DraftFileReference["kind"], value: DraftFileReference | null) {
    setUploadedFiles((current) =>
      value
        ? [...current.filter((file) => file.kind !== kind), value]
        : current.filter((file) => file.kind !== kind)
    )
    if (kind === "diploma" || kind === "transcript" || kind === "completion_declaration") {
      setSelectedFile(
        value
          ? { kind, name: value.originalName, path: value.path, size: value.size }
          : null
      )
    } else if (kind === "cref-card") {
      updateCref("professionalCardFile", value?.path ?? null)
    } else {
      updateCref("requestProofFile", value?.path ?? null)
    }
  }

  function removeDraftReference(path: string | undefined) {
    if (!path) return
    void fetch("/api/registration-draft/files", {
      method: "DELETE",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ path }),
    }).then((response) => {
      if (!response.ok) {
        setSubmissionError("Não foi possível remover o documento anterior do rascunho.")
      }
    }).catch(() => {
      setSubmissionError("Não foi possível remover o documento anterior do rascunho.")
    })
  }

  function updateLabor<K extends keyof ProfessionalLaborForm>(key: K, value: ProfessionalLaborForm[K]) {
    setLabor((current) => ({ ...current, [key]: value }))
  }

  function updateLaborPreservingScroll<K extends keyof ProfessionalLaborForm>(key: K, value: ProfessionalLaborForm[K]) {
    const scrollPosition = laborSelectionScrollPosition.current ?? { left: window.scrollX, top: window.scrollY }
    laborSelectionScrollPosition.current = null
    setLabor((current) => ({ ...current, [key]: value }))
    window.requestAnimationFrame(() => {
      window.scrollTo({ ...scrollPosition, behavior: "instant" })
    })
  }

  function rememberLaborSelectionScroll() {
    laborSelectionScrollPosition.current = { left: window.scrollX, top: window.scrollY }
  }

  function addLaborServiceArea() {
    const serviceArea = serviceAreaDraft.trim().replace(/\s+/g, " ")
    if (!serviceArea) return

    const normalizedServiceArea = normalizeFormationSearch(serviceArea)
    if (!labor.serviceAreas.some((current) => normalizeFormationSearch(current) === normalizedServiceArea)) {
      updateLabor("serviceAreas", [...labor.serviceAreas, serviceArea])
    }
    setServiceAreaDraft("")
  }

  function removeLaborServiceArea(index: number) {
    updateLabor("serviceAreas", labor.serviceAreas.filter((_, currentIndex) => currentIndex !== index))
  }

  function updateSignupTerms<K extends keyof SignupTerms>(key: K, value: SignupTerms[K]) {
    const scrollPosition = signupTermsScrollPosition.current ?? { left: window.scrollX, top: window.scrollY }
    signupTermsScrollPosition.current = null
    setSignupTerms((current) => ({ ...current, [key]: value }))
    window.requestAnimationFrame(() => {
      window.scrollTo({ ...scrollPosition, behavior: "instant" })
    })
  }

  function rememberSignupTermsScroll(target?: EventTarget | null) {
    if (target instanceof Element && target.closest("a")) {
      signupTermsScrollPosition.current = null
      return
    }
    signupTermsScrollPosition.current = { left: window.scrollX, top: window.scrollY }
  }

  function toggleSignupTermsCard(key: keyof SignupTerms, event: React.MouseEvent<HTMLDivElement>) {
    const target = event.target
    if (target instanceof Element && target.closest("a, [data-slot='checkbox']")) return
    updateSignupTerms(key, !signupTerms[key])
  }

  function scrollToFirstInvalidField() {
    requestAnimationFrame(() => {
      const firstInvalidField = document.querySelector<HTMLElement>("[aria-invalid='true']")
      firstInvalidField?.focus({ preventScroll: true })
      firstInvalidField?.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "center" })
    })
  }

  useEffect(() => {
    if (!prefersReducedMotion || pendingInvalidFocusStep.current !== step) return

    const frame = window.requestAnimationFrame(() => {
      if (pendingInvalidFocusStep.current !== step) return
      pendingInvalidFocusStep.current = null
      const firstInvalidField = document.querySelector<HTMLElement>("[aria-invalid='true']")
      firstInvalidField?.focus({ preventScroll: true })
      firstInvalidField?.scrollIntoView({ behavior: "auto", block: "center" })
    })

    return () => window.cancelAnimationFrame(frame)
  }, [prefersReducedMotion, step])

  function navigateToStep(nextStep: ProfessionalSignupStep) {
    if (nextStep === step) return
    pendingInvalidFocusStep.current = null
    setDirection(nextStep > step ? 1 : -1)
    setStep(nextStep)
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" })
  }

  function continueToAcademic(form?: HTMLFormElement) {
    const currentPersonal = form
      ? {
          ...personal,
          birthDate: formatBirthDate(form.querySelector<HTMLInputElement>("#birthDate")?.value ?? personal.birthDate),
          cpf: formatCpf(form.querySelector<HTMLInputElement>("#cpf")?.value ?? personal.cpf),
          phone: formatPhone(form.querySelector<HTMLInputElement>("#phone")?.value ?? personal.phone),
        }
      : personal
    const errors = validatePersonal(currentPersonal)

    setPersonal(currentPersonal)
    setAttemptedPersonal(true)
    if (Object.keys(errors).length > 0) {
      scrollToFirstInvalidField()
      return
    }
    setContinuedSteps((current) => new Set(current).add(1))
    navigateToStep(2)
    setAttemptedAcademic(false)
  }

  function returnToPersonal() {
    navigateToStep(1)
  }

  function continueToCref() {
    setAttemptedAcademic(true)
    if (Object.keys(academicErrors).length > 0) {
      scrollToFirstInvalidField()
      return
    }
    setContinuedSteps((current) => new Set(current).add(2))
    navigateToStep(3)
    setAttemptedCref(false)
  }

  function returnToAcademic() {
    navigateToStep(2)
  }

  function continueToLabor() {
    setAttemptedCref(true)
    if (Object.keys(crefErrors).length > 0) {
      scrollToFirstInvalidField()
      return
    }
    setContinuedSteps((current) => new Set(current).add(3))
    navigateToStep(4)
    setAttemptedLabor(false)
  }

  function continueToTerms() {
    setAttemptedLabor(true)
    if (Object.keys(laborErrors).length > 0) {
      scrollToFirstInvalidField()
      return
    }
    setContinuedSteps((current) => new Set(current).add(4))
    navigateToStep(5)
    setAttemptedTerms(false)
  }

  function returnToCref() {
    navigateToStep(3)
  }

  function returnToLabor() {
    navigateToStep(4)
  }

  async function finishSignup() {
    setSubmissionError(null)
    pendingInvalidFocusStep.current = null
    const validation = [
      { step: 1 as const, errors: personalErrors },
      { step: 2 as const, errors: academicErrors },
      { step: 3 as const, errors: crefErrors },
      { step: 4 as const, errors: laborErrors },
      { step: 5 as const, errors: signupTermsErrors },
    ]
    setAttemptedTerms(true)
    setAttemptedLabor(true)
    setAttemptedPersonal(true)
    setAttemptedAcademic(true)
    setAttemptedCref(true)

    const firstInvalid = validation.find(({ errors }) => Object.keys(errors).length > 0)
    if (firstInvalid) {
      if (firstInvalid.step === step) {
        scrollToFirstInvalidField()
      } else {
        pendingInvalidFocusStep.current = firstInvalid.step
        setDirection(firstInvalid.step > step ? 1 : -1)
        setStep(firstInvalid.step)
        window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" })
      }
      return
    }

    setSubmitting(true)
    try {
      const result = await finalizeProfessionalRegistration({
        personal,
        academic,
        cref,
        labor,
        terms: signupTerms,
      })
      if (!result.ok) {
        setSubmissionError(result.message)
        return
      }
      router.push(result.redirectTo, { transitionTypes: ["nav-forward"] })
    } catch {
      setSubmissionError(
        "Não foi possível concluir agora. O rascunho e os documentos foram mantidos para tentar novamente."
      )
    } finally {
      setSubmitting(false)
    }
  }

  function changeStatus(status: AcademicStatus) {
    removeDraftReference(selectedFile?.path)
    setAcademic((current) => ({
      ...current,
      status,
      year: "",
      diplomaAvailability: null,
      alternativeDocument: null,
    }))
    setSelectedFile(null)
    setUploadedFiles((current) => current.filter(
      (file) => !["diploma", "transcript", "completion_declaration"].includes(file.kind)
    ))
  }

  function changeDiplomaAvailability(value: DiplomaAvailability) {
    removeDraftReference(selectedFile?.path)
    setAcademic((current) => ({ ...current, diplomaAvailability: value, alternativeDocument: null }))
    setSelectedFile(null)
    setUploadedFiles((current) => current.filter(
      (file) => !["diploma", "transcript", "completion_declaration"].includes(file.kind)
    ))
  }

  function changeAlternativeDocument(value: AlternativeDocument) {
    removeDraftReference(selectedFile?.path)
    setAcademic((current) => ({ ...current, alternativeDocument: value }))
    setSelectedFile(null)
    setUploadedFiles((current) => current.filter(
      (file) => !["diploma", "transcript", "completion_declaration"].includes(file.kind)
    ))
  }

  function fieldProps(id: string, error?: string) {
    return {
      id,
      "aria-invalid": error ? true : undefined,
      "aria-describedby": error ? `${id}-error` : undefined,
    }
  }

  return (
    <main className={`relative isolate min-h-dvh overflow-clip px-4 pt-4 sm:px-7 sm:pb-12 sm:pt-6 ${step > 1 ? "pb-48" : "pb-28"}`}>
      <div aria-hidden="true" className="pointer-events-none absolute -top-36 right-[-10rem] -z-10 size-[28rem] rounded-full bg-primary/10 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute bottom-[-16rem] left-[-12rem] -z-10 size-[32rem] rounded-full bg-ehfi-secondary/10 blur-3xl" />

      <header className="mx-auto flex w-full max-w-6xl items-center justify-between">
        <Link href="/" transitionTypes={["nav-back"]} className="inline-flex items-center gap-2.5 rounded-full outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
          <Image src="/pwa/icon-192.png" width={38} height={38} alt="" className="size-9 rounded-xl border border-border/70 bg-card" />
          <span className="font-heading text-sm font-bold tracking-[0.16em] text-foreground">EHFI</span>
        </Link>
        <ThemeToggle />
      </header>

      <div className="mx-auto mt-6 grid w-full max-w-6xl items-start gap-6 lg:mt-12 lg:grid-cols-[minmax(14rem,0.68fr)_minmax(0,1.32fr)] lg:gap-10">
        <motion.aside
          {...entranceProps(0.04, prefersReducedMotion)}
          className="lg:sticky lg:top-8"
        >
          <Link
            href="/profissional/entrar"
            transitionTypes={["nav-back"]}
            className="mb-5 inline-flex h-10 items-center gap-2 rounded-xl px-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-card/55 hover:text-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40"
          >
            <IoArrowBackOutline aria-hidden="true" className="size-4" />
            Voltar ao login
          </Link>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ehfi-secondary">Cadastro profissional</p>
          <h1 className="mt-2 max-w-[16ch] font-heading text-3xl leading-[1.08] font-semibold tracking-[-0.035em] text-foreground sm:text-4xl">
            Sua experiência começa aqui.
          </h1>
          <p className="mt-3 max-w-md text-sm leading-6 text-muted-foreground sm:text-base">
            Conte um pouco sobre você, sua formação, sua situação no CREF e, se quiser, sua atuação em ginástica laboral.
          </p>
        </motion.aside>

        <section className="min-w-0">
          <Card className="gap-0 overflow-visible rounded-[1.8rem] border-border/60 bg-card/60 p-4 shadow-[0_24px_80px_-42px_rgba(31,22,50,0.34)] backdrop-blur-2xl sm:p-7 lg:p-8">
            <motion.div {...entranceProps(0.12, prefersReducedMotion)} className="w-full">
              <CardHeader className="gap-5 px-0 pb-5">
                <ProfessionalSignupStepper
                  currentStep={step}
                  completedSteps={completedSteps}
                  continuedSteps={continuedSteps}
                  onStepSelect={navigateToStep}
                />
                <div className="flex items-center gap-3">
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    {step === 1 || step === 3 ? <IoShieldCheckmarkOutline aria-hidden="true" className="size-5" /> : step === 2 ? <IoSchoolOutline aria-hidden="true" className="size-5" /> : step === 4 ? <IoFitnessOutline aria-hidden="true" className="size-5" /> : <IoDocumentTextOutline aria-hidden="true" className="size-5" />}
                  </span>
                  <div>
                    <h2 className="mt-1 font-heading text-lg font-semibold tracking-tight text-foreground sm:text-xl">
                      {step === 1 ? "Seus dados" : step === 2 ? "Sua formação" : step === 3 ? "Seu registro profissional" : step === 4 ? "Atuação em Ginástica Laboral" : "Termos e confirmações"}
                    </h2>
                  </div>
                </div>
              </CardHeader>
            </motion.div>

            <form
              id="professional-signup-form"
              onSubmit={(event) => {
                event.preventDefault()
                if (step === 1) {
                  continueToAcademic(event.currentTarget)
                } else if (step === 2) {
                  continueToCref()
                } else if (step === 3) {
                  continueToLabor()
                } else if (step === 4) {
                  continueToTerms()
                } else {
                  finishSignup()
                }
              }}
              noValidate
            >
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  data-ehfi-reveal
                  key={step}
                  style={{ overflowAnchor: step === 5 ? "none" : undefined }}
                  custom={direction}
                  initial={{ opacity: 0, x: prefersReducedMotion ? 0 : direction * ehfiMotion.distance.step }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: prefersReducedMotion ? 0 : direction * -ehfiMotion.distance.step }}
                  transition={{ duration: transitionDuration, ease: ehfiEase }}
                  onAnimationComplete={() => {
                    if (pendingInvalidFocusStep.current !== step) return
                    pendingInvalidFocusStep.current = null
                    scrollToFirstInvalidField()
                  }}
                  className="space-y-4"
                >
                  {step === 1 ? (
                    <>
                      <Panel>
                        <SectionTitle icon={<IoShieldCheckmarkOutline aria-hidden="true" className="size-5" />} title="Identificação" subtitle="Como podemos chamar você?" />
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div className="sm:col-span-2">
                            <FormField id="fullName" label="Nome completo" error={fieldError("fullName")} revealOrder={1}>
                              <IconInput icon={<IoPersonOutline aria-hidden="true" />} id="fullName" autoComplete="name" placeholder="Ex.: Ana Souza" value={personal.fullName} onChange={(event) => updatePersonal("fullName", event.target.value)} {...fieldProps("fullName", fieldError("fullName"))} />
                            </FormField>
                          </div>
                          <FormField id="birthDate" label="Data de nascimento" error={fieldError("birthDate")} hint="Dia, mês e ano" revealOrder={2}>
                              <IconInput icon={<IoCalendarOutline aria-hidden="true" />} id="birthDate" type="text" inputMode="numeric" autoComplete="bday" placeholder="DD/MM/AAAA" maxLength={10} value={personal.birthDate} onChange={(event) => updateMaskedPersonal("birthDate", event, formatBirthDate)} onBlur={(event) => updatePersonal("birthDate", formatBirthDate(event.currentTarget.value))} {...fieldProps("birthDate", fieldError("birthDate"))} />
                          </FormField>
                          <FormField id="cpf" label="CPF" error={fieldError("cpf")} revealOrder={3}>
                            <IconInput icon={<IoCardOutline aria-hidden="true" />} id="cpf" type="text" inputMode="numeric" autoComplete="off" placeholder="000.000.000-00" maxLength={14} value={personal.cpf} onChange={(event) => updateMaskedPersonal("cpf", event, formatCpf)} onBlur={(event) => updatePersonal("cpf", formatCpf(event.currentTarget.value))} {...fieldProps("cpf", fieldError("cpf"))} />
                          </FormField>
                        </div>
                      </Panel>

                      <Panel>
                        <SectionTitle icon={<IoCallOutline aria-hidden="true" className="size-5" />} title="Contato" subtitle="Por onde podemos falar com você?" />
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div className="sm:col-span-2">
                            <FormField id="email" label="E-mail" error={fieldError("email")} revealOrder={1}>
                              <IconInput icon={<IoMailOutline aria-hidden="true" />} id="email" type="email" inputMode="email" autoComplete="email" placeholder="voce@email.com" value={personal.email} onChange={(event) => updatePersonal("email", event.target.value)} {...fieldProps("email", fieldError("email"))} />
                            </FormField>
                          </div>
                          <FormField id="phone" label="Telefone / WhatsApp" error={fieldError("phone")} revealOrder={2}>
                            <IconInput icon={<IoCallOutline aria-hidden="true" />} id="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="(11) 91234-5678" maxLength={16} value={personal.phone} onChange={(event) => updateMaskedPersonal("phone", event, formatPhone)} onBlur={(event) => updatePersonal("phone", formatPhone(event.currentTarget.value))} {...fieldProps("phone", fieldError("phone"))} />
                          </FormField>
                        </div>
                      </Panel>

                      <Panel>
                        <SectionTitle icon={<IoShieldCheckmarkOutline aria-hidden="true" className="size-5" />} title="Acesso à conta" subtitle="Use o e-mail informado acima para entrar na EHFI." />
                        <div className="grid gap-4 sm:grid-cols-2">
                          <FormField id="password" label="Senha" error={fieldError("password")} hint="8+ caracteres, com maiúscula, minúscula, número e símbolo." revealOrder={3}>
                            <IconInput
                              icon={<IoShieldCheckmarkOutline aria-hidden="true" />}
                              id="password"
                              type={passwordVisible ? "text" : "password"}
                              autoComplete="new-password"
                              value={personal.password}
                              onChange={(event) => updatePersonal("password", event.target.value)}
                              trailing={
                                <PasswordVisibilityButton
                                  visible={passwordVisible}
                                  label="senha"
                                  onToggle={() => setPasswordVisible((visible) => !visible)}
                                />
                              }
                              {...fieldProps("password", fieldError("password"))}
                              aria-describedby={[
                                fieldError("password") ? "password-error" : null,
                                "password-strength-status",
                                "password-strength-checklist",
                              ].filter(Boolean).join(" ")}
                            />
                            <PasswordStrengthIndicator password={personal.password} />
                          </FormField>
                          <FormField id="passwordConfirmation" label="Confirmar senha" error={fieldError("passwordConfirmation")} revealOrder={4}>
                            <IconInput
                              icon={<IoShieldCheckmarkOutline aria-hidden="true" />}
                              id="passwordConfirmation"
                              type={passwordConfirmationVisible ? "text" : "password"}
                              autoComplete="new-password"
                              value={personal.passwordConfirmation}
                              onChange={(event) => updatePersonal("passwordConfirmation", event.target.value)}
                              trailing={
                                <PasswordVisibilityButton
                                  visible={passwordConfirmationVisible}
                                  label="confirmação de senha"
                                  onToggle={() => setPasswordConfirmationVisible((visible) => !visible)}
                                />
                              }
                              {...fieldProps("passwordConfirmation", fieldError("passwordConfirmation"))}
                            />
                          </FormField>
                        </div>
                      </Panel>

                      <Panel>
                        <SectionTitle icon={<IoLocationOutline aria-hidden="true" className="size-5" />} title="Localização" subtitle="Onde você atende ou estuda?" />
                        <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_6rem]">
                          <FormField id="city" label="Cidade" error={fieldError("city")} revealOrder={1}>
                            <IconInput icon={<IoLocationOutline aria-hidden="true" />} id="city" autoComplete="address-level2" placeholder="Sua cidade" value={personal.city} onChange={(event) => updatePersonal("city", event.target.value)} {...fieldProps("city", fieldError("city"))} />
                          </FormField>
                          <FormField id="state" label="Estado" error={fieldError("state")} hint="UF" revealOrder={2}>
                            <IconInput icon={<IoMapOutline aria-hidden="true" />} id="state" autoComplete="address-level1" placeholder="SP" maxLength={2} value={personal.state} onChange={(event) => updatePersonal("state", event.target.value.replace(/[^a-z]/gi, "").slice(0, 2).toUpperCase())} {...fieldProps("state", fieldError("state"))} />
                          </FormField>
                        </div>
                      </Panel>

                      <Panel>
                        <SectionTitle icon={<IoSchoolOutline aria-hidden="true" className="size-5" />} title="Presença profissional" subtitle="Um detalhe para as pessoas conhecerem seu trabalho." />
                        <FormField id="instagram" label="Instagram profissional" hint="Opcional" revealOrder={1}>
                          <IconInput icon={<IoLogoInstagram aria-hidden="true" />} id="instagram" autoComplete="off" placeholder="@seu.perfil" value={personal.instagram} onChange={(event) => updatePersonal("instagram", event.target.value)} />
                        </FormField>
                      </Panel>
                    </>
                  ) : step === 2 ? (
                    <>
                      <Panel>
                        <SectionTitle icon={<IoSchoolOutline aria-hidden="true" className="size-5" />} title="Formação acadêmica" subtitle="Compartilhe os dados da sua formação." />
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div className="sm:col-span-2">
                            <FormField id="institution" label="Instituição de ensino" error={academicError("institution")} revealOrder={1}>
                              <IconInput icon={<IoBusinessOutline aria-hidden="true" />} id="institution" autoComplete="organization" placeholder="Nome da instituição" value={academic.institution} onChange={(event) => updateAcademic("institution", event.target.value)} {...fieldProps("institution", academicError("institution"))} />
                            </FormField>
                          </div>
                          <FormField id="course" label="Curso" error={academicError("course")} revealOrder={2}>
                            <IconInput icon={<IoBookOutline aria-hidden="true" />} id="course" placeholder="Ex.: Educação Física" value={academic.course} onChange={(event) => updateAcademic("course", event.target.value)} {...fieldProps("course", academicError("course"))} />
                          </FormField>
                          <FormField id="formationType" label="Tipo de formação" error={academicError("formationType")} revealOrder={3}>
                            <Combobox
                              items={formationOptions.map((option) => option.value)}
                              autoHighlight
                              value={academic.formationType || null}
                              filter={(item, query) => {
                                const normalizedQuery = normalizeFormationSearch(query)
                                const option = formationOptions.find((candidate) => candidate.value === item)
                                const searchableText = `${option?.title ?? item} ${option?.description ?? ""}`
                                return normalizeFormationSearch(searchableText).includes(normalizedQuery)
                              }}
                              onValueChange={(value) => {
                                if (typeof value !== "string") return
                                const next = value as FormationType
                                setAcademic((current) => ({ ...current, formationType: next, otherFormation: next === "Outro" ? current.otherFormation : "" }))
                              }}
                            >
                              <ComboboxInput
                                id="formationType"
                                triggerLabel="Mostrar opções de tipo de formação"
                                placeholder="Busque ou selecione"
                                aria-invalid={Boolean(academicError("formationType"))}
                                aria-describedby={academicError("formationType") ? "formationType-error" : undefined}
                                className="h-11 w-full rounded-xl bg-background/60"
                              >
                                <InputGroupAddon align="inline-start" className="pl-3 pr-1 text-ehfi-secondary/80 [&_svg]:size-[18px]">
                                  <IoSchoolOutline aria-hidden="true" />
                                </InputGroupAddon>
                              </ComboboxInput>
                              <ComboboxContent className="rounded-xl border border-border/60 bg-popover p-1 shadow-xl">
                                <ComboboxEmpty className="px-4 py-5">Nenhuma formação encontrada.</ComboboxEmpty>
                                <ComboboxList className="max-h-64">
                                  {(value) => {
                                    const option = formationOptions.find((candidate) => candidate.value === value)
                                    if (!option) return null
                                    const FormationIcon = formationIconMap[option.icon]
                                    return (
                                      <ComboboxItem key={option.value} value={option.value} className="min-h-12 gap-3 rounded-lg px-3 py-2.5">
                                        <FormationIcon aria-hidden="true" className="size-4 text-ehfi-secondary" />
                                        <span className="min-w-0">
                                          <span className="block text-sm font-medium text-foreground">{option.title}</span>
                                          <span className="mt-0.5 block text-xs text-muted-foreground">{option.description}</span>
                                        </span>
                                      </ComboboxItem>
                                    )
                                  }}
                                </ComboboxList>
                              </ComboboxContent>
                            </Combobox>
                          </FormField>
                          {academic.formationType === "Outro" ? (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} transition={{ duration: transitionDuration }} className="overflow-hidden sm:col-span-2">
                              <FormField id="otherFormation" label="Qual é a formação?" error={academicError("otherFormation")} revealOrder={1}>
                                <IconInput icon={<IoSchoolOutline aria-hidden="true" />} id="otherFormation" placeholder="Descreva sua formação" value={academic.otherFormation} onChange={(event) => updateAcademic("otherFormation", event.target.value)} {...fieldProps("otherFormation", academicError("otherFormation"))} />
                              </FormField>
                            </motion.div>
                          ) : null}
                        </div>
                      </Panel>

                      <Panel>
                        <SectionTitle icon={<IoCheckmarkOutline aria-hidden="true" className="size-5" />} title="Situação acadêmica" subtitle="A situação define o tipo de comprovante necessário." />
                        <fieldset>
                          <legend className="mb-3 text-sm font-medium text-foreground/90">Em que etapa você está?</legend>
                          <div className="grid gap-3 sm:grid-cols-2">
                            <SelectableCard title="Formação concluída" description="Já finalizei o curso." selected={academic.status === "completed"} onClick={() => changeStatus("completed")} revealOrder={1} errorId={academicError("status") ? "academic-status-error" : undefined} />
                            <SelectableCard title="Em andamento" description="Ainda estou cursando." selected={academic.status === "in_progress"} onClick={() => changeStatus("in_progress")} revealOrder={2} errorId={academicError("status") ? "academic-status-error" : undefined} />
                          </div>
                          {academicError("status") ? <p id="academic-status-error" role="alert" className="mt-2 text-xs text-destructive">{academicError("status")}</p> : null}
                        </fieldset>

                        {academic.status ? (
                          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} transition={{ duration: transitionDuration }} className="mt-5 overflow-hidden">
                            <FormField id="year" label={academic.status === "completed" ? "Ano de conclusão" : "Ano previsto de conclusão"} error={academicError("year")} revealOrder={1}>
                              <IconInput icon={<IoCalendarOutline aria-hidden="true" />} id="year" inputMode="numeric" placeholder="AAAA" maxLength={4} value={academic.year} onChange={(event) => updateAcademic("year", event.target.value.replace(/\D/g, "").slice(0, 4))} {...fieldProps("year", academicError("year"))} />
                            </FormField>
                          </motion.div>
                        ) : null}

                        {academic.status === "completed" ? (
                          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} transition={{ duration: transitionDuration }} className="mt-5 overflow-hidden">
                            <fieldset>
                              <legend className="mb-3 text-sm font-medium text-foreground/90">Você já recebeu seu diploma?</legend>
                              <div className="grid gap-3 sm:grid-cols-2">
                                <SelectableCard title="Sim, já recebi" description="Tenho o diploma universitário." selected={academic.diplomaAvailability === "available"} onClick={() => changeDiplomaAvailability("available")} revealOrder={1} errorId={academicError("diplomaAvailability") ? "academic-diploma-error" : undefined} />
                                <SelectableCard title="Ainda não" description="Vou apresentar outro comprovante." selected={academic.diplomaAvailability === "pending"} onClick={() => changeDiplomaAvailability("pending")} revealOrder={2} errorId={academicError("diplomaAvailability") ? "academic-diploma-error" : undefined} />
                              </div>
                              {academicError("diplomaAvailability") ? <p id="academic-diploma-error" role="alert" className="mt-2 text-xs text-destructive">{academicError("diplomaAvailability")}</p> : null}
                            </fieldset>
                          </motion.div>
                        ) : null}

                        {academic.status === "completed" && academic.diplomaAvailability === "pending" ? (
                          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} transition={{ duration: transitionDuration }} className="mt-5 overflow-hidden">
                            <fieldset>
                              <legend className="mb-3 text-sm font-medium text-foreground/90">Qual documento você vai apresentar?</legend>
                              <div className="grid gap-3 sm:grid-cols-2">
                                <SelectableCard title="Histórico acadêmico" description="Comprova as disciplinas cursadas." selected={academic.alternativeDocument === "transcript"} onClick={() => changeAlternativeDocument("transcript")} revealOrder={1} errorId={academicError("alternativeDocument") ? "academic-alternative-document-error" : undefined} />
                                <SelectableCard title="Declaração de conclusão" description="Confirma a conclusão do curso." selected={academic.alternativeDocument === "completion_declaration"} onClick={() => changeAlternativeDocument("completion_declaration")} revealOrder={2} errorId={academicError("alternativeDocument") ? "academic-alternative-document-error" : undefined} />
                              </div>
                              {academicError("alternativeDocument") ? <p id="academic-alternative-document-error" role="alert" className="mt-2 text-xs text-destructive">{academicError("alternativeDocument")}</p> : null}
                            </fieldset>
                          </motion.div>
                        ) : null}
                      </Panel>

                      {requiredProof ? (
                        <Panel key={`proof-${requiredProof}`}>
                          <SectionTitle icon={<IoDocumentTextOutline aria-hidden="true" className="size-5" />} title="Comprovante" subtitle="Envie o documento solicitado em PDF. O arquivo fica privado." />
                          <PrivatePdfUpload
                            kind={requiredProof}
                            label={proofLabels[requiredProof]}
                            hint="PDF de até 10 MB. O EHFI ainda precisará analisar as informações declaradas."
                            value={uploadedFiles.find((file) => file.kind === requiredProof) ?? null}
                            error={academicError("proof")}
                            onChange={(file) => updateDraftFile(requiredProof, file)}
                          />
                        </Panel>
                      ) : null}
                    </>
                  ) : step === 3 ? (
                    <>
                      <Panel>
                        <SectionTitle icon={<IoShieldCheckmarkOutline aria-hidden="true" className="size-5" />} title="Registro profissional — CREF" subtitle="Informe sua situação no conselho regional." />
                        <fieldset>
                          <legend className="mb-3 text-sm font-medium text-foreground/90">Você possui registro no Conselho Regional de Educação Física - CREF?</legend>
                          <div className="grid gap-3 md:grid-cols-3">
                            <SelectableCard title="Sim, já possuo registro profissional" description="Tenho um registro emitido pelo CREF." selected={cref.answer === "registered"} onClick={() => updateCref("answer", "registered")} revealOrder={1} errorId={crefError("answer") ? "cref-answer-error" : undefined} />
                            <SelectableCard title="Estou aguardando a emissão do meu registro" description="Já solicitei a emissão ao conselho." selected={cref.answer === "awaiting"} onClick={() => updateCref("answer", "awaiting")} revealOrder={2} errorId={crefError("answer") ? "cref-answer-error" : undefined} />
                            <SelectableCard title="Ainda não possuo registro profissional" description="Ainda não tenho um registro no CREF." selected={cref.answer === "none"} onClick={() => updateCref("answer", "none")} revealOrder={3} errorId={crefError("answer") ? "cref-answer-error" : undefined} />
                          </div>
                          {crefError("answer") ? <p id="cref-answer-error" role="alert" className="mt-2 text-xs text-destructive">{crefError("answer")}</p> : null}
                        </fieldset>

                        {cref.answer === "registered" ? (
                          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} transition={{ duration: transitionDuration }} className="mt-5 space-y-5 overflow-hidden">
                            <div className="grid gap-4 sm:grid-cols-2">
                              <FormField id="crefCouncilUf" label="Conselho Regional" error={crefError("councilUf")} hint="Selecione o estado ou Distrito Federal do seu registro." revealOrder={1}>
                                <Combobox
                                  items={crefCouncilOptions.map((council) => council.name)}
                                  autoHighlight
                                  value={crefCouncilOptions.find((council) => council.value === cref.councilUf)?.name ?? null}
                                  filter={(item, query) => {
                                    const normalizedQuery = normalizeFormationSearch(query)
                                    const council = crefCouncilOptions.find((option) => option.name === item)
                                    return normalizeFormationSearch(`${council?.value ?? item} ${council?.name ?? ""}`).includes(normalizedQuery)
                                  }}
                                  onValueChange={(value) => {
                                    if (typeof value !== "string") return
                                    const council = crefCouncilOptions.find((option) => option.name === value)
                                    if (council) updateCref("councilUf", council.value)
                                  }}
                                >
                                  <ComboboxInput
                                    id="crefCouncilUf"
                                    triggerLabel="Mostrar opções de Conselho Regional"
                                    placeholder="Busque ou selecione o estado"
                                    aria-invalid={Boolean(crefError("councilUf"))}
                                    aria-describedby={crefError("councilUf") ? "crefCouncilUf-error" : undefined}
                                    className="h-11 w-full rounded-xl bg-background/60"
                                  >
                                    <InputGroupAddon align="inline-start" className="pl-3 pr-1 text-ehfi-secondary/80 [&_svg]:size-[18px]">
                                      <IoMapOutline aria-hidden="true" />
                                    </InputGroupAddon>
                                  </ComboboxInput>
                                  <ComboboxContent className="rounded-xl border border-border/60 bg-popover p-1 shadow-xl">
                                    <ComboboxEmpty className="px-4 py-5">Nenhum Conselho Regional encontrado.</ComboboxEmpty>
                                    <ComboboxList className="max-h-64">
                                      {(value) => {
                                        const council = crefCouncilOptions.find((option) => option.name === value)
                                        if (!council) return null
                                        return (
                                          <ComboboxItem key={council.value} value={council.name} className="min-h-11 rounded-lg px-3 py-2.5">
                                            <span className="font-medium">{council.name}</span>
                                            <span className="ml-auto text-xs text-muted-foreground">{council.value}</span>
                                          </ComboboxItem>
                                        )
                                      }}
                                    </ComboboxList>
                                  </ComboboxContent>
                                </Combobox>
                              </FormField>
                              <FormField id="crefRegistrationNumber" label="Número de registro profissional" error={crefError("registrationNumber")} revealOrder={2}>
                                <IconInput icon={<IoCardOutline aria-hidden="true" />} id="crefRegistrationNumber" placeholder="Ex.: 000000-G/SP" value={cref.registrationNumber} onChange={(event) => updateCref("registrationNumber", event.target.value)} {...fieldProps("crefRegistrationNumber", crefError("registrationNumber"))} />
                              </FormField>
                            </div>

                            <fieldset>
                              <legend className="mb-3 text-sm font-medium text-foreground/90">Situação do registro declarada</legend>
                              <div className="grid gap-3 sm:grid-cols-2">
                                <SelectableCard title="Regular" description="Declaro que meu registro está regular." selected={cref.declaredSituation === "regular"} onClick={() => updateCref("declaredSituation", "regular")} revealOrder={1} errorId={crefError("declaredSituation") ? "cref-declared-situation-error" : undefined} />
                                <SelectableCard title="Possuo pendências" description="Declaro que há pendências no meu registro." selected={cref.declaredSituation === "pending_issues"} onClick={() => updateCref("declaredSituation", "pending_issues")} revealOrder={2} errorId={crefError("declaredSituation") ? "cref-declared-situation-error" : undefined} />
                              </div>
                              {crefError("declaredSituation") ? <p id="cref-declared-situation-error" role="alert" className="mt-2 text-xs text-destructive">{crefError("declaredSituation")}</p> : null}
                              <p className="mt-2 text-xs leading-5 text-muted-foreground">Esta informação é autodeclarada e não confirma a validação do CREF.</p>
                            </fieldset>

                            <PrivatePdfUpload
                              kind="cref-card"
                              label="Carteira profissional do CREF (obrigatória)"
                              hint="PDF de até 10 MB. O envio não confirma a regularidade do registro."
                              value={uploadedFiles.find((file) => file.kind === "cref-card") ?? null}
                              error={crefError("professionalCardFile")}
                              onChange={(file) => updateDraftFile("cref-card", file)}
                            />
                          </motion.div>
                        ) : null}

                        {cref.answer === "awaiting" ? (
                          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} transition={{ duration: transitionDuration }} className="mt-5 space-y-5 overflow-hidden">
                            <FormField id="crefRequestSituation" label="Situação da solicitação" error={crefError("requestSituation")} hint="Conte quando solicitou o registro e em que etapa o pedido está." revealOrder={1}>
                              <Textarea id="crefRequestSituation" rows={4} placeholder="Descreva o andamento da sua solicitação" value={cref.requestSituation} onChange={(event) => updateCref("requestSituation", event.target.value)} {...fieldProps("crefRequestSituation", crefError("requestSituation"))} className="min-h-28 rounded-xl bg-background/60 text-sm" />
                            </FormField>
                            <PrivatePdfUpload
                              kind="cref-request"
                              label="Protocolo ou comprovante (opcional)"
                              hint="Se tiver um protocolo ou comprovante, envie-o em PDF (até 10 MB)."
                              value={uploadedFiles.find((file) => file.kind === "cref-request") ?? null}
                              onChange={(file) => updateDraftFile("cref-request", file)}
                            />
                          </motion.div>
                        ) : null}

                        {cref.answer === "none" ? (
                          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} transition={{ duration: transitionDuration }} className="mt-5 overflow-hidden rounded-2xl border border-primary/20 bg-primary/[0.045] p-4">
                            <p className="text-sm font-semibold text-foreground">A conclusão da graduação não substitui o registro profissional.</p>
                            <p className="mt-2 text-sm leading-6 text-muted-foreground">O registro no CREF é exigido para o exercício das atividades regulamentadas. Você pode continuar a criação da conta; até a regularização e validação, o perfil permanece pendente.</p>
                          </motion.div>
                        ) : null}
                      </Panel>

                      {crefPreventsPractice ? (
                        <Panel>
                          <SectionTitle icon={<IoDocumentTextOutline aria-hidden="true" className="size-5" />} title="Seu cadastro pode continuar" subtitle="Esta situação impede a atuação profissional por enquanto." />
                          <div className="rounded-2xl border border-border/70 bg-background/50 p-4 text-sm leading-6 text-foreground/85">
                            Você pode concluir o cadastro e usar funções internas. Sem um registro regularizado e validado, o perfil permanece pendente e não pode ofertar serviços profissionais nem atender clientes.
                          </div>
                        </Panel>
                      ) : null}
                    </>
                  ) : step === 4 ? (
                    <>
                      <Panel>
                        <SectionTitle
                          icon={<IoFitnessOutline aria-hidden="true" className="size-5" />}
                          title="Atuação em Ginástica Laboral"
                          subtitle="Etapa opcional. Você pode deixar sem resposta e continuar o cadastro."
                        />
                        <fieldset>
                          <legend className="mb-3 text-sm font-medium text-foreground/90">Tem interesse em atender empresas com ginástica laboral?</legend>
                          <div className="grid gap-3 sm:grid-cols-2" onPointerDownCapture={rememberLaborSelectionScroll} onKeyDownCapture={(event) => { if (event.key === " " || event.key === "Enter") rememberLaborSelectionScroll() }}>
                            <SelectableCard title="Sim" description="Tenho interesse em atender empresas com ginástica laboral." selected={labor.interest === "yes"} onClick={() => updateLaborPreservingScroll("interest", "yes")} revealOrder={1} />
                            <SelectableCard title="Não" description="No momento, não tenho interesse em atender empresas com ginástica laboral." selected={labor.interest === "no"} onClick={() => updateLaborPreservingScroll("interest", "no")} revealOrder={2} />
                          </div>
                        </fieldset>

                        {labor.interest === "yes" ? (
                          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} transition={{ duration: transitionDuration }} className="mt-5 space-y-5 overflow-hidden">
                            <fieldset>
                              <legend className="mb-3 text-sm font-medium text-foreground/90">Possui experiência com ginástica laboral?</legend>
                              <div className="grid gap-3 sm:grid-cols-2" onPointerDownCapture={rememberLaborSelectionScroll} onKeyDownCapture={(event) => { if (event.key === " " || event.key === "Enter") rememberLaborSelectionScroll() }}>
                                {laborExperienceOptions.map((option, index) => (
                                  <SelectableCard
                                    key={option.value}
                                    title={option.title}
                                    description={option.description}
                                    selected={labor.experience === option.value}
                                    onClick={() => updateLaborPreservingScroll("experience", option.value)}
                                    revealOrder={index + 1}
                                  />
                                ))}
                              </div>
                            </fieldset>

                            <fieldset>
                              <legend className="mb-3 text-sm font-medium text-foreground/90">Quais modalidades de atendimento está disponível para realizar?</legend>
                              <div className="grid gap-2 sm:grid-cols-2" onPointerDownCapture={rememberLaborSelectionScroll} onKeyDownCapture={(event) => { if (event.key === " ") rememberLaborSelectionScroll() }}>
                                {laborServiceModeOptions.map((option) => (
                                  <LaborCheckboxOption
                                    key={option.value}
                                    id={`labor-mode-${option.value}`}
                                    label={option.label}
                                    checked={labor.serviceModes.includes(option.value)}
                                    onCheckedChange={(checked) => updateLaborPreservingScroll("serviceModes", toggleLaborOption(labor.serviceModes, option.value, checked))}
                                  />
                                ))}
                                <LaborCheckboxOption
                                  id="labor-mode-all"
                                  label="Todas as modalidades"
                                  checked={labor.serviceModes.length === laborServiceModeOptions.length}
                                  onCheckedChange={(checked) => updateLaborPreservingScroll("serviceModes", checked ? laborServiceModeOptions.map((option) => option.value) : [])}
                                />
                              </div>
                            </fieldset>
                          </motion.div>
                        ) : null}
                      </Panel>

                      {labor.interest === "yes" ? (
                        <>
                          <Panel>
                            <SectionTitle
                              icon={<IoCalendarOutline aria-hidden="true" className="size-5" />}
                              title="Horários e frequência"
                              subtitle="Selecione os períodos e dias disponíveis. O intervalo informado se aplica aos dias selecionados."
                            />
                            <div className="space-y-5">
                              <fieldset>
                                <legend className="mb-3 text-sm font-medium text-foreground/90">Quais horários tem disponibilidade para atendimento?</legend>
                                <div className="grid gap-2 sm:grid-cols-2" onPointerDownCapture={rememberLaborSelectionScroll} onKeyDownCapture={(event) => { if (event.key === " ") rememberLaborSelectionScroll() }}>
                                  {laborPeriodOptions.map((option) => (
                                    <LaborCheckboxOption
                                      key={option.value}
                                      id={`labor-period-${option.value}`}
                                      label={option.label}
                                      checked={labor.periods.includes(option.value)}
                                      onCheckedChange={(checked) => updateLaborPreservingScroll("periods", toggleLaborOption(labor.periods, option.value, checked))}
                                    />
                                  ))}
                                </div>
                              </fieldset>

                              <div className="space-y-2">
                                <p className="text-sm font-medium text-foreground/90">Horário específico (opcional)</p>
                                <p className="text-xs leading-5 text-muted-foreground">Informe início e término para indicar um intervalo geral nos dias selecionados. Para um período que passe da meia-noite, informe o horário de início e o de término normalmente.</p>
                                <div className="grid gap-4 sm:grid-cols-2">
                                  <FormField id="laborSpecificStartTime" label="Horário de início" error={laborError("specificStartTime")} revealOrder={1}>
                                    <IconInput icon={<IoTimeOutline aria-hidden="true" />} id="laborSpecificStartTime" type="time" value={labor.specificStartTime} onChange={(event) => updateLabor("specificStartTime", event.target.value)} {...fieldProps("laborSpecificStartTime", laborError("specificStartTime"))} />
                                  </FormField>
                                  <FormField id="laborSpecificEndTime" label="Horário de término" error={laborError("specificEndTime")} revealOrder={2}>
                                    <IconInput icon={<IoTimeOutline aria-hidden="true" />} id="laborSpecificEndTime" type="time" value={labor.specificEndTime} onChange={(event) => updateLabor("specificEndTime", event.target.value)} {...fieldProps("laborSpecificEndTime", laborError("specificEndTime"))} />
                                  </FormField>
                                </div>
                              </div>

                              <fieldset>
                                <legend className="mb-3 text-sm font-medium text-foreground/90">Quais dias da semana tem disponibilidade?</legend>
                                <div className="grid gap-2 sm:grid-cols-2" onPointerDownCapture={rememberLaborSelectionScroll} onKeyDownCapture={(event) => { if (event.key === " ") rememberLaborSelectionScroll() }}>
                                  {laborDayOptions.map((option) => (
                                    <LaborCheckboxOption
                                      key={option.value}
                                      id={`labor-day-${option.value}`}
                                      label={option.label}
                                      checked={labor.days.includes(option.value)}
                                      onCheckedChange={(checked) => updateLaborPreservingScroll("days", toggleLaborOption(labor.days, option.value, checked))}
                                    />
                                  ))}
                                </div>
                              </fieldset>

                              <fieldset>
                                <legend className="mb-3 text-sm font-medium text-foreground/90">Tem disponibilidade para atender empresas que possuem turnos diferentes, inclusive noturnos?</legend>
                                <p className="mb-3 text-xs leading-5 text-muted-foreground">Esta resposta indica flexibilidade para combinar turnos da empresa; os períodos acima indicam seus horários pessoais de atendimento.</p>
                                <div className="grid gap-3 sm:grid-cols-2" onPointerDownCapture={rememberLaborSelectionScroll} onKeyDownCapture={(event) => { if (event.key === " " || event.key === "Enter") rememberLaborSelectionScroll() }}>
                                  <SelectableCard title="Sim" description="Posso combinar atendimento em diferentes turnos, inclusive noturnos." selected={labor.differentCompanyShifts === "yes"} onClick={() => updateLaborPreservingScroll("differentCompanyShifts", "yes")} revealOrder={1} />
                                  <SelectableCard title="Não" description="Prefiro atuar em horários compatíveis com os períodos selecionados." selected={labor.differentCompanyShifts === "no"} onClick={() => updateLaborPreservingScroll("differentCompanyShifts", "no")} revealOrder={2} />
                                </div>
                              </fieldset>

                              <fieldset>
                                <legend className="mb-3 text-sm font-medium text-foreground/90">Qual frequência de atendimento consegue oferecer?</legend>
                                <div className="grid gap-3 sm:grid-cols-2" onPointerDownCapture={rememberLaborSelectionScroll} onKeyDownCapture={(event) => { if (event.key === " " || event.key === "Enter") rememberLaborSelectionScroll() }}>
                                  {laborFrequencyOptions.map((option, index) => (
                                    <SelectableCard
                                      key={option.value}
                                      title={option.title}
                                      description={option.description}
                                      selected={labor.frequency === option.value}
                                      onClick={() => updateLaborPreservingScroll("frequency", option.value)}
                                      revealOrder={index + 1}
                                    />
                                  ))}
                                </div>
                              </fieldset>
                            </div>
                          </Panel>

                          <Panel>
                            <SectionTitle
                              icon={<IoLocationOutline aria-hidden="true" className="size-5" />}
                              title="Regiões e deslocamento"
                              subtitle="Informe onde pode atender e como prefere se deslocar."
                            />
                            <div className="space-y-5">
                              <FormField id="laborServiceAreaDraft" label="Em quais cidades ou regiões está disponível para prestar atendimento?" hint="Digite uma cidade, estado ou região e adicione à lista." revealOrder={1}>
                                <div className="flex flex-col gap-2 sm:flex-row">
                                  <div className="min-w-0 flex-1">
                                    <IconInput
                                      icon={<IoLocationOutline aria-hidden="true" />}
                                      id="laborServiceAreaDraft"
                                      placeholder="Ex.: Campinas, SP ou Região Metropolitana"
                                      value={serviceAreaDraft}
                                      onChange={(event) => setServiceAreaDraft(event.target.value)}
                                      onKeyDown={(event) => {
                                        if (event.key === "Enter") {
                                          event.preventDefault()
                                          addLaborServiceArea()
                                        }
                                      }}
                                    />
                                  </div>
                                  <Button type="button" variant="outline" className="h-11 rounded-xl sm:min-w-32" onClick={addLaborServiceArea}>
                                    Adicionar
                                  </Button>
                                </div>
                                {labor.serviceAreas.length > 0 ? (
                                  <ul aria-label="Cidades e regiões adicionadas" aria-live="polite" className="mt-3 flex flex-wrap gap-2">
                                    {labor.serviceAreas.map((serviceArea, index) => (
                                      <li key={`${normalizeFormationSearch(serviceArea)}-${index}`} className="flex min-h-11 items-center gap-1 rounded-full border border-primary/20 bg-primary/[0.045] pl-3 text-sm text-foreground">
                                        <span>{serviceArea}</span>
                                        <Button type="button" variant="ghost" size="icon" className="size-11 shrink-0 rounded-full" aria-label={`Remover ${serviceArea}`} onClick={() => removeLaborServiceArea(index)}>
                                          <IoTrashOutline aria-hidden="true" className="size-4" />
                                        </Button>
                                      </li>
                                    ))}
                                  </ul>
                                ) : (
                                  <p className="mt-2 text-xs leading-5 text-muted-foreground">Nenhuma cidade ou região adicionada.</p>
                                )}
                              </FormField>

                              <fieldset>
                                <legend className="mb-3 text-sm font-medium text-foreground/90">Possui disponibilidade para deslocamento até as empresas?</legend>
                                <div className="grid gap-3 sm:grid-cols-3" onPointerDownCapture={rememberLaborSelectionScroll} onKeyDownCapture={(event) => { if (event.key === " " || event.key === "Enter") rememberLaborSelectionScroll() }}>
                                  <SelectableCard title="Sim" description="Tenho disponibilidade para me deslocar." selected={labor.travelAvailability === "yes"} onClick={() => updateLaborPreservingScroll("travelAvailability", "yes")} revealOrder={1} />
                                  <SelectableCard title="Não" description="Não tenho disponibilidade para deslocamento." selected={labor.travelAvailability === "no"} onClick={() => updateLaborPreservingScroll("travelAvailability", "no")} revealOrder={2} />
                                  <SelectableCard title="Sim, dependendo da distância" description="Posso me deslocar conforme a distância até a empresa." selected={labor.travelAvailability === "depends_distance"} onClick={() => updateLaborPreservingScroll("travelAvailability", "depends_distance")} revealOrder={3} />
                                </div>
                              </fieldset>
                            </div>
                          </Panel>
                        </>
                      ) : null}
                    </>
                  ) : (
                    <>
                      <Panel>
                        <SectionTitle
                          icon={<IoDocumentTextOutline aria-hidden="true" className="size-5" />}
                          title="Termos e confirmações"
                          subtitle="Leia o aviso de privacidade e confirme as informações do cadastro."
                        />
                        <fieldset className="space-y-3">
                          <legend className="sr-only">Confirmações do cadastro</legend>

                          <div
                            role="presentation"
                            onPointerDownCapture={(event) => rememberSignupTermsScroll(event.target)}
                            onKeyDownCapture={(event) => { if (event.key === " ") rememberSignupTermsScroll(event.target) }}
                            onClick={(event) => toggleSignupTermsCard("privacyAcknowledged", event)}
                            className={`cursor-pointer rounded-2xl border p-4 ${signupTermsError("privacyAcknowledged") ? "border-destructive/50 bg-destructive/[0.035]" : "border-border/70 bg-background/50"}`}
                          >
                            <div className="flex items-start gap-3">
                              <Checkbox
                                id="privacyAcknowledged"
                                checked={signupTerms.privacyAcknowledged}
                                required
                                onCheckedChange={(checked) => updateSignupTerms("privacyAcknowledged", checked === true)}
                                aria-labelledby="privacyAcknowledged-label"
                                aria-invalid={signupTermsError("privacyAcknowledged") ? true : undefined}
                                aria-describedby={signupTermsError("privacyAcknowledged") ? "privacyAcknowledged-error" : undefined}
                                className="mt-0.5 size-5 rounded-md"
                              />
                              <div className="min-w-0 space-y-2">
                                <p id="privacyAcknowledged-label" className="text-sm leading-6 text-foreground">
                                  Li o Aviso de Privacidade do EHFI e estou ciente de como meus dados pessoais e documentos serão tratados.
                                </p>
                                <Link href="/privacidade" target="_blank" rel="noopener noreferrer" className="inline-flex rounded-sm text-sm font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40">
                                  Ler o Aviso de Privacidade
                                </Link>
                                <p className="text-xs leading-5 text-muted-foreground">Obrigatório para concluir o cadastro.</p>
                                {signupTermsError("privacyAcknowledged") ? <p id="privacyAcknowledged-error" role="alert" className="text-xs leading-5 text-destructive">{signupTermsError("privacyAcknowledged")}</p> : null}
                              </div>
                            </div>
                          </div>

                          <div
                            role="presentation"
                            onPointerDownCapture={(event) => rememberSignupTermsScroll(event.target)}
                            onKeyDownCapture={(event) => { if (event.key === " ") rememberSignupTermsScroll(event.target) }}
                            onClick={(event) => toggleSignupTermsCard("authenticityDeclared", event)}
                            className={`cursor-pointer rounded-2xl border p-4 ${signupTermsError("authenticityDeclared") ? "border-destructive/50 bg-destructive/[0.035]" : "border-border/70 bg-background/50"}`}
                          >
                            <div className="flex items-start gap-3">
                              <Checkbox
                                id="authenticityDeclared"
                                checked={signupTerms.authenticityDeclared}
                                required
                                onCheckedChange={(checked) => updateSignupTerms("authenticityDeclared", checked === true)}
                                aria-labelledby="authenticityDeclared-label"
                                aria-invalid={signupTermsError("authenticityDeclared") ? true : undefined}
                                aria-describedby={signupTermsError("authenticityDeclared") ? "authenticityDeclared-error" : undefined}
                                className="mt-0.5 size-5 rounded-md"
                              />
                              <div className="min-w-0">
                                <p id="authenticityDeclared-label" className="text-sm leading-6 text-foreground">
                                  Declaro que as informações fornecidas são verdadeiras e que os documentos enviados são autênticos.
                                </p>
                                <p className="mt-2 text-xs leading-5 text-muted-foreground">Obrigatório para concluir o cadastro.</p>
                                {signupTermsError("authenticityDeclared") ? <p id="authenticityDeclared-error" role="alert" className="mt-2 text-xs leading-5 text-destructive">{signupTermsError("authenticityDeclared")}</p> : null}
                              </div>
                            </div>
                          </div>

                          <div
                            role="presentation"
                            onPointerDownCapture={(event) => rememberSignupTermsScroll(event.target)}
                            onKeyDownCapture={(event) => { if (event.key === " ") rememberSignupTermsScroll(event.target) }}
                            onClick={(event) => toggleSignupTermsCard("marketingOptIn", event)}
                            className="cursor-pointer rounded-2xl border border-border/70 bg-background/50 p-4"
                          >
                            <div className="flex items-start gap-3">
                              <Checkbox
                                id="marketingOptIn"
                                checked={signupTerms.marketingOptIn}
                                onCheckedChange={(checked) => updateSignupTerms("marketingOptIn", checked === true)}
                                aria-labelledby="marketingOptIn-label"
                                className="mt-0.5 size-5 rounded-md"
                              />
                              <div className="min-w-0">
                                <p id="marketingOptIn-label" className="text-sm leading-6 text-foreground">
                                  Autorizo o recebimento de comunicações sobre novidades, divulgação e outras informações do EHFI.
                                </p>
                                <p className="mt-2 text-xs leading-5 text-muted-foreground">Opcional. Sua escolha não altera a conclusão do cadastro.</p>
                              </div>
                            </div>
                          </div>
                        </fieldset>
                      </Panel>
                    </>
                  )}
                </motion.div>
              </AnimatePresence>
            </form>
          </Card>

          <div style={{ bottom: keyboardInset }} className="fixed inset-x-0 bottom-0 z-30 border-t border-border/60 bg-background/90 px-4 pb-[max(env(safe-area-inset-bottom),1rem)] pt-3 backdrop-blur-xl sm:static sm:mt-6 sm:border-0 sm:bg-transparent sm:p-0 sm:pt-1">
            <div className="mx-auto flex w-full max-w-6xl flex-col-reverse gap-2 sm:flex-row sm:justify-between sm:gap-3">
              {step > 1 ? (
                <Button type="button" variant="outline" className="h-12 w-full rounded-xl sm:w-auto" onClick={step === 2 ? returnToPersonal : step === 3 ? returnToAcademic : step === 4 ? returnToCref : returnToLabor}>
                  <IoArrowBackOutline aria-hidden="true" className="size-4" /> Voltar
                </Button>
              ) : <span className="hidden sm:block" />}
              <Button form="professional-signup-form" type="submit" disabled={submitting || draft.status === "loading"} className="h-12 w-full rounded-xl px-5 font-semibold shadow-[0_8px_24px_-10px_color-mix(in_oklch,var(--primary)_65%,transparent)] sm:w-auto">
                {step === 5 && submitting ? "Salvando cadastro…" : step === 5 ? "Concluir cadastro" : "Continuar"}
                <IoArrowForwardOutline aria-hidden="true" className="size-4" />
              </Button>
            </div>
            {submissionError ? <p role="alert" className="mx-auto mt-2 max-w-6xl text-center text-sm text-destructive">{submissionError}</p> : null}
            <p className="mx-auto mt-2 max-w-6xl text-center text-xs text-muted-foreground">
              {draft.status === "saving" ? "Salvando rascunho…" : draft.status === "saved" ? "Rascunho salvo neste dispositivo por até 30 dias sem atividade." : draft.status === "error" ? draft.error : "Já tem conta? "}
              {draft.status !== "saving" && draft.status !== "saved" && draft.status !== "error" ? <Link href="/profissional/entrar" className="font-medium text-primary underline-offset-4 hover:underline">Entrar</Link> : null}
            </p>
            <p className="mx-auto mt-2 max-w-6xl text-center text-[0.68rem] text-muted-foreground sm:hidden">
              Seus dados são salvos como rascunho e enviados ao concluir o cadastro.
            </p>
          </div>
        </section>
      </div>

    </main>
  )
}
