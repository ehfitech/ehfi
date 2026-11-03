"use client"

import { motion, useReducedMotion } from "motion/react"
import { IoCheckmarkOutline, IoCloseOutline } from "react-icons/io5"

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  getStudentPasswordRequirements,
  type StudentPasswordRequirement,
} from "@/lib/student-registration"
import {
  fieldRevealVariants,
  panelRevealVariants,
  stillFieldVariants,
  stillPanelVariants,
} from "@/lib/ehfi-motion"

export function StudentPanel({ children }: { children: React.ReactNode }) {
  const reducedMotion = Boolean(useReducedMotion())

  return (
    <motion.div
      data-ehfi-reveal
      variants={reducedMotion ? stillPanelVariants : panelRevealVariants}
      initial={reducedMotion ? false : "hidden"}
      whileInView="visible"
      viewport={{ once: true, amount: 0.12, margin: "0px 0px -40px 0px" }}
      className="min-w-0"
    >
      <div className="rounded-3xl border border-border/70 bg-card/75 py-5 shadow-[0_16px_44px_-32px_rgba(25,16,40,0.28)] backdrop-blur-xl sm:py-6">
        <div className="space-y-5 px-4 sm:px-6">{children}</div>
      </div>
    </motion.div>
  )
}

export function StudentSectionTitle({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode
  title: string
  subtitle: string
}) {
  const reducedMotion = Boolean(useReducedMotion())

  return (
    <motion.div
      data-ehfi-reveal
      variants={reducedMotion ? stillFieldVariants : fieldRevealVariants}
      initial={reducedMotion ? false : "hidden"}
      whileInView="visible"
      viewport={{ once: true, amount: 0.18 }}
      className="flex items-start gap-3"
    >
      <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-secondary text-ehfi-secondary">
        {icon}
      </span>
      <div className="min-w-0">
        <h3 className="font-heading text-base font-semibold tracking-tight text-foreground sm:text-lg">
          {title}
        </h3>
        <p className="mt-1 text-sm leading-5 text-muted-foreground">
          {subtitle}
        </p>
      </div>
    </motion.div>
  )
}

export function StudentField({
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
  children: React.ReactNode
}) {
  const reducedMotion = Boolean(useReducedMotion())

  return (
    <motion.div
      data-ehfi-reveal
      variants={reducedMotion ? stillFieldVariants : fieldRevealVariants}
      initial={reducedMotion ? false : "hidden"}
      whileInView="visible"
      viewport={{ once: true, amount: 0.18 }}
      className="min-w-0 space-y-2"
    >
      <Label htmlFor={id} className="text-sm font-medium text-foreground/90">
        {label}
      </Label>
      {children}
      {error ? (
        <p
          id={id + "-error"}
          role="alert"
          className="text-xs leading-5 text-destructive"
        >
          {error}
        </p>
      ) : hint ? (
        <p
          id={id + "-hint"}
          className="text-xs leading-5 text-muted-foreground"
        >
          {hint}
        </p>
      ) : null}
    </motion.div>
  )
}

export type StudentInputProps = React.ComponentProps<typeof InputGroupInput> & {
  icon: React.ReactNode
  trailing?: React.ReactNode
}

