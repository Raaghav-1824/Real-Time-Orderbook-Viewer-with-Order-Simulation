export interface OrderLevel {
  price: number;
  quantity: number;
  total: number;
}

export interface OrderBookData {
  symbol: string;
  spread: number;
  spreadPercent: number;
  lastUpdate: number;
  asks: OrderLevel[];
  bids: OrderLevel[];
  maxLevel?: number;

}

export interface IncrementalUpdate {
  askUpdates?: OrderLevel[];
  bidUpdates?: OrderLevel[];
  lastUpdate?: number;
  isIncremental?: boolean;
  
}

export type Venue = 'okx' | 'bybit' | 'deribit';