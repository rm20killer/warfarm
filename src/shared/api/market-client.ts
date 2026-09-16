import { MarketPriceSummary, MarketPartPriceEntry, PrimeSetMarketBreakdown } from '../types/market';
import { RateLimiter } from '../utils/rate-limiter';

const BASE_API_URL = 'https://api.warframe.market/v2';
const BASE_WEB_URL = 'https://warframe.market/items';
const rateLimiter = new RateLimiter(3, 1);
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes cache

const memoryCache = new Map<string, { data: MarketPriceSummary; timestamp: number }>();

export function getMarketItemUrl(slugOrName: string): string {
  const slug = slugOrName.includes(' ') || /[A-Z]/.test(slugOrName) ? getItemMarketSlug(slugOrName) : slugOrName;
  return `${BASE_WEB_URL}/${encodeURIComponent(slug)}`;
}

/**
 * Normalizes any Warframe item name into a Warframe.market URL slug.
 */
export function getItemMarketSlug(rawName: string, isSet = false): string {
  let name = rawName.trim();
  if (!name) return '';

  const lower = name.toLowerCase();

  // Handle Relics: "Lith A12", "Lith A12 Relic" -> "lith_a12_relic"
  if (/^(lith|meso|neo|axi|requiem)\s+([a-z0-9]+)(\s+relic)?$/i.test(lower)) {
    const match = lower.match(/^(lith|meso|neo|axi|requiem)\s+([a-z0-9]+)/i);
    if (match) {
      return `${match[1]}_${match[2]}_relic`;
    }
  }

  // Handle Prime component blueprints vs weapon parts
  // Warframe parts in market have "_blueprint" suffix (e.g. rhino_prime_chassis_blueprint)
  if (
    /prime\s+(chassis|neuroptics|systems|harness|wings)/i.test(name) &&
    !name.toLowerCase().endsWith('blueprint')
  ) {
    name = `${name} Blueprint`;
  }

  let slug = name
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');

  const isPrimedMod = /^primed_/i.test(slug);

  // Prime items without component suffix represent the full tradeable Set on Warframe.market (e.g. rhino_prime_set)
  // Primed mods (e.g. primed_continuity) are single mods and must never have _set
  if (!isPrimedMod) {
    const isPrimeRoot = /_prime$/i.test(slug);
    if ((isSet || isPrimeRoot) && !slug.endsWith('_set')) {
      slug = `${slug}_set`;
    }
  }

  return slug;
}

