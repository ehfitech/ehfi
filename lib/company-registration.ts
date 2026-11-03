export type CompanySignupStep = 1 | 2 | 3 | 4 | 5 | 6

export type CompanyActivity =
  | "industry"
  | "commerce"
  | "health"
  | "education"
  | "services"
  | "technology"
  | "logistics"
  | "administrative"
  | "other"

export type EmployeeBand =
  | "up_to_10"
  | "11_to_30"
  | "31_to_50"
  | "51_to_100"
  | "101_to_200"
  | "201_to_500"
  | "over_500"

export type CompanySector =
  | "administrative"
  | "human_resources"
  | "production"
  | "sales"
  | "finance"
  | "logistics"
  | "customer_service"
  | "operational"
  | "other"

export type CompanyWeekday =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday"

export type CompanySectorSchedule = {
  id: string
  startTime: string
  endTime: string
}

export type CompanySectorEntry = {
  id: string
  category: CompanySector
  customName: string
  sameAsCompanyHours: boolean
  days: CompanyWeekday[]
  schedules: CompanySectorSchedule[]
}

export type CompanyShift = {
  id: string
  kind: "first" | "second" | "third" | "other"
  customName: string
  startTime: string
  endTime: string
}

export type CompanyServiceMode = "collective" | "sector" | "shift" | "guidance"
export type CompanyFrequency =
  | "weekly_1"
  | "weekly_2"
  | "weekly_3"
  | "weekdays"
  | "one_off"
  | "undecided"
export type CompanyDuration = "5_10" | "10_15" | "15_20" | "20_30" | "guidance"
export type CompanyGoal =
  | "quality_of_life"
  | "health_wellbeing"
  | "prevent_discomfort"
  | "healthy_habits"
  | "reduce_inactivity"
  | "team_integration"
  | "occupational_health"
  | "other"
export type CompanyPriorExperience = "currently" | "interrupted" | "first_time"

export type CompanyDirectoryData = {
  cnpj: string
  legalName: string
  tradeName?: string
  street?: string
  number?: string
  complement?: string
  district?: string
  city?: string
  state?: string
  postalCode?: string
  mainCnae?: string
  registrationStatus?: string
}

export type CompanyRegistrationForm = {
  legalName: string
  tradeName: string
  cnpj: string
  activity: CompanyActivity | ""
  otherActivity: string
  mainCnae: string
  registrationStatus: string
  street: string
  number: string
  complement: string
  district: string
  city: string
  state: string
  postalCode: string
  websiteOrSocial: string
  contactName: string
  contactRole: string
  contactDepartment: string
  contactEmail: string
  contactPhone: string
  contactTime: "morning" | "afternoon" | "night" | "any" | ""
  employeeBand: EmployeeBand | ""
  employeeExact: string
  workArrangement: "onsite" | "remote" | "hybrid" | ""
  spaceAvailability: "ample" | "limited" | "none" | "unknown" | ""
  openingTime: string
  closingTime: string
  operatingDays: CompanyWeekday[]
  hasShifts: "yes" | "no" | ""
  hasNightShift: "yes" | "no" | ""
  shifts: CompanyShift[]
  sectors: CompanySectorEntry[]
  serviceModes: CompanyServiceMode[]
  collectiveSpace: "yes" | "no" | "needs_evaluation" | ""
  frequency: CompanyFrequency | ""
  duration: CompanyDuration | ""
  contractInterest: "trial" | "monthly" | "ongoing" | "special_action" | "plans_first" | ""
  startWindow: "immediate" | "15_days" | "30_days" | "3_months" | "undecided" | ""
  budgetStatus: "yes" | "no" | "wants_values" | ""
  budgetAmount: string
  goals: CompanyGoal[]
  otherGoal: string
  priorExperience: CompanyPriorExperience | ""
  specificNeeds: string
  termsAccepted: boolean
  privacyAcknowledged: boolean
  contactAuthorized: boolean
  accuracyConfirmed: boolean
}

export type CompanyRegistrationField = keyof CompanyRegistrationForm
export type CompanyRegistrationErrors = Partial<
  Record<CompanyRegistrationField, string>
>

