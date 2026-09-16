export interface MarketItem {
  id: string;
  urlName: string;
  itemName: string;
  thumb: string;
}

export interface MarketUser {
  ingameName: string;
  status: 'ingame' | 'online' | 'offline';
  reputation: number;
}

export interface MarketOrder {
  orderType: 'sell' | 'buy';
  platinum: number;
  quantity: number;
  modRank?: number;
  user: MarketUser;
  platform: 'pc' | 'xbox' | 'ps4' | 'switch';
}

export interface MarketPriceSummary {
  slug: string;
  itemName: string;
  minSell: number | null; // Lowest active sell price (Buy Now)
  maxBuy: number | null; // Highest active buy price (Sell Now)
  activeOrderCount: number;
  onlineSellersCount: number;
  marketUrl: string;
  updatedAt: string;
  isCached?: boolean;
}

export interface MarketPartPriceEntry {
  partName: string;
  slug: string;
  minSell: number | null;
  maxBuy: number | null;
  marketUrl: string;
}

export interface PrimeSetMarketBreakdown {
  baseItemName: string;
  setSummary: MarketPriceSummary | null;
  parts: MarketPartPriceEntry[];
  totalPartsMinSell: number | null;
  setVsPartsDifference: number | null; // negative means buying parts separately is cheaper
  updatedAt: string;
}
