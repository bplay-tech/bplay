export default function MessagesLoading() {
  return (
    <div className="flex flex-col gap-6 w-full max-w-3xl mx-auto animate-pulse">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-white/5" />
          <div className="h-6 w-32 rounded-lg bg-white/5" />
        </div>
        <div className="h-9 w-28 rounded-xl bg-white/5" />
      </div>

      {/* Inbox section */}
      <div className="flex flex-col gap-3">
        <div className="h-3 w-16 rounded bg-white/5" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-2xl p-5 h-24 bg-white/5" />
        ))}
      </div>

      {/* Sent section */}
      <div className="flex flex-col gap-3">
        <div className="h-3 w-12 rounded bg-white/5" />
        {[1, 2].map((i) => (
          <div key={i} className="rounded-2xl p-5 h-20 bg-white/5" />
        ))}
      </div>
    </div>
  );
}
