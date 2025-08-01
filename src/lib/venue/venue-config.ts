import { VenueConfig } from './base-venue';

export const VENUE_CONFIGS: Record<string, VenueConfig> = {
  okx: {
    id: 'okx',
    name: 'OKX',
    baseUrl: 'https://www.okx.com/api/v5',
    wsUrl: 'wss://ws.okx.com:8443/ws/v5/public',
    defaultSymbol: 'BTC-USDT',
    symbolFormat: (symbol) => symbol, // OKX uses BTC-USDT format
    supportsWebSocket: true,
  },
  
  bybit: {
    id: 'bybit',
    name: 'Bybit',
    baseUrl: 'https://api.bybit.com/v5',
    wsUrl: 'wss://stream.bybit.com/v5/public/spot',
    defaultSymbol: 'BTCUSDT',
    symbolFormat: (symbol) => symbol.replace('-', ''), // Convert BTC-USDT to BTCUSDT
    supportsWebSocket: true,
  },
  
  deribit: {
    id: 'deribit',
    name: 'Deribit',
    baseUrl: 'https://www.deribit.com/api/v2/public',
    wsUrl: 'wss://www.deribit.com/ws/api/v2',
    defaultSymbol: 'BTC-PERPETUAL',
    symbolFormat: () => 'BTC-PERPETUAL', 
    supportsWebSocket: false, // For now
  },
  
  
 
};