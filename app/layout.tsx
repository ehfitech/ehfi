import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono, Inter, Outfit } from "next/font/google"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils";

const outfitHeading = Outfit({subsets:['latin'],variable:'--font-heading'});

const inter = Inter({subsets:['latin'],variable:'--font-sans'})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export const metadata: Metadata = {
  applicationName: "EHFI",
  manifest: "/manifest.webmanifest",
  title: "EHFI — Conexões em movimento",
  description: "Conectamos pessoas e profissionais de saúde, esporte e educação física.",
  appleWebApp: {
    capable: true,
    title: "EHFI",
    statusBarStyle: "default",
  },
  icons: {
    apple: [
      {
        url: "/pwa/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  },
  other: {
    "apple-mobile-web-app-capable": "yes",
  },
}

export const viewport: Viewport = {
  themeColor: [
    {
      media: "(prefers-color-scheme: light)",
      color: "#F8F7FF",
    },
    {
      media: "(prefers-color-scheme: dark)",
      color: "#09090B",
    },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="pt-BR"
      suppressHydrationWarning
      className={cn("antialiased", fontMono.variable, "font-sans", inter.variable, outfitHeading.variable)}
    >
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}
