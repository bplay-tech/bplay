import { cn } from "@/lib/utils";

const COLOR_VARIANTS = [
  "bg-purple-500",
  "bg-blue-500",
  "bg-green-500",
  "bg-yellow-500",
  "bg-red-500",
  "bg-pink-500",
];

function getColorFromName(name: string): string {
  const idx = name.charCodeAt(0) % COLOR_VARIANTS.length;
  return COLOR_VARIANTS[idx];
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

interface AvatarProps {
  name: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

const SIZE_MAP = { sm: "h-7 w-7 text-xs", md: "h-9 w-9 text-sm", lg: "h-11 w-11 text-base" };

export function Avatar({ name, className, size = "md" }: AvatarProps) {
  return (
    <div
      className={cn(
        "rounded-full flex items-center justify-center font-semibold text-white shrink-0",
        SIZE_MAP[size],
        getColorFromName(name),
        className
      )}
    >
      {getInitials(name)}
    </div>
  );
}
