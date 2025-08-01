import { create } from 'zustand';
import { OrderBookData, IncrementalUpdate } from '@/lib/types/orderbook';
import { createVenueClient , getAllVenues } from '@/lib/venue/venue-factory';
import { VenueClient } from '@/lib/venue/base-venue';
import { mergeOrderBookUpdate } from '@/lib/utils/orderbook-merger';

interface ScalableOrderbookStore {
  // Dynamic venue data
  orderbooks: Record<string, OrderBookData | null>;
  loading: Record<string, boolean>;
  errors: Record<string, string | null>;
  wsConnected: Record<string, boolean>;
  
  // Venue clients
  venueClients: Record<string, VenueClient>;
  
  // UI state
  selectedVenue: string;
  selectedSymbol: string;
  
  // Actions
  initializeVenues: () => void;
  setOrderbook: (venue: string, data: OrderBookData) => void;
  updateOrderbook: (venue: string, updates: IncrementalUpdate) => void;
  setVenue: (venue: string) => void;
  setSymbol: (symbol: string) => void;
  setLoading: (venue: string, loading: boolean) => void;
  setError: (venue: string, error: string | null) => void;
  setWSConnected: (venue: string, connected: boolean) => void;
  
  // Data fetching
  fetchOrderbookForVenue: (venue: string, symbol: string) => Promise<void>;
  connectVenueWebSocket: (venue: string) => Promise<void>;
  
  // Getters
  getCurrentOrderbook: () => OrderBookData | null;
  getAvailableVenues: () => string[];
}

export const useScalableOrderbookStore = create<ScalableOrderbookStore>((set, get) => ({
  // Initialize empty states
  orderbooks: {},
  loading: {},
  errors: {},
  wsConnected: {},
  venueClients: {},
  
  selectedVenue: 'okx',
  selectedSymbol: 'BTC-USDT',
  
  // Initialize all venues dynamically
  initializeVenues: () => {
    const venues = getAllVenues();
    const initialOrderbooks: Record<string, OrderBookData | null> = {};
    const initialLoading: Record<string, boolean> = {};
    const initialErrors: Record<string, string | null> = {};
    const initialWSConnected: Record<string, boolean> = {};
    const venueClients: Record<string, VenueClient> = {};
    
    venues.forEach(venue => {
      initialOrderbooks[venue] = null;
      initialLoading[venue] = false;
      initialErrors[venue] = null;
      initialWSConnected[venue] = false;
      
      // Create venue client
      const client = createVenueClient(venue);
      
      // Setup callbacks
      client.onOrderbookUpdate = (updates) => {
        get().updateOrderbook(venue, updates);
      };
      
      client.onConnectionChange = (connected) => {
        get().setWSConnected(venue, connected);
      };
      
      client.onError = (error) => {
        get().setError(venue, error);
      };
      
      venueClients[venue] = client;
    });
    
    set({
      orderbooks: initialOrderbooks,
      loading: initialLoading,
      errors: initialErrors,
      wsConnected: initialWSConnected,
      venueClients,
    });
  },
  
  // Generic actions  work with any venue
  setOrderbook: (venue, data) => set((state) => ({
    orderbooks: { ...state.orderbooks, [venue]: data },
    errors: { ...state.errors, [venue]: null },
  })),
  
  updateOrderbook: (venue, updates) => set((state) => {
    const current = state.orderbooks[venue];
    if (!current) return state;
    
    // / merging logic
    const merged = mergeOrderBookUpdate(current, updates);
    
    return {
      orderbooks: { ...state.orderbooks, [venue]: merged },
    };
  }),
  
  setVenue: (venue) => set({ selectedVenue: venue }),
  setSymbol: (symbol) => set({ selectedSymbol: symbol }),
  setLoading: (venue, loading) => set((state) => ({
    loading: { ...state.loading, [venue]: loading },
  })),
  setError: (venue, error) => set((state) => ({
    errors: { ...state.errors, [venue]: error },
    loading: { ...state.loading, [venue]: false },
  })),
  setWSConnected: (venue, connected) => set((state) => ({
    wsConnected: { ...state.wsConnected, [venue]: connected },
  })),
  
  // Generic data fetching
  fetchOrderbookForVenue: async (venue, symbol) => {
    const { venueClients, setLoading, setOrderbook, setError } = get();
    const client = venueClients[venue];
    
    if (!client) {
      setError(venue, `No client for venue: ${venue}`);
      return;
    }
    
    setLoading(venue, true);
    
    try {
      const data = await client.fetchOrderbook(symbol);
      setOrderbook(venue, data);
    } catch (error) {
      setError(venue, error instanceof Error ? error.message : 'Failed to fetch');
    } finally {
      setLoading(venue, false);
    }
  },
  
  connectVenueWebSocket: async (venue) => {
    const { venueClients, setError , selectedSymbol } = get();
    const client = venueClients[venue];
    
    if (!client) return;
    
    try {
      await client.connectWebSocket();
      await new Promise(resolve => setTimeout(resolve, 100));
      if(selectedSymbol){
        client.subscribeToOrderbook(selectedSymbol);
      }
    } catch {
      setError(venue, `WebSocket connection failed: ${venue}`);
    }
  },
  
  // Get
  getCurrentOrderbook: () => {
    const { orderbooks, selectedVenue } = get();
    return orderbooks[selectedVenue] || null;
  },
  
  getAvailableVenues: () => getAllVenues(),
}));