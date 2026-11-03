"use client"

import Link from "next/link"
import { motion, useReducedMotion } from "motion/react"
import {
  IoArrowForwardOutline,
  IoBusinessOutline,
  IoPeopleOutline,
  IoPersonOutline,
} from "react-icons/io5"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { entranceProps } from "@/lib/ehfi-motion"

export function RoleCard() {
  const reducedMotion = Boolean(useReducedMotion())

  return (
    <div
      role="group"
      aria-label="Perfis da EHFI"
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
    >
      <motion.div
        data-ehfi-reveal
        {...entranceProps(0.06, reducedMotion)}
        whileTap={reducedMotion ? undefined : { scale: 0.985 }}
        className="rounded-xl"
      >
        <Link
          href="/aluno/entrar"
          transitionTypes={["nav-forward"]}
          aria-label="Sou aluno. Entrar ou criar conta"
          className="group block h-full rounded-xl outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <Card className="h-full min-h-52 gap-0 rounded-2xl border-primary/25 bg-card/85 p-0 shadow-md ring-primary/10 transition-[border-color,box-shadow] duration-200 group-hover:border-primary/45 group-hover:shadow-lg">
            <CardHeader className="flex flex-row items-start justify-between gap-3 px-5 pt-5 pb-3">
              <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <IoPersonOutline aria-hidden="true" className="size-5" />
              </div>
              <span
                className={
                  "flex size-9 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm " +
                  (reducedMotion
                    ? ""
                    : "transition-transform duration-200 group-hover:translate-x-0.5")
                }
              >
                <IoArrowForwardOutline aria-hidden="true" className="size-4" />
              </span>
            </CardHeader>
            <CardContent className="mt-auto gap-2 px-5 pb-5">
              <CardTitle className="text-lg">Sou aluno</CardTitle>
              <CardDescription className="max-w-[28ch] leading-5">
                Pratique com orientação que considera sua saúde, sua rotina e
                seus objetivos.
              </CardDescription>
              <span className="mt-1 inline-flex items-center gap-2 text-sm font-semibold text-primary">
                Entrar ou criar conta
                <IoArrowForwardOutline aria-hidden="true" className="size-4" />
              </span>
            </CardContent>
          </Card>
        </Link>
      </motion.div>

      <motion.div
        data-ehfi-reveal
        {...entranceProps(0.12, reducedMotion)}
        whileTap={reducedMotion ? undefined : { scale: 0.985 }}
        className="rounded-xl"
      >
        <Link
          href="/profissional/entrar"
          transitionTypes={["nav-forward"]}
          aria-label="Sou profissional. Entrar ou criar conta"
          className="group block h-full rounded-xl outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <Card className="h-full min-h-52 gap-0 rounded-2xl border-primary/25 bg-card/85 p-0 shadow-md ring-primary/10 transition-[border-color,box-shadow] duration-200 group-hover:border-primary/45 group-hover:shadow-lg">
            <CardHeader className="flex flex-row items-start justify-between gap-3 px-5 pt-5 pb-3">
              <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <IoPeopleOutline aria-hidden="true" className="size-5" />
              </div>
              <span
                className={
                  "flex size-9 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm " +
                  (reducedMotion
                    ? ""
                    : "transition-transform duration-200 group-hover:translate-x-0.5")
                }
              >
                <IoArrowForwardOutline aria-hidden="true" className="size-4" />
              </span>
            </CardHeader>
            <CardContent className="mt-auto gap-2 px-5 pb-5">
              <CardTitle className="text-lg">Sou profissional</CardTitle>
              <CardDescription className="max-w-[28ch] leading-5">
                Saúde, esporte e educação física.
              </CardDescription>
              <span className="mt-1 inline-flex items-center gap-2 text-sm font-semibold text-primary">
                Entrar ou criar conta
                <IoArrowForwardOutline aria-hidden="true" className="size-4" />
              </span>
            </CardContent>
          </Card>
        </Link>
      </motion.div>

      <motion.div
        data-ehfi-reveal
        {...entranceProps(0.18, reducedMotion)}
        whileTap={reducedMotion ? undefined : { scale: 0.985 }}
        className="rounded-xl"
      >
        <Link
          href="/empresa/entrar"
          transitionTypes={["nav-forward"]}
          aria-label="Sou empresa. Entrar ou criar conta"
          className="group block h-full rounded-xl outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <Card className="h-full min-h-52 gap-0 rounded-2xl border-primary/25 bg-card/85 p-0 shadow-md ring-primary/10 transition-[border-color,box-shadow] duration-200 group-hover:border-primary/45 group-hover:shadow-lg">
            <CardHeader className="flex flex-row items-start justify-between gap-3 px-5 pt-5 pb-3">
              <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <IoBusinessOutline aria-hidden="true" className="size-5" />
              </div>
              <span
                className={
                  "flex size-9 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm " +
                  (reducedMotion
                    ? ""
                    : "transition-transform duration-200 group-hover:translate-x-0.5")
                }
              >
                <IoArrowForwardOutline aria-hidden="true" className="size-4" />
              </span>
            </CardHeader>
            <CardContent className="mt-auto gap-2 px-5 pb-5">
              <CardTitle className="text-lg">Sou empresa</CardTitle>
              <CardDescription className="max-w-[28ch] leading-5">
                Planeje sessões de ginástica laboral para sua equipe.
              </CardDescription>
              <span className="mt-1 inline-flex items-center gap-2 text-sm font-semibold text-primary">
                Entrar ou criar conta
                <IoArrowForwardOutline aria-hidden="true" className="size-4" />
              </span>
            </CardContent>
          </Card>
        </Link>
      </motion.div>
    </div>
  )
}
