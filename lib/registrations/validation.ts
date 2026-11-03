import type { Json } from "@/lib/database.types"
import {
  initialStudentRegistration,
  validateStudentStep,
  type StudentRegistrationForm,
  type StudentRegistrationField,
} from "@/lib/student-registration"
import {
  initialPersonal,
  initialAcademic,
  initialCref,
  initialProfessionalLabor,
  initialSignupTerms,
  getRequiredProof,
  validateAcademic,
  validateCref,
  validatePersonal,
  validateProfessionalLabor,
  validateSignupTerms,
  formationOptions,
  crefCouncilOptions,
  type AcademicForm,
  type CrefForm,
  type PersonalForm,
  type ProfessionalLaborForm,
  type SelectedFile,
  type SignupTerms,
} from "@/lib/professional-registration"
import {
  companyActivityOptions,
  companyContractInterestOptions,
  companyDurationOptions,
  companyFrequencyOptions,
  companyGoalOptions,
  companyPriorExperienceOptions,
  companySectorOptions,
  companyServiceModeOptions,
  companyStartWindowOptions,
  companyWeekdayOptions,
  employeeBandOptions,
  initialCompanyRegistration,
  validateCompanyStep,
  type CompanyRegistrationForm,
  type CompanyRegistrationField,
  type CompanySectorEntry,
  type CompanySectorSchedule,
  type CompanyShift,
} from "@/lib/company-registration"
import type { DraftFileReference } from "@/lib/registration-drafts/types"

export type ProfessionalRegistrationPayload = {
  personal: PersonalForm
  academic: AcademicForm
  cref: CrefForm
  labor: ProfessionalLaborForm
  terms: SignupTerms
}

