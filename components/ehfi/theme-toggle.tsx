"use client"

import { useEffect, useState } from "react"
import { useTheme } from "next-themes"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { IoMoonOutline, IoSunnyOutline } from "react-icons/io5"

import { Button } from "@/components/ui/button"
import { transitionTheme } from "@/lib/theme-transition"

const easeOut = [0.23, 1, 0.32, 1] as const

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const prefersReducedMotion = Boolean(useReducedMotion())
  const [mounted, setMounted] = useState(false)
  const isDark = resolvedTheme === "dark"

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      aria-label={!mounted ? "Alternar tema claro ou escuro" : isDark ? "Ativar tema claro" : "Ativar tema escuro"}
      title={!mounted ? "Alternar tema claro ou escuro" : isDark ? "Ativar tema claro" : "Ativar tema escuro"}
      onClick={(event) => {
        const nextTheme = isDark ? "light" : "dark"
        const bounds = event.currentTarget.getBoundingClientRect()
        transitionTheme(nextTheme, () => setTheme(nextTheme), {
          x: bounds.left + bounds.width / 2,
          y: bounds.top + bounds.height / 2,
        })
      }}
      className="size-11 rounded-full border-border/80 bg-card/70 shadow-sm backdrop-blur-xl"
    >
      {!mounted ? (
        <IoMoonOutline aria-hidden="true" className="opacity-0" />
      ) : (
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={isDark ? "light-icon" : "dark-icon"}
            initial={prefersReducedMotion ? false : { opacity: 0, rotate: isDark ? -22 : 22, scale: 0.86 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={prefersReducedMotion ? undefined : { opacity: 0, rotate: isDark ? 18 : -18, scale: 0.9 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.18, ease: easeOut }}
            className="inline-flex"
          >
            {isDark ? <IoSunnyOutline aria-hidden="true" /> : <IoMoonOutline aria-hidden="true" />}
          </motion.span>
        </AnimatePresence>
      )}
    </Button>
  )
}
