"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import OrderFormDesktop from "@/components/OrderForm/OrderFormDesktop";
import OrderbookDesktop from "@/components/orderbook/OrderbookDesktop";
import { OrderImpactPanel } from "@/components/orderbook/OrderImpactPanel";
import { MarketDepthChart } from "@/components/charts/MarketDepthChart";
import { useSimulationStore } from "@/store/simulationStore";

import { useThrottledOrderbook } from "@/hooks/use-throttled-orderbook";

export default function Home() {
  const { currentSimulation, isSimulating } = useSimulationStore();
  
  // Use throttled orderbook with configurable timing
  const { orderbook, loading } = useThrottledOrderbook({
    throttleMs: 1000, 
    enabled: true
  });

  return (
    <div className="h-screen bg-gray-900 text-gray-50 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="border-b border-gray-800 p-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-emerald-400">
            Real-Time Orderbook Viewer
          </h1>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-gray-400">Live</span>
          </div>
        </div>
      </header>

      {/* Mobile Tabs (visible on mobile only) */}
      <div className="lg:hidden border-b border-gray-800 flex-shrink-0">
        <Tabs defaultValue="orderbook" className="w-full h-full">
          <TabsList className="grid w-full grid-cols-3 bg-transparent h-12 p-0 flex-shrink-0">
            <TabsTrigger
              value="form"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-emerald-500"
            >
              Order Form
            </TabsTrigger>
            <TabsTrigger
              value="charts"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-emerald-500"
            >
              Charts
            </TabsTrigger>
            <TabsTrigger
              value="orderbook"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-emerald-500"
            >
              Orderbook
            </TabsTrigger>
          </TabsList>

          <TabsContent value="form" className="p-4 overflow-y-auto h-[calc(100vh-120px)]">
            <OrderFormDesktop />
          </TabsContent>

          <TabsContent value="orderbook" className="p-4 overflow-y-auto h-[calc(100vh-120px)]">
            <OrderbookDesktop />
          </TabsContent>

          <TabsContent value="charts" className="p-4 space-y-4 overflow-y-auto h-[calc(100vh-120px)]">
            <MarketDepthChart 
              orderbook={orderbook}
              loading={loading}
              throttleMs={1000}
              enableThrottling={true}
            />
            <OrderImpactPanel
              metrics={currentSimulation?.metrics || null}
              isLoading={isSimulating}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Desktop Layout Grid (hidden on mobile) */}
      <div className="hidden lg:grid lg:grid-cols-12 gap-4 p-4 flex-1 min-h-0 overflow-hidden">
        {/* Left Panel - Order Form */}
        <div className="lg:col-span-3 h-full overflow-y-auto">
          <OrderFormDesktop />
        </div>

        {/* Center Panel - Market Depth Chart & Order Impact */}
        <div className="lg:col-span-6 flex flex-col h-full gap-4 min-h-0">
          <div className="flex-[2] min-h-0 overflow-hidden">
            <MarketDepthChart 
              orderbook={orderbook}
              loading={loading}
              throttleMs={1000}
              enableThrottling={true}
            />
          </div>
          <div className="flex-1 min-h-0 overflow-hidden">
            <OrderImpactPanel
              metrics={currentSimulation?.metrics || null}
              isLoading={isSimulating}
            />
          </div>
        </div>

        {/* Right Panel - Orderbook */}
        <div className="lg:col-span-3 h-full overflow-hidden">
          <OrderbookDesktop />
        </div>
      </div>
    </div>
  );
}
