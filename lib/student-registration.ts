export type StudentSignupStep = 1 | 2 | 3 | 4 | 5 | 6

export type FitnessLevel = "beginner" | "intermediate" | "advanced"
export type CurrentExercise = "regular" | "irregular" | "none"
export type PracticeDuration =
  | "never"
  | "under_6_months"
  | "6_to_12_months"
  | "1_to_3_years"
  | "over_3_years"
export type ExerciseModality =
  | "strength"
  | "functional"
  | "walking_running"
  | "dance"
  | "pilates_stretching"
  | "team_sports"
  | "outdoors"
  | "other"
export type HealthCondition =
  | "none"
  | "hypertension"
  | "diabetes"
  | "cardiovascular"
  | "respiratory"
  | "renal"
  | "bone_joint"
  | "neurological"
  | "other"
export type ConditionControl = "controlled" | "uncontrolled" | "unsure"
export type HealthSymptom =
  | "chest_pain"
  | "shortness_of_breath"
  | "dizziness_fainting"
  | "palpitations"
  | "unusual_fatigue"
  | "none"
export type CurrentLimitation =
  "none" | "muscular" | "joint" | "spine" | "injury_surgery" | "other"
export type InjuryHistory = "none" | "recovered" | "ongoing"
export type ExerciseRestriction = "no" | "yes" | "unsure"
export type PregnancyStatus =
  "no" | "pregnant" | "postpartum" | "prefer_not_to_answer"
export type SleepQuality = "good" | "regular" | "poor"
export type DailyRoutine =
  "mostly_sitting" | "mixed" | "mostly_moving" | "intense_physical"
export type NutritionRoutine =
  "adequate" | "could_improve" | "difficult" | "prefer_not_to_answer"
export type StudentGoal =
  | "health"
  | "weight_loss"
  | "muscle_gain"
  | "strength_endurance"
  | "mobility"
  | "pain_function"
  | "sports_performance"
  | "stress_wellbeing"
  | "return_to_exercise"
  | "other"

export type StudentRegistrationForm = {
  fullName: string
  email: string
  phone: string
  password: string
  passwordConfirmation: string
  birthDate: string
  heightCm: string
  weightKg: string
  fitnessLevel: FitnessLevel | ""
  currentExercise: CurrentExercise | ""
  practiceDuration: PracticeDuration | ""
  modalities: ExerciseModality[]
  otherModality: string
  conditions: HealthCondition[]
  otherCondition: string
  conditionControl: ConditionControl | ""
  usesMedication: "yes" | "no" | ""
  medicationName: string
  medicationPurpose: string
  symptoms: HealthSymptom[]
  symptomDetails: string
  limitations: CurrentLimitation[]
  limitationDetails: string
  injuryHistory: InjuryHistory | ""
  injuryDetails: string
  exerciseRestriction: ExerciseRestriction | ""
  restrictionDetails: string
  pregnancyStatus: PregnancyStatus | ""
  pregnancyDuration: string
  otherHealthInfo: string
  sleepQuality: SleepQuality | ""
  dailyRoutine: DailyRoutine | ""
  nutritionRoutine: NutritionRoutine | ""
  goals: StudentGoal[]
  otherGoal: string
  experienceNotes: string
  accuracyConfirmed: boolean
  healthDataConsent: boolean
  guardianName: string
  guardianContact: string
  guardianConfirmed: boolean
}

export type StudentRegistrationField = keyof StudentRegistrationForm
export type StudentRegistrationErrors = Partial<
  Record<StudentRegistrationField, string>
> & {
  professionalReview?: string
}
export type StudentPasswordRequirement =
  "minLength" | "number" | "lowercase" | "uppercase" | "special"

export function getStudentPasswordRequirements(password: string) {
  return {
    minLength: Array.from(password).length >= 8,
    number: /\p{Nd}/u.test(password),
    lowercase: /\p{Ll}/u.test(password),
    uppercase: /\p{Lu}/u.test(password),
    special: /[\p{P}\p{S}]/u.test(password),
  } satisfies Record<StudentPasswordRequirement, boolean>
}

export const initialStudentRegistration: StudentRegistrationForm = {
  fullName: "",
  email: "",
  phone: "",
  password: "",
  passwordConfirmation: "",
  birthDate: "",
  heightCm: "",
  weightKg: "",
  fitnessLevel: "",
  currentExercise: "",
  practiceDuration: "",
  modalities: [],
  otherModality: "",
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
  sleepQuality: "",
  dailyRoutine: "",
  nutritionRoutine: "",
  goals: [],
  otherGoal: "",
  experienceNotes: "",
  accuracyConfirmed: false,
  healthDataConsent: false,
  guardianName: "",
  guardianContact: "",
  guardianConfirmed: false,
}

