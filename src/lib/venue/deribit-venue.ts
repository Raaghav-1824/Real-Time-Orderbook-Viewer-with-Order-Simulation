import { BaseVenueClient } from './base-venue';
import { OrderBookData, IncrementalUpdate } from '@/lib/types/orderbook';

interface DeribitWebSocketMessage {
  method?: string;
  params?: {
    channel?: string;
    data?: {
      asks?: [number, number][];
      bids?: [number, number][];
      timestamp?: number;
    };
  };
}

interface DeribitRestResponse {
  result: {
    asks?: [number, number][];
    bids?: [number, number][];
    timestamp?: number;
  };
}

interface DeribitSubscriptionMessage {
  method: string;
  params: {
    channels: string[];
  };
  [key: string]: unknown;
}

export class DeribitVenue extends BaseVenueClient {
  async fetchOrderbook(symbol: string): Promise<OrderBookData> {
    const formattedSymbol = this.config.symbolFormat(symbol);
    const data = await this.makeRequest<DeribitRestResponse>(`/get_order_book?instrument_name=${formattedSymbol}&depth=20`);
    return this.normalizeOrderbook(data, symbol);
  }

  processOrderbookMessage(message: DeribitWebSocketMessage): IncrementalUpdate | null {
    if (message.method === 'subscription' && message.params?.channel?.includes('book')) {
      const data = message.params.data;
      if (!data) return null;
      
      return {
        askUpdates: data.asks?.map((ask: [number, number]) => ({
          price: ask[0],
          quantity: ask[1],
          total: ask[0] * ask[1],
        })) || [],
        bidUpdates: data.bids?.map((bid: [number, number]) => ({
          price: bid[0],
          quantity: bid[1],
          total: bid[0] * bid[1],
        })) || [],
        lastUpdate: data.timestamp || Date.now(),
        isIncremental: true,
      };
    }
    return null;
  }

  createSubscriptionMessage(symbol: string): DeribitSubscriptionMessage {
    return {
      method: 'public/subscribe',
      params: {
        channels: [`book.${this.config.symbolFormat(symbol)}.20.100ms`]
      }
    };
  }

  createUnsubscriptionMessage(symbol: string): DeribitSubscriptionMessage {
    return {
      method: 'public/unsubscribe',
      params: {
        channels: [`book.${this.config.symbolFormat(symbol)}.20.100ms`]
      }
    };
  }

  private normalizeOrderbook(data: DeribitRestResponse, symbol: string): OrderBookData {
    const result = data.result;
    const asks = result.asks?.slice(0, 15).map((ask: [number, number]) => ({
      price: ask[0],
      quantity: ask[1],
      total: ask[0] * ask[1],
    })) || [];

    const bids = result.bids?.slice(0, 15).map((bid: [number, number]) => ({
      price: bid[0],
      quantity: bid[1],
      total: bid[0] * bid[1],
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
      lastUpdate: result.timestamp || Date.now(),
    };
  }
} 