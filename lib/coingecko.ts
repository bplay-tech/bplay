const TOP_COIN_IDS = [
  "bitcoin",
  "ethereum",
  "tether",
  "binancecoin",
  "solana",
  "ripple",
  "usd-coin",
  "dogecoin",
  "cardano",
  "avalanche-2",
].join(",");

export interface CoinPrice {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  price_change_percentage_24h: number;
}

export const fetchTopCryptos = async (): Promise<CoinPrice[]> => {
  try {
    const res = await fetch(
      `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${TOP_COIN_IDS}&order=market_cap_desc&per_page=10&sparkline=false`,
      { next: { revalidate: 600 } }
    );
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
};
