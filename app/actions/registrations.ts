"use server"

import {
  HEALTH_DATA_CONSENT_VERSION,
  type DraftFileReference,
} from "@/lib/registration-drafts/types"
import {
  deleteRegistrationDraft,
  getRegistrationDraftFromCookie,
  stageDraftFilesForUser,
} from "@/lib/registration-drafts/repository"
import { validatePassword } from "@/lib/auth/password"
import { hashDraftToken } from "@/lib/registration-drafts/token"
import { getRequiredProof } from "@/lib/professional-registration"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import {
  dateToIso,
  jsonObject,
  RegistrationValidationError,
  validateCompanyRegistration,
  validateProfessionalRegistration,
  validateStudentRegistration,
  type ProfessionalRegistrationPayload,
} from "@/lib/registrations/validation"
import type { StudentRegistrationForm } from "@/lib/student-registration"
import type { CompanyRegistrationForm } from "@/lib/company-registration"

export type RegistrationActionResult =
  | { ok: true; redirectTo: string }
  | {
      ok: false
      code: string
      message: string
      fieldErrors?: Record<string, string>
    }

type AuthenticatedIdentity =
  | { ok: true; supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>; userId: string }
  | { ok: false; result: RegistrationActionResult }

function validEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

async function authenticateOrCreate(
  email: string,
  password: string
): Promise<AuthenticatedIdentity> {
  const normalizedEmail = email.trim().toLowerCase()
  if (!validEmail(normalizedEmail)) {
    return {
      ok: false,
      result: {
        ok: false,
        code: "invalid_email",
        message: "Confira o e-mail informado.",
        fieldErrors: { email: "Confira o formato do e-mail." },
      },
    }
  }
  const passwordValidation = validatePassword(password)
  if (!passwordValidation.valid) {
    return {
      ok: false,
      result: {
        ok: false,
        code: "weak_password",
        message: passwordValidation.message ?? "A senha não atende aos requisitos.",
      },
    }
  }

  const supabase = await createServerSupabaseClient()
  const { data: current } = await supabase.auth.getClaims()
  const currentUserId = current?.claims?.sub
  if (typeof currentUserId === "string") {
    const currentEmail = current.claims?.email
    if (
      typeof currentEmail !== "string" ||
      currentEmail.toLowerCase() !== normalizedEmail
    ) {
      return {
        ok: false,
        result: {
          ok: false,
          code: "signed_in_email_mismatch",
          message: "Entre com a mesma conta do e-mail informado no cadastro.",
        },
      }
    }
    return { ok: true, supabase, userId: currentUserId }
  }

  const { data, error } = await supabase.auth.signUp({
    email: normalizedEmail,
    password,
  })
  if (error || !data.user) {
    return {
      ok: false,
      result: {
        ok: false,
        code: "account_creation_failed",
        message:
          "Não foi possível criar a conta. Se este e-mail já tem acesso à EHFI, entre primeiro e retome o cadastro.",
      },
    }
  }

  if (!data.session) {
    return {
      ok: false,
      result: {
        ok: false,
        code: "email_confirmation_enabled",
        message:
          "A criação da conta está aguardando configuração do Supabase para permitir acesso imediato.",
      },
    }
  }
  const { data: claims, error: claimsError } = await supabase.auth.getClaims()
  const userId = claims?.claims?.sub
  if (claimsError || typeof userId !== "string") {
    return {
      ok: false,
      result: {
        ok: false,
        code: "session_unavailable",
        message: "A conta foi criada, mas não foi possível iniciar a sessão. Entre para retomar.",
      },
    }
  }
  return { ok: true, supabase, userId }
}

function referencesFromJson(value: unknown): DraftFileReference[] {
  if (!Array.isArray(value)) return []
  return value.filter(
    (item): item is DraftFileReference =>
      typeof item === "object" &&
      item !== null &&
      !Array.isArray(item) &&
      typeof item.path === "string" &&
      typeof item.originalName === "string" &&
      typeof item.size === "number" &&
      typeof item.kind === "string"
  )
}

function validationFailure(error: unknown): RegistrationActionResult | null {
  if (error instanceof RegistrationValidationError) {
    return {
      ok: false,
      code: "invalid_registration",
      message: error.message,
      fieldErrors: error.fieldErrors,
    }
  }
  return null
}

