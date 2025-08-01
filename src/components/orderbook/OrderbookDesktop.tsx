"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OrderbookWithSimulation } from "./OrderbookWithSimulation";
import { useOrderbook } from "@/hooks/use-orderbook";
import { useScalableOrderbookStore } from "@/store/orderbookStore";
import { Button } from "@/components/ui/button";
import { RotateCcw, AlertCircle, Wifi, WifiOff } from "lucide-react";
// import { VenueSelector } from "../venue/venueSelector";

function OrderbookDesktop() {
  const { selectedSymbol } = useScalableOrderbookStore();
  const { orderbook, loading, error, wsConnected, lastUpdate, refetch } = useOrderbook();

  // Format last update time
  const getLastUpdateText = () => {
    if (!lastUpdate) return '';
    const now = Date.now();
    const diff = Math.floor((now - lastUpdate) / 1000);
    if (diff < 60) return `${diff}s ago`;
    return `${Math.floor(diff / 60)}m ago`;
  };

  return (
    <Card className="h-full flex flex-col overflow-hidden">
      <CardHeader className="pb-2 flex-shrink-0">
        <CardTitle className="flex items-center justify-between">
          <span>Order Book</span>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-400 font-mono">
              {selectedSymbol}
            </span>
            
            {/* Connection Status */}
            <div className="flex items-center space-x-1">
              {wsConnected ? (
                <Wifi className="h-3 w-3 text-emerald-500" />
              ) : (
                <WifiOff className="h-3 w-3 text-red-500" />
              )}
              
              {loading ? (
                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
              ) : error ? (
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              ) : wsConnected ? (
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              ) : (
                <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
              )}
            </div>

            {/* Refresh Button */}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={refetch}
              disabled={loading}
              className="h-6 w-6 p-0"
            >
              <RotateCcw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </CardTitle>
        
        {/* Status Bar */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>
            {wsConnected ? 'Live' : 'Snapshot'} • {getLastUpdateText()}
          </span>
          <span>
            {wsConnected ? 'Real-time' : 'Manual refresh'}
          </span>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 p-0 overflow-hidden min-h-0">
        {loading && !orderbook ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto mb-2"></div>
              <p className="text-sm text-gray-400">Loading orderbook...</p>
            </div>
          </div>
        ) : error && !orderbook ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
              <p className="text-sm text-red-400 mb-2">{error}</p>
              <Button variant="secondary" size="sm" onClick={refetch}>
                Retry
              </Button>
            </div>
          </div>
        ) : orderbook ? (
          <OrderbookWithSimulation orderbook={orderbook} />
        ) : null}
      </CardContent>
    </Card>
  );
}
export default OrderbookDesktop;