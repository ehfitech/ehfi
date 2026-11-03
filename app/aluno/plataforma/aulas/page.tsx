import { StudentActivities } from "@/components/ehfi/student-activities"
import { getStudentActivityListRange, getStudentBookings, listDiscoverableActivities } from "@/lib/activities/student-queries"

export default async function StudentActivitiesPage() {
  try {
    const range = getStudentActivityListRange()
    const [bookings, activities] = await Promise.all([
      getStudentBookings(range),
      listDiscoverableActivities(range),
    ])
    return <StudentActivities activities={activities} bookings={bookings} />
  } catch {
    return (
      <section className="mx-auto max-w-3xl rounded-[1.7rem] border border-border/70 bg-card/80 p-6 shadow-sm sm:p-9">
        <p className="font-heading text-lg font-semibold text-foreground">Não foi possível carregar as atividades.</p>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">Atualize a página e confira se a migração da plataforma de atividades já foi aplicada ao Supabase.</p>
      </section>
    )
  }
}
