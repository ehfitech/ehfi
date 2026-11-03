export function PlatformLoading({ kind }: { kind: "dashboard" | "agenda" | "activities" }) {
  return (
    <section role="status" aria-live="polite" aria-busy="true" className="space-y-5 pb-10">
      <span className="sr-only">Carregando sua plataforma EHFI…</span>
      <div className="animate-pulse motion-reduce:animate-none rounded-[2rem] border border-border/65 bg-card/65 p-6 sm:p-8">
        <div className="h-3 w-36 rounded-full bg-muted" />
        <div className="mt-4 h-9 w-2/3 max-w-md rounded-xl bg-muted" />
        <div className="mt-3 h-4 w-full max-w-xl rounded-full bg-muted" />
        <div className="mt-6 h-11 w-44 rounded-xl bg-muted" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: kind === "agenda" ? 3 : 4 }, (_, index) => (
          <div key={index} className="animate-pulse motion-reduce:animate-none space-y-4 rounded-[1.5rem] border border-border/65 bg-card/65 p-5">
            <div className="h-6 w-24 rounded-full bg-muted" />
            <div className="h-6 w-4/5 rounded-lg bg-muted" />
            <div className="h-4 w-2/3 rounded-full bg-muted" />
            <div className="h-14 rounded-xl bg-muted/70" />
          </div>
        ))}
      </div>
    </section>
  )
}