export const initialCompanyRegistration: CompanyRegistrationForm = {
  legalName: "",
  tradeName: "",
  cnpj: "",
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
  contactName: "",
  contactRole: "",
  contactDepartment: "",
  contactEmail: "",
  contactPhone: "",
  contactTime: "",
  employeeBand: "",
  employeeExact: "",
  workArrangement: "",
  spaceAvailability: "",
  openingTime: "",
  closingTime: "",
  operatingDays: [],
  hasShifts: "",
  hasNightShift: "",
  shifts: [],
  sectors: [],
  serviceModes: [],
  collectiveSpace: "",
  frequency: "",
  duration: "",
  contractInterest: "",
  startWindow: "",
  budgetStatus: "",
  budgetAmount: "",
  goals: [],
  otherGoal: "",
  priorExperience: "",
  specificNeeds: "",
  termsAccepted: false,
  privacyAcknowledged: false,
  contactAuthorized: false,
  accuracyConfirmed: false,
}

export const companySignupSteps = [
  { id: 1, label: "Dados da empresa", compactLabel: "Dados" },
  { id: 2, label: "Responsável", compactLabel: "Contato" },
  { id: 3, label: "Estrutura e horários", compactLabel: "Estrutura" },
  { id: 4, label: "Modelo e frequência", compactLabel: "Modelo" },
  { id: 5, label: "Contratação e objetivos", compactLabel: "Objetivos" },
  { id: 6, label: "Revisão e confirmações", compactLabel: "Final" },
] as const

export const companyActivityOptions: readonly {
  value: CompanyActivity
  title: string
}[] = [
  { value: "industry", title: "Indústria" },
  { value: "commerce", title: "Comércio" },
  { value: "health", title: "Saúde" },
  { value: "education", title: "Educação" },
  { value: "services", title: "Serviços" },
  { value: "technology", title: "Tecnologia" },
  { value: "logistics", title: "Logística" },
  { value: "administrative", title: "Administrativo" },
  { value: "other", title: "Outro" },
]

export const employeeBandOptions: readonly {
  value: EmployeeBand
  title: string
  minimum: number
  maximum: number | null
}[] = [
  { value: "up_to_10", title: "Até 10", minimum: 1, maximum: 10 },
  { value: "11_to_30", title: "11 a 30", minimum: 11, maximum: 30 },
  { value: "31_to_50", title: "31 a 50", minimum: 31, maximum: 50 },
  { value: "51_to_100", title: "51 a 100", minimum: 51, maximum: 100 },
  { value: "101_to_200", title: "101 a 200", minimum: 101, maximum: 200 },
  { value: "201_to_500", title: "201 a 500", minimum: 201, maximum: 500 },
  { value: "over_500", title: "Mais de 500", minimum: 501, maximum: null },
]

export const companySectorOptions: readonly {
  value: CompanySector
  title: string
}[] = [
  { value: "administrative", title: "Administrativo" },
  { value: "human_resources", title: "Recursos Humanos" },
  { value: "production", title: "Produção" },
  { value: "sales", title: "Comercial/Vendas" },
  { value: "finance", title: "Financeiro" },
  { value: "logistics", title: "Logística" },
  { value: "customer_service", title: "Atendimento" },
  { value: "operational", title: "Operacional" },
  { value: "other", title: "Outro" },
]

export const companyWeekdayOptions: readonly {
  value: CompanyWeekday
  title: string
  shortTitle: string
}[] = [
  { value: "monday", title: "Segunda-feira", shortTitle: "Seg" },
  { value: "tuesday", title: "Terça-feira", shortTitle: "Ter" },
  { value: "wednesday", title: "Quarta-feira", shortTitle: "Qua" },
  { value: "thursday", title: "Quinta-feira", shortTitle: "Qui" },
  { value: "friday", title: "Sexta-feira", shortTitle: "Sex" },
  { value: "saturday", title: "Sábado", shortTitle: "Sáb" },
  { value: "sunday", title: "Domingo", shortTitle: "Dom" },
]

export const companyServiceModeOptions: readonly {
  value: CompanyServiceMode
  title: string
  description: string
}[] = [
  {
    value: "collective",
    title: "Sessão coletiva",
    description: "Todos participam juntos, no mesmo horário.",
  },
  {
    value: "sector",
    title: "Por setor",
    description: "Cada equipe participa em seu próprio horário.",
  },
  {
    value: "shift",
    title: "Por turno",
    description: "Sessões organizadas conforme os turnos de trabalho.",
  },
  {
    value: "guidance",
    title: "Quero orientação",
    description: "Ainda não sei qual formato atende melhor à empresa.",
  },
]

