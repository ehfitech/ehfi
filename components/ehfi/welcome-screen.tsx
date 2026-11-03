"use client"

import Image from "next/image"
import Link from "next/link"
import { motion, useReducedMotion } from "motion/react"
import {
  IoFitnessOutline,
  IoHeartOutline,
  IoSchoolOutline,
} from "react-icons/io5"

import { RoleCard } from "@/components/ehfi/role-card"
import { ThemeToggle } from "@/components/ehfi/theme-toggle"
import { entranceProps } from "@/lib/ehfi-motion"

export function WelcomeScreen() {
  const reducedMotion = Boolean(useReducedMotion())

  return (
    <main className="relative isolate flex min-h-dvh flex-col overflow-hidden px-5 py-5 sm:px-8 sm:py-7">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 right-[-8rem] -z-10 size-[24rem] rounded-full bg-primary/10 blur-3xl sm:size-[32rem]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-[-10rem] left-[-10rem] -z-10 size-[28rem] rounded-full bg-ehfi-secondary/10 blur-3xl"
      />

      <header className="mx-auto flex w-full max-w-6xl items-center justify-between">
        <Link
          href="/"
          aria-label="EHFI — início"
          className="inline-flex items-center gap-3 rounded-full outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <Image
            src="/pwa/icon-192.png"
            width={48}
            height={48}
            alt=""
            priority
            className="size-12 rounded-2xl border border-border/60 bg-card shadow-sm"
          />
          <span className="font-heading text-base font-bold tracking-[0.18em] text-foreground">
            EHFI
          </span>
        </Link>
        <ThemeToggle />
      </header>

      <div className="mx-auto my-auto flex w-full max-w-6xl flex-col gap-10 py-12 lg:gap-12 lg:py-16">
        <section className="mx-auto w-full max-w-3xl text-center lg:mx-0 lg:text-left">
          <motion.h1
            data-ehfi-reveal
            {...entranceProps(0.06, reducedMotion)}
            className="mx-auto mt-5 max-w-[15ch] font-heading text-4xl leading-[1.04] font-semibold tracking-[-0.045em] text-foreground sm:text-5xl lg:mx-0 lg:text-[3.7rem]"
          >
            Conexões que movem sua jornada
          </motion.h1>

          <motion.p
            data-ehfi-reveal
            {...entranceProps(0.12, reducedMotion)}
            className="mx-auto mt-5 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg lg:mx-0"
          >
            Na EHFI, alunos, profissionais e empresas se encontram para cuidar,
            ensinar e evoluir.
          </motion.p>

          <motion.div
            data-ehfi-reveal
            {...entranceProps(0.18, reducedMotion)}
            className="mt-7 flex flex-wrap justify-center gap-x-5 gap-y-3 text-sm font-medium text-foreground/80 lg:justify-start"
            aria-label="Áreas de atuação"
          >
            <span className="inline-flex items-center gap-2">
              <IoHeartOutline
                aria-hidden="true"
                className="size-4 text-primary"
              />
              Saúde
            </span>
            <span className="inline-flex items-center gap-2">
              <IoFitnessOutline
                aria-hidden="true"
                className="size-4 text-primary"
              />
              Esporte
            </span>
            <span className="inline-flex items-center gap-2">
              <IoSchoolOutline
                aria-hidden="true"
                className="size-4 text-primary"
              />
              Educação física
            </span>
          </motion.div>
        </section>

        <motion.section
          data-ehfi-reveal
          {...entranceProps(0.24, reducedMotion)}
          className="w-full rounded-[1.75rem] border border-border/70 bg-card/65 p-5 shadow-[0_28px_80px_-38px_rgba(15,23,42,0.32)] backdrop-blur-2xl sm:p-7 lg:p-8"
        >
          <div className="mb-5">
            <p className="text-xs font-semibold tracking-[0.14em] text-ehfi-secondary uppercase">
              Bem-vindo à EHFI
            </p>
            <h2 className="mt-1 font-heading text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
              Como você quer participar?
            </h2>
          </div>

          <RoleCard />

          <p className="mt-5 text-center text-xs leading-5 text-muted-foreground">
            Demonstração: as respostas não são salvas; o CNPJ é consultado no
            Open CNPJ.
          </p>
        </motion.section>
      </div>

      <motion.footer
        data-ehfi-reveal
        {...entranceProps(0.42, reducedMotion)}
        className="mx-auto mt-2 flex w-full max-w-6xl items-center justify-between gap-4 border-t border-border/50 pt-4 text-xs text-muted-foreground"
      >
        <span>EHFI</span>
        <span>{new Date().getFullYear()} · Todos os direitos reservados</span>
      </motion.footer>
    </main>
  )
}
