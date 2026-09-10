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

export interface MarketStatistics {
  datetime: string;
  minPrice: number;
  maxPrice: number;
  avgPrice: number;
  median: number;
  waPrice: number;
  volume: number;
}

export interface MarketItemDetails {
  item: MarketItem;
  orders: MarketOrder[];
  statistics48h: MarketStatistics[];
  statistics90d: MarketStatistics[];
}
