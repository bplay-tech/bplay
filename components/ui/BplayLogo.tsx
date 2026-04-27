import { cn } from "@/lib/utils";

interface BplayLogoProps {
  size?: "sm" | "md" | "xl";
  className?: string;
}

const sizeMap = {
  sm: { text: "text-sm font-semibold",  dot: "w-1.5 h-1.5", gap: "gap-1.5" },
  md: { text: "text-lg font-semibold",  dot: "w-2 h-2",     gap: "gap-2"   },
  xl: { text: "text-5xl font-bold",     dot: "w-4 h-4",     gap: "gap-3"   },
};

export function BplayLogo({ size = "md", className }: BplayLogoProps) {
  const s = sizeMap[size];
  return (
    <div className={cn("flex items-center text-white", s.gap, s.text, className)}>
      <span>bplay</span>
      <span className="flex gap-0.75 items-center">
        <span className={cn("inline-block rounded-full shrink-0", s.dot)} style={{ background: "#7C5CFF" }} />
        <span className={cn("inline-block rounded-full shrink-0", s.dot)} style={{ background: "#7C5CFF" }} />
      </span>
    </div>
  );
}
