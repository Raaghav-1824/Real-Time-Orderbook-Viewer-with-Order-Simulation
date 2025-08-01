"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { VenueSelector } from "./venueSelector";
import { Venue } from "@/lib/types/orderbook";
import { Dropdown } from "../ui/dropdown";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect } from "react";
import { useScalableOrderbookStore } from "@/store/orderbookStore";
import { useOrderbook } from "@/hooks/use-orderbook";
import { useOrderSimulation } from '@/hooks/use-order-simulation';
import { SimulatedOrder } from "@/lib/types/simulation";

const orderFormSchema = z.object({
  venue: z.enum(["okx", "bybit", "deribit"]),
  symbol: z.string().min(1, "Symbol is required"),
  orderType: z.enum(["market", "limit"]),
  side: z.enum(["buy", "sell"]),
  price: z.number().min(0.01, "Price must be greater than 0.01"),
  quantity: z.number().min(0.001, "Quantity must be at least 0.001"),
  timing: z.enum(["immediate", "5s", "10s", "30s"]),
}).refine((data) => {
  if (data.orderType === "market") {
    return true;
  }
  // For limit orders, her price must  provided & valid
  return data.price >= 0.01;
}, {
  message: "Price must be greater than 0.01 for limit orders",
  path: ["price"],
});

type OrderFormData = z.infer<typeof orderFormSchema>;

const symbolOptions = [
  { value: "BTC-USDT", label: "BTC-USDT" },
  { value: "ETH-USDT", label: "ETH-USDT" },
  { value: "BTC-USD", label: "BTC-USD" },
  { value: "ETH-USD", label: "ETH-USD" },
];

export function OrderFormDesktop() {
  const form= useForm<OrderFormData>({
    resolver: zodResolver(orderFormSchema),
    defaultValues: {
      venue: "okx",
      symbol: "BTC-USDT",
      orderType: "limit",
      side: "buy",
      price: 0.01,
      quantity: 0,
      timing: "immediate",
    },
  });

 
  const { watch, setValue, trigger, formState:{errors} } = form;

  const orderType = watch("orderType");
  const side = watch("side");
  const currentPrice = watch("price");

  const { orderbook, loading, wsConnected } = useOrderbook();
  const { selectedVenue, selectedSymbol, setSymbol } =
    useScalableOrderbookStore();

  const [localSymbol, setLocalSymbol] = useState("BTC-USDT");

  const getMarketPrice = () => {
    if (!orderbook) return 0;
    if (side === "buy") {
      return orderbook.asks[0]?.price || 0;
    } else {
      return orderbook.bids[0]?.price || 0;
    }
  };

  useEffect(() => {
    setSymbol(localSymbol);
    setValue("symbol", localSymbol);
  }, [localSymbol, setSymbol, setValue]);

  const { simulateOrder } = useOrderSimulation();

  const onSubmit = async (data: OrderFormData) => {
    try {
      console.log("Order Simulation:", data);
      
      // Additional validation for orders
      if (data.orderType === "market" && !orderbook) {
        console.error("No orderbook data available for market order");
        return;
      }
      
      const simulatedOrder: SimulatedOrder = {
        venue: selectedVenue as Venue,
        symbol: selectedSymbol,
        side: data.side,
        type: data.orderType,
        price: data.orderType === "market" ? getMarketPrice() : (data.price || 0),
        quantity: data.quantity,
        timing: data.timing,
      };
      
      await simulateOrder(simulatedOrder);
    } catch (error) {
      console.error("Order simulation failed:", error);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="h-full">
      <Card className="h-full flex flex-col">
        <CardHeader className="flex-shrink-0">
          <CardTitle>Order Simulation</CardTitle>
          <div className="text-xs text-gray-400">
            {selectedVenue?.toUpperCase()} • {selectedSymbol} • 
            <span className={wsConnected ? "text-emerald-400" : "text-red-400"}>
              {wsConnected ? "Live" : "Disconnected"}
            </span>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 flex-1 overflow-y-auto">
          <>
            <VenueSelector />
          </>
          <Dropdown
            value={localSymbol}
            options={symbolOptions}
            placeholder="Select Symbol"
            onValueChange={setLocalSymbol}
          />

          {/* //Ordertype Selector */}

          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant={orderType === "market" ? "primary" : "secondary"}
              onClick={() => {
                setValue("orderType", "market");
                trigger("price");
              }}
            >
              Market
            </Button>
            <Button
              type="button"
              variant={orderType === "limit" ? "primary" : "secondary"}
              onClick={() => {
                setValue("orderType", "limit");
                if (currentPrice === 0) {
                  setValue("price", 0.01); 
                }
                trigger("price"); 
              }}
            >
              Limit
            </Button>
          </div>

          {/* <Input label="Symbol" placeholder="BTC-USD" /> */}

          <div className="space-y-1">
            <Input
              type="number"
              min="0.01"
              step="1"
              label={orderType === "market" ? "Market Price" : "Limit Price"}
              placeholder="0.00"
              value={orderType === "market" ? getMarketPrice().toFixed(2) : (currentPrice || "")}
              onChange={(e) => {
                if (orderType === "limit") {
                  const inputValue = e.target.value;
                  if (inputValue === "") {
                    setValue("price", 0.1);
                  } else {
                    const parsed = parseFloat(inputValue);
                    if (!isNaN(parsed) && parsed >= 0.1) {
                      setValue("price", parsed);
                    }
                  }
                  trigger("price");
                }
              }}
              disabled={orderType === "market"}
              className={
                orderType === "market" ? "bg-gray-700 text-gray-400" : ""
              }
            />
            {errors.price && (
              <p className="text-xs text-red-400 px-1">
                {errors.price.message}
              </p>
            )}
            
          </div>

          <div className="space-y-1">
            <Input
              type="number"
              label="Quantity"
              placeholder="0.000"
              step="0.001"
              min="0"
              {...form.register("quantity" , {valueAsNumber :true})}
            />
            {errors.quantity && (
              <p className="text-xs text-red-400 px-1">
                {errors.quantity.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant={side === "buy" ? "buy" : "secondary"}
              onClick={() => setValue("side", "buy")}
            >
              Buy
            </Button>
            <Button
              type="button"
              variant={side === "sell" ? "sell" : "secondary"}
              onClick={() => setValue("side", "sell")}
            >
              Sell
            </Button>
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Timing</label>
            <div className="grid grid-cols-2 gap-2">
              {(["immediate", "5s", "10s", "30s"] as const).map((time) => (
                <Button
                  key={time}
                  type="button"
                  variant={watch("timing") === time ? "primary" : "secondary"}
                  size="sm"
                  onClick={() => setValue("timing", time)}
                >
                  {time === "immediate" ? "Now" : time}
                </Button>
              ))}
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full"
            disabled={!orderbook || loading || Object.keys(errors).length > 0}
            variant={side === "buy" ? "buy" : side === "sell" ? "sell" : "primary"}
          >
            {loading ? "Loading..." : `Simulate ${side === "buy" ? "Buy" : "Sell"} Order`}
          </Button>
        </CardContent>
      </Card>
    </form>
  );
}

export default OrderFormDesktop;