export const companyFrequencyOptions: readonly {
  value: CompanyFrequency
  title: string
}[] = [
  { value: "weekly_1", title: "Uma vez por semana" },
  { value: "weekly_2", title: "Duas vezes por semana" },
  { value: "weekly_3", title: "Três vezes por semana" },
  { value: "weekdays", title: "Todos os dias úteis" },
  { value: "one_off", title: "Ações pontuais" },
  { value: "undecided", title: "Ainda não definido" },
]

export const companyDurationOptions: readonly {
  value: CompanyDuration
  title: string
}[] = [
  { value: "5_10", title: "5 a 10 minutos" },
  { value: "10_15", title: "10 a 15 minutos" },
  { value: "15_20", title: "15 a 20 minutos" },
  { value: "20_30", title: "20 a 30 minutos" },
  { value: "guidance", title: "Quero orientação profissional" },
]

export const companyGoalOptions: readonly {
  value: CompanyGoal
  title: string
}[] = [
  { value: "quality_of_life", title: "Melhorar a qualidade de vida" },
  { value: "health_wellbeing", title: "Promover saúde e bem-estar" },
  {
    value: "prevent_discomfort",
    title: "Prevenir desconfortos musculares do trabalho",
  },
  { value: "healthy_habits", title: "Incentivar hábitos saudáveis" },
  { value: "reduce_inactivity", title: "Reduzir o sedentarismo" },
  { value: "team_integration", title: "Melhorar a integração da equipe" },
  { value: "occupational_health", title: "Investir em saúde ocupacional" },
  { value: "other", title: "Outro objetivo" },
]

export const companyContractInterestOptions = [
  { value: "trial", title: "Sessão experimental" },
  { value: "monthly", title: "Pacote mensal" },
  { value: "ongoing", title: "Serviço contínuo" },
  { value: "special_action", title: "Ação especial" },
  { value: "plans_first", title: "Conhecer planos e valores" },
] as const

export const companyStartWindowOptions = [
  { value: "immediate", title: "Imediatamente" },
  { value: "15_days", title: "Dentro de 15 dias" },
  { value: "30_days", title: "Dentro de 30 dias" },
  { value: "3_months", title: "Nos próximos 3 meses" },
  { value: "undecided", title: "Ainda sem previsão" },
] as const

export const companyPriorExperienceOptions: readonly {
  value: CompanyPriorExperience
  title: string
}[] = [
  { value: "currently", title: "Sim, oferece atualmente" },
  { value: "interrupted", title: "Sim, mas interrompeu" },
  { value: "first_time", title: "Não, será a primeira experiência" },
]

export const companyUfs = [
  "AC",
  "AL",
  "AP",
  "AM",
  "BA",
  "CE",
  "DF",
  "ES",
  "GO",
  "MA",
  "MT",
  "MS",
  "MG",
  "PA",
  "PB",
  "PR",
  "PE",
  "PI",
  "RJ",
  "RN",
  "RS",
  "RO",
  "RR",
  "SC",
  "SP",
  "SE",
  "TO",
] as const

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const timePattern = /^(?:[01]\d|2[0-3]):[0-5]\d$/
const validBrazilianAreaCodes = new Set([
  "11", "12", "13", "14", "15", "16", "17", "18", "19",
  "21", "22", "24", "27", "28",
  "31", "32", "33", "34", "35", "37", "38",
  "41", "42", "43", "44", "45", "46", "47", "48", "49",
  "51", "53", "54", "55",
  "61", "62", "63", "64", "65", "66", "67", "68", "69",
  "71", "73", "74", "75", "77", "79",
  "81", "82", "83", "84", "85", "86", "87", "88", "89",
  "91", "92", "93", "94", "95", "96", "97", "98", "99",
])

function addError(
  errors: CompanyRegistrationErrors,
  field: CompanyRegistrationField,
  message: string
) {
  errors[field] = message
}

function validateRequiredTimePair(
  errors: CompanyRegistrationErrors,
  start: string,
  end: string,
  startField: CompanyRegistrationField,
  endField: CompanyRegistrationField,
  required: boolean
) {
  if (!start && !end && !required) return
  if (!timePattern.test(start)) {
    addError(errors, startField, "Informe um horário de início válido.")
  }
  if (!timePattern.test(end)) {
    addError(errors, endField, "Informe um horário de término válido.")
  }
  if (timePattern.test(start) && timePattern.test(end) && start === end) {
    addError(errors, endField, "O início e o término devem ser diferentes.")
  }
}

