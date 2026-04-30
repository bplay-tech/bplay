export default function Loading() {
  return (
    <div className="flex flex-col gap-6 max-w-2xl animate-pulse">
      <div className="h-8 w-64 rounded-lg bg-card-border" />
      <div className="h-4 w-96 rounded-lg bg-card-border" />
      <div className="rounded-2xl p-6 bg-card border border-card-border">
        <div className="h-10 rounded-lg bg-card-border mb-5" />
        <div className="h-48 rounded-lg bg-card-border" />
      </div>
    </div>
  );
}
