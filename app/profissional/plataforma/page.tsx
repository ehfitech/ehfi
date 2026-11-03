import { ProfessionalDashboard } from "@/components/ehfi/professional-dashboard"
import { getProfessionalDashboardSummary } from "@/lib/activities/professional-queries"

export default async function ProfessionalPlatformPage() {
  try {
    const summary = await getProfessionalDashboardSummary()
    return <ProfessionalDashboard summary={summary} />
  } catch {
    return (
      <section className="mx-auto max-w-3xl rounded-[1.7rem] border border-border/70 bg-card/80 p-6 shadow-sm sm:p-9">
        <p className="font-heading text-lg font-semibold text-foreground">Não foi possível carregar sua agenda.</p>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">Atualize a página e confira se a migração da plataforma de atividades já foi aplicada ao Supabase.</p>
      </section>
    )
  }
}
