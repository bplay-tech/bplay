"use client";

import * as Radix from "@radix-ui/react-dropdown-menu";
import { cn } from "@/lib/utils";

interface DropdownItem {
  label: string;
  onClick: () => void;
  variant?: "default" | "danger";
  disabled?: boolean;
}

interface DropdownMenuProps {
  trigger: React.ReactNode;
  items: DropdownItem[];
}

export function DropdownMenu({ trigger, items }: DropdownMenuProps) {
  return (
    <Radix.Root>
      <Radix.Trigger asChild>{trigger}</Radix.Trigger>
      <Radix.Portal>
        <Radix.Content
          align="end"
          sideOffset={4}
          className="z-50 min-w-36 rounded-lg border border-card-border bg-card shadow-xl p-1 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
        >
          {items.map((item) => (
            <Radix.Item
              key={item.label}
              onSelect={item.onClick}
              disabled={item.disabled}
              className={cn(
                "flex cursor-pointer select-none items-center rounded-md px-3 py-2 text-sm outline-none transition-colors",
                item.variant === "danger"
                  ? "text-danger data-[highlighted]:bg-danger/10"
                  : "text-foreground data-[highlighted]:bg-primary/10 data-[highlighted]:text-primary",
                item.disabled && "opacity-50 cursor-not-allowed pointer-events-none"
              )}
            >
              {item.label}
            </Radix.Item>
          ))}
        </Radix.Content>
      </Radix.Portal>
    </Radix.Root>
  );
}
