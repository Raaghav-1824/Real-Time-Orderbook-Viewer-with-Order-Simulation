"use client";
import { OrderBookData, OrderLevel } from '@/lib/types/orderbook';
import { OrderMetrics } from '@/lib/types/simulation';
import { useSimulationStore } from '@/store/simulationStore';
import { cn } from '@/lib/utils/utils';

interface OrderbookRowProps {
  level: OrderLevel;
  side: 'bid' | 'ask';
  isSimulated?: boolean;
  simulationMetrics?: OrderMetrics;
  index?:number;
}

function OrderbookRow({ level, side, isSimulated,  }: OrderbookRowProps) {
  const getRowClassName = () => {
    if (isSimulated) {
      return cn(
        "bg-yellow-500/20 border-l-4 border-yellow-500 animate-pulse",
        side === 'bid' ? "border-l-emerald-500 bg-emerald-500/20" : "border-l-red-500 bg-red-500/20"
      );
    }
    
    return side === 'bid' 
      ? "hover:bg-emerald-500/10" 
      : "hover:bg-red-500/10";
  };

  return (
    <div className={cn("grid grid-cols-3 relative", getRowClassName())}>
      {/* Price */}
      <div className={cn(
        "font-mono text-xs",
        side === 'bid' ? "text-emerald-400" : "text-red-400"
      )}>
        {level.price.toFixed(2)}
      </div>
      
      {/* Quantity */}
      <div className="font-mono text-xs text-gray-300 text-right">
        {level.quantity.toFixed(3)}
      </div>
      
      {/* Total */}
      <div className="font-mono text-xs text-gray-400 text-right">
        {level.total.toFixed(2)}
      </div>
      
      {/* Simulation Indicator */}
      {isSimulated && (
        <div className="absolute right-2 top-1/2 -translate-y-1/2">
          <div className="w-2 h-2 bg-yellow-500 rounded-full animate-ping" />
          <div className="w-2 h-2 bg-yellow-500 rounded-full absolute top-0" />
        </div>
      )}
      
      {/* Depth Bar */}
      <div 
        className={cn(
          "absolute left-0 top-0 h-full opacity-20",
          side === 'bid' ? "bg-emerald-500" : "bg-red-500"
        )}
        style={{ width: `${Math.min(level.quantity / 100, 1) * 100}%` }}
      />
    </div>
  );
}

interface OrderbookWithSimulationProps {
  orderbook: OrderBookData;
}

export function OrderbookWithSimulation({ orderbook }: OrderbookWithSimulationProps) {
  const { currentSimulation } = useSimulationStore();
  
  const getSimulatedLevelIndex = (side: 'bid' | 'ask') => {
    if (!currentSimulation) return -1;
    
    const { order, placement } = currentSimulation;
    if ((side === 'ask' && order.side !== 'buy') || (side === 'bid' && order.side !== 'sell')) {
      return -1;
    }
    
    return placement.position;
  };

  const getSpreadColorClasses = (spreadPercent: number) => {
    if (spreadPercent < 0.1) {
      return {
        border: "border-emerald-500",
        text: "text-emerald-400",
        bg: "bg-emerald-500/10"
      };
    } else if (spreadPercent < 0.3) {
      return {
        border: "border-emerald-600", 
        text: "text-emerald-500",
        bg: "bg-emerald-500/5"
      };
    } else if (spreadPercent < 0.8) {
      return {
        border: "border-yellow-500",
        text: "text-yellow-400", 
        bg: "bg-yellow-500/10"
      };
    } else {
      return {
        border: "border-red-500",
        text: "text-red-400",
        bg: "bg-red-500/10"
      };
    }
  };

  return (
    <div className="px-3 py-1 space-y-2">
      {/* Asks */}
      <div className="space-y-1">
        <div className="grid grid-cols-3 p-1 text-xs text-gray-500 border-b border-gray-800">
          <div>Price</div>
          <div className="text-right">Size</div>
          <div className="text-right">Total</div>
        </div>
        
        {orderbook.asks.slice(0, 13).reverse().map((level, i) => {
          const actualIndex = orderbook.asks.length - 1 - i;
          return (
            <OrderbookRow
              key={`ask-${actualIndex}`}
              level={level}
              index={actualIndex}
              side="ask"
              isSimulated={actualIndex === getSimulatedLevelIndex('ask')}
              simulationMetrics={currentSimulation?.metrics}
            />
          );
        })}
      </div>

      {/* Spread */}
      <div className={cn(
        "border-y py-2 text-center transition-colors",
        getSpreadColorClasses(orderbook.spreadPercent).border,
        getSpreadColorClasses(orderbook.spreadPercent).bg
      )}>
        {/* <div className="text-xs text-gray-500 mb-1">Spread</div> */}
        <div className={cn(
          "font-mono text-sm font-medium",
          getSpreadColorClasses(orderbook.spreadPercent).text
        )}>
          {orderbook.spread.toFixed(2)} ({orderbook.spreadPercent.toFixed(2)}%)
        </div>
      </div>

      {/* Bids */}
      <div className="space-y-1">
        {orderbook.bids.slice(0, 13).map((level, i) => (
          <OrderbookRow
            key={`bid-${i}`}
            level={level}
            index={i}
            side="bid"
            isSimulated={i === getSimulatedLevelIndex('bid')}
            simulationMetrics={currentSimulation?.metrics}
          />
        ))}
      </div>
    </div>
  );
}