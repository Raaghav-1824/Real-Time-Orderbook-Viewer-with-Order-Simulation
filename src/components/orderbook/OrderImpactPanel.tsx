"use client";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { OrderMetrics } from '@/lib/types/simulation';
import { AlertTriangle, TrendingUp, Clock, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils/utils';

interface OrderImpactPanelProps {
  metrics: OrderMetrics | null;
  isLoading?: boolean;
}

export function OrderImpactPanel({ metrics }: OrderImpactPanelProps) {
  if (!metrics) {
    return (
      <Card className="h-full flex flex-col">
        <CardHeader className="flex-shrink-0">
          <CardTitle className="text-sm">Order Impact Analysis</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center">
          <div className="text-gray-500 text-sm text-center">
            Submit an order simulation to see impact metrics
          </div>
        </CardContent>
      </Card>
    );
  }

  const getImpactColor = (impact: number) => {
    if (impact < 2) return "text-emerald-400";
    if (impact < 5) return "text-yellow-400";
    return "text-red-400";
  };

  const getSlippageColor = (slippage: number) => {
    if (slippage < 0.1) return "text-emerald-400";
    if (slippage < 0.5) return "text-yellow-400";
    return "text-red-400";
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex-shrink-0">
        <CardTitle className="text-sm flex items-center gap-2">
          <TrendingUp className="w-4 h-4" />
          Order Impact Analysis
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-3 flex-1 overflow-y-auto">
        {/* Fill Percentage */}
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span>Fill Percentage</span>
            <span>{metrics.fillPercentage.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className={cn(
                "h-2 rounded-full transition-all",
                metrics.fillPercentage === 100 ? "bg-emerald-500" : "bg-yellow-500"
              )}
              style={{ width: `${metrics.fillPercentage}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Left Column */}
          <div className="space-y-3">
            {/* Market Impact */}
            <div className="flex justify-between items-center">
              <span className="text-xs">Market Impact</span>
              <span className={cn("text-xs font-mono", getImpactColor(metrics.marketImpact))}>
                {metrics.marketImpact.toFixed(2)}%
              </span>
            </div>
            {/* Time to Fill */}
            <div className="flex justify-between items-center">
              <span className="text-xs flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Est. Time to Fill
              </span>
              <span className="text-xs font-mono text-gray-300">
                {metrics.estimatedTimeToFill}s
              </span>
            </div>
          </div>
          {/* Right Column */}
          <div className="space-y-3">
            {/* Slippage */}
            <div className="flex justify-between items-center">
              <span className="text-xs">Expected Slippage</span>
              <span className={cn("text-xs font-mono", getSlippageColor(metrics.slippage))}>
                {metrics.slippage.toFixed(3)}%
              </span>
            </div>
            {/* Total Cost */}
            <div className="flex justify-between items-center">
              <span className="text-xs flex items-center gap-1">
                <DollarSign className="w-3 h-3" />
                Total Cost
              </span>
              <span className="text-xs font-mono text-gray-300">
                ${metrics.totalCost.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Warnings */}
        {(metrics.slippage > 0.5 || metrics.marketImpact > 5) && (
          <div className="flex items-start gap-2 p-2 bg-yellow-500/10 border border-yellow-500/20 rounded">
            <AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5" />
            <div className="text-xs text-yellow-300">
              High impact order detected. Consider splitting into smaller orders.
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}