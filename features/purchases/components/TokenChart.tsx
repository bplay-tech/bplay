"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { TokenDataPoint } from "@/db/queries/bplay-purchases";

interface TokenChartProps {
  data: TokenDataPoint[];
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="rounded-xl px-3 py-2 text-xs"
      style={{ background: "#1a2235", border: "1px solid rgba(255,255,255,0.1)" }}
    >
      <p className="text-white/60 mb-1">{label}</p>
      <p className="font-semibold" style={{ color: "#a78bfa" }}>
        {payload[0].value?.toLocaleString()} BPLAY
      </p>
    </div>
  );
}

export function TokenChart({ data }: TokenChartProps) {
  if (data.length === 0) {
    return <p className="text-sm text-white/30 text-center py-8">No purchase history yet.</p>;
  }

  const formatted = data.map((d) => ({
    ...d,
    label: new Date(d.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
  }));

  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={formatted} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis
          dataKey="label"
          tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          width={50}
        />
        <Tooltip content={<CustomTooltip />} />
        <Line
          type="monotone"
          dataKey="cumulative"
          stroke="#7C5CFF"
          strokeWidth={2}
          dot={{ fill: "#7C5CFF", r: 3 }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
