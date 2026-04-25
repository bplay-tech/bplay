export default function RegisterLoading() {
  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="h-12 w-12 rounded-xl bg-card animate-pulse mb-4" />
          <div className="h-7 w-24 rounded bg-card animate-pulse" />
          <div className="h-5 w-20 rounded-full bg-card animate-pulse mt-2" />
        </div>
        <div className="bg-card border border-card-border rounded-xl p-6 flex flex-col gap-4">
          <div className="h-16 rounded-xl bg-muted/10 animate-pulse" />
          <div className="h-6 w-48 rounded bg-muted/10 animate-pulse" />
          <div className="h-4 w-64 rounded bg-muted/10 animate-pulse" />
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex flex-col gap-1.5">
              <div className="h-4 w-20 rounded bg-muted/10 animate-pulse" />
              <div className="h-10 rounded-lg bg-muted/10 animate-pulse" />
            </div>
          ))}
          <div className="h-10 rounded-lg bg-primary/20 animate-pulse mt-2" />
        </div>
      </div>
    </div>
  );
}
