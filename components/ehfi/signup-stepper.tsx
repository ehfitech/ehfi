"use client"

import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { IoCheckmarkOutline } from "react-icons/io5"

import { ehfiEase, ehfiMotion } from "@/lib/ehfi-motion"

export type SignupStepDefinition<Step extends number> = {
  id: Step
  label: string
  compactLabel: string
}

type SignupStepperProps<Step extends number> = {
  ariaLabel: string
  steps: readonly SignupStepDefinition<Step>[]
  currentStep: Step
  completedSteps: ReadonlySet<Step>
  continuedSteps: ReadonlySet<Step>
  onStepSelect: (step: Step) => void
}

export function SignupStepper<Step extends number>({
  ariaLabel,
  steps,
  currentStep,
  completedSteps,
  continuedSteps,
  onStepSelect,
}: SignupStepperProps<Step>) {
  const prefersReducedMotion = Boolean(useReducedMotion())
  const transition = {
    duration: prefersReducedMotion ? 0 : ehfiMotion.duration.step,
    ease: ehfiEase,
  }

  return (
    <nav aria-label={ariaLabel} className="w-full">
      <ol
        className="grid"
        style={{
          gridTemplateColumns: "repeat(" + steps.length + ", minmax(0, 1fr))",
        }}
      >
        {steps.map((item, index) => {
          const isCurrent = item.id === currentStep
          const isCompleted = completedSteps.has(item.id)
          const showAsComplete = isCompleted && !isCurrent
          const stateLabel = isCurrent
            ? "etapa atual"
            : isCompleted
              ? "concluída"
              : "incompleta"

          return (
            <li
              key={item.id}
              className="relative flex min-w-0 flex-col items-center"
            >
              {index < steps.length - 1 ? (
                <span
                  aria-hidden="true"
                  className="absolute top-4 right-[calc(-50%+1rem)] left-[calc(50%+1rem)] z-0 h-0.5 overflow-hidden rounded-full bg-border/80"
                >
                  <motion.span
                    initial={false}
                    animate={{ scaleX: continuedSteps.has(item.id) ? 1 : 0 }}
                    transition={transition}
                    style={{ transformOrigin: "left center" }}
                    className="absolute inset-0 rounded-full bg-gradient-to-r from-primary to-ehfi-secondary"
                  />
                </span>
              ) : null}

              <button
                type="button"
                aria-current={isCurrent ? "step" : undefined}
                aria-label={
                  "Etapa " + item.id + ": " + item.label + ", " + stateLabel
                }
                onClick={() => onStepSelect(item.id)}
                className="relative z-10 flex min-h-11 w-full min-w-0 flex-col items-center justify-start rounded-lg px-0.5 py-0.5 text-center outline-none focus-visible:ring-3 focus-visible:ring-ring/40"
              >
                <motion.span
                  aria-hidden="true"
                  animate={{
                    backgroundColor: showAsComplete
                      ? "var(--primary)"
                      : "var(--background)",
                    borderColor: showAsComplete
                      ? "var(--primary)"
                      : isCurrent
                        ? "var(--ehfi-secondary)"
                        : "var(--border)",
                    boxShadow: isCurrent
                      ? "0 0 0 4px color-mix(in oklch, var(--primary) 12%, transparent)"
                      : "0 0 0 0px transparent",
                    scale: isCurrent ? 1.04 : 1,
                  }}
                  transition={transition}
                  className={
                    "relative flex size-8 shrink-0 items-center justify-center rounded-full border-2 " +
                    (showAsComplete
                      ? "text-primary-foreground"
                      : isCurrent
                        ? "text-ehfi-secondary"
                        : "text-muted-foreground")
                  }
                >
                  <AnimatePresence initial={false} mode="wait">
                    <motion.span
                      key={
                        showAsComplete
                          ? "complete"
                          : isCurrent
                            ? "current"
                            : "upcoming"
                      }
                      initial={
                        prefersReducedMotion
                          ? false
                          : { opacity: 0, scale: 0.72, y: 2 }
                      }
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={
                        prefersReducedMotion
                          ? undefined
                          : { opacity: 0, scale: 0.72, y: -2 }
                      }
                      transition={transition}
                      className="flex items-center justify-center"
                    >
                      {showAsComplete ? (
                        <IoCheckmarkOutline className="size-4" />
                      ) : (
                        item.id
                      )}
                    </motion.span>
                  </AnimatePresence>
                </motion.span>

                <span
                  aria-hidden="true"
                  className={
                    "mt-2 block w-full truncate text-[0.625rem] leading-4 sm:hidden " +
                    (isCurrent
                      ? "font-semibold text-foreground"
                      : "font-medium text-muted-foreground")
                  }
                >
                  {item.compactLabel}
                </span>
                <span
                  aria-hidden="true"
                  className={
                    "mt-2 hidden max-w-full truncate text-xs leading-4 sm:block " +
                    (isCurrent
                      ? "font-semibold text-foreground"
                      : "font-medium text-muted-foreground")
                  }
                >
                  {item.label}
                </span>
                <span className="sr-only">{stateLabel}</span>
              </button>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
