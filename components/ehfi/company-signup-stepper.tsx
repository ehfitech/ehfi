"use client"

import {
  SignupStepper,
  type SignupStepDefinition,
} from "@/components/ehfi/signup-stepper"
import {
  companySignupSteps,
  type CompanySignupStep,
} from "@/lib/company-registration"

const steps: readonly SignupStepDefinition<CompanySignupStep>[] =
  companySignupSteps

type CompanySignupStepperProps = {
  currentStep: CompanySignupStep
  completedSteps: ReadonlySet<CompanySignupStep>
  continuedSteps: ReadonlySet<CompanySignupStep>
  onStepSelect: (step: CompanySignupStep) => void
}

export function CompanySignupStepper(props: CompanySignupStepperProps) {
  return (
    <SignupStepper
      ariaLabel="Etapas do cadastro de empresa"
      steps={steps}
      currentStep={props.currentStep}
      completedSteps={props.completedSteps}
      continuedSteps={props.continuedSteps}
      onStepSelect={props.onStepSelect}
    />
  )
}
