"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion, useReducedMotion } from "motion/react"
import {
  IoArrowForwardOutline,
  IoChevronDownOutline,
  IoPeopleOutline,
} from "react-icons/io5"

import { ActivityDiscoveryVisual } from "@/components/ehfi/activity-discovery-visual"
import { RoleCard } from "@/components/ehfi/role-card"
import { ThemeToggle } from "@/components/ehfi/theme-toggle"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ehfiEase, ehfiMotion, entranceProps } from "@/lib/ehfi-motion"

export function WelcomeScreen() {
  const reducedMotion = Boolean(useReducedMotion())
  const [showOtherProfiles, setShowOtherProfiles] = useState(false)

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

      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col">
        <section className="grid flex-1 items-center gap-8 py-9 sm:gap-10 sm:py-12 lg:grid-cols-[0.92fr_1.08fr] lg:gap-12 lg:py-8 xl:gap-16">
          <motion.div
            {...entranceProps(0.06, reducedMotion)}
            className="max-w-xl"
          >
            <p className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/[0.06] px-3.5 py-2 text-xs font-semibold tracking-[0.08em] text-primary uppercase">
              <span className="size-1.5 rounded-full bg-primary" />
              Movimento com orientação
            </p>

            <h1 className="mt-5 max-w-[13ch] font-heading text-[2.65rem] leading-[1.02] font-semibold tracking-[-0.055em] text-foreground sm:text-6xl lg:max-w-[18ch] lg:text-[3.5rem] xl:text-[3.75rem]">
              Encontre uma atividade que combina com você.
            </h1>

            <p className="mt-5 max-w-lg text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
              Descubra profissionais de educação física e saúde, e reserve sua vaga para se movimentar no seu ritmo.
            </p>

            <div className="mt-7 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:gap-4">
              <Link
                href="/aluno/entrar"
                transitionTypes={["nav-forward"]}
                className={cn(
                  buttonVariants({
                    size: "lg",
                    className:
                      "h-12 w-full rounded-xl px-5 text-sm font-semibold shadow-md shadow-primary/15 sm:w-auto",
                  })
                )}
              >
                Encontrar atividades
                <IoArrowForwardOutline aria-hidden="true" className="size-4" />
              </Link>
            </div>

            <section
              id="perfis"
              aria-label="Acesso profissional e empresarial"
              className="mt-4 w-full max-w-lg"
            >
              <button
                type="button"
                aria-expanded={showOtherProfiles}
                aria-controls="outros-perfis"
                onClick={() => setShowOtherProfiles((open) => !open)}
                className="group flex min-h-16 w-full items-center gap-3 rounded-2xl border border-border/75 bg-card/55 px-3.5 py-3 text-left shadow-sm backdrop-blur-xl transition-[border-color,background-color,box-shadow] duration-200 hover:border-primary/25 hover:bg-card/85 hover:shadow-md focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40"
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-secondary-foreground/10 bg-secondary/75 text-ehfi-secondary transition-colors duration-200 group-hover:bg-secondary">
                  <IoPeopleOutline aria-hidden="true" className="size-5" />
                </span>
                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="text-sm font-semibold text-foreground">
                    Entrar como profissional ou empresa
                  </span>
                  <span className="text-xs leading-5 text-muted-foreground">
                    Acesse seu espaço na EHFI
                  </span>
                </span>
                <motion.span
                  aria-hidden="true"
                  animate={{ rotate: showOtherProfiles ? 180 : 0 }}
                  transition={{ duration: reducedMotion ? 0 : 0.2, ease: ehfiEase }}
                  className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border/70 bg-background/75 text-muted-foreground transition-colors group-hover:text-foreground"
                >
                  <IoChevronDownOutline className="size-4" />
                </motion.span>
              </button>

              <motion.div
                id="outros-perfis"
                aria-hidden={!showOtherProfiles}
                inert={!showOtherProfiles}
                initial={{ height: 0, opacity: 0, y: reducedMotion ? 0 : -6 }}
                animate={{
                  height: showOtherProfiles ? "auto" : 0,
                  opacity: showOtherProfiles ? 1 : 0,
                  y: showOtherProfiles || reducedMotion ? 0 : -6,
                }}
                transition={{
                  duration: reducedMotion
                    ? 0
                    : showOtherProfiles
                      ? ehfiMotion.duration.panel
                      : ehfiMotion.duration.panel * 0.65,
                  ease: ehfiEase,
                }}
                className="overflow-hidden"
              >
                <div className="px-0.5 pt-3 pb-1">
                  <RoleCard />
                </div>
              </motion.div>
            </section>
          </motion.div>

          <motion.div {...entranceProps(0.14, reducedMotion)}>
            <ActivityDiscoveryVisual />
          </motion.div>
        </section>
      </div>

      <motion.footer
        {...entranceProps(0.42, reducedMotion)}
        className="mx-auto mt-2 flex w-full max-w-6xl items-center justify-between gap-4 border-t border-border/50 pt-4 text-xs text-muted-foreground"
      >
        <span>EHFI</span>
        <span>{new Date().getFullYear()} · Todos os direitos reservados</span>
      </motion.footer>
    </main>
  )
}
