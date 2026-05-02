"use client";

export default function NewsError() {
  return (
    <div className="flex flex-col gap-4 max-w-3xl mx-auto">
      <h1 className="text-xl font-bold text-foreground">Announcements</h1>
      <p className="text-sm text-danger">Failed to load announcements. Please try again.</p>
    </div>
  );
}
