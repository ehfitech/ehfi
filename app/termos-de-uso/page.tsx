import type { Metadata } from "next"
import Link from "next/link"

import { PageTransition } from "@/components/ehfi/page-transition"
import { ThemeToggle } from "@/components/ehfi/theme-toggle"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "Termos de Uso da demonstração — EHFI",
  description: "Termos operacionais do protótipo demonstrativo EHFI.",
}

function TermsContent() {
  return (
    <main className="relative isolate min-h-dvh overflow-clip px-4 pt-4 pb-12 sm:px-7 sm:pt-6">
      <div aria-hidden="true" className="pointer-events-none absolute -top-36 right-[-10rem] -z-10 size-[28rem] rounded-full bg-primary/10 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute bottom-[-16rem] left-[-12rem] -z-10 size-[32rem] rounded-full bg-ehfi-secondary/10 blur-3xl" />

      <header className="mx-auto flex w-full max-w-5xl items-center justify-between">
        <Link href="/" transitionTypes={["nav-back"]} className="inline-flex min-h-11 items-center rounded-full px-2 font-heading text-sm font-bold tracking-[0.16em] text-foreground outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
          EHFI
        </Link>
        <ThemeToggle />
      </header>

      <div className="mx-auto mt-6 w-full max-w-5xl sm:mt-10">
        <Link href="/empresa/cadastro" transitionTypes={["nav-back"]} className="mb-5 inline-flex min-h-10 items-center rounded-xl px-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-card/55 hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/40 focus-visible:outline-none">
          Voltar ao cadastro
        </Link>

        <Card className="gap-0 rounded-[1.8rem] border-border/60 bg-card/75 p-5 shadow-[0_24px_80px_-42px_rgba(31,22,50,0.34)] backdrop-blur-2xl sm:p-8 lg:p-10">
          <CardHeader className="gap-4 px-0 pb-6">
            <p className="w-fit rounded-full border border-primary/20 bg-primary/[0.06] px-3 py-1 text-xs font-semibold tracking-[0.1em] text-primary uppercase">
              Somente para demonstração
            </p>
            <div>
              <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                Termos de Uso da demonstração
              </h1>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                Estes termos descrevem o funcionamento do protótipo atual do EHFI. Eles não são os termos de uma operação comercial futura.
              </p>
            </div>
          </CardHeader>

          <CardContent className="space-y-7 px-0 pb-0 text-sm leading-7 text-muted-foreground">
            <section className="space-y-2">
              <h2 className="font-heading text-lg font-semibold text-foreground">1. O que esta demonstração faz</h2>
              <p>
                O cadastro de empresa permite percorrer seis etapas e visualizar como a coleta de informações para ginástica laboral poderá funcionar. Ele não cria conta ou perfil, não envia pedido de atendimento, não gera proposta ou contrato e não inicia uma contratação.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="font-heading text-lg font-semibold text-foreground">2. Consulta pública de CNPJ</h2>
              <p>
                Quando você informa um CNPJ completo, o protótipo envia os 14 dígitos ao Open CNPJ para consultar dados cadastrais públicos, como razão social e endereço. A resposta pode estar incompleta ou desatualizada. Confira os campos preenchidos e corrija-os se necessário; a consulta não é um documento oficial.
              </p>
              <p>
                As demais respostas ficam apenas na memória da página, não são enviadas ao EHFI e não são salvas por este protótipo. A consulta do CNPJ é a única comunicação externa deste formulário.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="font-heading text-lg font-semibold text-foreground">3. Informações de contato</h2>
              <p>
                O campo de autorização para contato é apenas demonstrativo: ninguém entrará em contato com você a partir deste cadastro. Para reduzir a exposição de informações pessoais, use dados de contato fictícios nesta experiência.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="font-heading text-lg font-semibold text-foreground">4. Operação futura</h2>
              <p>
                Recursos como conta empresarial, edição de perfil, solicitação de profissionais, propostas, contratações e histórico ainda não estão disponíveis. Os termos aplicáveis a uma futura operação serão definidos antes da ativação desses recursos.
              </p>
            </section>

            <p className="border-t border-border/50 pt-5 text-xs leading-5 text-muted-foreground">
              Consulte também a <Link href="/privacidade#cadastro-empresa" className="font-medium text-primary underline-offset-4 hover:underline">Política de Privacidade do cadastro de empresa</Link>.
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}

export default function TermsOfUsePage() {
  return (
    <PageTransition>
      <TermsContent />
    </PageTransition>
  )
}