export async function finalizeStudentRegistration(
  rawInput: unknown
): Promise<RegistrationActionResult> {
  let form: StudentRegistrationForm
  try {
    form = validateStudentRegistration(rawInput)
  } catch (error) {
    return (
      validationFailure(error) ?? {
        ok: false,
        code: "invalid_registration",
        message: "Confira os campos do cadastro.",
      }
    )
  }

  const draftState = await getRegistrationDraftFromCookie("student")
  if (
    !draftState ||
    draftState.draft.health_data_consent_version !== HEALTH_DATA_CONSENT_VERSION ||
    !form.healthDataConsent
  ) {
    return {
      ok: false,
      code: "health_consent_required",
      message:
        "Registre a autorização de tratamento de dados de saúde antes de concluir o cadastro.",
      fieldErrors: { healthDataConsent: "A autorização é obrigatória." },
    }
  }

  const identity = await authenticateOrCreate(form.email, form.password)
  if (!identity.ok) return identity.result

  const profile = {
    fullName: form.fullName.trim(),
    email: form.email.trim().toLowerCase(),
    phone: form.phone.trim(),
    birthDate: dateToIso(form.birthDate),
    heightCm: Number(form.heightCm),
    weightKg: form.weightKg.trim() ? Number(form.weightKg) : null,
    fitnessLevel: form.fitnessLevel,
    currentExercise: form.currentExercise,
    practiceDuration: form.practiceDuration,
    modalities: form.modalities,
    otherModality: form.otherModality,
    sleepQuality: form.sleepQuality,
    dailyRoutine: form.dailyRoutine,
    nutritionRoutine: form.nutritionRoutine,
    goals: form.goals,
    otherGoal: form.otherGoal,
    experienceNotes: form.experienceNotes,
    accuracyConfirmed: form.accuracyConfirmed,
  }
  const health = {
    conditions: form.conditions,
    otherCondition: form.otherCondition,
    conditionControl: form.conditionControl,
    usesMedication: form.usesMedication,
    medicationName: form.medicationName,
    medicationPurpose: form.medicationPurpose,
    symptoms: form.symptoms,
    symptomDetails: form.symptomDetails,
    limitations: form.limitations,
    limitationDetails: form.limitationDetails,
    injuryHistory: form.injuryHistory,
    injuryDetails: form.injuryDetails,
    exerciseRestriction: form.exerciseRestriction,
    restrictionDetails: form.restrictionDetails,
    pregnancyStatus: form.pregnancyStatus,
    pregnancyDuration: form.pregnancyDuration,
    otherHealthInfo: form.otherHealthInfo,
  }
  const consents = [
    {
      type: "health_data",
      version: HEALTH_DATA_CONSENT_VERSION,
      accepted: true,
      representativeType: "account_holder",
    },
    {
      type: "information_accuracy",
      version: "student-accuracy-v1",
      accepted: true,
      representativeType: null,
    },
  ]
  const { error } = await identity.supabase.rpc("finalize_student_registration", {
    p_profile: jsonObject(profile),
    p_health: jsonObject(health),
    p_consents: jsonObject(consents),
    p_draft_token_hash: hashDraftToken(draftState.token),
  })
  if (error) {
    return {
      ok: false,
      code: "profile_persistence_failed",
      message:
        "A conta de acesso ficou ativa, mas o perfil não foi salvo. Seus dados continuam no rascunho; tente concluir novamente.",
    }
  }

  try {
    await deleteRegistrationDraft("student", draftState.token)
  } catch {
    // Expiration cleanup removes any leftover draft without blocking account access.
  }
  return { ok: true, redirectTo: "/aluno/plataforma" }
}

export async function finalizeProfessionalRegistration(
  rawInput: unknown
): Promise<RegistrationActionResult> {
  const draftState = await getRegistrationDraftFromCookie("professional")
  if (!draftState) {
    return {
      ok: false,
      code: "draft_required",
      message: "O rascunho do cadastro expirou. Recomece o envio dos documentos.",
    }
  }

  let payload: ProfessionalRegistrationPayload
  try {
    payload = validateProfessionalRegistration(
      rawInput,
      referencesFromJson(draftState.draft.files)
    )
  } catch (error) {
    return (
      validationFailure(error) ?? {
        ok: false,
        code: "invalid_registration",
        message: "Confira os campos do cadastro.",
      }
    )
  }

  const identity = await authenticateOrCreate(
    payload.personal.email,
    payload.personal.password
  )
  if (!identity.ok) return identity.result

  let documents: Awaited<ReturnType<typeof stageDraftFilesForUser>>
  try {
    const selectedKinds = new Set<DraftFileReference["kind"]>([
      ...(getRequiredProof(payload.academic)
        ? [getRequiredProof(payload.academic)!]
        : []),
      ...(payload.cref.answer === "registered" ? ["cref-card"] : []),
      ...(payload.cref.answer === "awaiting" ? ["cref-request"] : []),
    ])
    const allowedSourcePaths = referencesFromJson(draftState.draft.files)
      .filter((file) => selectedKinds.has(file.kind))
      .map((file) => file.path)
    documents = await stageDraftFilesForUser(
      draftState.token,
      identity.userId,
      allowedSourcePaths
    )
  } catch {
    return {
      ok: false,
      code: "document_staging_failed",
      message:
        "A conta ficou ativa, mas não foi possível preparar os documentos. O rascunho foi mantido para tentar novamente.",
    }
  }
  const documentFor = (kind: DraftFileReference["kind"]) =>
    documents.find((file) => file.kind === kind)?.path ?? null
  const {
    password: _password,
    passwordConfirmation: _passwordConfirmation,
    ...safePersonal
  } = payload.personal
  const profile = {
    personal: {
      ...safePersonal,
      email: payload.personal.email.trim().toLowerCase(),
      birthDate: dateToIso(payload.personal.birthDate),
    },
    academic: payload.academic,
    cref: {
      ...payload.cref,
      professionalCardFile: documentFor("cref-card"),
      requestProofFile: documentFor("cref-request"),
    },
    labor: payload.labor,
    terms: payload.terms,
  }
  const consents = [
    { type: "privacy_notice", version: "professional-privacy-v1", accepted: true },
    { type: "professional_accuracy", version: "professional-accuracy-v1", accepted: true },
    { type: "marketing_contact", version: "professional-marketing-v1", accepted: payload.terms.marketingOptIn },
  ]
  const { error } = await identity.supabase.rpc(
    "finalize_professional_registration",
    {
      p_profile: jsonObject(profile),
      p_documents: jsonObject(documents),
      p_consents: jsonObject(consents),
      p_draft_token_hash: hashDraftToken(draftState.token),
    }
  )
  if (error) {
    return {
      ok: false,
      code: "profile_persistence_failed",
      message:
        "A conta ficou ativa, mas o perfil não foi salvo. O rascunho e os documentos foram mantidos para tentar novamente.",
    }
  }

  try {
    await deleteRegistrationDraft("professional", draftState.token)
  } catch {
    // Keep finalized documents and let the scheduled cleanup remove only draft data.
  }
  return { ok: true, redirectTo: "/profissional/plataforma" }
}