export class RegistrationValidationError extends Error {
  constructor(
    message: string,
    public readonly fieldErrors: Record<string, string>
  ) {
    super(message)
    this.name = "RegistrationValidationError"
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function stringValue(value: unknown) {
  return typeof value === "string" ? value.slice(0, 10000) : ""
}

function stringArray(value: unknown, maximum = 100) {
  return Array.isArray(value) && value.length <= maximum
    ? value.filter((item): item is string => typeof item === "string")
    : []
}

function optionValues(options: readonly { value: string }[]) {
  return new Set(options.map((option) => option.value))
}

function addInvalidOption(
  errors: Record<string, string>,
  field: string,
  value: unknown,
  allowed: ReadonlySet<string>
) {
  if (typeof value === "string" && value && !allowed.has(value)) {
    errors[field] = "Selecione uma opção válida."
  }
}

function addInvalidArray(
  errors: Record<string, string>,
  field: string,
  values: readonly string[],
  allowed: ReadonlySet<string>
) {
  if (values.some((value) => !allowed.has(value))) {
    errors[field] = "Remova opções inválidas e tente novamente."
  }
}

const studentModalities = new Set([
  "strength",
  "functional",
  "walking_running",
  "dance",
  "pilates_stretching",
  "team_sports",
  "outdoors",
  "other",
])
const studentGoals = new Set([
  "health",
  "weight_loss",
  "muscle_gain",
  "strength_endurance",
  "mobility",
  "pain_function",
  "sports_performance",
  "stress_wellbeing",
  "return_to_exercise",
  "other",
])

function normalizeStudentRegistration(value: unknown): StudentRegistrationForm {
  if (!isRecord(value)) {
    throw new RegistrationValidationError("Confira os dados do cadastro.", {
      form: "Os dados enviados não são válidos.",
    })
  }
  const form = { ...initialStudentRegistration }
  for (const key of Object.keys(form) as StudentRegistrationField[]) {
    const current = form[key]
    const input = value[key]
    if (Array.isArray(current)) {
      ;(form as Record<string, unknown>)[key] = stringArray(input)
    } else if (typeof current === "boolean") {
      ;(form as Record<string, unknown>)[key] =
        typeof input === "boolean" ? input : false
    } else {
      ;(form as Record<string, unknown>)[key] = stringValue(input)
    }
  }
  return form
}

export function validateStudentRegistration(value: unknown) {
  const form = normalizeStudentRegistration(value)
  const errors: Record<string, string> = {}
  for (const step of [1, 2, 3, 4, 5, 6] as const) {
    Object.assign(errors, validateStudentStep(form, step))
  }

  addInvalidOption(
    errors,
    "fitnessLevel",
    form.fitnessLevel,
    optionValues([
      { value: "beginner" },
      { value: "intermediate" },
      { value: "advanced" },
    ])
  )
  addInvalidOption(
    errors,
    "currentExercise",
    form.currentExercise,
    optionValues([{ value: "regular" }, { value: "irregular" }, { value: "none" }])
  )
  addInvalidOption(
    errors,
    "practiceDuration",
    form.practiceDuration,
    optionValues([
      { value: "never" },
      { value: "under_6_months" },
      { value: "6_to_12_months" },
      { value: "1_to_3_years" },
      { value: "over_3_years" },
    ])
  )
  addInvalidArray(errors, "conditions", form.conditions, studentOptions.conditions)
  addInvalidArray(errors, "symptoms", form.symptoms, studentOptions.symptoms)
  addInvalidArray(errors, "limitations", form.limitations, studentOptions.limitations)
  addInvalidArray(errors, "modalities", form.modalities, studentModalities)
  addInvalidArray(errors, "goals", form.goals, studentGoals)
  addInvalidOption(
    errors,
    "conditionControl",
    form.conditionControl,
    optionValues([
      { value: "controlled" },
      { value: "uncontrolled" },
      { value: "unsure" },
    ])
  )
  addInvalidOption(
    errors,
    "usesMedication",
    form.usesMedication,
    optionValues([{ value: "yes" }, { value: "no" }])
  )
  addInvalidOption(
    errors,
    "injuryHistory",
    form.injuryHistory,
    optionValues([{ value: "none" }, { value: "recovered" }, { value: "ongoing" }])
  )
  addInvalidOption(
    errors,
    "exerciseRestriction",
    form.exerciseRestriction,
    optionValues([{ value: "no" }, { value: "yes" }, { value: "unsure" }])
  )
  addInvalidOption(
    errors,
    "pregnancyStatus",
    form.pregnancyStatus,
    optionValues([
      { value: "no" },
      { value: "pregnant" },
      { value: "postpartum" },
      { value: "prefer_not_to_answer" },
    ])
  )
  addInvalidOption(
    errors,
    "sleepQuality",
    form.sleepQuality,
    optionValues([{ value: "good" }, { value: "regular" }, { value: "poor" }])
  )
  addInvalidOption(
    errors,
    "dailyRoutine",
    form.dailyRoutine,
    optionValues([
      { value: "mostly_sitting" },
      { value: "mixed" },
      { value: "mostly_moving" },
      { value: "intense_physical" },
    ])
  )
  addInvalidOption(
    errors,
    "nutritionRoutine",
    form.nutritionRoutine,
    optionValues([
      { value: "adequate" },
      { value: "could_improve" },
      { value: "difficult" },
      { value: "prefer_not_to_answer" },
    ])
  )
  if (Object.keys(errors).length > 0) {
    throw new RegistrationValidationError(
      "Confira os campos destacados antes de concluir.",
      errors
    )
  }
  return form
}

const studentOptions = {
  conditions: new Set([
    "none",
    "hypertension",
    "diabetes",
    "cardiovascular",
    "respiratory",
    "renal",
    "bone_joint",
    "neurological",
    "other",
  ]),
  symptoms: new Set([
    "chest_pain",
    "shortness_of_breath",
    "dizziness_fainting",
    "palpitations",
    "unusual_fatigue",
    "none",
  ]),
  limitations: new Set([
    "none",
    "muscular",
    "joint",
    "spine",
    "injury_surgery",
    "other",
  ]),
} satisfies Record<string, ReadonlySet<string>>

function normalizePersonal(value: unknown): PersonalForm {
  const input = isRecord(value) ? value : {}
  return {
    ...initialPersonal,
    fullName: stringValue(input.fullName),
    birthDate: stringValue(input.birthDate),
    cpf: stringValue(input.cpf),
    email: stringValue(input.email),
    phone: stringValue(input.phone),
    password: stringValue(input.password),
    passwordConfirmation: stringValue(input.passwordConfirmation),
    city: stringValue(input.city),
    state: stringValue(input.state),
    instagram: stringValue(input.instagram),
  }
}

function normalizeAcademic(value: unknown): AcademicForm {
  const input = isRecord(value) ? value : {}
  return {
    ...initialAcademic,
    institution: stringValue(input.institution),
    course: stringValue(input.course),
    formationType: stringValue(input.formationType) as AcademicForm["formationType"],
    otherFormation: stringValue(input.otherFormation),
    status:
      input.status === "completed" || input.status === "in_progress"
        ? input.status
        : null,
    year: stringValue(input.year),
    diplomaAvailability:
      input.diplomaAvailability === "available" ||
      input.diplomaAvailability === "pending"
        ? input.diplomaAvailability
        : null,
    alternativeDocument:
      input.alternativeDocument === "transcript" ||
      input.alternativeDocument === "completion_declaration"
        ? input.alternativeDocument
        : null,
  }
}

function normalizeCref(value: unknown): CrefForm {
  const input = isRecord(value) ? value : {}
  return {
    ...initialCref,
    answer:
      input.answer === "registered" ||
      input.answer === "awaiting" ||
      input.answer === "none"
        ? input.answer
        : null,
    councilUf: stringValue(input.councilUf),
    registrationNumber: stringValue(input.registrationNumber),
    declaredSituation:
      input.declaredSituation === "regular" ||
      input.declaredSituation === "pending_issues"
        ? input.declaredSituation
        : null,
    requestSituation: stringValue(input.requestSituation),
    professionalCardFile: stringValue(input.professionalCardFile) || null,
    requestProofFile: stringValue(input.requestProofFile) || null,
  }
}

function normalizeLabor(value: unknown): ProfessionalLaborForm {
  const input = isRecord(value) ? value : {}
  const interest =
    input.interest === "yes" || input.interest === "no" ? input.interest : null
  const experience = [
    "experienced",
    "not_experienced",
    "interested_without_experience",
  ].includes(String(input.experience))
    ? (input.experience as ProfessionalLaborForm["experience"])
    : null
  const serviceModes = stringArray(input.serviceModes)
  const periods = stringArray(input.periods)
  const days = stringArray(input.days)
  return {
    ...initialProfessionalLabor,
    interest,
    experience,
    serviceModes: serviceModes as ProfessionalLaborForm["serviceModes"],
    periods: periods as ProfessionalLaborForm["periods"],
    specificStartTime: stringValue(input.specificStartTime),
    specificEndTime: stringValue(input.specificEndTime),
    days: days as ProfessionalLaborForm["days"],
    differentCompanyShifts:
      input.differentCompanyShifts === "yes" ||
      input.differentCompanyShifts === "no"
        ? input.differentCompanyShifts
        : null,
    frequency: stringValue(input.frequency) as ProfessionalLaborForm["frequency"],
    serviceAreas: stringArray(input.serviceAreas),
    travelAvailability: [
      "yes",
      "no",
      "depends_distance",
    ].includes(String(input.travelAvailability))
      ? (input.travelAvailability as ProfessionalLaborForm["travelAvailability"])
      : null,
  }
}

function normalizeTerms(value: unknown): SignupTerms {
  const input = isRecord(value) ? value : {}
  return {
    ...initialSignupTerms,
    privacyAcknowledged: input.privacyAcknowledged === true,
    authenticityDeclared: input.authenticityDeclared === true,
    marketingOptIn: input.marketingOptIn === true,
  }
}

export function validateProfessionalRegistration(
  value: unknown,
  files: DraftFileReference[]
): ProfessionalRegistrationPayload {
  const input = isRecord(value) ? value : {}
  const personal = normalizePersonal(input.personal)
  const academic = normalizeAcademic(input.academic)
  const cref = normalizeCref(input.cref)
  const labor = normalizeLabor(input.labor)
  const terms = normalizeTerms(input.terms)
  const requiredProof = getRequiredProof(academic)
  const academicReference = requiredProof
    ? files.find(
        (file) =>
          file.kind === requiredProof &&
          file.path.startsWith("drafts/")
      )
    : undefined
  const selectedFile: SelectedFile | null = academicReference
    ? {
        kind: academicReference.kind as SelectedFile["kind"],
        name: academicReference.originalName,
        path: academicReference.path,
        size: academicReference.size,
      }
    : null
  const crefCard = files.find((file) => file.kind === "cref-card")
  const crefRequest = files.find((file) => file.kind === "cref-request")
  if (cref.professionalCardFile && cref.professionalCardFile !== crefCard?.path) {
    cref.professionalCardFile = null
  }
  if (cref.requestProofFile && cref.requestProofFile !== crefRequest?.path) {
    cref.requestProofFile = null
  }

  const errors: Record<string, string> = {
    ...validatePersonal(personal),
    ...validateAcademic(academic, selectedFile),
    ...validateCref(cref),
    ...validateProfessionalLabor(labor),
    ...validateSignupTerms(terms),
  }
  if (academic.formationType && !optionValues(formationOptions).has(academic.formationType)) {
    errors.formationType = "Selecione uma formação válida."
  }
  if (cref.councilUf && !optionValues(crefCouncilOptions).has(cref.councilUf)) {
    errors.councilUf = "Selecione um conselho válido."
  }
  addInvalidArray(
    errors,
    "serviceModes",
    labor.serviceModes,
    new Set(["collective", "sector", "shift"])
  )
  addInvalidArray(
    errors,
    "periods",
    labor.periods,
    new Set(["morning", "afternoon", "evening", "overnight"])
  )
  addInvalidArray(
    errors,
    "days",
    labor.days,
    new Set([
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
      "sunday",
    ])
  )
  addInvalidOption(
    errors,
    "frequency",
    labor.frequency,
    new Set(["weekly_1", "weekly_2", "weekly_3", "weekdays", "flexible"])
  )
  addInvalidOption(
    errors,
    "travelAvailability",
    labor.travelAvailability,
    new Set(["yes", "no", "depends_distance"])
  )
  if (Object.keys(errors).length > 0) {
    throw new RegistrationValidationError(
      "Confira os campos destacados antes de concluir.",
      errors
    )
  }
  return { personal, academic, cref, labor, terms }
}

function normalizeSectorSchedule(value: unknown): CompanySectorSchedule | null {
  if (!isRecord(value)) return null
  return {
    id: stringValue(value.id) || crypto.randomUUID(),
    startTime: stringValue(value.startTime),
    endTime: stringValue(value.endTime),
  }
}

function normalizeSector(value: unknown): CompanySectorEntry | null {
  if (!isRecord(value)) return null
  const schedules = Array.isArray(value.schedules)
    ? value.schedules
        .slice(0, 24)
        .map(normalizeSectorSchedule)
        .filter((item): item is CompanySectorSchedule => item !== null)
    : []
  return {
    id: stringValue(value.id) || crypto.randomUUID(),
    category: stringValue(value.category) as CompanySectorEntry["category"],
    customName: stringValue(value.customName),
    sameAsCompanyHours: value.sameAsCompanyHours === true,
    days: stringArray(value.days) as CompanySectorEntry["days"],
    schedules,
  }
}

function normalizeShift(value: unknown): CompanyShift | null {
  if (!isRecord(value)) return null
  const kind = stringValue(value.kind) as CompanyShift["kind"]
  return {
    id: stringValue(value.id) || crypto.randomUUID(),
    kind,
    customName: stringValue(value.customName),
    startTime: stringValue(value.startTime),
    endTime: stringValue(value.endTime),
  }
}

function normalizeCompanyRegistration(value: unknown): CompanyRegistrationForm {
  if (!isRecord(value)) {
    throw new RegistrationValidationError("Confira os dados da empresa.", {
      form: "Os dados enviados não são válidos.",
    })
  }
  const form = { ...initialCompanyRegistration }
  for (const key of Object.keys(form) as CompanyRegistrationField[]) {
    const current = form[key]
    const input = value[key]
    if (Array.isArray(current)) {
      if (key === "sectors") {
        ;(form as Record<string, unknown>)[key] = Array.isArray(input)
          ? input
              .slice(0, 100)
              .map(normalizeSector)
              .filter((item): item is CompanySectorEntry => item !== null)
          : []
      } else if (key === "shifts") {
        ;(form as Record<string, unknown>)[key] = Array.isArray(input)
          ? input
              .slice(0, 100)
              .map(normalizeShift)
              .filter((item): item is CompanyShift => item !== null)
          : []
      } else {
        ;(form as Record<string, unknown>)[key] = stringArray(input)
      }
    } else if (typeof current === "boolean") {
      ;(form as Record<string, unknown>)[key] =
        typeof input === "boolean" ? input : false
    } else {
      ;(form as Record<string, unknown>)[key] = stringValue(input)
    }
  }
  return form
}

export function validateCompanyRegistration(value: unknown) {
  const form = normalizeCompanyRegistration(value)
  const errors: Record<string, string> = {}
  for (const step of [1, 2, 3, 4, 5, 6] as const) {
    Object.assign(errors, validateCompanyStep(form, step))
  }
  const checks: [string, unknown, ReadonlySet<string>][] = [
    ["activity", form.activity, optionValues(companyActivityOptions)],
    ["employeeBand", form.employeeBand, optionValues(employeeBandOptions)],
    ["frequency", form.frequency, optionValues(companyFrequencyOptions)],
    ["duration", form.duration, optionValues(companyDurationOptions)],
    ["contractInterest", form.contractInterest, optionValues(companyContractInterestOptions)],
    ["startWindow", form.startWindow, optionValues(companyStartWindowOptions)],
    ["priorExperience", form.priorExperience, optionValues(companyPriorExperienceOptions)],
  ]
  for (const [field, valueToCheck, allowed] of checks) {
    addInvalidOption(errors, field, valueToCheck, allowed)
  }
  if (form.serviceModes.some((mode) => !optionValues(companyServiceModeOptions).has(mode))) {
    errors.serviceModes = "Selecione um formato válido."
  }
  if (form.operatingDays.some((day) => !optionValues(companyWeekdayOptions).has(day))) {
    errors.operatingDays = "Selecione dias de funcionamento válidos."
  }
  if (form.goals.some((goal) => !optionValues(companyGoalOptions).has(goal))) {
    errors.goals = "Selecione objetivos válidos."
  }
  if (
    form.sectors.some(
      (sector) => !optionValues(companySectorOptions).has(sector.category)
    )
  ) {
    errors.sectors = "Selecione setores válidos."
  }
  if (
    form.sectors.some((sector) =>
      sector.days.some((day) => !optionValues(companyWeekdayOptions).has(day))
    )
  ) {
    errors.sectors = "Selecione dias válidos para cada setor."
  }
  if (
    form.shifts.some(
      (shift) => !["first", "second", "third", "other"].includes(shift.kind)
    )
  ) {
    errors.shifts = "Selecione um tipo de turno válido."
  }
  addInvalidOption(
    errors,
    "workArrangement",
    form.workArrangement,
    new Set(["onsite", "remote", "hybrid"])
  )
  addInvalidOption(
    errors,
    "spaceAvailability",
    form.spaceAvailability,
    new Set(["ample", "limited", "none", "unknown"])
  )
  addInvalidOption(
    errors,
    "contactTime",
    form.contactTime,
    new Set(["morning", "afternoon", "night", "any"])
  )
  addInvalidOption(
    errors,
    "budgetStatus",
    form.budgetStatus,
    new Set(["yes", "no", "wants_values"])
  )
  addInvalidOption(
    errors,
    "hasShifts",
    form.hasShifts,
    new Set(["yes", "no"])
  )
  addInvalidOption(
    errors,
    "hasNightShift",
    form.hasNightShift,
    new Set(["yes", "no"])
  )
  addInvalidOption(
    errors,
    "collectiveSpace",
    form.collectiveSpace,
    new Set(["yes", "no", "needs_evaluation"])
  )
  if (Object.keys(errors).length > 0) {
    throw new RegistrationValidationError(
      "Confira os campos destacados antes de concluir.",
      errors
    )
  }
  return form
}

export function dateToIso(value: string) {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value)
  if (!match) throw new Error("Data de nascimento inválida.")
  return match[3] + "-" + match[2] + "-" + match[1]
}

export function removeCredentials<T extends Record<string, unknown>>(value: T) {
  const safe = { ...value }
  delete safe.password
  delete safe.passwordConfirmation
  return safe as Omit<T, "password" | "passwordConfirmation">
}

export function jsonObject(value: unknown): Json {
  return JSON.parse(JSON.stringify(value)) as Json
}
