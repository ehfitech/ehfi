import { notFound } from "next/navigation"

import { StudentActivityDetail } from "@/components/ehfi/student-activity-detail"
import { getStudentActivityDetails } from "@/lib/activities/student-queries"

export default async function StudentActivityDetailPage({
  params,
}: {
  params: Promise<{ activityId: string }>
}) {
  const { activityId } = await params
  let details: Awaited<ReturnType<typeof getStudentActivityDetails>> = null
  try {
    details = await getStudentActivityDetails(activityId)
  } catch {
    return (
      <section className="mx-auto max-w-3xl rounded-[1.7rem] border border-border/70 bg-card/80 p-6 shadow-sm sm:p-9">
        <p className="font-heading text-lg font-semibold text-foreground">Não foi possível carregar esta atividade.</p>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">Atualize a página. Se o problema continuar, confira se a conexão com o Supabase está disponível.</p>
      </section>
    )
  }
  if (!details) notFound()
  return <StudentActivityDetail details={details} />
}
