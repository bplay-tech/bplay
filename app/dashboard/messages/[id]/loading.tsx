export default function MessageDetailLoading() {
  return (
    <div className="flex flex-col gap-6 w-full max-w-2xl mx-auto animate-pulse">
      {/* Back + title */}
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-lg bg-white/5" />
        <div className="h-6 w-56 rounded-lg bg-white/5" />
      </div>

      {/* Message card */}
      <div className="rounded-2xl p-6 flex flex-col gap-4" style={{ background: "#121826", border: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="flex items-start justify-between pb-4 border-b border-white/10">
          <div className="flex flex-col gap-2">
            <div className="h-4 w-48 rounded bg-white/5" />
            <div className="h-3 w-32 rounded bg-white/5" />
          </div>
          <div className="h-8 w-20 rounded-lg bg-white/5" />
        </div>
        <div className="flex flex-col gap-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-3 rounded bg-white/5" style={{ width: `${70 + (i % 3) * 10}%` }} />
          ))}
        </div>
      </div>
    </div>
  );
}
