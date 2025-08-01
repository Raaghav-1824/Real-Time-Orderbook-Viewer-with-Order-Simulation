import { Venue } from "./orderbook";

export interface OrderFormData {
    venue: Venue;
    symbol: string;
    orderType: "market" | "limit";
    side: "buy" | "sell";
    price?: number; 
    quantity: number;
    timing: "immediate" | "5s" | "10s" | "30s";
  }


export interface SimulatedOrder {
    venue: Venue;
    symbol: string;
    side: 'buy' | 'sell';
    type: 'market' | 'limit';
    price?: number;
    quantity: number;
    timing: 'immediate' | '5s' | '10s' | '30s';
  }
  
  export interface OrderPlacement {
    position: number; 
    priceLevel: number; 
    partialFill: boolean;
    queuePosition?: number;
  }
  
  export interface OrderMetrics {
    fillPercentage: number; 
    marketImpact: number; 
    slippage: number; 
    estimatedTimeToFill: number; 
    worstCasePrice: number;
    averageExecutionPrice: number;
    totalCost: number;
  }
  
  export interface SimulationResult {
    order: SimulatedOrder;
    placement: OrderPlacement;
    metrics: OrderMetrics;
    timestamp: number;
  }
  