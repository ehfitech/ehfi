import type { Variants } from "motion/react"

export const ehfiEase = [0.22, 1, 0.36, 1] as const

export const ehfiMotion = {
  duration: {
    entrance: 0.36,
    panel: 0.38,
    field: 0.28,
    step: 0.26,
  },
  distance: {
    entrance: 12,
    panel: 10,
    field: 8,
    step: 16,
  },
  stagger: {
    entrance: 0.06,
    panel: 0.055,
    field: 0.14,
  },
} as const

export function entranceProps(delay: number, reducedMotion: boolean) {
  return {
    "data-ehfi-reveal": "",
    initial: reducedMotion
      ? false
      : { opacity: 0, y: ehfiMotion.distance.entrance },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.1 },
    transition: {
      duration: reducedMotion ? 0 : ehfiMotion.duration.entrance,
      delay: reducedMotion ? 0 : delay,
      ease: ehfiEase,
    },
  }
}

export const panelRevealVariants: Variants = {
  hidden: { opacity: 0, y: ehfiMotion.distance.panel },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: ehfiMotion.duration.panel,
      ease: ehfiEase,
    },
  },
}

export const fieldRevealVariants: Variants = {
  hidden: { opacity: 0, y: ehfiMotion.distance.field },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: ehfiMotion.duration.field, delay, ease: ehfiEase },
  }),
}

export const stillPanelVariants: Variants = {
  hidden: { opacity: 1, y: 0 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0, when: "beforeChildren", staggerChildren: 0 },
  },
}

export const stillFieldVariants: Variants = {
  hidden: { opacity: 1, y: 0 },
  visible: { opacity: 1, y: 0, transition: { duration: 0 } },
}