export async function finalizeCompanyRegistration(
  rawInput: unknown
): Promise<RegistrationActionResult> {
  let form: CompanyRegistrationForm
  try {
    form = validateCompanyRegistration(rawInput)
  } catch (error) {
    return (
      validationFailure(error) ?? {
        ok: false,
        code: "invalid_registration",
        message: "Confira os campos do cadastro.",
      }
    )
  }

  const draftState = await getRegistrationDraftFromCookie("company")
  if (!draftState) {
    return {
      ok: false,
      code: "draft_unavailable",
      message: "Não foi possível recuperar seu rascunho. Recarregue a página e tente novamente.",
    }
  }

  const identity = await authenticateOrCreate(
    form.contactEmail,
    form.password
  )
  if (!identity.ok) return identity.result

  const company = {
    legalName: form.legalName.trim(),
    tradeName: form.tradeName.trim(),
    cnpj: form.cnpj.replace(/\D/g, ""),
    activity: form.activity,
    otherActivity: form.otherActivity,
    mainCnae: form.mainCnae,
    registrationStatus: form.registrationStatus,
    street: form.street,
    number: form.number,
    complement: form.complement,
    district: form.district,
    city: form.city,
    state: form.state,
    postalCode: form.postalCode.replace(/\D/g, ""),
    websiteOrSocial: form.websiteOrSocial,
    contactName: form.contactName,
    contactRole: form.contactRole,
    contactDepartment: form.contactDepartment,
    contactEmail: form.contactEmail.trim().toLowerCase(),
    contactPhone: form.contactPhone,
  }
  const intake = {
    employeeBand: form.employeeBand,
    employeeExact: form.employeeExact ? Number(form.employeeExact) : null,
    workArrangement: form.workArrangement,
    spaceAvailability: form.spaceAvailability,
    openingTime: form.openingTime,
    closingTime: form.closingTime,
    operatingDays: form.operatingDays,
    hasShifts: form.hasShifts,
    hasNightShift: form.hasNightShift,
    shifts: form.shifts,
    sectors: form.sectors,
    serviceModes: form.serviceModes,
    collectiveSpace: form.collectiveSpace,
    frequency: form.frequency,
    duration: form.duration,
    contractInterest: form.contractInterest,
    startWindow: form.startWindow,
    budgetStatus: form.budgetStatus,
    budgetAmount: form.budgetAmount
      ? Number(form.budgetAmount.replace(/,/g, "."))
      : null,
    goals: form.goals,
    otherGoal: form.otherGoal,
    priorExperience: form.priorExperience,
    specificNeeds: form.specificNeeds,
  }
  const consents = [
    { type: "terms_of_use", version: "company-terms-v1", accepted: form.termsAccepted },
    { type: "privacy_notice", version: "company-privacy-v1", accepted: form.privacyAcknowledged },
    { type: "contact_authorization", version: "company-contact-v1", accepted: form.contactAuthorized },
    { type: "information_accuracy", version: "company-accuracy-v1", accepted: form.accuracyConfirmed },
  ]
  const { error } = await identity.supabase.rpc(
    "finalize_company_registration",
    {
      p_company: jsonObject(company),
      p_intake: jsonObject(intake),
      p_consents: jsonObject(consents),
      p_draft_token_hash: hashDraftToken(draftState.token),
    }
  )
  if (error) {
    return {
      ok: false,
      code: "profile_persistence_failed",
      message:
        "A conta ficou ativa, mas a solicitação não foi salva. Tente concluir novamente.",
    }
  }

  try {
    await deleteRegistrationDraft("company", draftState.token)
  } catch {
    // Expiration cleanup removes the finished draft if immediate deletion fails.
  }
  return { ok: true, redirectTo: "/empresa/plataforma" }
}
