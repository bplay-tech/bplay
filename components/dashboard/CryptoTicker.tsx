"use client";

import { useQuery } from "@tanstack/react-query";
import type { CoinPrice } from "@/lib/coingecko";

interface CryptoTickerProps {
  bplayRatePerUsdc: number;
}

function CoinCard({ coin }: { coin: CoinPrice }) {
  const isUp = coin.price_change_percentage_24h >= 0;
  return (
    <div
      className="flex items-center gap-2 px-3 py-2 rounded-xl shrink-0"
      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
    >
      <img src={coin.image} alt={coin.name} className="h-5 w-5 rounded-full" />
      <span className="text-xs font-semibold text-white uppercase">{coin.symbol}</span>
      <span className="text-xs text-white/70">
        ${coin.current_price >= 1 ? coin.current_price.toLocaleString(undefined, { maximumFractionDigits: 2 }) : coin.current_price.toFixed(4)}
      </span>
      <span className={`text-xs font-medium ${isUp ? "text-green-400" : "text-red-400"}`}>
        {isUp ? "+" : ""}{coin.price_change_percentage_24h.toFixed(2)}%
      </span>
    </div>
  );
}

function BplayCard({ ratePerUsdc }: { ratePerUsdc: number }) {
  const priceUsdc = ratePerUsdc > 0 ? (1 / ratePerUsdc).toFixed(4) : "0.0000";
  return (
    <div
      className="flex items-center gap-2 px-3 py-2 rounded-xl shrink-0"
      style={{ background: "rgba(124,92,255,0.15)", border: "1px solid rgba(124,92,255,0.35)" }}
    >
      <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center shrink-0">
        <span className="text-[9px] font-bold text-white">BP</span>
      </div>
      <span className="text-xs font-semibold text-white">BPLAY</span>
      <span className="text-xs text-white/70">${priceUsdc}</span>
      <span className="text-xs font-medium text-purple-400">live</span>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div
      className="h-9 w-36 rounded-xl animate-pulse shrink-0"
      style={{ background: "rgba(255,255,255,0.04)" }}
    />
  );
}

export function CryptoTicker({ bplayRatePerUsdc }: CryptoTickerProps) {
  const { data, isLoading } = useQuery<CoinPrice[]>({
    queryKey: ["cryptoPrices"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/crypto-prices");
        if (!res.ok) return [];
        return res.json();
      } catch {
        return [];
      }
    },
    refetchInterval: 10 * 60 * 1000,
    staleTime: 5 * 60 * 1000,
  });

  const { data: bplayData } = useQuery<{ ratePerUsdc: number }>({
    queryKey: ["bplayRate"],
    queryFn: async () => {
      const res = await fetch("/api/bplay-rate");
      if (!res.ok) return { ratePerUsdc: bplayRatePerUsdc };
      return res.json();
    },
    placeholderData: { ratePerUsdc: bplayRatePerUsdc },
    refetchInterval: 30 * 1000,
    staleTime: 0,
  });

  const liveBplayRate = bplayData?.ratePerUsdc ?? bplayRatePerUsdc;

  const coins = data ?? [];
  const track = [...coins, ...coins];

  return (
    <div className="w-full">
      <style>{`
        @keyframes ticker-slide {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .ticker-track {
          display: flex;
          align-items: center;
          gap: 8px;
          width: max-content;
          animation: ticker-slide 40s linear infinite;
        }
        .ticker-track:hover { animation-play-state: paused; }
      `}</style>

      <div className="flex items-center gap-3">
        {/* BPLAY card — polled every 30s */}
        <div className="shrink-0">
          <BplayCard ratePerUsdc={liveBplayRate} />
        </div>

        {/* Scrolling coins */}
        <div className="overflow-hidden flex-1">
          {isLoading ? (
            <div className="flex items-center gap-2">
              {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : (
            <div className="ticker-track">
              {track.map((coin, i) => <CoinCard key={`${coin.id}-${i}`} coin={coin} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
