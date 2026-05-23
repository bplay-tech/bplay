export const TIER_DISPLAY = {
  Bronze: {
    label: "Bronze Partner",
    color: "text-amber-600",
    bg: "bg-amber-600/10",
    border: "border-amber-600/30",
    hex: "#CD7F32",
  },
  Silver: {
    label: "Silver Partner",
    color: "text-slate-400",
    bg: "bg-slate-400/10",
    border: "border-slate-400/30",
    hex: "#9CA3AF",
  },
  Gold: {
    label: "Gold Partner",
    color: "text-yellow-500",
    bg: "bg-yellow-500/10",
    border: "border-yellow-500/30",
    hex: "#D4AF37",
  },
  Platinum: {
    label: "Platinum Partner",
    color: "text-cyan-400",
    bg: "bg-cyan-400/10",
    border: "border-cyan-400/30",
    hex: "#67E8F9",
  },
  Diamond: {
    label: "Diamond Partner",
    color: "text-cyan-200",
    bg: "bg-cyan-200/10",
    border: "border-cyan-200/30",
    hex: "#B9F2FF",
  },
} as const;

export type TierName = keyof typeof TIER_DISPLAY;
