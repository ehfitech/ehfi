import { validatePassword } from "@/lib/auth/password"

export type PersonalForm = {
  fullName: string
  birthDate: string
  cpf: string
  email: string
  phone: string
  password: string
  passwordConfirmation: string
  city: string
  state: string
  instagram: string
}

export type FormationType =
  | "Bacharelado"
  | "Licenciatura"
  | "Tecnólogo"
  | "Pós-graduação / Especialização"
  | "Outro"

export type AcademicStatus = "completed" | "in_progress"
export type DiplomaAvailability = "available" | "pending"
export type AlternativeDocument = "transcript" | "completion_declaration"
export type ProofKind = "diploma" | "transcript" | "completion_declaration"
export type SelectedFile = {
  kind: ProofKind
  name: string
  path?: string
  size?: number
}

export type AcademicForm = {
  institution: string
  course: string
  formationType: FormationType | ""
  otherFormation: string
  status: AcademicStatus | null
  year: string
  diplomaAvailability: DiplomaAvailability | null
  alternativeDocument: AlternativeDocument | null
}

export type CrefAnswer = "registered" | "awaiting" | "none"
export type CrefDeclaredSituation = "regular" | "pending_issues"

export type CrefForm = {
  answer: CrefAnswer | null
  councilUf: string
  registrationNumber: string
  declaredSituation: CrefDeclaredSituation | null
  requestSituation: string
  professionalCardFile: string | null
  requestProofFile: string | null
}

export type SignupTerms = {
  privacyAcknowledged: boolean
  authenticityDeclared: boolean
  marketingOptIn: boolean
}

export type LaborInterest = "yes" | "no"
export type LaborExperience = "experienced" | "not_experienced" | "interested_without_experience"
export type LaborServiceMode = "collective" | "sector" | "shift"
export type LaborPeriod = "morning" | "afternoon" | "evening" | "overnight"
export type LaborWeekday = "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday"
export type LaborFrequency = "weekly_1" | "weekly_2" | "weekly_3" | "weekdays" | "flexible"
export type LaborTravelAvailability = "yes" | "no" | "depends_distance"

export type ProfessionalLaborForm = {
  interest: LaborInterest | null
  experience: LaborExperience | null
  serviceModes: LaborServiceMode[]
  periods: LaborPeriod[]
  specificStartTime: string
  specificEndTime: string
  days: LaborWeekday[]
  differentCompanyShifts: LaborInterest | null
  frequency: LaborFrequency | null
  serviceAreas: string[]
  travelAvailability: LaborTravelAvailability | null
}

export type ProfessionalLaborErrors = Partial<
  Record<"specificStartTime" | "specificEndTime", string>
>

export type PersonalField = keyof PersonalForm
export type PersonalErrors = Partial<Record<PersonalField, string>>
export type AcademicErrors = Partial<
  Record<keyof AcademicForm | "proof", string>
>
export type CrefField = keyof CrefForm
export type CrefErrors = Partial<Record<CrefField, string>>
export type SignupTermsErrors = Partial<Record<"privacyAcknowledged" | "authenticityDeclared", string>>

export const initialPersonal: PersonalForm = {
  fullName: "",
  birthDate: "",
  cpf: "",
  email: "",
  phone: "",
  password: "",
  passwordConfirmation: "",
  city: "",
  state: "",
  instagram: "",
}

export const initialAcademic: AcademicForm = {
  institution: "",
  course: "",
  formationType: "",
  otherFormation: "",
  status: null,
  year: "",
  diplomaAvailability: null,
  alternativeDocument: null,
}

export const initialCref: CrefForm = {
  answer: null,
  councilUf: "",
  registrationNumber: "",
  declaredSituation: null,
  requestSituation: "",
  professionalCardFile: null,
  requestProofFile: null,
}

export const initialSignupTerms: SignupTerms = {
  privacyAcknowledged: false,
  authenticityDeclared: false,
  marketingOptIn: false,
}

export const initialProfessionalLabor: ProfessionalLaborForm = {
  interest: null,
  experience: null,
  serviceModes: [],
  periods: [],
  specificStartTime: "",
  specificEndTime: "",
  days: [],
  differentCompanyShifts: null,
  frequency: null,
  serviceAreas: [],
  travelAvailability: null,
}

