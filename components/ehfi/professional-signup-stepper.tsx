"use client"

import {
  SignupStepper,
  type SignupStepDefinition,
} from "@/components/ehfi/signup-stepper"

export type ProfessionalSignupStep = 1 | 2 | 3 | 4 | 5

const steps: readonly SignupStepDefinition<ProfessionalSignupStep>[] = [
  { id: 1, label: "Seus dados", compactLabel: "Dados" },
  { id: 2, label: "Sua formação", compactLabel: "Formação" },
  { id: 3, label: "Registro CREF", compactLabel: "CREF" },
  { id: 4, label: "Ginástica Laboral", compactLabel: "Laboral" },
  { id: 5, label: "Termos e confirmações", compactLabel: "Termos" },
]

type ProfessionalSignupStepperProps = {
  currentStep: ProfessionalSignupStep
  completedSteps: ReadonlySet<ProfessionalSignupStep>
  continuedSteps: ReadonlySet<ProfessionalSignupStep>
  onStepSelect: (step: ProfessionalSignupStep) => void
}

export function ProfessionalSignupStepper(
  props: ProfessionalSignupStepperProps
) {
  return (
    <SignupStepper
      ariaLabel="Etapas do cadastro profissional"
      steps={steps}
      currentStep={props.currentStep}
      completedSteps={props.completedSteps}
      continuedSteps={props.continuedSteps}
      onStepSelect={props.onStepSelect}
    />
  )
}