export function formatCnpj(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 14)
  return digits
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/^(\d{2})\.(\d{3})\.(\d{3})(\d)/, "$1.$2.$3/$4")
    .replace(/(\d{4})(\d{1,2})$/, "$1-$2")
}

export function getEmployeeBand(exact: string): EmployeeBand | "" {
  const count = Number(exact)
  if (!Number.isInteger(count) || count < 1) return ""
  return employeeBandOptions.find(
    ({ minimum, maximum }) => count >= minimum && (maximum === null || count <= maximum)
  )?.value ?? ""
}

function validateCompanyDetails(form: CompanyRegistrationForm) {
  const errors: CompanyRegistrationErrors = {}
  if (!form.legalName.trim()) addError(errors, "legalName", "Informe a razão social.")
  if (!form.tradeName.trim()) addError(errors, "tradeName", "Informe o nome fantasia.")
  if (form.cnpj.replace(/\D/g, "").length !== 14) {
    addError(errors, "cnpj", "Informe um CNPJ com 14 dígitos.")
  }
  if (!form.activity) addError(errors, "activity", "Selecione o ramo de atividade.")
  if (form.activity === "other" && !form.otherActivity.trim()) {
    addError(errors, "otherActivity", "Descreva o ramo de atividade.")
  }
  if (!form.street.trim()) addError(errors, "street", "Informe o logradouro.")
  if (!form.number.trim()) addError(errors, "number", "Informe o número.")
  if (!form.district.trim()) addError(errors, "district", "Informe o bairro.")
  if (!form.city.trim()) addError(errors, "city", "Informe a cidade.")
  if (!companyUfs.includes(form.state as (typeof companyUfs)[number])) {
    addError(errors, "state", "Selecione a UF.")
  }
  if (form.postalCode.replace(/\D/g, "").length !== 8) {
    addError(errors, "postalCode", "Informe um CEP com 8 dígitos.")
  }
  if (
    form.websiteOrSocial.trim() &&
    !/^(https?:\/\/)?[\w.-]+\.[a-z]{2,}(?:[/?#][^\s]*)?$/i.test(form.websiteOrSocial.trim())
  ) {
    addError(errors, "websiteOrSocial", "Informe um site ou perfil válido.")
  }
  return errors
}

function validateContact(form: CompanyRegistrationForm) {
  const errors: CompanyRegistrationErrors = {}
  if (form.contactName.trim().split(/\s+/).filter(Boolean).length < 2) {
    addError(errors, "contactName", "Informe o nome e sobrenome do responsável.")
  }
  if (!form.contactRole.trim()) addError(errors, "contactRole", "Informe o cargo ou função.")
  if (!form.contactDepartment.trim()) addError(errors, "contactDepartment", "Informe o setor do responsável.")
  if (!emailPattern.test(form.contactEmail.trim())) {
    addError(errors, "contactEmail", "Confira o formato do e-mail.")
  }
  const phoneDigits = form.contactPhone.replace(/\D/g, "")
  if (
    ![10, 11].includes(phoneDigits.length) ||
    !validBrazilianAreaCodes.has(phoneDigits.slice(0, 2))
  ) {
    addError(errors, "contactPhone", "Informe um telefone com DDD válido.")
  }
  if (!form.contactTime) addError(errors, "contactTime", "Selecione o melhor horário para contato.")
  return errors
}

function validateStructure(form: CompanyRegistrationForm) {
  const errors: CompanyRegistrationErrors = {}
  const exactCount = form.employeeExact.trim()
  if (exactCount) {
    if (!getEmployeeBand(exactCount)) {
      addError(errors, "employeeExact", "Informe uma quantidade inteira maior que zero.")
    }
  } else if (!form.employeeBand) {
    addError(errors, "employeeBand", "Selecione uma faixa de colaboradores.")
  }
  if (form.sectors.length === 0) addError(errors, "sectors", "Adicione ao menos um setor.")
  if (
    form.sectors.some(
      (sector) => sector.category === "other" && !sector.customName.trim()
    )
  ) {
    addError(errors, "sectors", "Informe o nome de cada outro setor.")
  }
  if (!form.workArrangement) addError(errors, "workArrangement", "Selecione o formato de trabalho.")
  if (!form.spaceAvailability) addError(errors, "spaceAvailability", "Informe se há espaço para as sessões.")
  validateRequiredTimePair(
    errors,
    form.openingTime,
    form.closingTime,
    "openingTime",
    "closingTime",
    true
  )
  if (form.operatingDays.length === 0) {
    addError(errors, "operatingDays", "Selecione ao menos um dia de funcionamento.")
  }
  if (!form.hasShifts) addError(errors, "hasShifts", "Informe se a empresa trabalha com turnos.")

  if (form.hasShifts === "yes") {
    if (!form.hasNightShift) addError(errors, "hasNightShift", "Informe se há turno noturno.")
    if (form.shifts.length === 0) addError(errors, "shifts", "Adicione os horários dos turnos.")
    if (form.shifts.some((shift) => shift.kind === "other" && !shift.customName.trim())) {
      addError(errors, "shifts", "Informe o nome de cada outro turno.")
    }
    form.shifts.forEach((shift) => {
      validateRequiredTimePair(
        errors,
        shift.startTime,
        shift.endTime,
        "shifts",
        "shifts",
        true
      )
    })
  }

  form.sectors.forEach((sector) => {
    if (sector.sameAsCompanyHours) return
    if (sector.days.length === 0) addError(errors, "sectors", "Selecione os dias de cada setor com horário próprio.")
    if (sector.schedules.length === 0) addError(errors, "sectors", "Adicione ao menos um horário para cada setor com programação própria.")
    sector.schedules.forEach((schedule) => {
      validateRequiredTimePair(
        errors,
        schedule.startTime,
        schedule.endTime,
        "sectors",
        "sectors",
        true
      )
    })
  })
  return errors
}

function validateServiceModel(form: CompanyRegistrationForm) {
  const errors: CompanyRegistrationErrors = {}
  if (form.serviceModes.length === 0) {
    addError(errors, "serviceModes", "Selecione um modelo de atendimento.")
  }
  if (form.serviceModes.includes("guidance") && form.serviceModes.length > 1) {
    addError(errors, "serviceModes", "A opção de orientação deve ser selecionada sozinha.")
  }
  if (form.serviceModes.includes("collective") && !form.collectiveSpace) {
    addError(errors, "collectiveSpace", "Informe se há espaço para reunir todos os colaboradores.")
  }
  if (!form.frequency) addError(errors, "frequency", "Selecione a frequência desejada.")
  if (!form.duration) addError(errors, "duration", "Selecione a duração desejada.")
  return errors
}

function validateContractAndGoals(form: CompanyRegistrationForm) {
  const errors: CompanyRegistrationErrors = {}
  if (!form.contractInterest) addError(errors, "contractInterest", "Selecione o interesse inicial.")
  if (!form.startWindow) addError(errors, "startWindow", "Informe quando gostaria de iniciar.")
  if (!form.budgetStatus) addError(errors, "budgetStatus", "Informe se há orçamento definido.")
  if (form.budgetAmount.trim()) {
    const amount = Number(form.budgetAmount.replace(/,/g, "."))
    if (!Number.isFinite(amount) || amount <= 0) {
      addError(errors, "budgetAmount", "Informe um valor mensal maior que zero.")
    }
  }
  if (form.goals.length === 0) addError(errors, "goals", "Selecione ao menos um objetivo.")
  if (form.goals.includes("other") && !form.otherGoal.trim()) {
    addError(errors, "otherGoal", "Descreva o outro objetivo.")
  }
  if (!form.priorExperience) {
    addError(errors, "priorExperience", "Informe se a empresa já ofereceu ginástica laboral.")
  }
  return errors
}

function validateConfirmations(form: CompanyRegistrationForm) {
  const errors: CompanyRegistrationErrors = {}
  if (!form.termsAccepted) addError(errors, "termsAccepted", "Aceite os Termos de Uso da demonstração.")
  if (!form.privacyAcknowledged) addError(errors, "privacyAcknowledged", "Confirme a ciência da Política de Privacidade.")
  if (!form.contactAuthorized) addError(errors, "contactAuthorized", "Autorize o contato do EHFI sobre esta solicitação.")
  if (!form.accuracyConfirmed) addError(errors, "accuracyConfirmed", "Confirme as informações fornecidas.")
  return errors
}

export function validateCompanyStep(
  form: CompanyRegistrationForm,
  step: CompanySignupStep
): CompanyRegistrationErrors {
  switch (step) {
    case 1:
      return validateCompanyDetails(form)
    case 2:
      return validateContact(form)
    case 3:
      return validateStructure(form)
    case 4:
      return validateServiceModel(form)
    case 5:
      return validateContractAndGoals(form)
    case 6:
      return validateConfirmations(form)
  }
}
