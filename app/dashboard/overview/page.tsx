export const dynamic = "force-dynamic";

import Link from "next/link";
import {
  ArrowUpRight,
  ChevronRight,
  DollarSign,
  Clock,
  Target,
  Zap,
  UserPlus,
  Copy,
  Newspaper,
  ShoppingCart,
  TrendingUp,
} from "lucide-react";
import { verifySession } from "@/lib/dal";
import { getDashboardStats, getTransactionsByUser } from "@/db/queries/transactions";
import { getBplayBalance, getTeamTokensSold, getTokenPurchaseHistory, getAffiliateTurnoverUsd } from "@/db/queries/bplay-purchases";
import { countReferrals } from "@/db/queries/affiliations";
import { getAllPartnerTiers, getPartnerTierByName } from "@/db/queries/partner-tiers";
import { getUserById } from "@/db/queries/users";
import { getCurrentExchangeRate } from "@/db/queries/exchange-rates";
import { getRecentSystemMessages } from "@/db/queries/system-messages";
import { buildReferralUrl } from "@/lib/referral";
import { formatUsd, formatBplay } from "@/lib/exchange";
import { TIER_DISPLAY, type TierName } from "@/lib/tiers";
import { CopyButton } from "@/components/ui/CopyButton";
import { TokenChart } from "@/features/purchases/components/TokenChart";
import { WelcomeBanner } from "@/components/dashboard/WelcomeBanner";
import { CryptoTicker } from "@/components/dashboard/CryptoTicker";

