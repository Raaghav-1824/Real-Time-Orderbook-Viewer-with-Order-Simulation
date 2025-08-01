'use client';

import React from 'react';
import { cn } from '@/lib/utils/utils';
import { OrderLevel } from '@/lib/types/orderbook';
import { useState , useEffect } from 'react';
// import max

interface OrderbookTableProps {
  symbol: string;
  bids: OrderLevel[];
  asks: OrderLevel[];
  spread: number;
  spreadPercent: number;
  maxLevels?:number;

}

export function OrderBookTable({ 
  bids, 
  asks, 
  spread, 
  spreadPercent, 
  maxLevels = 9
}: OrderbookTableProps) {
  
  // Take only the number of levels we want to display
  const displayAsks = asks.slice(0, maxLevels).reverse();
  const displayBids = bids.slice(0, maxLevels);

 
  return (
    <div className="w-full h-full flex flex-col">
      
      {/* Table Header */}
      <div className="grid grid-cols-3 gap-4 px-4 py-2 border-b border-gray-700 bg-gray-800/50">
        <div className="text-xs font-medium text-gray-400 text-right">Price (USD)</div>
        <div className="text-xs font-medium text-gray-400 text-right">Size (BTC)</div>
        <div className="text-xs font-medium text-gray-400 text-right">Total (USD)</div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-hidden">
        {/* Asks Section (Sell Orders) - Red */}
        <div className="space-y-px">
          {displayAsks.map((ask, index) => (
            <OrderBookRow
              key={`ask-${ask.price}`}
              level={ask}
              type="ask"
              index={index}
            />
          ))}
        </div>

        {/* Spread Indicator */}
        <div className="flex items-center justify-center py-3 px-4 bg-gray-800/30 border-y border-gray-700/50">
          <div className="text-center">
            <div className="text-sm font-mono text-gray-300">
              Spread: ${spread.toFixed(2)}
            </div>
            <div className="text-xs text-gray-500">
              ({(spreadPercent * 100).toFixed(3)}%)
            </div>
          </div>
        </div>

        {/* Bids Section */}
        <div className="space-y-px">
          {displayBids.map((bid, index) => (
            <OrderBookRow
              key={`bid-${bid.price}`}
              level={bid}
              type="bid"
              index={index}
            />
          ))}
        </div>
      </div>
    </div>
  );
}





// Individual orderbook row component
interface OrderBookRowProps {
  level: OrderLevel;
  type: 'bid' | 'ask';
  index: number;
}

function OrderBookRow({ level, type }: OrderBookRowProps) {
  const [priceChanged, setPriceChanged] = useState<'up' | 'down' | null>(null);
  const [prevPrice, setPrevPrice] = useState(level.price);
  
  const isBid = type === 'bid';

  // Detect price changes for animations
  useEffect(() => {
    if (prevPrice !== level.price) {
      setPriceChanged(level.price > prevPrice ? 'up' : 'down');
      setPrevPrice(level.price);
      
      // Clear animation after 1 second
      const timer = setTimeout(() => setPriceChanged(null), 1000);
      return () => clearTimeout(timer);
    }
  }, [level.price, prevPrice]);
  
  return (
    <div
      className={cn(
        "grid grid-cols-3 gap-4 px-4 py-1.5 hover:bg-gray-700/30 transition-all cursor-pointer",
        "group relative overflow-hidden",
        // Price change animations
        priceChanged === 'up' && "bg-emerald-500/20 animate-pulse",
        priceChanged === 'down' && "bg-red-500/20 animate-pulse"
      )}
    >
      {/* Price with change indicator */}
      <div className={cn(
        "text-right font-mono text-sm font-medium transition-colors",
        isBid ? "text-emerald-400" : "text-red-400",
        priceChanged === 'up' && "text-emerald-300",
        priceChanged === 'down' && "text-red-300"
      )}>
        {level.price.toLocaleString('en-US', { 
          minimumFractionDigits: 2, 
          maximumFractionDigits: 2 
        })}
      </div>

      {/* Quantity */}
      <div className="text-right font-mono text-sm text-gray-300">
        {level.quantity.toFixed(3)}
      </div>

      {/* Total */}
      <div className="text-right font-mono text-sm text-gray-400">
        {level.total.toLocaleString('en-US', { 
          minimumFractionDigits: 2, 
          maximumFractionDigits: 2 
        })}
      </div>

      {/* Depth bar */}
      <div
        className={cn(
          "absolute inset-0 opacity-10 transition-all",
          isBid ? "bg-emerald-500" : "bg-red-500"
        )}
        style={{
          width: `${Math.min(85, (level.quantity / 3) * 100)}%`,
          right: 0,
        }}
      />
    </div>
  );
}