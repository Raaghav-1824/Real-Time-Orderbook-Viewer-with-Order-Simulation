"use client";
import { useCallback } from 'react';
import { useOrderbook } from './use-orderbook';
import { useSimulationStore } from '@/store/simulationStore';
import { OrderSimulationEngine } from '@/lib/simulation/order-simulation-engine';
import { SimulatedOrder } from '@/lib/types/simulation';

export function useOrderSimulation() {
  const { orderbook } = useOrderbook();
  const { setSimulation, setSimulating, clearSimulation } = useSimulationStore();

  const simulateOrder = useCallback(async (order: SimulatedOrder) => {
    if (!orderbook) {
      console.warn('No orderbook data available for simulation');
      return;
    }

    setSimulating(true);
    
    try {
      // Add small delay to show loading state
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const placement = OrderSimulationEngine.calculateOrderPlacement(order, orderbook);
      const metrics = OrderSimulationEngine.calculateOrderMetrics(order, orderbook);
      
      const simulation = {
        order,
        placement,
        metrics,
        timestamp: Date.now()
      };
      
      setSimulation(simulation);
    } catch (error) {
      console.error('Order simulation failed:', error);
    } finally {
      setSimulating(false);
    }
  }, [orderbook, setSimulation, setSimulating]);

  return {
    simulateOrder,
    clearSimulation
  };
}