export default function ComposeMessageLoading() {
  return (
    <div className="flex flex-col gap-6 w-full max-w-2xl mx-auto animate-pulse">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <div className="h-7 w-48 rounded-lg bg-white/5" />
        <div className="h-3 w-72 rounded bg-white/5" />
      </div>

      {/* Form card */}
      <div className="rounded-2xl p-6 flex flex-col gap-5" style={{ background: "#0f1520", border: "1px solid rgba(255,255,255,0.07)" }}>
        {/* Recipient */}
        <div className="flex flex-col gap-2">
          <div className="h-3 w-20 rounded bg-white/5" />
          <div className="h-10 rounded-xl bg-white/5" />
        </div>
        {/* Subject */}
        <div className="flex flex-col gap-2">
          <div className="h-3 w-16 rounded bg-white/5" />
          <div className="h-10 rounded-xl bg-white/5" />
        </div>
        {/* Body */}
        <div className="flex flex-col gap-2">
          <div className="h-3 w-20 rounded bg-white/5" />
          <div className="h-40 rounded-xl bg-white/5" />
        </div>
        {/* Button */}
        <div className="h-10 w-32 rounded-xl bg-white/5" />
      </div>
    </div>
  );
}
