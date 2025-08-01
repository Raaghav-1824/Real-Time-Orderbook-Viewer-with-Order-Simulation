import { OrderBookData } from '@/lib/types/orderbook';
import { SimulatedOrder, OrderPlacement, OrderMetrics } from '@/lib/types/simulation';

export class OrderSimulationEngine {
  
  static calculateOrderPlacement(order: SimulatedOrder, orderbook: OrderBookData): OrderPlacement {
    const levels = order.side === 'buy' ? orderbook.asks : orderbook.bids;
    const orderPrice = order.type === 'market' 
      ? (order.side === 'buy' ? orderbook.asks[0]?.price : orderbook.bids[0]?.price)
      : order.price!;

    // Find position in orderbook
    let position = 0;
    for (let i = 0; i < levels.length; i++) {
      if (order.side === 'buy' && levels[i].price <= orderPrice) {
        position = i;
        break;
      } else if (order.side === 'sell' && levels[i].price >= orderPrice) {
        position = i;
        break;
      }
      position = i + 1;
    }

    return {
      position,
      priceLevel: orderPrice,
      partialFill: this.willPartiallyFill(order, orderbook),
      queuePosition: 1 
    };
  }

  static calculateOrderMetrics(order: SimulatedOrder, orderbook: OrderBookData): OrderMetrics {
    const levels = order.side === 'buy' ? orderbook.asks : orderbook.bids;
    let remainingQuantity = order.quantity;
    let totalCost = 0;
    let worstPrice = 0;
    let levelsFilled = 0;

    // Calculate fill simulation
    for (const level of levels) {
      if (remainingQuantity <= 0) break;
      
      const fillQuantity = Math.min(remainingQuantity, level.quantity);
      totalCost += fillQuantity * level.price;
      worstPrice = level.price;
      remainingQuantity -= fillQuantity;
      levelsFilled++;
    }

    const fillPercentage = ((order.quantity - remainingQuantity) / order.quantity) * 100;
    const averagePrice = totalCost / (order.quantity - remainingQuantity);
    const marketPrice = order.side === 'buy' ? orderbook.asks[0]?.price : orderbook.bids[0]?.price;
    const slippage = Math.abs((averagePrice - marketPrice) / marketPrice) * 100;
    const marketImpact = (levelsFilled / levels.length) * 100;

    return {
      fillPercentage,
      marketImpact,
      slippage,
      estimatedTimeToFill: this.estimateTimeToFill(order, fillPercentage),
      worstCasePrice: worstPrice,
      averageExecutionPrice: averagePrice,
      totalCost
    };
  }

  private static willPartiallyFill(order: SimulatedOrder, orderbook: OrderBookData): boolean {
    const levels = order.side === 'buy' ? orderbook.asks : orderbook.bids;
    const totalLiquidity = levels.reduce((sum, level) => sum + level.quantity, 0);
    return order.quantity > totalLiquidity;
  }

  private static estimateTimeToFill(order: SimulatedOrder, fillPercentage: number): number {
    const baseTime = order.timing === 'immediate' ? 0 : parseInt(order.timing);
    const sizeMultiplier = order.quantity > 10 ? 1.5 : 1;
    const fillMultiplier = fillPercentage < 100 ? 2 : 1;
    
    return baseTime + (sizeMultiplier * fillMultiplier * 5); 
}

}