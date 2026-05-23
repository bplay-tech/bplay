"use client";

import { Battery } from "lucide-react";

interface Tier {
  name: string;
  minTurnoverUsd: number;
  commissionRate: string;
  color: string;
}

interface TierProgressBarProps {
  currentTurnover: number;
  currentTierName: string;
  tiers: Tier[];
}

const TIER_COLORS: Record<string, { fill: string; text: string; glow: string }> = {
  Bronze:   { fill: "#CD7F32", text: "#e8a87c", glow: "rgba(205,127,50,0.4)" },
  Silver:   { fill: "#9CA3AF", text: "#d1d5db", glow: "rgba(156,163,175,0.4)" },
  Gold:     { fill: "#D4AF37", text: "#fcd34d", glow: "rgba(212,175,55,0.4)" },
  Platinum: { fill: "#67E8F9", text: "#a5f3fc", glow: "rgba(103,232,249,0.4)" },
  Diamond:  { fill: "#B9F2FF", text: "#e0f9ff", glow: "rgba(185,242,255,0.5)" },
};

function formatTurnover(amount: number): string {
  if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `$${(amount / 1_000).toFixed(0)}k`;
  return `$${amount.toLocaleString()}`;
}

export function TierProgressBar({ currentTurnover, currentTierName, tiers }: TierProgressBarProps) {
  const sorted = [...tiers].sort((a, b) => a.minTurnoverUsd - b.minTurnoverUsd);
  const currentIdx = sorted.findIndex((t) => t.name === currentTierName);
  const currentTier = sorted[currentIdx] ?? sorted[0];
  const nextTier = sorted[currentIdx + 1] ?? null;
  const isMaxTier = !nextTier;

  const tierColor = TIER_COLORS[currentTierName] ?? TIER_COLORS["Bronze"];

  let fillPct = 100;
  if (!isMaxTier && nextTier) {
    const base = currentTier.minTurnoverUsd;
    const cap = nextTier.minTurnoverUsd;
    fillPct = Math.min(100, Math.max(0, ((currentTurnover - base) / (cap - base)) * 100));
  }

  const remainingToNext = nextTier ? Math.max(0, nextTier.minTurnoverUsd - currentTurnover) : 0;

  return (
    <div className="flex flex-col gap-2 w-full">
      {/* Header: tier badge + commission */}
      <div className="flex items-center justify-between">
        <div
          className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold"
          style={{
            background: `${tierColor.fill}22`,
            border: `1px solid ${tierColor.fill}66`,
            color: tierColor.text,
          }}
        >
          <Battery className="h-3 w-3" />
          {currentTierName} Partner
        </div>
        <span className="text-xs font-semibold" style={{ color: tierColor.text }}>
          {parseFloat(currentTier.commissionRate)}% commission
        </span>
      </div>

      {/* Battery bar */}
      <div className="relative flex items-center gap-1">
        {/* Battery body */}
        <div
          className="relative flex-1 h-6 rounded-md overflow-hidden"
          style={{
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.12)",
          }}
        >
          {/* Segment lines */}
          {sorted.slice(1).map((tier) => {
            const maxThreshold = sorted[sorted.length - 1].minTurnoverUsd;
            if (maxThreshold === 0) return null;
            const pct = (tier.minTurnoverUsd / maxThreshold) * 100;
            return (
              <div
                key={tier.name}
                className="absolute top-0 bottom-0 w-px"
                style={{ left: `${pct}%`, background: "rgba(255,255,255,0.15)" }}
              />
            );
          })}

          {/* Fill */}
          <div
            className="h-full rounded-md transition-all duration-700"
            style={{
              width: `${fillPct}%`,
              background: `linear-gradient(90deg, ${tierColor.fill}99, ${tierColor.fill})`,
              boxShadow: `0 0 8px ${tierColor.glow}`,
            }}
          />

          {/* Fill % text */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[10px] font-bold text-white/70 mix-blend-plus-lighter">
              {isMaxTier ? "MAX LEVEL" : `${Math.round(fillPct)}%`}
            </span>
          </div>
        </div>

        {/* Battery nub */}
        <div
          className="h-3 w-1.5 rounded-r-sm shrink-0"
          style={{ background: "rgba(255,255,255,0.2)" }}
        />
      </div>

      {/* Status line */}
      <div className="flex items-center justify-between text-[10px] text-white/40">
        <span>Turnover: {formatTurnover(currentTurnover)}</span>
        {isMaxTier ? (
          <span style={{ color: tierColor.text }}>Diamond level achieved!</span>
        ) : (
          <span>{formatTurnover(remainingToNext)} to {nextTier?.name}</span>
        )}
      </div>
    </div>
  );
}
