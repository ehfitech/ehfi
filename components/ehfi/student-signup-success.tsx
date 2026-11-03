"use client"

import Image from "next/image"
import Link from "next/link"
import { motion, useReducedMotion } from "motion/react"
import {
  IoCheckmarkOutline,
  IoHomeOutline,
  IoShieldCheckmarkOutline,
} from "react-icons/io5"

import { ThemeToggle } from "@/components/ehfi/theme-toggle"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { entranceProps } from "@/lib/ehfi-motion"

export function StudentSignupSuccess() {
  const reducedMotion = Boolean(useReducedMotion())

  return (
    <main className="relative isolate flex min-h-dvh flex-col overflow-hidden px-5 py-5 sm:px-8 sm:py-7">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-32 right-[-8rem] -z-10 size-[28rem] rounded-full bg-primary/10 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-[-14rem] left-[-10rem] -z-10 size-[30rem] rounded-full bg-ehfi-secondary/10 blur-3xl"
      />

      <header className="mx-auto flex w-full max-w-6xl items-center justify-between">
        <Link
          href="/"
          transitionTypes={["nav-back"]}
          aria-label="EHFI — início"
          className="inline-flex items-center gap-3 rounded-full outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <Image
            src="/pwa/icon-192.png"
            width={42}
            height={42}
            alt=""
            className="size-[2.625rem] rounded-xl border border-border/70 bg-card"
          />
          <span className="font-heading text-sm font-bold tracking-[0.16em] text-foreground">
            EHFI
          </span>
        </Link>
        <ThemeToggle />
      </header>

      <section className="mx-auto my-auto w-full max-w-2xl py-12">
        <Card className="items-center gap-0 rounded-[2rem] border-border/60 bg-card/70 px-6 py-8 text-center shadow-[0_30px_90px_-48px_rgba(31,22,50,0.38)] backdrop-blur-2xl sm:px-12 sm:py-12">
          <motion.div
            {...entranceProps(0, reducedMotion)}
            className="flex size-[5.25rem] items-center justify-center rounded-[1.8rem] bg-primary text-primary-foreground shadow-[0_16px_44px_-18px_color-mix(in_oklch,var(--primary)_70%,transparent)]"
          >
            <IoCheckmarkOutline aria-hidden="true" className="size-9" />
          </motion.div>
          <motion.p
            {...entranceProps(0.06, reducedMotion)}
            className="mt-6 text-xs font-semibold tracking-[0.16em] text-ehfi-secondary uppercase"
          >
            Jornada demonstrativa
          </motion.p>
          <motion.h1
            {...entranceProps(0.12, reducedMotion)}
            className="mt-2 font-heading text-3xl leading-tight font-semibold tracking-[-0.035em] text-foreground sm:text-4xl"
          >
            Etapas concluídas
          </motion.h1>
          <motion.p
            {...entranceProps(0.18, reducedMotion)}
            className="mt-4 max-w-lg text-sm leading-6 text-muted-foreground sm:text-base"
          >
            Você percorreu o cadastro demonstrativo de aluno e a anamnese
            inicial da EHFI.
          </motion.p>

          <motion.div
            {...entranceProps(0.24, reducedMotion)}
            className="w-full"
          >
            <Card className="mt-7 gap-0 rounded-2xl border-primary/15 bg-primary/[0.045] p-4 text-left shadow-none sm:p-5">
              <CardContent className="flex flex-col gap-3 px-0 sm:flex-row sm:items-center">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <IoShieldCheckmarkOutline
                    aria-hidden="true"
                    className="size-5"
                  />
                </span>
                <p className="text-sm leading-6 text-foreground/85">
                  Nenhuma conta foi criada e nenhuma senha ou resposta de saúde
                  foi enviada ou salva. A confirmação de responsável também não
                  foi verificada.
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            {...entranceProps(0.3, reducedMotion)}
            className="mt-7 w-full sm:w-auto"
          >
            <Link
              href="/"
              transitionTypes={["nav-back"]}
              className={buttonVariants({
                variant: "outline",
                className: "h-12 w-full rounded-xl px-5 sm:w-auto",
              })}
            >
              <IoHomeOutline aria-hidden="true" className="size-4" /> Voltar ao
              início
            </Link>
          </motion.div>
        </Card>
      </section>
      <p className="mx-auto w-full max-w-6xl border-t border-border/50 pt-4 text-center text-xs text-muted-foreground">
        EHFI · Saúde · esporte · educação física
      </p>
    </main>
  )
}
