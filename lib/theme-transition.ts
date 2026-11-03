type EhfiTheme = "light" | "dark"
type ThemeOrigin = { x: number; y: number }

type ViewTransitionDocument = Document & {
  startViewTransition?: (updateCallback: () => void) => { finished: Promise<void> }
}

let themeTransitionSequence = 0

export function transitionTheme(
  theme: EhfiTheme,
  applyTheme: () => void,
  origin?: ThemeOrigin
) {
  if (typeof document === "undefined") {
    applyTheme()
    return
  }

  const viewTransitionDocument = document as ViewTransitionDocument
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
  const sequence = ++themeTransitionSequence
  const root = document.documentElement

  if (reducedMotion || !viewTransitionDocument.startViewTransition) {
    root.removeAttribute("data-ehfi-theme-transition")
    root.style.removeProperty("--ehfi-theme-origin-x")
    root.style.removeProperty("--ehfi-theme-origin-y")
    applyTheme()
    return
  }

  const x = origin?.x ?? window.innerWidth / 2
  const y = origin?.y ?? window.innerHeight / 2

  root.setAttribute("data-ehfi-theme-transition", "active")
  root.style.setProperty("--ehfi-theme-origin-x", `${x}px`)
  root.style.setProperty("--ehfi-theme-origin-y", `${y}px`)

  const applyThemeImmediately = () => {
    root.classList.remove("light", "dark")
    root.classList.add(theme)
    root.style.colorScheme = theme
    applyTheme()
  }

  let transition: ReturnType<NonNullable<ViewTransitionDocument["startViewTransition"]>>

  try {
    transition = viewTransitionDocument.startViewTransition(applyThemeImmediately)
  } catch {
    root.removeAttribute("data-ehfi-theme-transition")
    root.style.removeProperty("--ehfi-theme-origin-x")
    root.style.removeProperty("--ehfi-theme-origin-y")
    applyThemeImmediately()
    return
  }

  const clearOrigin = () => {
    if (sequence !== themeTransitionSequence) return
    root.removeAttribute("data-ehfi-theme-transition")
    root.style.removeProperty("--ehfi-theme-origin-x")
    root.style.removeProperty("--ehfi-theme-origin-y")
  }

  void transition.finished.then(clearOrigin, clearOrigin)
}
