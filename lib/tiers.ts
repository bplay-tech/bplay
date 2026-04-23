export const TIER_DISPLAY = {
  Bronze: {
    label: "Bronze Partner",
    color: "text-amber-600",
    bg: "bg-amber-600/10",
    border: "border-amber-600/30",
  },
  Silver: {
    label: "Silver Partner",
    color: "text-slate-400",
    bg: "bg-slate-400/10",
    border: "border-slate-400/30",
  },
  Gold: {
    label: "Gold Partner",
    color: "text-yellow-500",
    bg: "bg-yellow-500/10",
    border: "border-yellow-500/30",
  },
} as const;

export type TierName = keyof typeof TIER_DISPLAY;
