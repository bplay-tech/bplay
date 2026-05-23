"use client";

import { useState } from "react";
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
  Coins,
  Send,
  MessageSquare,
  ChevronDown,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import { BplayLogo } from "@/components/ui/BplayLogo";
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
  { label: "Buy BPLAY", href: "/dashboard/buy", icon: <Coins className="h-4 w-4" /> },
  { label: "Sales & Referrals", href: "/dashboard/sales", icon: <TrendingUp className="h-4 w-4" />, roles: ["SALES", "ADMIN", "SUPER_ADMIN"] },
  { label: "Payouts", href: "/dashboard/payouts", icon: <Wallet className="h-4 w-4" />, roles: ["SALES", "ADMIN", "SUPER_ADMIN"] },
  { label: "Team", href: "/dashboard/team", icon: <Users className="h-4 w-4" />, roles: ["ADMIN", "SUPER_ADMIN"] },
  { label: "Purchases", href: "/dashboard/purchases", icon: <Package className="h-4 w-4" />, roles: ["SUPER_ADMIN"] },
  { label: "Exchange Rate", href: "/dashboard/exchange-rate", icon: <RefreshCw className="h-4 w-4" />, roles: ["SUPER_ADMIN"] },
  { label: "Compose", href: "/dashboard/compose", icon: <Send className="h-4 w-4" />, roles: ["SUPER_ADMIN"] },
  { label: "Messages", href: "/dashboard/messages", icon: <MessageSquare className="h-4 w-4" /> },
  { label: "Settings", href: "/dashboard/settings", icon: <Settings className="h-4 w-4" /> },
];

interface TopNavProps {
  name: string;
  role: string;
  tierName: string;
  notificationBell?: React.ReactNode;
}

function getInitials(name: string) {
  return name.split(" ").slice(0, 2).map((p) => p[0]).join("").toUpperCase();
}

export function TopNav({ name, role, tierName, notificationBell }: TopNavProps) {
  const pathname = usePathname();
  const [navOpen, setNavOpen] = useState(false);
  const tierDisplay = role !== "USER" ? TIER_DISPLAY[tierName as TierName] : null;
  const roleLabel = role.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());

  const visibleItems = NAV_ITEMS.filter(
    (item) => !item.roles || item.roles.includes(role)
  );

  const activeItem = visibleItems.find(
    (item) => pathname === item.href || pathname.startsWith(item.href + "/")
  );

  return (
    <header className="sticky top-0 z-40 bg-bg border-b border-white/5">
      {/* Top bar: logo + user */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 gap-3">
        {/* Left: logo + badge */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <BplayLogo size="md" className="shrink-0" />
          <span className="px-2 sm:px-2.5 py-0.5 rounded-full border border-white/20 text-xs text-white/60 font-medium whitespace-nowrap">
            Partner Zone
          </span>
        </div>

        {/* Right: bell + user */}
        <div className="flex items-center gap-1 sm:gap-3 shrink-0">
          {notificationBell}
          <DropdownMenu
            trigger={
              <button className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center shrink-0">
                  <span className="text-sm font-bold text-primary">{getInitials(name)}</span>
                </div>
                <div className="hidden sm:flex flex-col items-start">
                  <span className="text-sm font-semibold text-white leading-none">{name}</span>
                  {tierDisplay ? (
                    <span className="text-xs mt-0.5 font-medium" style={{ color: tierDisplay.hex }}>
                      {roleLabel} – {tierName}
                    </span>
                  ) : (
                    <span className="text-xs text-white/40 mt-0.5">{roleLabel}</span>
                  )}
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

      {/* Mobile nav: dropdown selector — visible below sm */}
      <div className="sm:hidden px-4 pb-3">
        <button
          onClick={() => setNavOpen((v) => !v)}
          className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-sm font-medium text-white transition-colors hover:bg-white/10"
        >
          <div className="flex items-center gap-2.5 text-white">
            {activeItem?.icon}
            <span>{activeItem?.label ?? "Menu"}</span>
          </div>
          <ChevronDown
            className={cn("h-4 w-4 text-white/40 transition-transform duration-200", navOpen && "rotate-180")}
          />
        </button>

        {navOpen && (
          <div
            className="mt-1.5 rounded-xl border border-white/10 overflow-hidden"
            style={{ background: "#121826" }}
          >
            {visibleItems.map((item) => {
              const active = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setNavOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors border-b border-white/5 last:border-0",
                    active
                      ? "bg-primary/20 text-primary"
                      : "text-white/50 hover:text-white hover:bg-white/5"
                  )}
                >
                  {item.icon}
                  {item.label}
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Desktop nav: horizontal tabs — visible from sm up */}
      <div className="hidden sm:block relative">
        <div className="overflow-x-auto scrollbar-hide">
          <nav className="flex items-center gap-1 px-6 pb-0 min-w-max pr-8">
            {visibleItems.map((item) => {
              const active = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2.5 rounded-t-lg text-sm font-medium transition-all whitespace-nowrap shrink-0",
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
        </div>
        <div className="pointer-events-none absolute right-0 top-0 h-full w-10 bg-linear-to-l from-bg to-transparent" />
      </div>
    </header>
  );
}