function getStoredCache(slug: string): MarketPriceSummary | null {
  const mem = memoryCache.get(slug);
  if (mem && Date.now() - mem.timestamp < CACHE_TTL_MS) {
    return { ...mem.data, isCached: true };
  }

  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const stored = localStorage.getItem(`wfm_cache_${slug}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed.timestamp === 'number' && Date.now() - parsed.timestamp < CACHE_TTL_MS) {
          memoryCache.set(slug, { data: parsed.data, timestamp: parsed.timestamp });
          return { ...parsed.data, isCached: true };
        }
      }
    } catch {
      // Ignore localStorage errors
    }
  }

  return null;
}

function setStoredCache(slug: string, summary: MarketPriceSummary): void {
  const now = Date.now();
  memoryCache.set(slug, { data: summary, timestamp: now });

  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      localStorage.setItem(`wfm_cache_${slug}`, JSON.stringify({ data: summary, timestamp: now }));
    } catch {
      // Ignore localStorage quota errors
    }
  }
}

async function fetchMarketApi(endpointPath: string): Promise<Response> {
  const isBrowser = typeof window !== 'undefined';

  if (isBrowser) {
    try {
      const proxyUrl = `/api/wfm${endpointPath}`;
      const res = await fetch(proxyUrl, {
        headers: { Accept: 'application/json' },
      });
      if (res.ok || res.status === 404) {
        return res;
      }
    } catch {
      // Fallback to direct API fetch
    }
  }

  return fetch(`${BASE_API_URL}${endpointPath.replace(/^\/v2/, '')}`, {
    headers: { Accept: 'application/json' },
  });
}

/**
 * Fetches live buy/sell market pricing for a given item slug.
 */
export async function fetchMarketPrice(
  slugOrName: string,
  options: { isSet?: boolean; forceRefresh?: boolean; platform?: string } = {}
): Promise<MarketPriceSummary | null> {
  const slug = getItemMarketSlug(slugOrName, options.isSet);
  if (!slug) return null;

  if (!options.forceRefresh) {
    const cached = getStoredCache(slug);
    if (cached) return cached;
  }

  try {
    await rateLimiter.acquire();
    const queryStr = options.forceRefresh ? '?nocache=1' : '';
    const res = await fetchMarketApi(`/v2/orders/item/${slug}${queryStr}`);

    if (!res.ok) {
      if (res.status === 404 && !options.isSet && slugOrName.toLowerCase().endsWith(' prime')) {
        // Try falling back to _set if direct slug not found
        return fetchMarketPrice(slugOrName, { ...options, isSet: true });
      }
      return null;
    }

    const json = await res.json();
    const orders: any[] = json?.data || [];

    const targetPlatform = (options.platform || 'pc').toLowerCase();

    // Filter to active online or ingame traders
    const onlineOrders = orders.filter((o) => {
      const user = o.user;
      if (!user) return false;
      const isOnline = user.status === 'ingame' || user.status === 'online';
      if (!isOnline) return false;
      if (user.crossplay) return true;
      return (user.platform || 'pc').toLowerCase() === targetPlatform;
    });

    const sellOrders = onlineOrders.filter((o) => o.type === 'sell' && typeof o.platinum === 'number');
    const buyOrders = onlineOrders.filter((o) => o.type === 'buy' && typeof o.platinum === 'number');

    const minSell = sellOrders.length > 0 ? Math.min(...sellOrders.map((o) => o.platinum)) : null;
    const maxBuy = buyOrders.length > 0 ? Math.max(...buyOrders.map((o) => o.platinum)) : null;

    const summary: MarketPriceSummary = {
      slug,
      itemName: slugOrName,
      minSell,
      maxBuy,
      activeOrderCount: onlineOrders.length,
      onlineSellersCount: sellOrders.length,
      marketUrl: getMarketItemUrl(slug),
      updatedAt: new Date().toISOString(),
      isCached: false,
    };

    setStoredCache(slug, summary);
    return summary;
  } catch (err) {
    console.warn(`Could not fetch warframe.market orders for ${slug}:`, err);
    // Return stale cache if available upon network failure
    const stale = memoryCache.get(slug);
    if (stale) return { ...stale.data, isCached: true };
    return null;
  }
}

/**
 * Concurrently fetches live pricing for a Prime Set and all its component blueprints/parts.
 */
export async function fetchPrimeSetMarketBreakdown(
  primeBaseName: string,
  rawPartNames: string[] = [],
  options: { forceRefresh?: boolean; platform?: string } = {}
): Promise<PrimeSetMarketBreakdown> {
  const cleanBase = primeBaseName.replace(/\s+Set$/i, '').trim();

  let partNames = rawPartNames;
  if (partNames.length === 0) {
    const lower = cleanBase.toLowerCase();
    const isWarframe = !/rifle|bow|shotgun|pistol|dagger|sword|blade|glaive|hammer|scythe|polearm|whip|gunblade/i.test(lower);
    if (isWarframe) {
      partNames = [
        `${cleanBase} Blueprint`,
        `${cleanBase} Neuroptics Blueprint`,
        `${cleanBase} Chassis Blueprint`,
        `${cleanBase} Systems Blueprint`,
      ];
    } else {
      partNames = [
        `${cleanBase} Blueprint`,
        `${cleanBase} Barrel`,
        `${cleanBase} Receiver`,
        `${cleanBase} Stock`,
      ];
    }
  }

  // Fetch Set price and all parts prices in parallel
  const [setSummary, ...partSummaries] = await Promise.all([
    fetchMarketPrice(cleanBase, { isSet: true, forceRefresh: options.forceRefresh, platform: options.platform }),
    ...partNames.map((pName) =>
      fetchMarketPrice(pName, { isSet: false, forceRefresh: options.forceRefresh, platform: options.platform })
    ),
  ]);

  const parts: MarketPartPriceEntry[] = partNames.map((pName, idx) => {
    const pSum = partSummaries[idx];
    const slug = getItemMarketSlug(pName);
    return {
      partName: pName,
      slug,
      minSell: pSum?.minSell ?? null,
      maxBuy: pSum?.maxBuy ?? null,
      marketUrl: getMarketItemUrl(slug),
    };
  });

  const validPartSells = parts.map((p) => p.minSell).filter((p): p is number => typeof p === 'number');
  const allPartsHavePrices = validPartSells.length === parts.length && parts.length > 0;
  const totalPartsMinSell = allPartsHavePrices ? validPartSells.reduce((a, b) => a + b, 0) : null;

  let setVsPartsDifference: number | null = null;
  if (totalPartsMinSell !== null && setSummary?.minSell !== null && setSummary?.minSell !== undefined) {
    setVsPartsDifference = totalPartsMinSell - setSummary.minSell;
  }

  return {
    baseItemName: cleanBase,
    setSummary,
    parts,
    totalPartsMinSell,
    setVsPartsDifference,
    updatedAt: new Date().toISOString(),
  };
}
