export default function Loading() {
  return (
    <div className="flex flex-col gap-6 max-w-3xl animate-pulse">
      <div className="h-4 w-32 rounded-lg bg-card-border" />
      <div>
        <div className="h-3 w-48 rounded-lg bg-card-border mb-2" />
        <div className="h-8 w-96 rounded-lg bg-card-border" />
      </div>
      <div className="rounded-2xl p-6 bg-card border border-card-border h-64" />
    </div>
  );
}
