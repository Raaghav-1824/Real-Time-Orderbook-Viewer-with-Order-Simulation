import { OrderBookData, IncrementalUpdate } from "@/lib/types/orderbook";

// WebSocket message types
interface SubscriptionMessage {
  [key: string]: unknown;
}

interface WebSocketMessage {
  [key: string]: unknown;
}

export interface VenueConfig {
  id: string;
  name: string;
  baseUrl: string;
  wsUrl: string;
  defaultSymbol: string;
  symbolFormat: (symbol: string) => string;
  supportsWebSocket: boolean;
}

export interface VenueClient {
  config: VenueConfig;

  // REST API methods
  fetchOrderbook(symbol: string): Promise<OrderBookData>;

  // WebSocket methods
  connectWebSocket(): Promise<void>;
  disconnectWebSocket(): void;
  subscribeToOrderbook(symbol: string): void;
  unsubscribeFromOrderbook(symbol: string): void;

  // Event callbacks
  onOrderbookUpdate?: (data: IncrementalUpdate) => void;
  onConnectionChange?: (connected: boolean) => void;
  onError?: (error: string) => void;

  // status
  isConnected(): boolean;
}

export abstract class BaseVenueClient implements VenueClient {
  public config: VenueConfig;
  protected ws: WebSocket | null = null;
  protected isConnectedState = false;
  protected subscriptions = new Set<string>();
  protected reconnectAttempts = 0;

  // Event callbacks
  public onOrderbookUpdate?: (data: IncrementalUpdate) => void;
  public onConnectionChange?: (connected: boolean) => void;
  public onError?: (error: string) => void;

  constructor(config: VenueConfig) {
    this.config = config;
  }

  // Methods for each venue
  abstract fetchOrderbook(symbol: string): Promise<OrderBookData>;
  abstract processOrderbookMessage(data: WebSocketMessage): IncrementalUpdate | null;
  abstract createSubscriptionMessage(symbol: string): SubscriptionMessage;
  abstract createUnsubscriptionMessage(symbol: string): SubscriptionMessage;

  async connectWebSocket(): Promise<void> {
    if (!this.config.supportsWebSocket) {
      throw new Error(`${this.config.name} doesn't support WebSocket`);
    }

    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.config.wsUrl);

        this.ws.onopen = () => {
          console.log(`${this.config.name} WebSocket connected`);
          this.isConnectedState = true;
          this.reconnectAttempts = 0;
          this.onConnectionChange?.(true);
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            const processed = this.processOrderbookMessage(message);
            if (processed) {
              this.onOrderbookUpdate?.(processed);
            }
          } catch (error) {
            console.error(
              `${this.config.name} message processing error:`,
              error
            );
          }
        };

        this.ws.onclose = () => {
          console.log(`${this.config.name} WebSocket disconnected`);
          this.isConnectedState = false;
          this.onConnectionChange?.(false);
          this.handleReconnect();
        };

        this.ws.onerror = (error) => {
          console.error(`${this.config.name} WebSocket error:`, error);
          this.onError?.(`${this.config.name} connection error`);
          reject(error);
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  subscribeToOrderbook(symbol: string): void {
    if (!this.isConnectedState || !this.ws) return;

    const message = this.createSubscriptionMessage(symbol);
    this.ws.send(JSON.stringify(message));
    this.subscriptions.add(symbol);
  }

  unsubscribeFromOrderbook(symbol: string): void {
    if (!this.isConnectedState || !this.ws) return;

    const message = this.createUnsubscriptionMessage(symbol);
    this.ws.send(JSON.stringify(message));
    this.subscriptions.delete(symbol);
  }

  disconnectWebSocket(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.isConnectedState = false;
    this.subscriptions.clear();
  }

  isConnected(): boolean {
    return this.isConnectedState;
  }

  private handleReconnect(): void {
    if (this.reconnectAttempts >= 5) return;

    this.reconnectAttempts++;
    const delay = 1000 * Math.pow(2, this.reconnectAttempts - 1);

    setTimeout(() => {
      this.connectWebSocket()
        .then(() => {
          this.subscriptions.forEach((symbol) => {
            this.subscribeToOrderbook(symbol);
          });
        })
        .catch(console.error);
    }, delay);
  }

  // Commo REST API method
  protected async makeRequest<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${this.config.baseUrl}${endpoint}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }
}
