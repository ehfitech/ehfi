"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, type ReactNode } from "react"
import {
  IoCalendarOutline,
  IoCloseOutline,
  IoHomeOutline,
  IoLogOutOutline,
  IoMenuOutline,
  IoPersonOutline,
  IoPeopleOutline,
  IoSparklesOutline,
} from "react-icons/io5"

import { signOut } from "@/app/actions/auth"
import { ThemeToggle } from "@/components/ehfi/theme-toggle"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { cn } from "@/lib/utils"
import type { PlatformRole } from "@/lib/auth/roles"

type ShellRole = PlatformRole

const roleCopy: Record<ShellRole, { name: string; hello: string }> = {
  professional: { name: "Profissional", hello: "Espaço profissional" },
  student: { name: "Aluno", hello: "Sua jornada EHFI" },
}

const navByRole: Record<ShellRole, { label: string; href: string; icon: typeof IoHomeOutline }[]> = {
  professional: [
    { label: "Início", href: "/profissional/plataforma", icon: IoHomeOutline },
    { label: "Agenda", href: "/profissional/plataforma/agenda", icon: IoCalendarOutline },
  ],
  student: [
    { label: "Início", href: "/aluno/plataforma", icon: IoHomeOutline },
    { label: "Aulas", href: "/aluno/plataforma/aulas", icon: IoSparklesOutline },
  ],
}

function isCurrentPath(pathname: string, href: string) {
  const target = href.split("#")[0]
  if (target.endsWith("/plataforma")) return pathname === target
  return pathname === target || pathname.startsWith(`${target}/`)
}

function NavigationLink({
  href,
  label,
  icon: Icon,
  current,
  onNavigate,
  dock = false,
}: {
  href: string
  label: string
  icon: typeof IoHomeOutline
  current: boolean
  onNavigate?: () => void
  dock?: boolean
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      aria-current={current ? "page" : undefined}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40",
        dock
          ? "min-w-16 flex-1 flex-col gap-1 px-3 py-2 text-[0.68rem] sm:min-w-24 sm:flex-row sm:py-2.5 sm:text-xs"
          : "min-h-11 px-3.5",
        current
          ? "bg-primary/10 text-primary dark:bg-primary/15"
          : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
      )}
    >
      <Icon aria-hidden="true" className={cn(dock ? "size-5" : "size-[1.1rem]")} />
      <span>{label}</span>
    </Link>
  )
}

function DrawerItem({
  href,
  label,
  icon: Icon,
  current,
  close,
}: {
  href: string
  label: string
  icon: typeof IoHomeOutline
  current: boolean
  close: () => void
}) {
  return (
    <Link
      href={href}
      onClick={close}
      aria-current={current ? "page" : undefined}
      className={cn(
        "flex min-h-12 items-center gap-3 rounded-xl px-3.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40",
        current ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
      )}
    >
      <Icon aria-hidden="true" className="size-5" />
      {label}
    </Link>
  )
}

