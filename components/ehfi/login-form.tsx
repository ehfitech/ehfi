"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, type FormEvent } from "react"

import { signInWithProfile } from "@/app/actions/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"
import type { RegistrationRole } from "@/lib/registration-drafts/types"
import {
  IoEyeOffOutline,
  IoEyeOutline,
  IoLockClosedOutline,
  IoMailOutline,
} from "react-icons/io5"

const roleNames: Record<RegistrationRole, string> = {
  student: "aluno",
  professional: "profissional",
  company: "empresa",
}

export function LoginForm({ role }: { role: RegistrationRole }) {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [passwordVisible, setPasswordVisible] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPending(true)
    setError(null)
    try {
      const result = await signInWithProfile({ role, email, password })
      if (!result.ok) {
        setError(result.message)
        return
      }
      router.replace(result.redirectTo)
      router.refresh()
    } catch {
      setError("Não foi possível entrar agora. Tente novamente.")
    } finally {
      setPending(false)
    }
  }

  return (
    <Card className="w-full gap-0 rounded-[1.75rem] border-border/60 bg-card/80 p-5 shadow-[0_24px_70px_-38px_rgba(31,22,50,0.35)] backdrop-blur-xl sm:p-8">
      <CardHeader className="px-0 pt-0">
        <p className="text-xs font-semibold tracking-[0.14em] text-primary uppercase">
          Acesso EHFI
        </p>
        <CardTitle className="mt-1 font-heading text-2xl">
          Entrar como {roleNames[role]}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-0 pb-0">
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="email">E-mail</label>
            <InputGroup className="h-11 rounded-xl bg-background/60 transition-colors focus-within:bg-background/80">
              <InputGroupInput
                id="email"
                type="email"
                autoComplete="username"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="h-11 text-sm"
              />
              <InputGroupAddon align="inline-start" className="pr-1 pl-3 text-ehfi-secondary/80 [&_svg]:size-[18px]">
                <IoMailOutline aria-hidden="true" />
              </InputGroupAddon>
            </InputGroup>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="password">Senha</label>
            <InputGroup className="h-11 rounded-xl bg-background/60 transition-colors focus-within:bg-background/80">
              <InputGroupInput
                id="password"
                type={passwordVisible ? "text" : "password"}
                autoComplete="current-password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="h-11 text-sm"
              />
              <InputGroupAddon align="inline-start" className="pr-1 pl-3 text-ehfi-secondary/80 [&_svg]:size-[18px]">
                <IoLockClosedOutline aria-hidden="true" />
              </InputGroupAddon>
              <InputGroupAddon align="inline-end" className="py-0 pr-0.5">
                <InputGroupButton
                  size="icon-sm"
                  className="size-11 rounded-xl p-0 text-muted-foreground hover:text-foreground"
                  aria-label={passwordVisible ? "Ocultar senha" : "Mostrar senha"}
                  aria-pressed={passwordVisible}
                  title={passwordVisible ? "Ocultar senha" : "Mostrar senha"}
                  onClick={() => setPasswordVisible((visible) => !visible)}
                >
                  {passwordVisible ? (
                    <IoEyeOffOutline aria-hidden="true" className="size-5" />
                  ) : (
                    <IoEyeOutline aria-hidden="true" className="size-5" />
                  )}
                </InputGroupButton>
              </InputGroupAddon>
            </InputGroup>
          </div>
          {error ? <p role="alert" className="text-sm text-destructive">{error}</p> : null}
          <Button type="submit" disabled={pending} className="h-11 w-full rounded-xl">
            {pending ? "Entrando…" : "Entrar"}
          </Button>
          <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
            <Link
              href={"/auth/recuperar?role=" + role}
              className="text-primary underline-offset-4 hover:underline"
            >
              Esqueci minha senha
            </Link>
            <Link
              href={"/" + (role === "student" ? "aluno" : role === "professional" ? "profissional" : "empresa") + "/cadastro"}
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              Criar conta
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
