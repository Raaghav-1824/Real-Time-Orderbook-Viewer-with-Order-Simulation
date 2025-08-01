"use client";
import { useState, useEffect, useRef } from 'react';
import { useOrderbook } from './use-orderbook';
import { OrderBookData } from '@/lib/types/orderbook';

interface UseThrottledOrderbookOptions {
  throttleMs?: number; 
  enabled?: boolean;   
}

export function useThrottledOrderbook(options: UseThrottledOrderbookOptions = {}) {
  const { throttleMs = 1000, enabled = true } = options;
  
  const { orderbook: liveOrderbook, loading, error, wsConnected, lastUpdate, refetch } = useOrderbook();
  const [throttledOrderbook, setThrottledOrderbook] = useState<OrderBookData | null>(null);
  const throttleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const pendingUpdateRef = useRef<OrderBookData | null>(null);
  
  useEffect(() => {
    if (!enabled) {
      setThrottledOrderbook(liveOrderbook);
      return;
    }
    
    if (!liveOrderbook) {
      return; 
    }
    
    // Store latest update
    pendingUpdateRef.current = liveOrderbook;
    
    // Throttle updats
    if (!throttleTimerRef.current) {
      throttleTimerRef.current = setTimeout(() => {
        if (pendingUpdateRef.current) {
          setThrottledOrderbook(pendingUpdateRef.current);
          pendingUpdateRef.current = null;
        }
        throttleTimerRef.current = null;
      }, throttleMs);
    }
    
    return () => {
      if (throttleTimerRef.current) {
        clearTimeout(throttleTimerRef.current);
        throttleTimerRef.current = null;
      }
    };
  }, [liveOrderbook, throttleMs, enabled]);
  
  return {
    orderbook: throttledOrderbook,
    liveOrderbook, 
    loading,
    error,
    wsConnected,
    lastUpdate,
    refetch,
    isThrottled: enabled,
  };
}