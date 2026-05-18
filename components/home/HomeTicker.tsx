"use client";

import { useEffect, useState } from "react";
import type { CoinPrice } from "@/lib/coingecko";

const PLACEHOLDER: CoinPrice[] = [
  { id: "bitcoin",     symbol: "btc", name: "Bitcoin",  image: "", current_price: 0, price_change_percentage_24h: 0 },
  { id: "ethereum",    symbol: "eth", name: "Ethereum", image: "", current_price: 0, price_change_percentage_24h: 0 },
  { id: "solana",      symbol: "sol", name: "Solana",   image: "", current_price: 0, price_change_percentage_24h: 0 },
  { id: "binancecoin", symbol: "bnb", name: "BNB",      image: "", current_price: 0, price_change_percentage_24h: 0 },
  { id: "ripple",      symbol: "xrp", name: "XRP",      image: "", current_price: 0, price_change_percentage_24h: 0 },
  { id: "dogecoin",    symbol: "doge",name: "Dogecoin", image: "", current_price: 0, price_change_percentage_24h: 0 },
];

function CoinChip({ coin, loading }: { coin: CoinPrice; loading: boolean }) {
  if (loading) {
    return (
      <div
        className="h-8 w-32 rounded-full animate-pulse shrink-0 mx-3"
        style={{ background: "rgba(255,255,255,0.05)" }}
      />
    );
  }

  const isUp = coin.price_change_percentage_24h >= 0;
  const price =
    coin.current_price >= 1
      ? coin.current_price.toLocaleString(undefined, { maximumFractionDigits: 2 })
      : coin.current_price.toFixed(4);

  return (
    <div className="flex items-center gap-2 px-4 shrink-0">
      {coin.image ? (
        <img src={coin.image} alt={coin.name} className="h-4 w-4 rounded-full" />
      ) : (
        <div className="h-4 w-4 rounded-full" style={{ background: "rgba(255,255,255,0.1)" }} />
      )}
      <span className="text-xs font-semibold text-white/80 uppercase">{coin.symbol}</span>
      <span className="text-xs text-white/50">${price}</span>
      <span className={`text-xs font-medium ${isUp ? "text-green-400" : "text-red-400"}`}>
        {isUp ? "+" : ""}{coin.price_change_percentage_24h.toFixed(2)}%
      </span>
      <span className="text-white/15 mx-1">·</span>
    </div>
  );
}

export function HomeTicker() {
  const [coins, setCoins] = useState<CoinPrice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/crypto-prices")
      .then((r) => (r.ok ? r.json() : []))
      .then((data: CoinPrice[]) => {
        if (data.length > 0) setCoins(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const items = loading ? PLACEHOLDER : coins;
  // Duplicate so the loop is seamless
  const track = [...items, ...items];

  return (
    <div
      className="w-full overflow-hidden border-t"
      style={{ borderColor: "rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)" }}
    >
      <style>{`
        @keyframes marquee {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .ticker-track {
          display: flex;
          align-items: center;
          width: max-content;
          animation: marquee 35s linear infinite;
        }
        .ticker-track:hover {
          animation-play-state: paused;
        }
      `}</style>
      <div className="py-3">
        <div className="ticker-track">
          {track.map((coin, i) => (
            <CoinChip key={`${coin.id}-${i}`} coin={coin} loading={loading} />
          ))}
        </div>
      </div>
    </div>
  );
}