export const crefCouncilOptions = [
  { value: "AC", name: "Acre" },
  { value: "AL", name: "Alagoas" },
  { value: "AP", name: "Amapá" },
  { value: "AM", name: "Amazonas" },
  { value: "BA", name: "Bahia" },
  { value: "CE", name: "Ceará" },
  { value: "DF", name: "Distrito Federal" },
  { value: "ES", name: "Espírito Santo" },
  { value: "GO", name: "Goiás" },
  { value: "MA", name: "Maranhão" },
  { value: "MT", name: "Mato Grosso" },
  { value: "MS", name: "Mato Grosso do Sul" },
  { value: "MG", name: "Minas Gerais" },
  { value: "PA", name: "Pará" },
  { value: "PB", name: "Paraíba" },
  { value: "PR", name: "Paraná" },
  { value: "PE", name: "Pernambuco" },
  { value: "PI", name: "Piauí" },
  { value: "RJ", name: "Rio de Janeiro" },
  { value: "RN", name: "Rio Grande do Norte" },
  { value: "RS", name: "Rio Grande do Sul" },
  { value: "RO", name: "Rondônia" },
  { value: "RR", name: "Roraima" },
  { value: "SC", name: "Santa Catarina" },
  { value: "SP", name: "São Paulo" },
  { value: "SE", name: "Sergipe" },
  { value: "TO", name: "Tocantins" },
] as const

export const formationOptions: {
  value: FormationType
  title: string
  description: string
  icon: "school" | "person" | "construct" | "ribbon" | "ellipsis-horizontal-circle"
}[] = [
  { value: "Bacharelado", title: "Bacharelado", description: "Graduação", icon: "school" },
  { value: "Licenciatura", title: "Licenciatura", description: "Formação docente", icon: "person" },
  { value: "Tecnólogo", title: "Tecnólogo", description: "Graduação tecnológica", icon: "construct" },
  { value: "Pós-graduação / Especialização", title: "Pós-graduação", description: "Especialização", icon: "ribbon" },
  { value: "Outro", title: "Outro", description: "Outra formação", icon: "ellipsis-horizontal-circle" },
]

export const proofLabels: Record<ProofKind, string> = {
  diploma: "Diploma universitário",
  transcript: "Histórico acadêmico",
  completion_declaration: "Declaração de conclusão",
}

export const sampleFiles: Record<ProofKind, string> = {
  diploma: "diploma_universitario_demo.pdf",
  transcript: "historico_academico_demo.pdf",
  completion_declaration: "declaracao_conclusao_demo.pdf",
}

export function formatCpf(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11)
  return digits
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2")
}

export function formatPhone(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11)
  if (digits.length < 3) {
    return digits ? `(${digits}${digits.length === 2 ? ")" : ""}` : ""
  }

  const localDigits = digits.slice(2)
  const localLength = digits.length === 11 ? 5 : 4
  const first = localDigits.slice(0, localLength)
  const second = localDigits.slice(localLength)
  return `(${digits.slice(0, 2)}) ${first}${second ? `-${second}` : ""}`
}

