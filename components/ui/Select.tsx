"use client";

import * as RadixSelect from "@radix-ui/react-select";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  value: string;
  onValueChange: (value: string) => void;
  options: SelectOption[];
  label?: string;
  placeholder?: string;
  className?: string;
}

export function Select({ value, onValueChange, options, label, placeholder, className }: SelectProps) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label && <span className="text-sm font-medium text-foreground">{label}</span>}
      <RadixSelect.Root value={value} onValueChange={onValueChange}>
        <RadixSelect.Trigger className="flex h-10 w-full items-center justify-between rounded-lg border border-card-border bg-card px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary">
          <RadixSelect.Value placeholder={placeholder ?? "Select..."} />
          <RadixSelect.Icon>
            <ChevronDown className="h-4 w-4 text-muted" />
          </RadixSelect.Icon>
        </RadixSelect.Trigger>
        <RadixSelect.Portal>
          <RadixSelect.Content className="z-50 overflow-hidden rounded-lg border border-card-border bg-card shadow-xl">
            <RadixSelect.Viewport className="p-1">
              {options.map((opt) => (
                <RadixSelect.Item
                  key={opt.value}
                  value={opt.value}
                  className="relative flex cursor-pointer select-none items-center rounded-md px-8 py-2 text-sm text-foreground outline-none data-[highlighted]:bg-primary/10 data-[highlighted]:text-primary"
                >
                  <RadixSelect.ItemIndicator className="absolute left-2">
                    <Check className="h-4 w-4" />
                  </RadixSelect.ItemIndicator>
                  <RadixSelect.ItemText>{opt.label}</RadixSelect.ItemText>
                </RadixSelect.Item>
              ))}
            </RadixSelect.Viewport>
          </RadixSelect.Content>
        </RadixSelect.Portal>
      </RadixSelect.Root>
    </div>
  );
}