export function PlatformShell({
  role,
  availableRoles,
  children,
}: {
  role: ShellRole
  availableRoles: PlatformRole[]
  children: ReactNode
}) {
  const pathname = usePathname()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const navigation = navByRole[role]
  const profileHref = "/profissional/plataforma/perfil"
  const roleDescription = roleCopy[role]

  return (
    <div className="min-h-dvh pb-28 md:pb-10">
      <header className="sticky top-0 z-30 border-b border-border/55 bg-background/75 backdrop-blur-2xl supports-backdrop-filter:bg-background/65">
        <div className="mx-auto flex h-[4.4rem] max-w-7xl items-center justify-between gap-3 px-4 sm:px-7">
          <div className="flex items-center gap-2.5">
            <Drawer open={drawerOpen} onOpenChange={setDrawerOpen} swipeDirection="left">
              <DrawerTrigger
                aria-label="Abrir menu de navegação"
                className="inline-flex size-10 items-center justify-center rounded-xl text-foreground transition hover:bg-muted focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40 md:hidden"
              >
                <IoMenuOutline aria-hidden="true" className="size-5" />
              </DrawerTrigger>
              <DrawerContent className="h-dvh w-[min(88vw,22rem)] rounded-r-[1.7rem] border-r border-border/70 bg-card/95 shadow-2xl backdrop-blur-xl">
                <DrawerHeader className="px-5 pt-7 pb-5 text-left">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <Image src="/pwa/icon-192.png" width={42} height={42} alt="" className="size-10 rounded-xl border border-border/70" />
                      <div>
                        <DrawerTitle className="font-heading text-base font-bold tracking-[0.14em]">EHFI</DrawerTitle>
                        <DrawerDescription className="mt-1 text-xs">{roleDescription.hello}</DrawerDescription>
                      </div>
                    </div>
                    <DrawerClose
                      aria-label="Fechar menu"
                      className="inline-flex size-9 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40"
                    >
                      <IoCloseOutline aria-hidden="true" className="size-5" />
                    </DrawerClose>
                  </div>
                </DrawerHeader>
                <nav aria-label="Menu principal" className="flex flex-1 flex-col gap-1 px-4">
                  {navigation.map(({ href, label, icon }) => (
                    <DrawerItem key={href} href={href} label={label} icon={icon} current={isCurrentPath(pathname, href)} close={() => setDrawerOpen(false)} />
                  ))}
                  {role === "professional" && (
                    <DrawerItem href={profileHref} label="Perfil público" icon={IoPersonOutline} current={isCurrentPath(pathname, profileHref)} close={() => setDrawerOpen(false)} />
                  )}
                  {availableRoles.length > 1 && (
                    <div className="mt-5 border-t border-border/70 pt-4">
                      <p className="px-3.5 pb-2 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Outros espaços</p>
                      {availableRoles.filter((item) => item !== role).map((item) => {
                        const destination = item === "student" ? "/aluno/plataforma" : "/profissional/plataforma"
                        return <DrawerItem key={item} href={destination} label={roleCopy[item].name} icon={item === "student" ? IoPeopleOutline : IoPersonOutline} current={false} close={() => setDrawerOpen(false)} />
                      })}
                    </div>
                  )}
                </nav>
                <div className="flex items-center justify-between border-t border-border/70 px-5 py-5">
                  <ThemeToggle />
                  <form action={signOut}>
                    <button type="submit" className="inline-flex min-h-10 items-center gap-2 rounded-xl px-3 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40">
                      <IoLogOutOutline aria-hidden="true" className="size-4" /> Sair
                    </button>
                  </form>
                </div>
              </DrawerContent>
            </Drawer>
            <Link href={`/${role === "student" ? "aluno" : "profissional"}/plataforma`} className="inline-flex items-center gap-2.5 rounded-xl focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40">
              <Image src="/pwa/icon-192.png" width={38} height={38} alt="" className="size-[2.35rem] rounded-xl border border-border/70 bg-card" />
              <span className="font-heading text-sm font-bold tracking-[0.16em] text-foreground">EHFI</span>
              <span className="hidden rounded-full bg-secondary px-2.5 py-1 text-[0.68rem] font-medium text-secondary-foreground sm:inline-flex">{roleDescription.name}</span>
            </Link>
          </div>

          <nav aria-label="Navegação" className="hidden items-center gap-1 md:flex">
            {navigation.map(({ href, label, icon }) => (
              <NavigationLink key={href} href={href} label={label} icon={icon} current={isCurrentPath(pathname, href)} />
            ))}
            {role === "professional" && <NavigationLink href={profileHref} label="Perfil público" icon={IoPersonOutline} current={isCurrentPath(pathname, profileHref)} />}
          </nav>

          <div className="hidden items-center gap-2 md:flex">
            {availableRoles.length > 1 && availableRoles.filter((item) => item !== role).map((item) => (
              <Link key={item} href={item === "student" ? "/aluno/plataforma" : "/profissional/plataforma"} className="rounded-xl px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground">{roleCopy[item].name}</Link>
            ))}
            <ThemeToggle />
            <form action={signOut}>
              <button type="submit" aria-label="Sair da conta" title="Sair da conta" className="inline-flex size-10 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40">
                <IoLogOutOutline aria-hidden="true" className="size-[1.15rem]" />
              </button>
            </form>
          </div>
          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle />
            <form action={signOut}>
              <button type="submit" aria-label="Sair da conta" title="Sair da conta" className="inline-flex size-10 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40">
                <IoLogOutOutline aria-hidden="true" className="size-[1.15rem]" />
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl px-4 pt-6 sm:px-7 sm:pt-9">{children}</main>

      <nav aria-label="Navegação rápida" className="fixed inset-x-0 bottom-0 z-40 px-3 pb-[max(env(safe-area-inset-bottom),0.7rem)] md:hidden">
        <div className="mx-auto flex max-w-md items-center gap-1 rounded-[1.5rem] border border-border/70 bg-card/85 p-1.5 shadow-[0_16px_50px_-20px_rgba(44,27,71,0.45)] backdrop-blur-2xl">
          {navigation.map(({ href, label, icon }) => (
            <NavigationLink key={href} href={href} label={label} icon={icon} current={isCurrentPath(pathname, href)} dock />
          ))}
        </div>
      </nav>
    </div>
  )
}
