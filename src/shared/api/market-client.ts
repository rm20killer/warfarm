import { MarketItem, MarketOrder, MarketStatistics } from '../types/market';
import { RateLimiter } from '../utils/rate-limiter';

const BASE_URL = 'https://api.warframe.market/v1';
const rateLimiter = new RateLimiter(3, 1);

async function request<T>(endpoint: string): Promise<T> {
  await rateLimiter.acquire();
  const response = await fetch(`${BASE_URL}${endpoint}`);
  if (!response.ok) {
    throw new Error(`Market API error: ${response.status} ${response.statusText}`);
  }
  const data = await response.json();
  return data.payload;
}

export async function fetchAllItems(): Promise<MarketItem[]> {
  const payload = await request<{ items: MarketItem[] }>('/items');
  return payload.items;
}

export async function fetchOrders(urlName: string): Promise<MarketOrder[]> {
  const payload = await request<{ orders: MarketOrder[] }>(`/items/${urlName}/orders`);
  return payload.orders;
}

export async function fetchStatistics(urlName: string): Promise<{ stats48h: MarketStatistics[]; stats90d: MarketStatistics[] }> {
  const payload = await request<{ statistics_closed: { '48hours': MarketStatistics[]; '90days': MarketStatistics[] } }>(`/items/${urlName}/statistics`);
  return {
    stats48h: payload.statistics_closed['48hours'],
    stats90d: payload.statistics_closed['90days'],
  };
}

export async function getLowestSellPrice(urlName: string, platform: string = 'pc'): Promise<number | null> {
  const orders = await fetchOrders(urlName);
  const validSellOrders = orders.filter(
    (o) =>
      o.orderType === 'sell' &&
      o.platform === platform &&
      (o.user.status === 'ingame' || o.user.status === 'online')
  );

  if (validSellOrders.length === 0) {
    return null;
  }

  return Math.min(...validSellOrders.map((o) => o.platinum));
}

export interface MarketPriceSummary {
  minSell: number | null;
  avgPrice: number | null;
  medianPrice: number | null;
  volume: number;
}

export async function fetchMarketPrice(urlName: string, platform: string = 'pc'): Promise<MarketPriceSummary> {
  const [minSell, stats] = await Promise.all([
    getLowestSellPrice(urlName, platform).catch(() => null),
    fetchStatistics(urlName).catch(() => null),
  ]);

  const latest48h = stats?.stats48h && stats.stats48h.length > 0 ? stats.stats48h[stats.stats48h.length - 1] : null;

  return {
    minSell,
    avgPrice: latest48h?.avgPrice ?? null,
    medianPrice: latest48h?.median ?? null,
    volume: latest48h?.volume ?? 0,
  };
}

