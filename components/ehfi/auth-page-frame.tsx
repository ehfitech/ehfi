import Image from "next/image"
import Link from "next/link"
import type { ReactNode } from "react"
import { IoArrowBackOutline } from "react-icons/io5"

import { ThemeToggle } from "@/components/ehfi/theme-toggle"

export function AuthPageFrame({ children }: { children: ReactNode }) {
  return (
    <main className="relative isolate flex min-h-dvh flex-col overflow-hidden px-5 py-5 sm:px-8 sm:py-7">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-28 right-[-8rem] -z-10 size-[26rem] rounded-full bg-primary/10 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-[-12rem] left-[-10rem] -z-10 size-[28rem] rounded-full bg-ehfi-secondary/10 blur-3xl"
      />
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between">
        <Link
          href="/"
          aria-label="EHFI — início"
          className="inline-flex min-h-11 items-center gap-3 rounded-full outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
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
      <section className="mx-auto my-auto flex w-full max-w-md flex-col gap-4 py-12">
        <Link
          href="/"
          className="inline-flex w-fit items-center gap-2 rounded-lg px-2 py-2 text-sm font-medium text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40"
        >
          <IoArrowBackOutline aria-hidden="true" className="size-4" />
          Voltar à escolha de perfil
        </Link>
        {children}
      </section>
      <p className="mx-auto w-full max-w-6xl border-t border-border/50 pt-4 text-center text-xs text-muted-foreground">
        EHFI · Saúde · esporte · educação física
      </p>
    </main>
  )
}