export const studentSignupSteps = [
  { id: 1, label: "Sua conta", compactLabel: "Conta" },
  { id: 2, label: "Perfil físico", compactLabel: "Perfil" },
  { id: 3, label: "Movimento e rotina", compactLabel: "Rotina" },
  { id: 4, label: "Histórico de saúde", compactLabel: "Saúde" },
  { id: 5, label: "Cuidados e limitações", compactLabel: "Cuidados" },
  { id: 6, label: "Objetivos e confirmações", compactLabel: "Final" },
] as const

export const fitnessLevelOptions: readonly {
  value: FitnessLevel
  title: string
  description: string
}[] = [
  {
    value: "beginner",
    title: "Iniciante",
    description: "Pratico pouco ou nenhum exercício físico.",
  },
  {
    value: "intermediate",
    title: "Intermediário",
    description: "Pratico exercício físico ocasionalmente.",
  },
  {
    value: "advanced",
    title: "Avançado",
    description: "Pratico exercício físico regularmente.",
  },
]

export const currentExerciseOptions: readonly {
  value: CurrentExercise
  title: string
}[] = [
  { value: "regular", title: "Sim, regularmente" },
  { value: "irregular", title: "Sim, mas de forma irregular" },
  { value: "none", title: "Não pratico atualmente" },
]

export const practiceDurationOptions: readonly {
  value: PracticeDuration
  title: string
}[] = [
  { value: "never", title: "Nunca pratiquei regularmente" },
  { value: "under_6_months", title: "Menos de 6 meses" },
  { value: "6_to_12_months", title: "De 6 meses a 1 ano" },
  { value: "1_to_3_years", title: "De 1 a 3 anos" },
  { value: "over_3_years", title: "Mais de 3 anos" },
]

export const healthConditionOptions: readonly {
  value: HealthCondition
  title: string
}[] = [
  { value: "none", title: "Não possuo nenhuma dessas condições" },
  { value: "hypertension", title: "Hipertensão arterial" },
  { value: "diabetes", title: "Diabetes" },
  { value: "cardiovascular", title: "Doença cardíaca ou cardiovascular" },
  { value: "respiratory", title: "Doença respiratória, como asma" },
  { value: "renal", title: "Doença renal" },
  { value: "bone_joint", title: "Alteração óssea ou articular" },
  { value: "neurological", title: "Problema neurológico" },
  { value: "other", title: "Outra condição de saúde" },
]

export const healthSymptomOptions: readonly {
  value: HealthSymptom
  title: string
}[] = [
  { value: "chest_pain", title: "Dor ou pressão no peito" },
  {
    value: "shortness_of_breath",
    title: "Falta de ar desproporcional ao esforço",
  },
  { value: "dizziness_fainting", title: "Tontura ou desmaio" },
  { value: "palpitations", title: "Palpitações ou batimentos incomuns" },
  { value: "unusual_fatigue", title: "Cansaço excessivo sem motivo aparente" },
  { value: "none", title: "Nenhum desses sintomas" },
]

export const limitationOptions: readonly {
  value: CurrentLimitation
  title: string
}[] = [
  { value: "none", title: "Não" },
  { value: "muscular", title: "Sim, muscular" },
  { value: "joint", title: "Sim, articular" },
  { value: "spine", title: "Sim, na coluna" },
  { value: "injury_surgery", title: "Sim, decorrente de lesão ou cirurgia" },
  { value: "other", title: "Sim, outra limitação" },
]

export const injuryHistoryOptions: readonly {
  value: InjuryHistory
  title: string
}[] = [
  { value: "none", title: "Não" },
  { value: "recovered", title: "Sim, estou totalmente recuperado(a)" },
  { value: "ongoing", title: "Sim, ainda tenho alguma limitação" },
]

export const exerciseRestrictionOptions: readonly {
  value: ExerciseRestriction
  title: string
}[] = [
  { value: "no", title: "Não" },
  { value: "yes", title: "Sim" },
  { value: "unsure", title: "Não tenho certeza" },
]

export const pregnancyStatusOptions: readonly {
  value: PregnancyStatus
  title: string
}[] = [
  { value: "no", title: "Não" },
  { value: "pregnant", title: "Sim, estou gestante" },
  { value: "postpartum", title: "Sim, estou no período pós-parto" },
  { value: "prefer_not_to_answer", title: "Prefiro não responder" },
]

export const sleepQualityOptions: readonly {
  value: SleepQuality
  title: string
}[] = [
  { value: "good", title: "Boa" },
  { value: "regular", title: "Regular" },
  { value: "poor", title: "Ruim" },
]

export const dailyRoutineOptions: readonly {
  value: DailyRoutine
  title: string
  description?: string
}[] = [
  { value: "mostly_sitting", title: "A maior parte do dia sentado(a)" },
  { value: "mixed", title: "Alterno períodos sentado(a) e em movimento" },
  {
    value: "mostly_moving",
    title: "A maior parte do dia em pé ou em movimento",
  },
  { value: "intense_physical", title: "Realizo trabalho físico intenso" },
]

