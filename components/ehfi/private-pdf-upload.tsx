"use client"

import { useId, useRef, useState } from "react"
import { IoCloudUploadOutline, IoDocumentTextOutline, IoTrashOutline } from "react-icons/io5"

import { Button } from "@/components/ui/button"
import type { DraftFileReference } from "@/lib/registration-drafts/types"

type UploadKind = DraftFileReference["kind"]

export function PrivatePdfUpload({
  kind,
  label,
  hint,
  value,
  error,
  onChange,
}: {
  kind: UploadKind
  label: string
  hint?: string
  value: DraftFileReference | null
  error?: string
  onChange: (value: DraftFileReference | null) => void
}) {
  const id = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const [pending, setPending] = useState(false)
  const [requestError, setRequestError] = useState<string | null>(null)
  const visibleError = error ?? requestError

  async function upload(file: File) {
    setPending(true)
    setRequestError(null)
    try {
      if (file.size > 10 * 1024 * 1024) {
        throw new Error("O PDF precisa ter até 10 MB.")
      }
      const formData = new FormData()
      formData.set("file", file)
      formData.set("kind", kind)
      const response = await fetch("/api/registration-draft/files", {
        method: "POST",
        body: formData,
      })
      const result = (await response.json()) as {
        ok?: boolean
        file?: DraftFileReference
        error?: string
      }
      if (!response.ok || result.ok !== true || !result.file) {
        throw new Error(result.error ?? "Não foi possível enviar o PDF.")
      }
      onChange(result.file)
    } catch (error) {
      setRequestError(
        error instanceof Error ? error.message : "Não foi possível enviar o PDF."
      )
    } finally {
      setPending(false)
      if (inputRef.current) inputRef.current.value = ""
    }
  }

  async function remove() {
    if (!value) return
    setPending(true)
    setRequestError(null)
    try {
      const response = await fetch("/api/registration-draft/files", {
        method: "DELETE",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ path: value.path }),
      })
      const result = (await response.json()) as { ok?: boolean; error?: string }
      if (!response.ok || result.ok !== true) {
        throw new Error(result.error ?? "Não foi possível remover o PDF.")
      }
      onChange(null)
    } catch (error) {
      setRequestError(
        error instanceof Error ? error.message : "Não foi possível remover o PDF."
      )
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="rounded-2xl border border-border/70 bg-background/50 p-4">
      <div className="mb-3">
        <label htmlFor={id} className="text-sm font-medium text-foreground">
          {label}
        </label>
        {hint ? <p className="mt-1 text-xs leading-5 text-muted-foreground">{hint}</p> : null}
      </div>
      {value ? (
        <div className="flex flex-col gap-3 rounded-xl border border-primary/20 bg-primary/[0.045] p-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <IoDocumentTextOutline aria-hidden="true" className="size-5" />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-medium text-foreground">
                {value.originalName}
              </span>
              <span className="mt-0.5 block text-xs text-muted-foreground">
                PDF · {(value.size / (1024 * 1024)).toFixed(2)} MB · enviado ao rascunho privado
              </span>
            </span>
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={pending}
              className="min-h-11 rounded-xl"
              onClick={() => inputRef.current?.click()}
            >
              Substituir
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              disabled={pending}
              aria-label={"Remover " + label}
              onClick={() => void remove()}
            >
              <IoTrashOutline aria-hidden="true" className="size-4" />
            </Button>
          </div>
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          disabled={pending}
          aria-invalid={visibleError ? true : undefined}
          aria-describedby={visibleError ? id + "-error" : undefined}
          className="h-11 w-full justify-center rounded-xl border-dashed"
          onClick={() => inputRef.current?.click()}
        >
          <IoCloudUploadOutline aria-hidden="true" className="size-4" />
          {pending ? "Enviando PDF…" : "Selecionar PDF"}
        </Button>
      )}
      <input
        id={id}
        ref={inputRef}
        className="sr-only"
        type="file"
        accept="application/pdf,.pdf"
        disabled={pending}
        aria-invalid={visibleError ? true : undefined}
        aria-describedby={visibleError ? id + "-error" : undefined}
        onChange={(event) => {
          const file = event.currentTarget.files?.[0]
          if (file) void upload(file)
        }}
      />
      {visibleError ? (
        <p id={id + "-error"} role="alert" className="mt-2 text-xs text-destructive">
          {visibleError}
        </p>
      ) : null}
    </div>
  )
}