export function StudentIconInput({
  icon,
  trailing,
  className,
  ...props
}: StudentInputProps) {
  return (
    <InputGroup className="h-11 rounded-xl bg-background/60 transition-colors focus-within:bg-background/80">
      <InputGroupInput
        {...props}
        className={"h-11 text-sm " + (className ?? "")}
      />
      <InputGroupAddon
        align="inline-start"
        className="pr-1 pl-3 text-ehfi-secondary/80 [&_svg]:size-[18px]"
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

const passwordRequirementLabels: readonly {
  id: StudentPasswordRequirement
  label: string
}[] = [
  { id: "minLength", label: "8 caracteres" },
  { id: "number", label: "1 número" },
  { id: "lowercase", label: "1 letra minúscula" },
  { id: "uppercase", label: "1 letra maiúscula" },
  { id: "special", label: "1 caractere especial" },
]

export function StudentPasswordStrength({ password }: { password: string }) {
  const requirements = getStudentPasswordRequirements(password)
  const completed = Object.values(requirements).filter(Boolean).length

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-medium text-foreground/85">
          Requisitos da senha
        </p>
        <p
          id="password-strength-status"
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className="shrink-0 text-xs text-muted-foreground"
        >
          {completed}/5 requisitos atendidos
        </p>
      </div>

      <div
        role="progressbar"
        aria-label="Requisitos de senha atendidos"
        aria-valuemin={0}
        aria-valuemax={5}
        aria-valuenow={completed}
        aria-valuetext={`${completed} de 5 requisitos atendidos`}
        className="flex gap-1.5"
      >
        {passwordRequirementLabels.map(({ id }, index) => (
          <span
            key={id}
            aria-hidden="true"
            className={
              "h-1.5 min-w-0 flex-1 rounded-full transition-colors duration-200 motion-reduce:transition-none " +
              (index < completed ? "bg-ehfi-secondary" : "bg-muted/80")
            }
          />
        ))}
      </div>

      <ul
        id="password-strength-checklist"
        className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs leading-4 text-muted-foreground"
      >
        {passwordRequirementLabels.map(({ id, label }) => {
          const isMet = requirements[id]

          return (
            <li key={id} className="flex min-w-0 items-center gap-1.5">
              {isMet ? (
                <IoCheckmarkOutline
                  aria-hidden="true"
                  className="size-3.5 shrink-0 text-ehfi-secondary"
                />
              ) : (
                <IoCloseOutline
                  aria-hidden="true"
                  className="size-3.5 shrink-0 text-muted-foreground/70"
                />
              )}
              <span className="min-w-0">
                {label}
                <span className="sr-only">
                  {isMet ? " — atendido" : " — pendente"}
                </span>
              </span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export type StudentChoiceOption<Value extends string> = {
  value: Value
  title: string
  description?: string
}

export function StudentChoiceGrid<Value extends string>({
  id,
  label,
  hint,
  error,
  options,
  selected,
  onSelect,
  columns = 2,
}: {
  id: string
  label: string
  hint?: string
  error?: string
  options: readonly StudentChoiceOption<Value>[]
  selected: Value | "" | readonly Value[]
  onSelect: (value: Value) => void
  columns?: 2 | 3
}) {
  const reducedMotion = Boolean(useReducedMotion())
  const selectedValues =
    typeof selected === "string" ? (selected ? [selected] : []) : [...selected]
  const selectionHint = hint ?? "Selecione uma opção."

  return (
    <fieldset
      id={id}
      aria-describedby={error ? id + "-error" : id + "-hint"}
      className="min-w-0 space-y-2"
    >
      <legend className="text-sm leading-5 font-medium text-foreground/90">
        {label}
      </legend>
      {hint ? (
        <p
          id={id + "-hint"}
          className="text-xs leading-5 text-muted-foreground"
        >
          {hint}
        </p>
      ) : (
        <span id={id + "-hint"} className="sr-only">
          {selectionHint}
        </span>
      )}
      <div
        className={
          "grid gap-2 " + (columns === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2")
        }
      >
        {options.map((option, index) => {
          const isSelected = selectedValues.includes(option.value)
          return (
            <motion.button
              key={option.value}
              type="button"
              aria-pressed={isSelected}
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? id + "-error" : id + "-hint"}
              variants={
                reducedMotion ? stillFieldVariants : fieldRevealVariants
              }
              custom={index * 0.025}
              initial={reducedMotion ? false : "hidden"}
              whileInView="visible"
              viewport={{ once: true, amount: 0.18 }}
              whileTap={reducedMotion ? undefined : { scale: 0.99 }}
              onClick={() => onSelect(option.value)}
              className={
                "group min-h-14 rounded-2xl border px-3 py-3 text-left transition-[border-color,background-color,box-shadow] duration-200 outline-none focus-visible:ring-3 focus-visible:ring-ring/40 " +
                (isSelected
                  ? "border-primary/60 bg-primary/[0.07] shadow-[0_0_0_3px_color-mix(in_oklch,var(--primary)_10%,transparent)]"
                  : "border-border/80 bg-background/45 hover:border-primary/30 hover:bg-background/75")
              }
            >
              <span className="flex items-start justify-between gap-3">
                <span className="min-w-0">
                  <span className="block text-sm leading-5 font-semibold text-foreground">
                    {option.title}
                  </span>
                  {option.description ? (
                    <span className="mt-1 block text-xs leading-5 text-muted-foreground">
                      {option.description}
                    </span>
                  ) : null}
                </span>
                <span
                  aria-hidden="true"
                  className={
                    "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border " +
                    (isSelected
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-input bg-background")
                  }
                >
                  {isSelected ? (
                    <IoCheckmarkOutline className="size-3.5" />
                  ) : null}
                </span>
              </span>
            </motion.button>
          )
        })}
      </div>
      {error ? (
        <p
          id={id + "-error"}
          role="alert"
          className="text-xs leading-5 text-destructive"
        >
          {error}
        </p>
      ) : null}
    </fieldset>
  )
}

export function StudentTextarea({
  id,
  value,
  onChange,
  placeholder,
  error,
  hasHint = false,
  rows = 3,
}: {
  id: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  error?: string
  hasHint?: boolean
  rows?: number
}) {
  return (
    <Textarea
      id={id}
      rows={rows}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      aria-invalid={error ? true : undefined}
      aria-describedby={
        error ? id + "-error" : hasHint ? id + "-hint" : undefined
      }
      className="min-h-24 w-full rounded-xl bg-background/60 px-3 py-2.5 text-sm leading-6"
    />
  )
}