export default async function OverviewPage() {
  const user = await verifySession();
  const isUser = user.role === "USER";

  const [bplayBalance, rate, newsItems] = await Promise.all([
    getBplayBalance(user.id),
    getCurrentExchangeRate(),
    getRecentSystemMessages(3),
  ]);

  const currentRate = parseFloat(rate?.rate ?? "0");
  // rate is BPLAY per USDC (e.g. 6.67), so 1 BPLAY = 1/rate USDC
  const bplayUsdValue = currentRate > 0 ? bplayBalance / currentRate : 0;
  const firstName = user.name?.split(" ")[0] ?? "there";

  if (isUser) {
    const chartData = await getTokenPurchaseHistory(user.id);

    return (
      <div className="flex flex-col gap-6">
        <WelcomeBanner firstName={firstName} role={user.role} />
        <CryptoTicker bplayRatePerUsdc={currentRate} />

        {/* Balance Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-2xl p-5 flex flex-col gap-3" style={{ background: "#121826", border: "1px solid rgba(255,255,255,0.07)" }}>
            <div className="flex items-start justify-between">
              <p className="text-xs text-white/40 font-medium tracking-wide">BPLAY Balance</p>
              <div className="h-9 w-9 rounded-full flex items-center justify-center" style={{ background: "rgba(124,92,255,0.2)" }}>
                <Zap className="h-4 w-4 text-purple-400" />
              </div>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{bplayBalance > 0 ? bplayBalance.toLocaleString() : "0"} BPLAY</p>
              <p className="text-xs text-white/40 mt-1">{formatUsd(bplayUsdValue)}</p>
            </div>
          </div>

          <div
            className="rounded-2xl p-5 flex flex-col items-center justify-center gap-3 cursor-pointer hover:opacity-90 transition-opacity"
            style={{ background: "linear-gradient(135deg, rgba(124,92,255,0.3) 0%, rgba(0,180,150,0.2) 100%)", border: "1px solid rgba(124,92,255,0.4)" }}
          >
            <ShoppingCart className="h-8 w-8 text-purple-300" />
            <p className="text-sm font-semibold text-white">Buy BPLAY Tokens</p>
            <Link
              href="/dashboard/buy"
              className="px-4 py-1.5 rounded-lg text-xs font-semibold text-white"
              style={{ background: "rgba(124,92,255,0.6)" }}
            >
              Go to Buy
            </Link>
          </div>
        </div>

        {/* Token Growth Chart */}
        <div className="rounded-2xl p-6" style={{ background: "#121826", border: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="flex items-center gap-2 mb-4">
            <Zap className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold text-white">BPLAY Growth</h2>
          </div>
          <TokenChart data={chartData} />
        </div>

        {/* Company News */}
        <div className="rounded-2xl p-6" style={{ background: "#121826", border: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="flex items-center gap-2 mb-4">
            <Newspaper className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold text-white">Company News</h2>
          </div>
          <div className="flex flex-col divide-y" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
            {newsItems.length === 0 ? (
              <p className="text-sm text-white/30 py-4">No announcements yet.</p>
            ) : (
              newsItems.map((item) => (
                <div key={item.id} className="py-4 first:pt-0 last:pb-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-white">{item.title}</p>
                      <p className="text-xs text-white/40 mt-1">
                        {item.body.slice(0, 120)}{item.body.length > 120 ? "…" : ""}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className="text-xs text-white/30">
                        {new Date(item.createdAt).toISOString().split("T")[0]}
                      </span>
                      <Link
                        href={`/dashboard/news/${item.id}`}
                        className="text-xs text-primary hover:underline"
                      >
                        Read more
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  }

  // ADMIN / SALES / SUPER_ADMIN view
  const [stats, referralCount, tier, recentTxns, teamSales, allTiers, totalTurnover, freshUser] = await Promise.all([
    getDashboardStats(user.id),
    countReferrals(user.id),
    getPartnerTierByName(user.tierName),
    getTransactionsByUser(user.id),
    getTeamTokensSold(user.id),
    getAllPartnerTiers(),
    getAffiliateTurnoverUsd(user.id),
    getUserById(user.id),
  ]);

  const recent = recentTxns.slice(-5).reverse();
  const conversionRate = referralCount > 0
    ? ((stats.totalSales / referralCount) * 100).toFixed(1)
    : "0.0";
  const referralUrl = buildReferralUrl(user.referralCode, process.env.NEXTAUTH_URL ?? "http://localhost:3000");
  const commissionRate = parseFloat(tier?.commissionRate ?? "0");
  const tierDisplay = TIER_DISPLAY[user.tierName as TierName];
  const cumulatedCommissions = parseFloat(freshUser?.cumulatedCommissions ?? "0");

  return (
    <div className="flex flex-col gap-6">
      <WelcomeBanner
        firstName={firstName}
        role={user.role}
        tierName={user.tierName}
        commissionRate={commissionRate}
        totalTurnover={totalTurnover}
        allTiers={allTiers.map((t) => ({
          name: t.name,
          minTurnoverUsd: t.minTurnoverUsd,
          commissionRate: t.commissionRate,
          color: t.color,
        }))}
      />
      <CryptoTicker bplayRatePerUsdc={currentRate} />

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="rounded-2xl p-5 flex flex-col gap-3" style={{ background: "#121826", border: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="flex items-start justify-between">
            <p className="text-xs text-white/40 font-medium tracking-wide">BPLAY Balance</p>
            <div className="h-9 w-9 rounded-full flex items-center justify-center" style={{ background: "rgba(124,92,255,0.2)" }}>
              <Zap className="h-4 w-4 text-purple-400" />
            </div>
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{bplayBalance > 0 ? bplayBalance.toLocaleString() : "0"}</p>
            <p className="text-xs text-white/40 mt-1">{formatUsd(bplayUsdValue)}</p>
          </div>
        </div>

        <div className="rounded-2xl p-5 flex flex-col gap-3" style={{ background: "#121826", border: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="flex items-start justify-between">
            <p className="text-xs text-white/40 font-medium tracking-wide">Total Earnings</p>
            <div className="h-9 w-9 rounded-full flex items-center justify-center" style={{ background: "rgba(34,197,94,0.2)" }}>
              <DollarSign className="h-4 w-4 text-green-400" />
            </div>
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{formatUsd(stats.totalEarnings)}</p>
            <p className="text-xs text-green-400 mt-1 flex items-center gap-1">
              <ArrowUpRight className="h-3 w-3" />
              Confirmed commissions
            </p>
          </div>
        </div>

        <div className="rounded-2xl p-5 flex flex-col gap-3" style={{ background: "#121826", border: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="flex items-start justify-between">
            <p className="text-xs text-white/40 font-medium tracking-wide">Pending Commission</p>
            <div className="h-9 w-9 rounded-full flex items-center justify-center" style={{ background: "rgba(245,158,11,0.2)" }}>
              <Clock className="h-4 w-4 text-yellow-400" />
            </div>
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{formatUsd(stats.pendingAmount)}</p>
            <p className="text-xs text-white/40 mt-1">Awaiting confirmation</p>
          </div>
        </div>

        <div className="rounded-2xl p-5 flex flex-col gap-3" style={{ background: "#121826", border: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="flex items-start justify-between">
            <p className="text-xs text-white/40 font-medium tracking-wide">Conversion Rate</p>
            <div className="h-9 w-9 rounded-full flex items-center justify-center" style={{ background: "rgba(20,184,166,0.2)" }}>
              <Target className="h-4 w-4 text-teal-400" />
            </div>
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{conversionRate}%</p>
            <p className="text-xs text-white/40 mt-1">{stats.totalSales} sales / {referralCount} refs</p>
          </div>
        </div>

        <div className="rounded-2xl p-5 flex flex-col gap-3" style={{ background: "#121826", border: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="flex items-start justify-between">
            <p className="text-xs text-white/40 font-medium tracking-wide">Team Tokens Sold</p>
            <div className="h-9 w-9 rounded-full flex items-center justify-center" style={{ background: "rgba(124,92,255,0.2)" }}>
              <Zap className="h-4 w-4 text-purple-400" />
            </div>
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{teamSales.totalBplay.toLocaleString()}</p>
            <p className="text-xs text-white/40 mt-1">BPLAY transferred</p>
          </div>
        </div>

        <div className="rounded-2xl p-5 flex flex-col gap-3" style={{ background: "#121826", border: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="flex items-start justify-between">
            <p className="text-xs text-white/40 font-medium tracking-wide">Total USDC Volume</p>
            <div className="h-9 w-9 rounded-full flex items-center justify-center" style={{ background: "rgba(34,197,94,0.2)" }}>
              <DollarSign className="h-4 w-4 text-green-400" />
            </div>
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{formatUsd(teamSales.totalUsdc)}</p>
            <p className="text-xs text-white/40 mt-1">From team purchases</p>
          </div>
        </div>

        <div className="rounded-2xl p-5 flex flex-col gap-3" style={{ background: "#121826", border: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="flex items-start justify-between">
            <p className="text-xs text-white/40 font-medium tracking-wide">Cumulated Commissions</p>
            <div className="h-9 w-9 rounded-full flex items-center justify-center" style={{ background: "rgba(124,92,255,0.2)" }}>
              <TrendingUp className="h-4 w-4 text-purple-400" />
            </div>
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{formatUsd(cumulatedCommissions)}</p>
            <p className="text-xs text-purple-400 mt-1">All-time provisions earned</p>
          </div>
        </div>
      </div>

      {/* Affiliate Link */}
      <div className="rounded-2xl p-6" style={{ background: "#121826", border: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="flex items-center gap-2 mb-1">
          <UserPlus className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold text-white">Your Affiliate Link</h2>
        </div>
        <p className="text-xs text-white/40 mb-4">Share this link to earn {commissionRate}% on every token purchase</p>

        <div className="flex items-center gap-2 sm:gap-3 mb-6">
          <div
            className="flex-1 min-w-0 flex items-center px-3 sm:px-4 py-3 rounded-xl text-xs sm:text-sm font-mono text-white/50"
            style={{ background: "#0B0F1A", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            <span className="truncate">{referralUrl}</span>
          </div>
          <CopyButton text={referralUrl} className="shrink-0" />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          {[
            { label: "Referrals", value: referralCount },
            { label: "Conversions", value: stats.totalSales },
            { label: "Conv. Rate", value: `${conversionRate}%` },
            { label: "Commission", value: `${commissionRate}%` },
          ].map(({ label, value }) => (
            <div key={label} className="text-center">
              <p className="text-xl font-bold text-white">{value}</p>
              <p className="text-xs text-white/40 mt-1">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Company News */}
      <div className="rounded-2xl p-6" style={{ background: "#121826", border: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="flex items-center gap-2 mb-4">
          <Newspaper className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold text-white">Company News</h2>
        </div>
        <div className="flex flex-col divide-y" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
          {newsItems.length === 0 ? (
            <p className="text-sm text-white/30 py-4">No announcements yet.</p>
          ) : (
            newsItems.map((item) => (
              <div key={item.id} className="py-4 first:pt-0 last:pb-0">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-white">{item.title}</p>
                    <p className="text-xs text-white/40 mt-1">
                      {item.body.slice(0, 120)}{item.body.length > 120 ? "…" : ""}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className="text-xs text-white/30">
                      {new Date(item.createdAt).toISOString().split("T")[0]}
                    </span>
                    <Link
                      href={`/dashboard/news/${item.id}`}
                      className="text-xs text-primary hover:underline"
                    >
                      Read more
                    </Link>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="rounded-2xl p-6" style={{ background: "#121826", border: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-sm font-semibold text-white">Recent Activity</h2>
            <p className="text-xs text-white/40 mt-0.5">Your latest sales and transactions</p>
          </div>
          <Link
            href="/dashboard/sales"
            className="flex items-center gap-1 text-xs text-white/40 hover:text-white/70 transition-colors"
          >
            View All <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {recent.length === 0 ? (
          <p className="text-sm text-white/30 text-center py-8">No transactions yet.</p>
        ) : (
          <div className="flex flex-col divide-y" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
            {recent.map((tx) => {
              const isSale = tx.type === "SALE";
              const isReferral = tx.type === "REFERRAL";
              const isPayout = tx.type === "PAYOUT";

              const iconBg = isSale
                ? "rgba(34,197,94,0.2)"
                : isReferral
                ? "rgba(124,92,255,0.2)"
                : "rgba(59,130,246,0.2)";
              const iconColor = isSale ? "#4ade80" : isReferral ? "#a78bfa" : "#60a5fa";
              const amountColor = isPayout ? "#60a5fa" : isReferral ? "#a78bfa" : "#4ade80";
              const prefix = isPayout ? "-" : "+";

              return (
                <div key={tx.id} className="flex items-center justify-between py-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="h-9 w-9 rounded-full flex items-center justify-center shrink-0"
                      style={{ background: iconBg }}
                    >
                      {isSale || isReferral ? (
                        <DollarSign className="h-4 w-4" style={{ color: iconColor }} />
                      ) : (
                        <Copy className="h-4 w-4" style={{ color: iconColor }} />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white capitalize">{tx.type.charAt(0) + tx.type.slice(1).toLowerCase()}</p>
                      <p className="text-xs text-white/40">{new Date(tx.createdAt).toISOString().split("T")[0]}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold" style={{ color: amountColor }}>
                      {prefix}{formatUsd(tx.amount)}
                    </p>
                    {!isPayout && (
                      <p className="text-xs mt-0.5 text-white/30">
                        {commissionRate}% {isReferral ? "referral bonus" : "commission"}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