export function formatBirthDate(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 8)
  if (digits.length <= 2) return digits
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`
}

export function formatWithCaret(
  rawValue: string,
  selectionStart: number | null,
  selectionEnd: number | null,
  formatter: (value: string) => string
) {
  const value = formatter(rawValue)
  const mapPosition = (position: number | null) => {
    if (position === null) return value.length
    const digitsBeforeCaret = rawValue.slice(0, position).replace(/\D/g, "").length
    let mapped = 0
    let digitsSeen = 0

    while (mapped < value.length && digitsSeen < digitsBeforeCaret) {
      if (/\d/.test(value[mapped])) digitsSeen += 1
      mapped += 1
    }

    if (digitsBeforeCaret > 0 && mapped < value.length && /\D/.test(value[mapped])) {
      mapped += 1
    }

    return mapped
  }

  return {
    value,
    selectionStart: mapPosition(selectionStart),
    selectionEnd: mapPosition(selectionEnd),
  }
}

function isValidCpf(value: string) {
  const digits = value.replace(/\D/g, "")
  if (digits.length !== 11 || /^([0-9])\1{10}$/.test(digits)) return false

  const calculateDigit = (length: number) => {
    const sum = digits
      .slice(0, length)
      .split("")
      .reduce((total, digit, index) => total + Number(digit) * (length + 1 - index), 0)
    const remainder = (sum * 10) % 11
    return remainder === 10 ? 0 : remainder
  }

  return calculateDigit(9) === Number(digits[9]) && calculateDigit(10) === Number(digits[10])
}

export function validatePersonal(form: PersonalForm): PersonalErrors {
  const errors: PersonalErrors = {}
  const parts = form.fullName.trim().split(/\s+/).filter(Boolean)
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(form.birthDate)
  let validDate = false
  if (match) {
    const day = Number(match[1])
    const month = Number(match[2])
    const year = Number(match[3])
    const date = new Date(year, month - 1, day)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    validDate = date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day && date <= today
  }

  if (parts.length < 2) errors.fullName = "Informe seu nome e sobrenome."
  if (!validDate) errors.birthDate = "Informe uma data válida, que não seja futura."
  if (!isValidCpf(form.cpf)) errors.cpf = "Informe um CPF válido."
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) errors.email = "Confira o formato do e-mail."
  if (![10, 11].includes(form.phone.replace(/\D/g, "").length)) errors.phone = "Informe um telefone com DDD."
  if (!validatePassword(form.password).valid) errors.password = "Atenda aos requisitos de segurança da senha."
  if (!form.passwordConfirmation || form.passwordConfirmation !== form.password) {
    errors.passwordConfirmation = "As senhas precisam ser iguais."
  }
  if (form.city.trim().length < 2) errors.city = "Informe sua cidade."
  if (!/^[A-Za-z]{2}$/.test(form.state.trim())) errors.state = "Use a sigla de dois caracteres."
  return errors
}

export function getRequiredProof(academic: AcademicForm): ProofKind | null {
  if (academic.status === "in_progress") return "transcript"
  if (academic.status === "completed" && academic.diplomaAvailability === "available") return "diploma"
  if (academic.status === "completed" && academic.diplomaAvailability === "pending") {
    return academic.alternativeDocument
  }
  return null
}

export function validateAcademic(
  academic: AcademicForm,
  selectedFile: SelectedFile | null,
  currentYear = new Date().getFullYear()
): AcademicErrors {
  const errors: AcademicErrors = {}
  if (academic.institution.trim().length < 2) errors.institution = "Informe a instituição."
  if (academic.course.trim().length < 2) errors.course = "Informe o curso."
  if (!academic.formationType) errors.formationType = "Selecione o tipo de formação."
  if (academic.formationType === "Outro" && academic.otherFormation.trim().length < 2) {
    errors.otherFormation = "Descreva sua formação."
  }
  if (!academic.status) errors.status = "Escolha sua situação acadêmica."
  if (academic.status && !/^\d{4}$/.test(academic.year)) {
    errors.year = "Informe o ano com quatro dígitos."
  } else if (academic.status === "completed" && Number(academic.year) < 1900) {
    errors.year = "Confira o ano de conclusão."
  } else if (academic.status === "completed" && Number(academic.year) > currentYear) {
    errors.year = "Use um ano de conclusão que já tenha ocorrido."
  } else if (academic.status === "in_progress" && Number(academic.year) < currentYear) {
    errors.year = "Use o ano previsto de conclusão."
  }
  if (academic.status === "completed" && !academic.diplomaAvailability) {
    errors.diplomaAvailability = "Indique se o diploma já foi recebido."
  }
  if (academic.status === "completed" && academic.diplomaAvailability === "pending" && !academic.alternativeDocument) {
    errors.alternativeDocument = "Escolha qual documento você vai apresentar."
  }
  const requiredProof = getRequiredProof(academic)
  if (!requiredProof || !selectedFile || selectedFile.kind !== requiredProof) {
    errors.proof = "Adicione o comprovante solicitado em PDF."
  }
  return errors
}

export function validateCref(form: CrefForm): CrefErrors {
  const errors: CrefErrors = {}

  if (!form.answer) {
    errors.answer = "Selecione uma opção sobre seu registro no CREF."
    return errors
  }

  if (form.answer === "registered") {
    if (!form.councilUf) errors.councilUf = "Selecione o estado do seu CREF."
    if (!form.registrationNumber.trim()) errors.registrationNumber = "Informe seu número de registro profissional."
    if (!form.declaredSituation) errors.declaredSituation = "Informe a situação declarada do seu registro."
    if (!form.professionalCardFile) errors.professionalCardFile = "Anexe a carteira profissional do CREF."
  }

  if (form.answer === "awaiting" && !form.requestSituation.trim()) {
    errors.requestSituation = "Conte a situação da solicitação do seu registro."
  }

  return errors
}

export function validateSignupTerms(terms: SignupTerms): SignupTermsErrors {
  const errors: SignupTermsErrors = {}

  if (!terms.privacyAcknowledged) {
    errors.privacyAcknowledged = "Confirme a leitura do Aviso de Privacidade para continuar."
  }
  if (!terms.authenticityDeclared) {
    errors.authenticityDeclared = "Confirme a veracidade das informações e dos documentos para continuar."
  }

  return errors
}

export function validateProfessionalLabor(form: ProfessionalLaborForm): ProfessionalLaborErrors {
  const errors: ProfessionalLaborErrors = {}

  if (form.interest !== "yes") return errors

  if (form.specificStartTime && !form.specificEndTime) {
    errors.specificEndTime = "Informe o término do intervalo."
  } else if (!form.specificStartTime && form.specificEndTime) {
    errors.specificStartTime = "Informe o início do intervalo."
  }

  return errors
}
