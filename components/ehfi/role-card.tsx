"use client"

import Link from "next/link"
import { motion, useReducedMotion } from "motion/react"
import {
  IoArrowForwardOutline,
  IoBusinessOutline,
  IoPeopleOutline,
} from "react-icons/io5"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const profiles = [
  {
    href: "/profissional/entrar",
    title: "Sou profissional",
    description: "Apresente seu trabalho e encontre alunos na EHFI.",
    icon: IoPeopleOutline,
  },
  {
    href: "/empresa/entrar",
    title: "Sou empresa",
    description: "Planeje sessões de ginástica laboral para sua equipe.",
    icon: IoBusinessOutline,
  },
]

export function RoleCard() {
  const reducedMotion = Boolean(useReducedMotion())

  return (
    <div
      role="group"
      aria-label="Escolha entre profissional e empresa"
      className="grid gap-3 sm:grid-cols-2"
    >
      {profiles.map(({ href, title, description, icon: Icon }) => (
        <motion.div
          key={href}
          whileTap={reducedMotion ? undefined : { scale: 0.985 }}
          className="rounded-2xl"
        >
          <Link
            href={href}
            transitionTypes={["nav-forward"]}
            aria-label={`${title}. Entrar ou criar conta`}
            className="group block h-full rounded-2xl outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <Card className="h-full min-h-44 gap-0 rounded-2xl border-border/75 bg-card/85 p-0 shadow-sm transition-[border-color,box-shadow,background-color] duration-200 group-hover:border-primary/35 group-hover:bg-card group-hover:shadow-md">
              <CardHeader className="flex flex-row items-start justify-between gap-3 px-4 pt-4 pb-2">
                <span className="flex size-10 items-center justify-center rounded-xl bg-primary/[0.07] text-primary transition-colors duration-200 group-hover:bg-primary/10">
                  <Icon aria-hidden="true" className="size-5" />
                </span>
                <span className="flex size-8 items-center justify-center rounded-full bg-primary/[0.07] text-primary transition ease-in-out duration-200 group-hover:translate-x-0.5 group-hover:bg-primary group-hover:text-primary-foreground">
                  <IoArrowForwardOutline aria-hidden="true" className="size-4" />
                </span>
              </CardHeader>
              <CardContent className="mt-auto gap-1.5 px-4 pb-4">
                <CardTitle className="text-base">{title}</CardTitle>
                <CardDescription className="text-xs leading-5">
                  {description}
                </CardDescription>
                <span className="mt-1 inline-flex items-center gap-1.5 text-xs font-semibold text-primary">
                  Entrar ou criar conta
                  <IoArrowForwardOutline aria-hidden="true" className="size-3.5" />
                </span>
              </CardContent>
            </Card>
          </Link>
        </motion.div>
      ))}
    </div>
  )
}
