import { ProfessionalAgenda } from "@/components/ehfi/professional-agenda"
import { addCalendarDays, getSaoPauloDateKey, getSaoPauloWeek, isValidDateKey, saoPauloDateTimeToIso } from "@/lib/activities/dates"
import { listProfessionalActivities } from "@/lib/activities/professional-queries"
import { getProfessionalProfileEditorData } from "@/lib/activities/profile-queries"

export default async function ProfessionalAgendaPage({
  searchParams,
}: {
  searchParams: Promise<{ week?: string | string[]; novo?: string | string[]; atividade?: string | string[] }>
}) {
  try {
    const params = await searchParams
    const requestedWeek = Array.isArray(params.week) ? params.week[0] : params.week
    const requestedActivity = Array.isArray(params.atividade) ? params.atividade[0] : params.atividade
    const requestedNew = Array.isArray(params.novo) ? params.novo[0] : params.novo
    const week = getSaoPauloWeek(isValidDateKey(requestedWeek) ? requestedWeek : getSaoPauloDateKey())
    const loadedFrom = addCalendarDays(week.startDate, -7)
    const loadedTo = addCalendarDays(week.endDate, 14)
    const [activities, profileData] = await Promise.all([
      listProfessionalActivities({
        from: saoPauloDateTimeToIso(loadedFrom, "00:00"),
        to: saoPauloDateTimeToIso(loadedTo, "00:00"),
      }),
      getProfessionalProfileEditorData(),
    ])
    const today = getSaoPauloDateKey()
    const initialActivity = activities.find((activity) => activity.activity_id === requestedActivity)
    const initialSelectedDay = initialActivity
      ? getSaoPauloDateKey(initialActivity.starts_at)
      : today >= week.startDate && today < week.endDate
        ? today
        : week.startDate
    return (
      <ProfessionalAgenda
        key={`${week.startDate}:${requestedActivity ?? ""}:${requestedNew === "1" ? "nova" : ""}`}
        activities={activities}
        loadedFrom={loadedFrom}
        loadedTo={loadedTo}
        initialSelectedDay={initialSelectedDay}
        initialCreateOpen={requestedNew === "1"}
        initialActivityId={requestedActivity ?? null}
        profilePublished={profileData.profile?.is_published ?? false}
      />
    )
  } catch {
    return (
      <section className="mx-auto max-w-3xl rounded-[1.7rem] border border-border/70 bg-card/80 p-6 shadow-sm sm:p-9">
        <p className="font-heading text-lg font-semibold text-foreground">Não foi possível carregar sua agenda.</p>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">Atualize a página e confira se a migração da plataforma de atividades já foi aplicada ao Supabase.</p>
      </section>
    )
  }
}
