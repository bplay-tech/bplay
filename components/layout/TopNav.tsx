"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  TrendingUp,
  Users,
  Wallet,
  Settings,
  Package,
  RefreshCw,
  Bell,
  ChevronDown,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import { DropdownMenu } from "@/components/ui/DropdownMenu";
import { TIER_DISPLAY, type TierName } from "@/lib/tiers";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  roles?: string[];
}

const NAV_ITEMS: NavItem[] = [
  { label: "Overview", href: "/dashboard/overview", icon: <LayoutDashboard className="h-4 w-4" /> },
  { label: "Sales & Referrals", href: "/dashboard/sales", icon: <TrendingUp className="h-4 w-4" /> },
  { label: "Team", href: "/dashboard/team", icon: <Users className="h-4 w-4" />, roles: ["ADMIN", "SUPER_ADMIN"] },
  { label: "Payouts", href: "/dashboard/payouts", icon: <Wallet className="h-4 w-4" /> },
  { label: "Settings", href: "/dashboard/settings", icon: <Settings className="h-4 w-4" /> },
  { label: "Purchases", href: "/dashboard/purchases", icon: <Package className="h-4 w-4" />, roles: ["SUPER_ADMIN"] },
  { label: "Exchange Rate", href: "/dashboard/exchange-rate", icon: <RefreshCw className="h-4 w-4" />, roles: ["SUPER_ADMIN"] },
];

interface TopNavProps {
  name: string;
  role: string;
  tierName: string;
}

function getInitials(name: string) {
  return name.split(" ").slice(0, 2).map((p) => p[0]).join("").toUpperCase();
}

export function TopNav({ name, role, tierName }: TopNavProps) {
  const pathname = usePathname();
  const tierDisplay = TIER_DISPLAY[tierName as TierName];
  const roleLabel = role.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());

  const visibleItems = NAV_ITEMS.filter(
    (item) => !item.roles || item.roles.includes(role)
  );

  return (
    <header className="sticky top-0 z-40 bg-bg border-b border-white/5">
      {/* Top bar: logo + user */}
      <div className="flex items-center justify-between px-6 py-3">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-linear-to-br from-primary to-accent flex items-center justify-center">
            <TrendingUp className="h-4 w-4 text-white" />
          </div>
          <span className="text-white font-bold text-lg tracking-tight">BPLAY</span>
          <span className="px-2.5 py-0.5 rounded-full border border-white/20 text-xs text-white/60 font-medium">
            Partner Zone
          </span>
        </div>

        <div className="flex items-center gap-4">
          <button className="relative p-2 rounded-lg text-white/50 hover:text-white transition-colors">
            <Bell className="h-5 w-5" />
          </button>
          <DropdownMenu
            trigger={
              <button className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
                <div className="h-9 w-9 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center">
                  <span className="text-sm font-bold text-primary">{getInitials(name)}</span>
                </div>
                <div className="hidden sm:flex flex-col items-start">
                  <span className="text-sm font-semibold text-white leading-none">{name}</span>
                  <span className="text-xs text-white/40 mt-0.5">{roleLabel}</span>
                </div>
                <ChevronDown className="h-4 w-4 text-white/30" />
              </button>
            }
            items={[
              { label: "Sign out", onClick: () => signOut({ callbackUrl: "/login" }), variant: "danger" },
            ]}
          />
        </div>
      </div>

      {/* Nav tabs */}
      <nav className="flex items-center gap-1 px-6 pb-0">
        {visibleItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-t-lg text-sm font-medium transition-all",
                active
                  ? "bg-primary text-white shadow-[0_0_20px_rgba(124,92,255,0.3)]"
                  : "text-white/50 hover:text-white/80 hover:bg-white/5"
              )}
            >
              {item.icon}
              {item.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
