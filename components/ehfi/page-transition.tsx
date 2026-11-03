import { ViewTransition, type ReactNode } from "react"

const routeClasses = {
  default: "ehfi-nav-neutral",
  "nav-forward": "ehfi-nav-forward",
  "nav-back": "ehfi-nav-back",
}

export function PageTransition({ children }: { children: ReactNode }) {
  return (
    <ViewTransition
      default="ehfi-nav-neutral"
      enter={routeClasses}
      exit={routeClasses}
    >
      {children}
    </ViewTransition>
  )
}
