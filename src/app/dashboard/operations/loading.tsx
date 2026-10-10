function Block({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-md bg-muted ${className}`} />;
}

function CardSkeleton({ rows, className = "" }: { rows: number; className?: string }) {
  return (
    <div className={`rounded-xl bg-card p-4 ring-1 ring-foreground/10 ${className}`}>
      <Block className="h-4 w-36" />
      <Block className="mt-2 h-3 w-52" />
      <div className="mt-5 space-y-4">
        {Array.from({ length: rows }).map((_, i) => (
          <Block key={i} className="h-8 w-full" />
        ))}
      </div>
    </div>
  );
}

export default function OperationsLoading() {
  return (
    <div
      role="status"
      aria-busy="true"
      className="mx-auto w-full max-w-6xl space-y-6"
    >
      <span className="sr-only">Loading event operations…</span>

      <div className="space-y-5">
        <Block className="h-4 w-56" />
        <div className="space-y-2">
          <Block className="h-8 w-64" />
          <Block className="h-4 w-72" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className={`rounded-xl bg-card p-4 ring-1 ring-foreground/10 ${
              i === 0 ? "col-span-2 lg:col-span-1" : ""
            }`}
          >
            <Block className="h-4 w-24" />
            <Block className="mt-4 h-7 w-20" />
            <Block className="mt-3 h-3 w-28" />
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <CardSkeleton rows={4} className="lg:col-span-7" />
        <CardSkeleton rows={2} className="lg:col-span-5" />
        <CardSkeleton rows={4} className="lg:col-span-7" />
        <CardSkeleton rows={3} className="lg:col-span-5" />
      </div>
    </div>
  );
}
