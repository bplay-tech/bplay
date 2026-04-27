"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  TrendingUp,
  Wallet,
  ShoppingCart,
  Settings,
  Users,
  Package,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { BplayLogo } from "@/components/ui/BplayLogo";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  roles?: string[];
}

const NAV_ITEMS: NavItem[] = [
  { label: "Overview", href: "/dashboard/overview", icon: <LayoutDashboard className="h-4 w-4" /> },
  { label: "Buy BPLAY", href: "/dashboard/buy", icon: <ShoppingCart className="h-4 w-4" /> },
  { label: "Sales & Referrals", href: "/dashboard/sales", icon: <TrendingUp className="h-4 w-4" />, roles: ["ADMIN", "SUPER_ADMIN"] },
  { label: "Payouts", href: "/dashboard/payouts", icon: <Wallet className="h-4 w-4" />, roles: ["ADMIN", "SUPER_ADMIN"] },
  { label: "Team", href: "/dashboard/team", icon: <Users className="h-4 w-4" />, roles: ["ADMIN", "SUPER_ADMIN"] },
  { label: "Purchases", href: "/dashboard/purchases", icon: <Package className="h-4 w-4" />, roles: ["SUPER_ADMIN"] },
  { label: "Exchange Rate", href: "/dashboard/exchange-rate", icon: <RefreshCw className="h-4 w-4" />, roles: ["SUPER_ADMIN"] },
  { label: "Settings", href: "/dashboard/settings", icon: <Settings className="h-4 w-4" /> },
];

interface SidebarProps {
  role: string;
}

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();

  const visibleItems = NAV_ITEMS.filter(
    (item) => !item.roles || item.roles.includes(role)
  );

  return (
    <aside className="flex flex-col w-60 min-h-screen bg-card border-r border-card-border px-3 py-6 shrink-0">
      <div className="px-3 mb-8">
        <BplayLogo size="md" />
      </div>
      <nav className="flex flex-col gap-1 flex-1">
        {visibleItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-primary/10 text-primary"
                  : "text-muted hover:bg-card-border/30 hover:text-foreground"
              )}
            >
              {item.icon}
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
