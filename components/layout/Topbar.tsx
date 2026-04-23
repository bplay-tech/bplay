"use client";

import { Bell, LogOut, ChevronDown } from "lucide-react";
import { signOut } from "next-auth/react";
import { Avatar } from "@/components/ui/Avatar";
import { DropdownMenu } from "@/components/ui/DropdownMenu";
import { TIER_DISPLAY, type TierName } from "@/lib/tiers";
import { cn } from "@/lib/utils";

interface TopbarProps {
  name: string;
  email: string;
  role: string;
  tierName: string;
}

export function Topbar({ name, email, role, tierName }: TopbarProps) {
  const tierDisplay = TIER_DISPLAY[tierName as TierName];
  const roleLabel = role.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <header className="h-16 border-b border-card-border bg-card flex items-center justify-between px-6 shrink-0">
      <div />
      <div className="flex items-center gap-3">
        <button className="relative p-2 rounded-lg text-muted hover:text-foreground hover:bg-card-border/30 transition-colors">
          <Bell className="h-5 w-5" />
        </button>
        <DropdownMenu
          trigger={
            <button className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
              <Avatar name={name} size="sm" />
              <div className="hidden sm:flex flex-col items-start">
                <span className="text-sm font-medium text-foreground leading-none">{name}</span>
                <span className={cn("text-xs mt-0.5", tierDisplay?.color ?? "text-muted")}>{roleLabel}</span>
              </div>
              <ChevronDown className="h-4 w-4 text-muted" />
            </button>
          }
          items={[
            { label: "Sign out", onClick: () => signOut({ callbackUrl: "/login" }), variant: "danger" },
          ]}
        />
      </div>
    </header>
  );
}
