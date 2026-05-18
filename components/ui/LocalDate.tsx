"use client";

interface LocalDateProps {
  iso: string | Date;
  showTime?: boolean;
}

export function LocalDate({ iso, showTime = false }: LocalDateProps) {
  const isoStr = iso instanceof Date ? iso.toISOString() : iso;
  const d = new Date(isoStr);

  const text = showTime
    ? d.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })
    : d.toLocaleDateString(undefined, { dateStyle: "medium" });

  return (
    <time dateTime={isoStr} suppressHydrationWarning>
      {text}
    </time>
  );
}
