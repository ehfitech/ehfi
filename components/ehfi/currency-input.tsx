"use client"

import { useLayoutEffect, useRef, useState } from "react"
import type { ChangeEvent, ComponentProps, FocusEvent } from "react"

import { Input } from "@/components/ui/input"

const brlNumber = new Intl.NumberFormat("pt-BR", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

function formatCents(cents: number) {
  return brlNumber.format(cents / 100)
}

function caretAfterDigits(value: string, digitCount: number) {
  if (digitCount <= 0) return 0

  let seen = 0
  for (let index = 0; index < value.length; index += 1) {
    if (/\d/.test(value[index] ?? "")) {
      seen += 1
      if (seen === digitCount) return index + 1
    }
  }

  return value.length
}

export function CurrencyInput({
  initialCents,
  name = "price",
  ...inputProps
}: Omit<ComponentProps<"input">, "defaultValue" | "name" | "onChange" | "type" | "value"> & {
  initialCents: number
  name?: string
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const pendingCaret = useRef<{ digitCount: number; atEnd: boolean } | null>(null)
  const focusedRef = useRef(false)
  const [cents, setCents] = useState(() => Math.max(0, Math.round(initialCents)))
  const value = formatCents(cents)

  useLayoutEffect(() => {
    const caret = pendingCaret.current
    const input = inputRef.current
    if (!caret || !input) return

    const position = caret.atEnd ? input.value.length : caretAfterDigits(input.value, caret.digitCount)
    input.setSelectionRange(position, position)
    pendingCaret.current = null
  }, [value])

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const inputValue = event.currentTarget.value
    const caret = event.currentTarget.selectionStart ?? inputValue.length
    pendingCaret.current = {
      digitCount: inputValue.slice(0, caret).replace(/\D/g, "").length,
      atEnd: caret === inputValue.length,
    }

    const digits = inputValue.replace(/\D/g, "")
    setCents(digits ? Number(digits) : 0)
  }

  function handleFocus(event: FocusEvent<HTMLInputElement>) {
    if (focusedRef.current) return
    focusedRef.current = true
    const position = event.currentTarget.value.length
    event.currentTarget.setSelectionRange(position, position)
  }

  return (
    <Input
      {...inputProps}
      ref={inputRef}
      name={name}
      type="text"
      inputMode="decimal"
      autoComplete="off"
      maxLength={14}
      value={value}
      onChange={handleChange}
      onFocus={handleFocus}
    />
  )
}
