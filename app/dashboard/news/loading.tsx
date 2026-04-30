export default function NewsLoading() {
  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <div className="h-8 w-48 rounded-lg bg-white/5 animate-pulse" />
      {[1, 2, 3].map((i) => (
        <div key={i} className="rounded-2xl p-5 h-24 bg-white/5 animate-pulse" />
      ))}
    </div>
  );
}
