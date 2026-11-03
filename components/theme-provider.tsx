"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes"
import { IconContext } from "react-icons"
import { MotionConfig } from "motion/react"
import { transitionTheme } from "@/lib/theme-transition"

function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      {...props}
    >
      <MotionConfig reducedMotion="user">
        <IconContext.Provider value={{ size: "24px" }}>
          <MotionReadiness />
          <ThemeHotkey />
          <ThemeColorSync />
          {children}
        </IconContext.Provider>
      </MotionConfig>
    </NextThemesProvider>
  )
}

function MotionReadiness() {
  React.useLayoutEffect(() => {
    if (typeof window.IntersectionObserver !== "function") {
      return
    }

    const root = document.documentElement
    root.setAttribute("data-ehfi-motion-ready", "true")

    return () => {
      root.removeAttribute("data-ehfi-motion-ready")
    }
  }, [])

  return null
}

function isTypingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return false
  }

  return (
    target.isContentEditable ||
    target.tagName === "INPUT" ||
    target.tagName === "TEXTAREA" ||
    target.tagName === "SELECT"
  )
}

function ThemeHotkey() {
  const { resolvedTheme, setTheme } = useTheme()

  React.useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.defaultPrevented || event.repeat) {
        return
      }

      if (event.metaKey || event.ctrlKey || event.altKey) {
        return
      }

      if (isTypingTarget(event.target)) {
        return
      }

      if (typeof event.key !== "string" || event.key.toLowerCase() !== "d") {
        return
      }

      const nextTheme = resolvedTheme === "dark" ? "light" : "dark"
      transitionTheme(nextTheme, () => setTheme(nextTheme))
    }

    window.addEventListener("keydown", onKeyDown)

    return () => {
      window.removeEventListener("keydown", onKeyDown)
    }
  }, [resolvedTheme, setTheme])

  return null
}

function ThemeColorSync() {
  const { resolvedTheme } = useTheme()

  React.useEffect(() => {
    const background = window
      .getComputedStyle(document.documentElement)
      .getPropertyValue("--background")
      .trim()

    if (!background) {
      return
    }

    document
      .querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]')
      .forEach((meta) => {
        meta.content = background
      })
  }, [resolvedTheme])

  return null
}

export { ThemeProvider }
