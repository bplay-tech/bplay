"use client";

import * as Switch from "@radix-ui/react-switch";
import { cn } from "@/lib/utils";

interface ToggleProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  className?: string;
}

export function Toggle({ checked, onCheckedChange, label, disabled, className }: ToggleProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <Switch.Root
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        className={cn(
          "relative h-6 w-11 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
          checked ? "bg-primary" : "bg-card-border",
          disabled && "opacity-50 pointer-events-none"
        )}
      >
        <Switch.Thumb className="block h-5 w-5 rounded-full bg-white shadow transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0.5" />
      </Switch.Root>
      {label && <span className="text-sm text-foreground">{label}</span>}
    </div>
  );
}
