"use client"

import Image from "next/image"
import Link from "next/link"
import { motion, useReducedMotion } from "motion/react"
import { IoArrowBackOutline, IoCalendarOutline, IoPeopleOutline } from "react-icons/io5"

import { ThemeToggle } from "@/components/ehfi/theme-toggle"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { entranceProps } from "@/lib/ehfi-motion"

export function PlatformPlaceholder() {
  const reducedMotion = Boolean(useReducedMotion())

  return (
    <main className="relative isolate flex min-h-dvh flex-col overflow-hidden px-5 py-5 sm:px-8 sm:py-7">
      <div aria-hidden="true" className="pointer-events-none absolute -top-32 right-[-8rem] -z-10 size-[28rem] rounded-full bg-primary/10 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute bottom-[-14rem] left-[-10rem] -z-10 size-[30rem] rounded-full bg-ehfi-secondary/10 blur-3xl" />

      <header className="mx-auto flex w-full max-w-6xl items-center justify-between">
        <Link href="/" transitionTypes={["nav-back"]} aria-label="EHFI — início" className="inline-flex items-center gap-3 rounded-full outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
          <Image src="/pwa/icon-192.png" width={42} height={42} alt="" className="size-[2.625rem] rounded-xl border border-border/70 bg-card" />
          <span className="font-heading text-sm font-bold tracking-[0.16em] text-foreground">EHFI</span>
        </Link>
        <ThemeToggle />
      </header>

      <section className="mx-auto my-auto w-full max-w-3xl py-12">
        <div>
          <motion.div {...entranceProps(0, reducedMotion)}>
            <Link href="/profissional/sucesso" transitionTypes={["nav-back"]} className="mb-5 inline-flex h-10 items-center gap-2 rounded-xl px-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-card/55 hover:text-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40">
              <IoArrowBackOutline aria-hidden="true" className="size-4" /> Voltar
            </Link>
          </motion.div>
          <Card className="items-center gap-0 rounded-[2rem] border-border/60 bg-card/70 px-6 py-8 text-center shadow-[0_30px_90px_-48px_rgba(31,22,50,0.38)] backdrop-blur-2xl sm:px-12 sm:py-12">
            <motion.p {...entranceProps(0.06, reducedMotion)} className="text-xs font-semibold uppercase tracking-[0.16em] text-ehfi-secondary">Estamos preparando tudo</motion.p>
            <motion.h1 {...entranceProps(0.12, reducedMotion)} className="mt-2 font-heading text-3xl leading-tight font-semibold tracking-[-0.035em] text-foreground sm:text-4xl">
              Área profissional em breve
            </motion.h1>
            <motion.p {...entranceProps(0.18, reducedMotion)} className="mt-4 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
              A plataforma da EHFI está em desenvolvimento. Em breve, profissionais poderão encontrar novas formas de se conectar e evoluir.
            </motion.p>
            <div className="mt-7 grid w-full gap-3 text-left sm:grid-cols-2">
              <motion.div {...entranceProps(0.24, reducedMotion)}>
                <Card className="gap-0 rounded-2xl border-border/70 bg-background/45 p-4 shadow-none">
                  <CardContent className="flex flex-row items-center gap-3 px-0">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"><IoPeopleOutline aria-hidden="true" className="size-5" /></span>
                    <span><span className="block text-sm font-semibold text-foreground">Novas conexões</span><span className="mt-1 block text-xs leading-5 text-muted-foreground">Uma comunidade para profissionais.</span></span>
                  </CardContent>
                </Card>
              </motion.div>
              <motion.div {...entranceProps(0.3, reducedMotion)}>
                <Card className="gap-0 rounded-2xl border-border/70 bg-background/45 p-4 shadow-none">
                  <CardContent className="flex flex-row items-center gap-3 px-0">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-ehfi-secondary"><IoCalendarOutline aria-hidden="true" className="size-5" /></span>
                    <span><span className="block text-sm font-semibold text-foreground">Mais novidades</span><span className="mt-1 block text-xs leading-5 text-muted-foreground">Estamos construindo os próximos passos.</span></span>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
            <motion.div {...entranceProps(0.36, reducedMotion)} className="w-full sm:w-auto">
              <Link href="/" transitionTypes={["nav-back"]} className={buttonVariants({ variant: "outline", className: "mt-7 h-12 w-full rounded-xl sm:w-auto" })}>
                <IoArrowBackOutline aria-hidden="true" className="size-4" /> Voltar para a EHFI
              </Link>
            </motion.div>
          </Card>
        </div>
      </section>
      <p className="mx-auto w-full max-w-6xl border-t border-border/50 pt-4 text-center text-xs text-muted-foreground">
        EHFI · Saúde · esporte · educação física
      </p>
    </main>
  )
}
