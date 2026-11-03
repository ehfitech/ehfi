"use client"

import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useState, type FormEvent } from "react"

import {
  requestPasswordReset,
  updatePassword,
} from "@/app/actions/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

export function PasswordResetRequestForm() {
  const searchParams = useSearchParams()
  const role = searchParams.get("role")
  const loginPath =
    role === "professional"
      ? "/profissional/entrar"
      : role === "company"
        ? "/empresa/entrar"
        : "/aluno/entrar"
  const [email, setEmail] = useState("")
  const [sent, setSent] = useState(searchParams.get("enviado") === "1")
  const [pending, setPending] = useState(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPending(true)
    try {
      await requestPasswordReset(email)
      setSent(true)
    } finally {
      setPending(false)
    }
  }

  return (
    <Card className="w-full gap-0 rounded-[1.75rem] border-border/60 bg-card/80 p-5 shadow-[0_24px_70px_-38px_rgba(31,22,50,0.35)] backdrop-blur-xl sm:p-8">
      <CardHeader className="px-0 pt-0">
        <p className="text-xs font-semibold tracking-[0.14em] text-primary uppercase">Recuperação de acesso</p>
        <CardTitle className="mt-1 font-heading text-2xl">Redefinir senha</CardTitle>
      </CardHeader>
      <CardContent className="px-0 pb-0">
        {sent ? (
          <p role="status" className="text-sm leading-6 text-muted-foreground">
            Se houver uma conta para este e-mail, enviaremos um link de recuperação.
            Confira também a pasta de spam.
          </p>
        ) : (
          <form className="space-y-4" onSubmit={submit}>
            <label className="block space-y-2 text-sm font-medium" htmlFor="reset-email">
              E-mail da conta
              <Input
                id="reset-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="h-11 rounded-xl font-normal"
              />
            </label>
            <Button type="submit" disabled={pending} className="h-11 w-full rounded-xl">
              {pending ? "Enviando…" : "Enviar link"}
            </Button>
          </form>
        )}
        <Link href={loginPath} className="mt-5 inline-block text-sm font-medium text-primary underline-offset-4 hover:underline">
          Voltar para entrar
        </Link>
      </CardContent>
    </Card>
  )
}

export function PasswordUpdateForm() {
  const router = useRouter()
  const [password, setPassword] = useState("")
  const [confirmation, setConfirmation] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPending(true)
    setError(null)
    try {
      const result = await updatePassword(password, confirmation)
      if (!result.ok) {
        setError(result.message)
        setPending(false)
        return
      }
      router.replace("/")
      router.refresh()
    } catch {
      setError("Não foi possível atualizar a senha agora.")
      setPending(false)
    }
  }

  return (
    <Card className="w-full gap-0 rounded-[1.75rem] border-border/60 bg-card/80 p-5 shadow-[0_24px_70px_-38px_rgba(31,22,50,0.35)] backdrop-blur-xl sm:p-8">
      <CardHeader className="px-0 pt-0">
        <p className="text-xs font-semibold tracking-[0.14em] text-primary uppercase">Nova senha</p>
        <CardTitle className="mt-1 font-heading text-2xl">Atualizar senha</CardTitle>
      </CardHeader>
      <CardContent className="px-0 pb-0">
        <form className="space-y-4" onSubmit={submit}>
          <label className="block space-y-2 text-sm font-medium" htmlFor="new-password">
            Nova senha
            <Input
              id="new-password"
              type="password"
              autoComplete="new-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="h-11 rounded-xl font-normal"
            />
          </label>
          <label className="block space-y-2 text-sm font-medium" htmlFor="confirm-password">
            Confirmar senha
            <Input
              id="confirm-password"
              type="password"
              autoComplete="new-password"
              required
              value={confirmation}
              onChange={(event) => setConfirmation(event.target.value)}
              className="h-11 rounded-xl font-normal"
            />
          </label>
          <p className="text-xs leading-5 text-muted-foreground">
            Use ao menos 8 caracteres, incluindo letras maiúsculas e minúsculas, número e símbolo.
          </p>
          {error ? <p role="alert" className="text-sm text-destructive">{error}</p> : null}
          <Button type="submit" disabled={pending} className="h-11 w-full rounded-xl">
            {pending ? "Salvando…" : "Salvar nova senha"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
