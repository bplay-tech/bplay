"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface DatePickerProps {
  name: string;
  label?: string;
  defaultValue?: string | null;
  required?: boolean;
  /** Latest selectable date (YYYY-MM-DD). Defaults to today. */
  max?: string;
  /** Earliest selectable year. Defaults to 1900. */
  minYear?: number;
  placeholder?: string;
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

const parseISO = (value?: string | null): Date | null => {
  if (!value) return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  return Number.isNaN(date.getTime()) ? null : date;
};

const toISO = (date: Date): string =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate()
  ).padStart(2, "0")}`;

const sameDay = (a: Date, b: Date): boolean =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

export function DatePicker({
  name,
  label,
  defaultValue,
  required,
  max,
  minYear = 1900,
  placeholder = "Select a date",
}: DatePickerProps) {
  const today = useMemo(() => new Date(), []);
  const maxDate = useMemo(() => parseISO(max) ?? today, [max, today]);

  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Date | null>(() => parseISO(defaultValue));
  const initial = parseISO(defaultValue) ?? maxDate;
  const [viewMonth, setViewMonth] = useState(initial.getMonth());
  const [viewYear, setViewYear] = useState(initial.getFullYear());

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const years = useMemo(() => {
    const list: number[] = [];
    for (let y = maxDate.getFullYear(); y >= minYear; y--) list.push(y);
    return list;
  }, [maxDate, minYear]);

  const leadingBlanks = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const goMonth = (delta: number) => {
    const next = new Date(viewYear, viewMonth + delta, 1);
    setViewMonth(next.getMonth());
    setViewYear(next.getFullYear());
  };

  const pick = (day: number) => {
    const date = new Date(viewYear, viewMonth, day);
    setSelected(date);
    setOpen(false);
  };

  const triggerClass = cn(
    "flex h-10 w-full items-center justify-between rounded-lg border border-card-border bg-card px-3 text-sm",
    "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
    selected ? "text-foreground" : "text-muted"
  );

  return (
    <div className="flex flex-col gap-1.5" ref={containerRef}>
      {label && (
        <span className="text-sm font-medium text-foreground">
          {label}
          {required && <span className="text-danger"> *</span>}
        </span>
      )}
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-haspopup="dialog"
          aria-expanded={open}
          className={triggerClass}
        >
          <span>
            {selected
              ? selected.toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" })
              : placeholder}
          </span>
          <Calendar className="h-4 w-4 text-muted" />
        </button>

        <input type="hidden" name={name} value={selected ? toISO(selected) : ""} />

        {open && (
          <div className="absolute left-0 z-50 mt-1 w-72 rounded-lg border border-card-border bg-card p-3 shadow-xl">
            <div className="mb-2 flex items-center gap-2">
              <button
                type="button"
                onClick={() => goMonth(-1)}
                aria-label="Previous month"
                className="flex h-8 w-8 items-center justify-center rounded-md text-muted hover:bg-primary/10 hover:text-primary"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              <select
                aria-label="Month"
                value={viewMonth}
                onChange={(event) => setViewMonth(Number(event.target.value))}
                className="h-8 flex-1 rounded-md border border-card-border bg-card px-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {MONTHS.map((month, index) => (
                  <option key={month} value={index}>
                    {month}
                  </option>
                ))}
              </select>

              <select
                aria-label="Year"
                value={viewYear}
                onChange={(event) => setViewYear(Number(event.target.value))}
                className="h-8 w-20 rounded-md border border-card-border bg-card px-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={() => goMonth(1)}
                aria-label="Next month"
                className="flex h-8 w-8 items-center justify-center rounded-md text-muted hover:bg-primary/10 hover:text-primary"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            <div className="mb-1 grid grid-cols-7 gap-1">
              {WEEKDAYS.map((weekday) => (
                <span key={weekday} className="flex h-8 items-center justify-center text-xs font-medium text-muted">
                  {weekday}
                </span>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: leadingBlanks }).map((_, index) => (
                <span key={`blank-${index}`} className="h-8 w-8" />
              ))}
              {Array.from({ length: daysInMonth }).map((_, index) => {
                const day = index + 1;
                const date = new Date(viewYear, viewMonth, day);
                const disabled = date > maxDate;
                const isSelected = selected ? sameDay(date, selected) : false;
                const isToday = sameDay(date, today);
                return (
                  <button
                    key={day}
                    type="button"
                    disabled={disabled}
                    onClick={() => pick(day)}
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-md text-sm transition-colors",
                      isSelected
                        ? "bg-primary text-white"
                        : "text-foreground hover:bg-primary/10 hover:text-primary",
                      !isSelected && isToday && "ring-1 ring-primary/50",
                      disabled && "cursor-not-allowed text-muted opacity-40 hover:bg-transparent hover:text-muted"
                    )}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