export const nutritionRoutineOptions: readonly {
  value: NutritionRoutine
  title: string
}[] = [
  { value: "adequate", title: "Adequadas" },
  { value: "could_improve", title: "Poderiam melhorar" },
  {
    value: "difficult",
    title: "Tenho dificuldades para manter uma rotina adequada",
  },
  { value: "prefer_not_to_answer", title: "Prefiro não responder" },
]

function parseStudentBirthDate(value: string) {
  const match = value.trim().match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
  if (!match) return null

  const day = Number(match[1])
  const month = Number(match[2])
  const year = Number(match[3])
  const date = new Date(year, month - 1, day)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day ||
    date > today
  ) {
    return null
  }

  return date
}

export function formatStudentBirthDate(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 8)
  if (digits.length <= 2) return digits
  if (digits.length <= 4) return digits.slice(0, 2) + "/" + digits.slice(2)
  return digits.slice(0, 2) + "/" + digits.slice(2, 4) + "/" + digits.slice(4)
}

export function getStudentAge(birthDate: string, today = new Date()) {
  const date = parseStudentBirthDate(birthDate)
  if (!date) return null

  let age = today.getFullYear() - date.getFullYear()
  const birthdayHasNotOccurred =
    today.getMonth() < date.getMonth() ||
    (today.getMonth() === date.getMonth() && today.getDate() < date.getDate())
  if (birthdayHasNotOccurred) age -= 1
  return age
}

function hasSelectedOption<T extends string>(values: readonly T[], except?: T) {
  return values.some((value) => value !== except)
}

function validateAccount(
  form: StudentRegistrationForm
): StudentRegistrationErrors {
  const errors: StudentRegistrationErrors = {}
  const nameParts = form.fullName.trim().split(/\s+/).filter(Boolean)

  if (nameParts.length < 2) errors.fullName = "Informe seu nome e sobrenome."
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
    errors.email = "Confira o formato do e-mail."
  if (![10, 11].includes(form.phone.replace(/\D/g, "").length))
    errors.phone = "Informe um telefone com DDD."
  if (
    !Object.values(getStudentPasswordRequirements(form.password)).every(Boolean)
  ) {
    errors.password = "Atenda aos cinco requisitos da senha."
  }
  if (
    form.passwordConfirmation !== form.password ||
    !form.passwordConfirmation
  ) {
    errors.passwordConfirmation = "As senhas precisam ser iguais."
  }

  return errors
}

function validatePhysicalProfile(
  form: StudentRegistrationForm
): StudentRegistrationErrors {
  const errors: StudentRegistrationErrors = {}
  if (getStudentAge(form.birthDate) === null)
    errors.birthDate = "Informe uma data válida, que não seja futura."

  const height = Number(form.heightCm)
  if (
    !form.heightCm.trim() ||
    !Number.isFinite(height) ||
    height <= 0 ||
    height > 300
  ) {
    errors.heightCm = "Informe sua altura em centímetros."
  }

  if (form.weightKg.trim()) {
    const weight = Number(form.weightKg)
    if (!Number.isFinite(weight) || weight <= 0 || weight > 500)
      errors.weightKg = "Informe um peso válido em quilogramas."
  }

  if (!form.fitnessLevel)
    errors.fitnessLevel = "Selecione seu nível atual de condicionamento."
  return errors
}

function validateMovementAndRoutine(
  form: StudentRegistrationForm
): StudentRegistrationErrors {
  const errors: StudentRegistrationErrors = {}
  if (!form.currentExercise) errors.currentExercise = "Selecione uma opção."
  if (!form.practiceDuration) errors.practiceDuration = "Selecione uma opção."
  if (form.modalities.length === 0)
    errors.modalities = "Selecione ao menos uma modalidade."
  if (form.modalities.includes("other") && !form.otherModality.trim())
    errors.otherModality = "Descreva a modalidade."
  if (!form.sleepQuality) errors.sleepQuality = "Selecione uma opção."
  if (!form.dailyRoutine) errors.dailyRoutine = "Selecione uma opção."
  if (!form.nutritionRoutine) errors.nutritionRoutine = "Selecione uma opção."
  return errors
}

