import { BaseVenueClient } from './base-venue';
import { OrderBookData, IncrementalUpdate } from '@/lib/types/orderbook';

interface BybitWebSocketMessage {
  data?: {
    a?: [string, string][];
    b?: [string, string][];
    ts?: number;
  };
  topic?: string;
}

interface BybitRestResponse {
  result: {
    a?: [string, string][];
    b?: [string, string][];
    ts?: number;
  };
}

interface BybitSubscriptionMessage {
  op: string;
  args: string[];
  [key: string]: unknown;
}

export class BybitVenue extends BaseVenueClient {
  async fetchOrderbook(symbol: string): Promise<OrderBookData> {
    const formattedSymbol = this.config.symbolFormat(symbol);
    const data = await this.makeRequest<BybitRestResponse>(`/market/orderbook?category=spot&symbol=${formattedSymbol}&limit=20`);
    return this.normalizeOrderbook(data, symbol);
  }

  processOrderbookMessage(message: BybitWebSocketMessage): IncrementalUpdate | null {
    if (message.data && message.topic?.includes('orderbook')) {
      const data = message.data;
      return {
        askUpdates: data.a?.map(([price, size]: [string, string]) => ({
          price: parseFloat(price),
          quantity: parseFloat(size),
          total: parseFloat(price) * parseFloat(size),
        })) || [],
        bidUpdates: data.b?.map(([price, size]: [string, string]) => ({
          price: parseFloat(price),
          quantity: parseFloat(size),
          total: parseFloat(price) * parseFloat(size),
        })) || [],
        lastUpdate: data.ts || Date.now(),
        isIncremental: true,
      };
    }
    return null;
  }

  createSubscriptionMessage(symbol: string): BybitSubscriptionMessage {
    return {
      op: 'subscribe',
      args: [`orderbook.20.${this.config.symbolFormat(symbol)}`]
    };
  }

  createUnsubscriptionMessage(symbol: string): BybitSubscriptionMessage {
    return {
      op: 'unsubscribe',
      args: [`orderbook.20.${this.config.symbolFormat(symbol)}`]
    };
  }

  private normalizeOrderbook(data: BybitRestResponse, symbol: string): OrderBookData {
    const result = data.result;
    const asks = result.a?.slice(0, 15).map(([price, size]: [string, string]) => ({
      price: parseFloat(price),
      quantity: parseFloat(size),
      total: parseFloat(price) * parseFloat(size),
    })) || [];

    const bids = result.b?.slice(0, 15).map(([price, size]: [string, string]) => ({
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
      lastUpdate: result.ts || Date.now(),
    };
  }
}