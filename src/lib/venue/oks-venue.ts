import { BaseVenueClient } from './base-venue';
import { OrderBookData, IncrementalUpdate } from '@/lib/types/orderbook';

interface OKXWebSocketMessage {
  data?: Array<{
    asks?: [string, string][];
    bids?: [string, string][];
    ts: string;
  }>;
}

interface OKXRestResponse {
  data: Array<{
    asks?: [string, string][];
    bids?: [string, string][];
    ts: string;
  }>;
}

interface OKXSubscriptionMessage {
  op: string;
  args: Array<{ channel: string; instId: string }>;
  [key: string]: unknown;
}

export class OKXVenue extends BaseVenueClient {
  async fetchOrderbook(symbol: string): Promise<OrderBookData> {
    const formattedSymbol = this.config.symbolFormat(symbol);
    const data = await this.makeRequest<OKXRestResponse>(`/market/books?instId=${formattedSymbol}&sz=20`);
    
    return this.normalizeOrderbook(data, symbol);
  }

  processOrderbookMessage(message: OKXWebSocketMessage): IncrementalUpdate | null {
    if (message.data && message.data.length > 0) {
      const data = message.data[0];
      return {
        askUpdates: data.asks?.map(([price, size]: [string, string]) => ({
          price: parseFloat(price),
          quantity: parseFloat(size),
          total: parseFloat(price) * parseFloat(size),
        })) || [],
        bidUpdates: data.bids?.map(([price, size]: [string, string]) => ({
          price: parseFloat(price),
          quantity: parseFloat(size),
          total: parseFloat(price) * parseFloat(size),
        })) || [],
        lastUpdate: parseInt(data.ts),
        isIncremental: true,
      };
    }
    return null;
  }

  createSubscriptionMessage(symbol: string): OKXSubscriptionMessage {
    return {
      op: 'subscribe',
      args: [{ channel: 'books', instId: this.config.symbolFormat(symbol) }]
    };
  }

  createUnsubscriptionMessage(symbol: string): OKXSubscriptionMessage {
    return {
      op: 'unsubscribe',
      args: [{ channel: 'books', instId: this.config.symbolFormat(symbol) }]
    };
  }

  private normalizeOrderbook(data: OKXRestResponse, symbol: string): OrderBookData {
    const orderbookRaw = data.data[0];
    
    const asks = orderbookRaw.asks?.slice(0, 15).map(([price, size]: [string, string]) => ({
      price: parseFloat(price),
      quantity: parseFloat(size),
      total: parseFloat(price) * parseFloat(size),
    })) || [];

    const bids = orderbookRaw.bids?.slice(0, 15).map(([price, size]: [string, string]) => ({
      price: parseFloat(price),
      quantity: parseFloat(size),
      total: parseFloat(price) * parseFloat(size),
    })) || [];

    const bestAsk = asks[0]?.price || 0;
    const bestBid = bids[0]?.price || 0;
    const spread = bestAsk - bestBid;
    const spreadPercent = spread / bestAsk;
    
    return {
      symbol,
      asks,
      bids,
      spread,
      spreadPercent,
      lastUpdate: parseInt(orderbookRaw.ts),
    };
  }
}