function validateHealthHistory(
  form: StudentRegistrationForm
): StudentRegistrationErrors {
  const errors: StudentRegistrationErrors = {}
  if (form.conditions.length === 0) errors.conditions = "Selecione uma opção."
  if (form.conditions.includes("none") && form.conditions.length > 1) {
    errors.conditions = "“Não possuo nenhuma” deve ser selecionada sozinha."
  }

  const hasCondition = hasSelectedOption(form.conditions, "none")
  if (hasCondition && !form.conditionControl)
    errors.conditionControl = "Informe se a condição está controlada."
  if (!form.usesMedication) errors.usesMedication = "Selecione uma opção."
  if (form.usesMedication === "yes" && !form.medicationName.trim()) {
    errors.medicationName = "Informe o nome do medicamento."
  }

  if (form.symptoms.length === 0) errors.symptoms = "Selecione uma opção."
  if (form.symptoms.includes("none") && form.symptoms.length > 1) {
    errors.symptoms = "“Nenhum desses sintomas” deve ser selecionada sozinha."
  }
  if (hasSelectedOption(form.symptoms, "none") && !form.symptomDetails.trim()) {
    errors.symptomDetails = "Explique quando acontece e se ainda ocorre."
  }

  return errors
}

function validateSafetyAndLimitations(
  form: StudentRegistrationForm
): StudentRegistrationErrors {
  const errors: StudentRegistrationErrors = {}
  if (form.limitations.length === 0) errors.limitations = "Selecione uma opção."
  if (form.limitations.includes("none") && form.limitations.length > 1) {
    errors.limitations = "“Não” deve ser selecionada sozinha."
  }
  if (
    hasSelectedOption(form.limitations, "none") &&
    !form.limitationDetails.trim()
  ) {
    errors.limitationDetails =
      "Informe região, duração e movimentos que causam desconforto."
  }

  if (!form.injuryHistory) errors.injuryHistory = "Selecione uma opção."
  if (
    form.injuryHistory &&
    form.injuryHistory !== "none" &&
    !form.injuryDetails.trim()
  ) {
    errors.injuryDetails = "Descreva brevemente a cirurgia ou lesão."
  }

  if (!form.exerciseRestriction)
    errors.exerciseRestriction = "Selecione uma opção."
  if (form.exerciseRestriction === "yes" && !form.restrictionDetails.trim()) {
    errors.restrictionDetails = "Informe quais restrições foram recomendadas."
  }

  if (!form.pregnancyStatus) errors.pregnancyStatus = "Selecione uma opção."
  if (
    (form.pregnancyStatus === "pregnant" ||
      form.pregnancyStatus === "postpartum") &&
    !form.pregnancyDuration.trim()
  ) {
    errors.pregnancyDuration = "Informe o tempo de gestação ou desde o parto."
  }

  return errors
}

function validateGoalsAndConfirmation(
  form: StudentRegistrationForm
): StudentRegistrationErrors {
  const errors: StudentRegistrationErrors = {}
  if (form.goals.length === 0) errors.goals = "Selecione ao menos um objetivo."
  if (form.goals.includes("other") && !form.otherGoal.trim())
    errors.otherGoal = "Descreva seu objetivo."
  if (!form.accuracyConfirmed)
    errors.accuracyConfirmed = "Confirme as informações fornecidas."
  if (!form.healthDataConsent)
    errors.healthDataConsent =
      "A autorização é necessária para concluir este cadastro."

  const age = getStudentAge(form.birthDate)
  if (age !== null && age < 18) {
    if (!form.guardianName.trim())
      errors.guardianName = "Informe o nome do responsável legal."
    const contact = form.guardianContact.trim()
    const emailIsValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact)
    const phoneLength = contact.replace(/\D/g, "").length
    if (!emailIsValid && ![10, 11].includes(phoneLength)) {
      errors.guardianContact =
        "Informe um e-mail ou telefone com DDD do responsável."
    }
    if (!form.guardianConfirmed)
      errors.guardianConfirmed =
        "O responsável precisa confirmar a autorização."
  }

  if (requiresProfessionalReview(form)) {
    errors.professionalReview =
      "O cadastro não pode ser concluído enquanto houver necessidade de revisão profissional."
  }

  return errors
}

export function validateStudentStep(
  form: StudentRegistrationForm,
  step: StudentSignupStep
): StudentRegistrationErrors {
  switch (step) {
    case 1:
      return validateAccount(form)
    case 2:
      return validatePhysicalProfile(form)
    case 3:
      return validateMovementAndRoutine(form)
    case 4:
      return validateHealthHistory(form)
    case 5:
      return validateSafetyAndLimitations(form)
    case 6:
      return validateGoalsAndConfirmation(form)
  }
}

export function requiresProfessionalReview(form: StudentRegistrationForm) {
  return (
    hasSelectedOption(form.conditions, "none") ||
    form.usesMedication === "yes" ||
    hasSelectedOption(form.symptoms, "none") ||
    hasSelectedOption(form.limitations, "none") ||
    (form.injuryHistory !== "" && form.injuryHistory !== "none") ||
    (form.exerciseRestriction !== "" && form.exerciseRestriction !== "no") ||
    form.pregnancyStatus === "pregnant" ||
    form.pregnancyStatus === "postpartum" ||
    form.otherHealthInfo.trim().length > 0
  )
}
