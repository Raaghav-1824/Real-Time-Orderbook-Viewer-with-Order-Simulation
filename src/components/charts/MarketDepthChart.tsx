"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OrderBookData } from "@/lib/types/orderbook";
import { useMemo } from "react";
import { TrendingUp } from "lucide-react";
import { useThrottledOrderbook } from "@/hooks/use-throttled-orderbook";
import {
  ComposedChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

interface MarketDepthChartProps {
  orderbook?: OrderBookData | null;
  loading?: boolean;
  throttleMs?: number; 
  enableThrottling?: boolean;
}

interface DepthPoint {
  price: number;
  bidCumulative: number;
  askCumulative: number;
  bidVolume: number;
  askVolume: number;
}



export function MarketDepthChart({ 
  orderbook: propOrderbook, 
  loading: propLoading,
  throttleMs = 500,
  enableThrottling = true 
}: MarketDepthChartProps) {
  // Use throttled hook only if orderbook not provided as prop
  const { 
    orderbook: hookOrderbook, 
    loading: hookLoading,
    isThrottled 
  } = useThrottledOrderbook({ 
    throttleMs, 
    enabled: enableThrottling && !propOrderbook 
  });
  
  // Use prop data if available, otherwise use hook data
  const orderbook = propOrderbook || hookOrderbook;
  const loading = propLoading !== undefined ? propLoading : hookLoading;
  
  // Add throttling indicator to header
  const ThrottleIndicator = () => (
    <div className="flex items-center gap-2 text-xs">
      <div className="flex items-center gap-1">
        <div className="w-3 h-1 bg-emerald-400 rounded"></div>
        <span>Bids</span>
      </div>
      <div className="flex items-center gap-1">
        <div className="w-3 h-1 bg-red-400 rounded"></div>
        <span>Asks</span>
      </div>
      {isThrottled && (
        <div className="flex items-center gap-1 text-yellow-400">
          <span>~{throttleMs}ms</span>
        </div>
      )}
    </div>
  );

  // Calculate cumulative bid volume (from highest price down)
  let cumulativeBidVolume = 0;
  const cumulativeBids: DepthPoint[] = orderbook?.bids.map((bid) => {
    cumulativeBidVolume += bid.quantity;
    return {
      price: bid.price,
      bidCumulative: cumulativeBidVolume,
      askCumulative: 0,
      bidVolume: bid.quantity,
      askVolume: 0,
    };
  }) || [];

  // Calculate cumulative ask volume (from lowest price up)
  let cumulativeAskVolume = 0;
  const cumulativeAsks: DepthPoint[] = orderbook?.asks.map((ask) => {
    cumulativeAskVolume += ask.quantity;
    return {
      price: ask.price,
      bidCumulative: 0,
      askCumulative: cumulativeAskVolume,
      bidVolume: 0,
      askVolume: ask.quantity,
    };
  }) || [];

  // Combine and sort by price
  const combined = [...cumulativeBids, ...cumulativeAsks].sort((a, b) => a.price - b.price);
  
  // Calculate mid price
  const bestBid = orderbook?.bids[0]?.price || 0;
  const bestAsk = orderbook?.asks[0]?.price || 0;
  const midPrice = (bestBid + bestAsk) / 2;

  const depthData = useMemo(() => combined, [combined]);

  // Custom tooltip formatter
  const CustomTooltip = ({ active, payload, label }: {
    active?: boolean;
    payload?: Array<{
      dataKey: string;
      value: number;
      color: string;
    }>;
    label?: string | number;
  }) => {
    if (active && payload && payload.length) {
      const bidData = payload.find((p) => p.dataKey === 'bidCumulative');
      const askData = payload.find((p) => p.dataKey === 'askCumulative');
      
      return (
        <div className="bg-gray-800 border border-gray-600 rounded p-2 text-sm">
          <p className="text-gray-300">{`Price: $${Number(label).toFixed(2)}`}</p>
          {bidData && bidData.value > 0 && (
            <p className="text-emerald-400">{`Bid Volume: ${bidData.value.toFixed(3)}`}</p>
          )}
          {askData && askData.value > 0 && (
            <p className="text-red-400">{`Ask Volume: ${askData.value.toFixed(3)}`}</p>
          )}
        </div>
      );
    }
    return null;
  };



  if (loading) {
    return (
      <Card className="h-full flex flex-col">
        <CardHeader className="pb-2 flex-shrink-0">
          <CardTitle className="text-sm flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Market Depth Chart
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center min-h-[300px]">
          <div className="text-gray-400 text-sm">Loading market data...</div>
        </CardContent>
      </Card>
    );
  }

  if (loading && !orderbook) {
    return (
      <Card className="h-full flex flex-col">
        <CardHeader className="pb-2 flex-shrink-0">
          <CardTitle className="text-sm flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Market Depth Chart
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center min-h-[300px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto mb-2"></div>
            <div className="text-gray-400 text-sm">Loading market data...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!orderbook || !orderbook.bids?.length || !orderbook.asks?.length) {
    return (
      <Card className="h-full flex flex-col">
        <CardHeader className="pb-2 flex-shrink-0">
          <CardTitle className="text-sm flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Market Depth Chart
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center min-h-[300px]">
          <div className="text-gray-400 text-sm">No market data available</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2 flex-shrink-0">
        <CardTitle className="text-sm flex items-center gap-2">
          <TrendingUp className="w-4 h-4" />
          Market Depth Chart
        </CardTitle>
        <ThrottleIndicator />
      </CardHeader>
      
      <CardContent className="flex-1 pb-4 min-h-0">
        <div className="h-full w-full min-h-[300px] min-w-0 lg:min-w-[400px]">
          <ResponsiveContainer 
            width="100%" 
            height="100%"
            minHeight={300}
            debounce={50}
          >
            <ComposedChart 
              data={depthData.length > 0 ? depthData : [{ price: 0, bidCumulative: 0, askCumulative: 0 }]} 
              margin={{ top: 10, right: 30, left: 0, bottom: 50 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="price" 
                type="number" 
                domain={['dataMin', 'dataMax']}
                tickFormatter={(value) => `$${value.toFixed(0)}`}
                stroke="#9CA3AF"
                fontSize={10}
              />
              <YAxis 
                tickFormatter={(value) => `${value.toFixed(1)}`}
                stroke="#9CA3AF"
                fontSize={10}
              />
              <Tooltip content={<CustomTooltip />} />
              
              {/* Mid price reference line */}
              {midPrice > 0 && (
                <ReferenceLine 
                  x={midPrice} 
                  stroke="#FCD34D" 
                  strokeWidth={1}
                  strokeDasharray="4 4"
                />
              )}
              
              {/* Bid area (green) */}
              <Area
                type="stepAfter"
                dataKey="bidCumulative"
                stroke="#10B981"
                fill="rgba(16, 185, 129, 0.3)"
                strokeWidth={2}
                isAnimationActive={false}
                connectNulls={false}
              />
              
              {/* Ask area (red) */}
              <Area
                type="stepAfter"
                dataKey="askCumulative"
                stroke="#EF4444"
                fill="rgba(239, 68, 68, 0.3)"
                strokeWidth={2}
                isAnimationActive={false}
                connectNulls={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}